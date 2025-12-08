using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Purchase.Application.DTOs;
using Stocker.Modules.Purchase.Application.Features.PurchaseInvoices.Commands;
using Stocker.Modules.Purchase.Application.Features.PurchaseInvoices.Queries;
using Stocker.Modules.Purchase.Domain.Entities;
using Stocker.Modules.Purchase.Infrastructure.Persistence;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Purchase.Application.Features.PurchaseInvoices.Handlers;

public class CreatePurchaseInvoiceHandler : IRequestHandler<CreatePurchaseInvoiceCommand, Result<PurchaseInvoiceDto>>
{
    private readonly PurchaseDbContext _context;
    private readonly IMapper _mapper;
    private readonly ITenantService _tenantService;

    public CreatePurchaseInvoiceHandler(PurchaseDbContext context, IMapper mapper, ITenantService tenantService)
    {
        _context = context;
        _mapper = mapper;
        _tenantService = tenantService;
    }

    public async Task<Result<PurchaseInvoiceDto>> Handle(CreatePurchaseInvoiceCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue)
            return Result<PurchaseInvoiceDto>.Failure(Error.Unauthorized("Tenant", "Tenant is required"));

        var invoiceNumber = $"PI-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..8].ToUpper()}";

        var invoice = PurchaseInvoice.Create(
            invoiceNumber,
            request.Dto.SupplierId,
            request.Dto.SupplierName,
            tenantId.Value,
            request.Dto.Type,
            request.Dto.Currency ?? "TRY"
        );

        if (!string.IsNullOrEmpty(request.Dto.SupplierInvoiceNumber))
            invoice.SetSupplierInvoiceNumber(request.Dto.SupplierInvoiceNumber);

        if (request.Dto.InvoiceDate != default)
            invoice.SetInvoiceDate(request.Dto.InvoiceDate);

        if (request.Dto.DueDate.HasValue)
            invoice.SetDueDate(request.Dto.DueDate.Value);
        else if (request.Dto.PaymentTermDays > 0)
            invoice.SetPaymentTerms(request.Dto.PaymentTermDays);

        if (request.Dto.PurchaseOrderId.HasValue)
            invoice.LinkToPurchaseOrder(request.Dto.PurchaseOrderId.Value, request.Dto.PurchaseOrderNumber);

        if (request.Dto.GoodsReceiptId.HasValue)
            invoice.LinkToGoodsReceipt(request.Dto.GoodsReceiptId.Value, request.Dto.GoodsReceiptNumber);

        if (request.Dto.ExchangeRate > 0 && request.Dto.ExchangeRate != 1)
            invoice.SetExchangeRate(request.Dto.ExchangeRate);

        if (request.Dto.WithholdingTaxAmount > 0)
            invoice.SetWithholdingTax(request.Dto.WithholdingTaxAmount);

        if (!string.IsNullOrEmpty(request.Dto.EInvoiceId))
            invoice.SetEInvoiceInfo(request.Dto.EInvoiceId, request.Dto.EInvoiceUUID);

        invoice.SetNotes(request.Dto.Notes, request.Dto.InternalNotes);

        int lineNumber = 1;
        foreach (var itemDto in request.Dto.Items)
        {
            var item = PurchaseInvoiceItem.Create(
                invoice.Id,
                itemDto.ProductId ?? Guid.Empty,
                itemDto.ProductCode,
                itemDto.ProductName,
                itemDto.Unit ?? "Adet",
                itemDto.Quantity,
                itemDto.UnitPrice,
                itemDto.VatRate,
                lineNumber++,
                tenantId.Value
            );

            if (itemDto.DiscountRate > 0)
                item.Update(itemDto.Quantity, itemDto.UnitPrice, itemDto.VatRate, itemDto.DiscountRate);

            invoice.AddItem(item);
        }

        if (request.Dto.DiscountRate > 0)
            invoice.ApplyDiscount(request.Dto.DiscountRate);

        _context.PurchaseInvoices.Add(invoice);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<PurchaseInvoiceDto>.Success(_mapper.Map<PurchaseInvoiceDto>(invoice));
    }
}

public class GetPurchaseInvoiceByIdHandler : IRequestHandler<GetPurchaseInvoiceByIdQuery, Result<PurchaseInvoiceDto>>
{
    private readonly PurchaseDbContext _context;
    private readonly IMapper _mapper;

