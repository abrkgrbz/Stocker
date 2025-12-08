using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Purchase.Application.DTOs;
using Stocker.Modules.Purchase.Application.Features.PurchaseReturns.Commands;
using Stocker.Modules.Purchase.Application.Features.PurchaseReturns.Queries;
using Stocker.Modules.Purchase.Domain.Entities;
using Stocker.Modules.Purchase.Infrastructure.Persistence;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Purchase.Application.Features.PurchaseReturns.Handlers;

public class CreatePurchaseReturnHandler : IRequestHandler<CreatePurchaseReturnCommand, Result<PurchaseReturnDto>>
{
    private readonly PurchaseDbContext _context;
    private readonly IMapper _mapper;
    private readonly ITenantService _tenantService;

    public CreatePurchaseReturnHandler(PurchaseDbContext context, IMapper mapper, ITenantService tenantService)
    {
        _context = context;
        _mapper = mapper;
        _tenantService = tenantService;
    }

    public async Task<Result<PurchaseReturnDto>> Handle(CreatePurchaseReturnCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue)
            return Result<PurchaseReturnDto>.Failure(Error.Unauthorized("Tenant", "Tenant is required"));

        var returnNumber = $"PRN-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..8].ToUpper()}";

        var purchaseReturn = PurchaseReturn.Create(
            returnNumber,
            request.Dto.SupplierId,
            request.Dto.SupplierName,
            request.Dto.WarehouseId ?? Guid.Empty,
            request.Dto.WarehouseName,
            request.Dto.Reason,
            tenantId.Value,
            request.Dto.Type
        );

        if (!string.IsNullOrEmpty(request.Dto.ReasonDescription))
            purchaseReturn.SetReasonDescription(request.Dto.ReasonDescription);

        if (request.Dto.PurchaseOrderId.HasValue)
            purchaseReturn.LinkToPurchaseOrder(request.Dto.PurchaseOrderId.Value, request.Dto.PurchaseOrderNumber);

        if (request.Dto.GoodsReceiptId.HasValue)
            purchaseReturn.LinkToGoodsReceipt(request.Dto.GoodsReceiptId.Value, request.Dto.GoodsReceiptNumber);

        if (request.Dto.PurchaseInvoiceId.HasValue)
            purchaseReturn.LinkToPurchaseInvoice(request.Dto.PurchaseInvoiceId.Value, request.Dto.PurchaseInvoiceNumber);

        if (request.Dto.RefundMethod.HasValue)
            purchaseReturn.SetRefundMethod(request.Dto.RefundMethod.Value);

        if (!string.IsNullOrEmpty(request.Dto.Notes))
            purchaseReturn.SetNotes(request.Dto.Notes);

        int lineNumber = 1;
        foreach (var itemDto in request.Dto.Items)
        {
            var item = PurchaseReturnItem.Create(
                purchaseReturn.Id,
                itemDto.ProductId ?? Guid.Empty,
                itemDto.ProductCode,
                itemDto.ProductName,
                itemDto.Unit ?? "Adet",
                itemDto.Quantity,
                itemDto.UnitPrice,
                itemDto.VatRate,
                itemDto.Reason,
                itemDto.Condition,
                lineNumber++,
                tenantId.Value
            );

            if (!string.IsNullOrEmpty(itemDto.ReasonDescription))
                item.SetReasonDescription(itemDto.ReasonDescription);

            if (!string.IsNullOrEmpty(itemDto.BatchNumber) || !string.IsNullOrEmpty(itemDto.SerialNumber))
                item.SetBatchInfo(itemDto.BatchNumber, itemDto.SerialNumber);

            purchaseReturn.AddItem(item);
        }

        _context.PurchaseReturns.Add(purchaseReturn);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<PurchaseReturnDto>.Success(_mapper.Map<PurchaseReturnDto>(purchaseReturn));
    }
}

public class GetPurchaseReturnByIdHandler : IRequestHandler<GetPurchaseReturnByIdQuery, Result<PurchaseReturnDto>>
{
    private readonly PurchaseDbContext _context;
    private readonly IMapper _mapper;

    public GetPurchaseReturnByIdHandler(PurchaseDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<PurchaseReturnDto>> Handle(GetPurchaseReturnByIdQuery request, CancellationToken cancellationToken)
    {
        var purchaseReturn = await _context.PurchaseReturns
            .Include(r => r.Items)
            .FirstOrDefaultAsync(r => r.Id == request.Id, cancellationToken);

        if (purchaseReturn == null)
            return Result<PurchaseReturnDto>.Failure(Error.NotFound("PurchaseReturn", "Purchase return not found"));

        return Result<PurchaseReturnDto>.Success(_mapper.Map<PurchaseReturnDto>(purchaseReturn));
    }
}

public class GetPurchaseReturnsHandler : IRequestHandler<GetPurchaseReturnsQuery, Result<PagedResult<PurchaseReturnListDto>>>
{
    private readonly PurchaseDbContext _context;