    public GetPurchaseInvoiceByIdHandler(PurchaseDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<PurchaseInvoiceDto>> Handle(GetPurchaseInvoiceByIdQuery request, CancellationToken cancellationToken)
    {
        var invoice = await _context.PurchaseInvoices
            .Include(i => i.Items)
            .FirstOrDefaultAsync(i => i.Id == request.Id, cancellationToken);

        if (invoice == null)
            return Result<PurchaseInvoiceDto>.Failure(Error.NotFound("PurchaseInvoice", "Purchase invoice not found"));

        return Result<PurchaseInvoiceDto>.Success(_mapper.Map<PurchaseInvoiceDto>(invoice));
    }
}

public class GetPurchaseInvoicesHandler : IRequestHandler<GetPurchaseInvoicesQuery, Result<PagedResult<PurchaseInvoiceListDto>>>
{
    private readonly PurchaseDbContext _context;

    public GetPurchaseInvoicesHandler(PurchaseDbContext context)
    {
        _context = context;
    }

    public async Task<Result<PagedResult<PurchaseInvoiceListDto>>> Handle(GetPurchaseInvoicesQuery request, CancellationToken cancellationToken)
    {
        var query = _context.PurchaseInvoices
            .Include(i => i.Items)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var searchTerm = request.SearchTerm.ToLower();
            query = query.Where(i =>
                i.InvoiceNumber.ToLower().Contains(searchTerm) ||
                (i.SupplierInvoiceNumber != null && i.SupplierInvoiceNumber.ToLower().Contains(searchTerm)) ||
                (i.SupplierName != null && i.SupplierName.ToLower().Contains(searchTerm)));
        }

        if (request.Status.HasValue)
            query = query.Where(i => i.Status == request.Status.Value);

        if (request.Type.HasValue)
            query = query.Where(i => i.Type == request.Type.Value);

        if (request.SupplierId.HasValue)
            query = query.Where(i => i.SupplierId == request.SupplierId.Value);

        if (request.FromDate.HasValue)
            query = query.Where(i => i.InvoiceDate >= request.FromDate.Value);

        if (request.ToDate.HasValue)
            query = query.Where(i => i.InvoiceDate <= request.ToDate.Value);

        if (request.DueDateFrom.HasValue)
            query = query.Where(i => i.DueDate >= request.DueDateFrom.Value);

        if (request.DueDateTo.HasValue)
            query = query.Where(i => i.DueDate <= request.DueDateTo.Value);

        if (request.IsOverdue == true)
            query = query.Where(i => i.DueDate < DateTime.UtcNow && i.RemainingAmount > 0);

        var totalCount = await query.CountAsync(cancellationToken);

        query = request.SortBy?.ToLower() switch
        {
            "invoicenumber" => request.SortDescending ? query.OrderByDescending(i => i.InvoiceNumber) : query.OrderBy(i => i.InvoiceNumber),
            "suppliername" => request.SortDescending ? query.OrderByDescending(i => i.SupplierName) : query.OrderBy(i => i.SupplierName),
            "totalamount" => request.SortDescending ? query.OrderByDescending(i => i.TotalAmount) : query.OrderBy(i => i.TotalAmount),
            "duedate" => request.SortDescending ? query.OrderByDescending(i => i.DueDate) : query.OrderBy(i => i.DueDate),
            "status" => request.SortDescending ? query.OrderByDescending(i => i.Status) : query.OrderBy(i => i.Status),
            _ => request.SortDescending ? query.OrderByDescending(i => i.CreatedAt) : query.OrderBy(i => i.CreatedAt)
        };

        var items = await query
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(i => new PurchaseInvoiceListDto
            {
                Id = i.Id,
                InvoiceNumber = i.InvoiceNumber,
                SupplierInvoiceNumber = i.SupplierInvoiceNumber,
                InvoiceDate = i.InvoiceDate,
                DueDate = i.DueDate,
                SupplierName = i.SupplierName,
                Status = i.Status.ToString(),
                Type = i.Type.ToString(),
                TotalAmount = i.TotalAmount,
                PaidAmount = i.PaidAmount,
                RemainingAmount = i.RemainingAmount,
                Currency = i.Currency,
                EInvoiceStatus = i.EInvoiceStatus.ToString(),
                ItemCount = i.Items.Count,
                CreatedAt = i.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return Result<PagedResult<PurchaseInvoiceListDto>>.Success(
            new PagedResult<PurchaseInvoiceListDto>(items, request.Page, request.PageSize, totalCount));
    }
}

public class ApprovePurchaseInvoiceHandler : IRequestHandler<ApprovePurchaseInvoiceCommand, Result<PurchaseInvoiceDto>>
{
    private readonly PurchaseDbContext _context;
    private readonly IMapper _mapper;
    private readonly ICurrentUserService _currentUserService;