    public GetPurchaseReturnsHandler(PurchaseDbContext context)
    {
        _context = context;
    }

    public async Task<Result<PagedResult<PurchaseReturnListDto>>> Handle(GetPurchaseReturnsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.PurchaseReturns
            .Include(r => r.Items)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var searchTerm = request.SearchTerm.ToLower();
            query = query.Where(r =>
                r.ReturnNumber.ToLower().Contains(searchTerm) ||
                (r.RmaNumber != null && r.RmaNumber.ToLower().Contains(searchTerm)) ||
                (r.SupplierName != null && r.SupplierName.ToLower().Contains(searchTerm)));
        }

        if (request.Status.HasValue)
            query = query.Where(r => r.Status == request.Status.Value);

        if (request.Type.HasValue)
            query = query.Where(r => r.Type == request.Type.Value);

        if (request.Reason.HasValue)
            query = query.Where(r => r.Reason == request.Reason.Value);

        if (request.SupplierId.HasValue)
            query = query.Where(r => r.SupplierId == request.SupplierId.Value);

        if (request.FromDate.HasValue)
            query = query.Where(r => r.ReturnDate >= request.FromDate.Value);

        if (request.ToDate.HasValue)
            query = query.Where(r => r.ReturnDate <= request.ToDate.Value);

        var totalCount = await query.CountAsync(cancellationToken);

        query = request.SortBy?.ToLower() switch
        {
            "returnnumber" => request.SortDescending ? query.OrderByDescending(r => r.ReturnNumber) : query.OrderBy(r => r.ReturnNumber),
            "suppliername" => request.SortDescending ? query.OrderByDescending(r => r.SupplierName) : query.OrderBy(r => r.SupplierName),
            "totalamount" => request.SortDescending ? query.OrderByDescending(r => r.TotalAmount) : query.OrderBy(r => r.TotalAmount),
            "status" => request.SortDescending ? query.OrderByDescending(r => r.Status) : query.OrderBy(r => r.Status),
            _ => request.SortDescending ? query.OrderByDescending(r => r.CreatedAt) : query.OrderBy(r => r.CreatedAt)
        };

        var items = await query
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(r => new PurchaseReturnListDto
            {
                Id = r.Id,
                ReturnNumber = r.ReturnNumber,
                RmaNumber = r.RmaNumber,
                ReturnDate = r.ReturnDate,
                SupplierName = r.SupplierName,
                Status = r.Status.ToString(),
                Type = r.Type.ToString(),
                Reason = r.Reason.ToString(),
                TotalAmount = r.TotalAmount,
                RefundAmount = r.RefundAmount,
                Currency = r.Currency,
                ItemCount = r.Items.Count,
                CreatedAt = r.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return Result<PagedResult<PurchaseReturnListDto>>.Success(
            new PagedResult<PurchaseReturnListDto>(items, request.Page, request.PageSize, totalCount));
    }
}

public class ApprovePurchaseReturnHandler : IRequestHandler<ApprovePurchaseReturnCommand, Result<PurchaseReturnDto>>
{
    private readonly PurchaseDbContext _context;
    private readonly IMapper _mapper;
    private readonly ICurrentUserService _currentUserService;

    public ApprovePurchaseReturnHandler(PurchaseDbContext context, IMapper mapper, ICurrentUserService currentUserService)
    {
        _context = context;
        _mapper = mapper;
        _currentUserService = currentUserService;
    }

    public async Task<Result<PurchaseReturnDto>> Handle(ApprovePurchaseReturnCommand request, CancellationToken cancellationToken)
    {
        var purchaseReturn = await _context.PurchaseReturns
            .Include(r => r.Items)
            .FirstOrDefaultAsync(r => r.Id == request.Id, cancellationToken);

        if (purchaseReturn == null)
            return Result<PurchaseReturnDto>.Failure(Error.NotFound("PurchaseReturn", "Purchase return not found"));

        var userId = _currentUserService.UserId ?? Guid.Empty;
        var userName = _currentUserService.UserName;

        purchaseReturn.Approve(userId, userName);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<PurchaseReturnDto>.Success(_mapper.Map<PurchaseReturnDto>(purchaseReturn));
    }
}

public class ShipPurchaseReturnHandler : IRequestHandler<ShipPurchaseReturnCommand, Result<PurchaseReturnDto>>
{
    private readonly PurchaseDbContext _context;
    private readonly IMapper _mapper;