    public ApprovePurchaseInvoiceHandler(PurchaseDbContext context, IMapper mapper, ICurrentUserService currentUserService)
    {
        _context = context;
        _mapper = mapper;
        _currentUserService = currentUserService;
    }

    public async Task<Result<PurchaseInvoiceDto>> Handle(ApprovePurchaseInvoiceCommand request, CancellationToken cancellationToken)
    {
        var invoice = await _context.PurchaseInvoices
            .Include(i => i.Items)
            .FirstOrDefaultAsync(i => i.Id == request.Id, cancellationToken);

        if (invoice == null)
            return Result<PurchaseInvoiceDto>.Failure(Error.NotFound("PurchaseInvoice", "Purchase invoice not found"));

        var userId = _currentUserService.UserId ?? Guid.Empty;
        var userName = _currentUserService.UserName;

        invoice.Approve(userId, userName);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<PurchaseInvoiceDto>.Success(_mapper.Map<PurchaseInvoiceDto>(invoice));
    }
}

public class RecordInvoicePaymentHandler : IRequestHandler<RecordInvoicePaymentCommand, Result<PurchaseInvoiceDto>>
{
    private readonly PurchaseDbContext _context;
    private readonly IMapper _mapper;

    public RecordInvoicePaymentHandler(PurchaseDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<PurchaseInvoiceDto>> Handle(RecordInvoicePaymentCommand request, CancellationToken cancellationToken)
    {
        var invoice = await _context.PurchaseInvoices
            .Include(i => i.Items)
            .FirstOrDefaultAsync(i => i.Id == request.Id, cancellationToken);

        if (invoice == null)
            return Result<PurchaseInvoiceDto>.Failure(Error.NotFound("PurchaseInvoice", "Purchase invoice not found"));

        invoice.RecordPayment(request.Dto.Amount);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<PurchaseInvoiceDto>.Success(_mapper.Map<PurchaseInvoiceDto>(invoice));
    }
}

public class DeletePurchaseInvoiceHandler : IRequestHandler<DeletePurchaseInvoiceCommand, Result>
{
    private readonly PurchaseDbContext _context;

    public DeletePurchaseInvoiceHandler(PurchaseDbContext context)
    {
        _context = context;
    }

    public async Task<Result> Handle(DeletePurchaseInvoiceCommand request, CancellationToken cancellationToken)
    {
        var invoice = await _context.PurchaseInvoices
            .FirstOrDefaultAsync(i => i.Id == request.Id, cancellationToken);

        if (invoice == null)
            return Result.Failure(Error.NotFound("PurchaseInvoice", "Purchase invoice not found"));

        if (invoice.Status != PurchaseInvoiceStatus.Draft)
            return Result.Failure(Error.Conflict("PurchaseInvoice.Status", "Only draft invoices can be deleted"));

        _context.PurchaseInvoices.Remove(invoice);
        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}

public class GetOverduePurchaseInvoicesHandler : IRequestHandler<GetOverduePurchaseInvoicesQuery, Result<List<PurchaseInvoiceListDto>>>
{
    private readonly PurchaseDbContext _context;

    public GetOverduePurchaseInvoicesHandler(PurchaseDbContext context)
    {
        _context = context;
    }

    public async Task<Result<List<PurchaseInvoiceListDto>>> Handle(GetOverduePurchaseInvoicesQuery request, CancellationToken cancellationToken)
    {
        var invoices = await _context.PurchaseInvoices
            .Include(i => i.Items)
            .Where(i => i.DueDate < DateTime.UtcNow && i.RemainingAmount > 0)
            .OrderBy(i => i.DueDate)
            .Select(i => new PurchaseInvoiceListDto
            {
                Id = i.Id,
                InvoiceNumber = i.InvoiceNumber,
                SupplierInvoiceNumber = i.SupplierInvoiceNumber,
                InvoiceDate = i.InvoiceDate,
                DueDate = i.DueDate,
                SupplierName = i.SupplierName,
                Status = i.Status.ToString(),
                Type = i.Type.ToString(),
                TotalAmount = i.TotalAmount,
                PaidAmount = i.PaidAmount,
                RemainingAmount = i.RemainingAmount,
                Currency = i.Currency,
                EInvoiceStatus = i.EInvoiceStatus.ToString(),
                ItemCount = i.Items.Count,
                CreatedAt = i.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return Result<List<PurchaseInvoiceListDto>>.Success(invoices);
    }
}