    public ShipPurchaseReturnHandler(PurchaseDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<PurchaseReturnDto>> Handle(ShipPurchaseReturnCommand request, CancellationToken cancellationToken)
    {
        var purchaseReturn = await _context.PurchaseReturns
            .Include(r => r.Items)
            .FirstOrDefaultAsync(r => r.Id == request.Id, cancellationToken);

        if (purchaseReturn == null)
            return Result<PurchaseReturnDto>.Failure(Error.NotFound("PurchaseReturn", "Purchase return not found"));

        if (!string.IsNullOrEmpty(request.Dto.ShippingMethod) || !string.IsNullOrEmpty(request.Dto.TrackingNumber))
            purchaseReturn.SetShippingInfo(request.Dto.ShippingMethod, request.Dto.TrackingNumber, request.Dto.ShippingCost);

        purchaseReturn.Ship();
        await _context.SaveChangesAsync(cancellationToken);

        return Result<PurchaseReturnDto>.Success(_mapper.Map<PurchaseReturnDto>(purchaseReturn));
    }
}

public class ProcessReturnRefundHandler : IRequestHandler<ProcessReturnRefundCommand, Result<PurchaseReturnDto>>
{
    private readonly PurchaseDbContext _context;
    private readonly IMapper _mapper;

    public ProcessReturnRefundHandler(PurchaseDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<PurchaseReturnDto>> Handle(ProcessReturnRefundCommand request, CancellationToken cancellationToken)
    {
        var purchaseReturn = await _context.PurchaseReturns
            .Include(r => r.Items)
            .FirstOrDefaultAsync(r => r.Id == request.Id, cancellationToken);

        if (purchaseReturn == null)
            return Result<PurchaseReturnDto>.Failure(Error.NotFound("PurchaseReturn", "Purchase return not found"));

        var refundAmount = request.Dto.Amount > 0 ? request.Dto.Amount : purchaseReturn.TotalAmount;
        purchaseReturn.ProcessRefund(refundAmount, request.Dto.RefundReference);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<PurchaseReturnDto>.Success(_mapper.Map<PurchaseReturnDto>(purchaseReturn));
    }
}

public class DeletePurchaseReturnHandler : IRequestHandler<DeletePurchaseReturnCommand, Result>
{
    private readonly PurchaseDbContext _context;

    public DeletePurchaseReturnHandler(PurchaseDbContext context)
    {
        _context = context;
    }

    public async Task<Result> Handle(DeletePurchaseReturnCommand request, CancellationToken cancellationToken)
    {
        var purchaseReturn = await _context.PurchaseReturns
            .FirstOrDefaultAsync(r => r.Id == request.Id, cancellationToken);

        if (purchaseReturn == null)
            return Result.Failure(Error.NotFound("PurchaseReturn", "Purchase return not found"));

        if (purchaseReturn.Status != PurchaseReturnStatus.Draft)
            return Result.Failure(Error.Conflict("PurchaseReturn.Status", "Only draft returns can be deleted"));

        _context.PurchaseReturns.Remove(purchaseReturn);
        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}

public class GetPendingPurchaseReturnsHandler : IRequestHandler<GetPendingPurchaseReturnsQuery, Result<List<PurchaseReturnListDto>>>
{
    private readonly PurchaseDbContext _context;

    public GetPendingPurchaseReturnsHandler(PurchaseDbContext context)
    {
        _context = context;
    }

    public async Task<Result<List<PurchaseReturnListDto>>> Handle(GetPendingPurchaseReturnsQuery request, CancellationToken cancellationToken)
    {
        var returns = await _context.PurchaseReturns
            .Include(r => r.Items)
            .Where(r => r.Status == PurchaseReturnStatus.Pending)
            .OrderBy(r => r.CreatedAt)
            .Select(r => new PurchaseReturnListDto
            {
                Id = r.Id,
                ReturnNumber = r.ReturnNumber,
                RmaNumber = r.RmaNumber,
                ReturnDate = r.ReturnDate,
                SupplierName = r.SupplierName,
                Status = r.Status.ToString(),
                Type = r.Type.ToString(),
                Reason = r.Reason.ToString(),
                TotalAmount = r.TotalAmount,
                RefundAmount = r.RefundAmount,
                Currency = r.Currency,
                ItemCount = r.Items.Count,
                CreatedAt = r.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return Result<List<PurchaseReturnListDto>>.Success(returns);
    }
}
