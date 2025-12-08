using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Purchase.Application.DTOs;
using Stocker.Modules.Purchase.Application.Features.SupplierPayments.Commands;
using Stocker.Modules.Purchase.Application.Features.SupplierPayments.Queries;
using Stocker.Modules.Purchase.Domain.Entities;
using Stocker.Modules.Purchase.Infrastructure.Persistence;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Purchase.Application.Features.SupplierPayments.Handlers;

public class CreateSupplierPaymentHandler : IRequestHandler<CreateSupplierPaymentCommand, Result<SupplierPaymentDto>>
{
    private readonly PurchaseDbContext _context;
    private readonly IMapper _mapper;
    private readonly ITenantService _tenantService;

    public CreateSupplierPaymentHandler(PurchaseDbContext context, IMapper mapper, ITenantService tenantService)
    {
        _context = context;
        _mapper = mapper;
        _tenantService = tenantService;
    }

    public async Task<Result<SupplierPaymentDto>> Handle(CreateSupplierPaymentCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue)
            return Result<SupplierPaymentDto>.Failure(Error.Unauthorized("Tenant", "Tenant is required"));

        var paymentNumber = $"SP-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..8].ToUpper()}";

        var payment = SupplierPayment.Create(
            paymentNumber,
            request.Dto.SupplierId,
            request.Dto.SupplierName,
            request.Dto.Amount,
            request.Dto.Method,
            tenantId.Value,
            request.Dto.Type,
            request.Dto.Currency
        );

        if (request.Dto.PaymentDate.HasValue)
            payment.SetPaymentDate(request.Dto.PaymentDate.Value);

        if (request.Dto.ExchangeRate != 1)
            payment.SetExchangeRate(request.Dto.ExchangeRate);

        payment.SetBankDetails(
            request.Dto.BankName,
            request.Dto.BankAccountNumber,
            request.Dto.IBAN,
            request.Dto.SwiftCode
        );

        if (request.Dto.CheckNumber != null || request.Dto.CheckDate.HasValue)
            payment.SetCheckDetails(request.Dto.CheckNumber, request.Dto.CheckDate);

        payment.SetDescription(request.Dto.Description);
        payment.SetNotes(request.Dto.Notes, request.Dto.InternalNotes);

        if (request.Dto.PurchaseInvoiceId.HasValue)
            payment.LinkToInvoice(request.Dto.PurchaseInvoiceId.Value, request.Dto.PurchaseInvoiceNumber);

        if (!string.IsNullOrEmpty(request.Dto.LinkedInvoiceIds))
            payment.LinkToMultipleInvoices(request.Dto.LinkedInvoiceIds);

        _context.SupplierPayments.Add(payment);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<SupplierPaymentDto>.Success(_mapper.Map<SupplierPaymentDto>(payment));
    }
}

public class GetSupplierPaymentByIdHandler : IRequestHandler<GetSupplierPaymentByIdQuery, Result<SupplierPaymentDto>>
{
    private readonly PurchaseDbContext _context;
    private readonly IMapper _mapper;

    public GetSupplierPaymentByIdHandler(PurchaseDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<SupplierPaymentDto>> Handle(GetSupplierPaymentByIdQuery request, CancellationToken cancellationToken)
    {
        var payment = await _context.SupplierPayments
            .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);

        if (payment == null)
            return Result<SupplierPaymentDto>.Failure(Error.NotFound("SupplierPayment", "Supplier payment not found"));

        return Result<SupplierPaymentDto>.Success(_mapper.Map<SupplierPaymentDto>(payment));
    }
}

public class GetSupplierPaymentsHandler : IRequestHandler<GetSupplierPaymentsQuery, Result<PagedResult<SupplierPaymentListDto>>>
{
    private readonly PurchaseDbContext _context;

    public GetSupplierPaymentsHandler(PurchaseDbContext context)
    {
        _context = context;
    }

    public async Task<Result<PagedResult<SupplierPaymentListDto>>> Handle(GetSupplierPaymentsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.SupplierPayments.AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var searchTerm = request.SearchTerm.ToLower();
            query = query.Where(p =>
                p.PaymentNumber.ToLower().Contains(searchTerm) ||
                (p.SupplierName != null && p.SupplierName.ToLower().Contains(searchTerm)) ||
                (p.TransactionReference != null && p.TransactionReference.ToLower().Contains(searchTerm)));
        }

        if (request.Status.HasValue)
            query = query.Where(p => p.Status == request.Status.Value);

        if (request.Type.HasValue)
            query = query.Where(p => p.Type == request.Type.Value);

        if (request.Method.HasValue)
            query = query.Where(p => p.Method == request.Method.Value);

        if (request.SupplierId.HasValue)
            query = query.Where(p => p.SupplierId == request.SupplierId.Value);

        if (request.FromDate.HasValue)
            query = query.Where(p => p.PaymentDate >= request.FromDate.Value);

        if (request.ToDate.HasValue)
            query = query.Where(p => p.PaymentDate <= request.ToDate.Value);

        if (request.IsReconciled.HasValue)
            query = query.Where(p => p.IsReconciled == request.IsReconciled.Value);

        var totalCount = await query.CountAsync(cancellationToken);

        query = request.SortBy?.ToLower() switch
        {
            "paymentnumber" => request.SortDescending ? query.OrderByDescending(p => p.PaymentNumber) : query.OrderBy(p => p.PaymentNumber),
            "suppliername" => request.SortDescending ? query.OrderByDescending(p => p.SupplierName) : query.OrderBy(p => p.SupplierName),
            "amount" => request.SortDescending ? query.OrderByDescending(p => p.Amount) : query.OrderBy(p => p.Amount),
            "paymentdate" => request.SortDescending ? query.OrderByDescending(p => p.PaymentDate) : query.OrderBy(p => p.PaymentDate),
            "status" => request.SortDescending ? query.OrderByDescending(p => p.Status) : query.OrderBy(p => p.Status),
            _ => request.SortDescending ? query.OrderByDescending(p => p.CreatedAt) : query.OrderBy(p => p.CreatedAt)
        };

        var items = await query
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(p => new SupplierPaymentListDto
            {
                Id = p.Id,
                PaymentNumber = p.PaymentNumber,
                PaymentDate = p.PaymentDate,
                SupplierName = p.SupplierName,
                Status = p.Status.ToString(),
                Type = p.Type.ToString(),
                Method = p.Method.ToString(),
                Amount = p.Amount,
                Currency = p.Currency,
                PurchaseInvoiceNumber = p.PurchaseInvoiceNumber,
                IsReconciled = p.IsReconciled,
                CreatedAt = p.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return Result<PagedResult<SupplierPaymentListDto>>.Success(
            new PagedResult<SupplierPaymentListDto>(items, request.Page, request.PageSize, totalCount));
    }
}

public class SubmitSupplierPaymentHandler : IRequestHandler<SubmitSupplierPaymentCommand, Result<SupplierPaymentDto>>
{
    private readonly PurchaseDbContext _context;
    private readonly IMapper _mapper;

    public SubmitSupplierPaymentHandler(PurchaseDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<SupplierPaymentDto>> Handle(SubmitSupplierPaymentCommand request, CancellationToken cancellationToken)
    {
        var payment = await _context.SupplierPayments
            .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);

        if (payment == null)
            return Result<SupplierPaymentDto>.Failure(Error.NotFound("SupplierPayment", "Supplier payment not found"));

        payment.Submit();
        await _context.SaveChangesAsync(cancellationToken);

        return Result<SupplierPaymentDto>.Success(_mapper.Map<SupplierPaymentDto>(payment));
    }
}

public class ApproveSupplierPaymentHandler : IRequestHandler<ApproveSupplierPaymentCommand, Result<SupplierPaymentDto>>
{
    private readonly PurchaseDbContext _context;
    private readonly IMapper _mapper;
    private readonly ICurrentUserService _currentUserService;

    public ApproveSupplierPaymentHandler(PurchaseDbContext context, IMapper mapper, ICurrentUserService currentUserService)
    {
        _context = context;
        _mapper = mapper;
        _currentUserService = currentUserService;
    }

    public async Task<Result<SupplierPaymentDto>> Handle(ApproveSupplierPaymentCommand request, CancellationToken cancellationToken)
    {
        var payment = await _context.SupplierPayments
            .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);

        if (payment == null)
            return Result<SupplierPaymentDto>.Failure(Error.NotFound("SupplierPayment", "Supplier payment not found"));

        var userId = _currentUserService.UserId ?? Guid.Empty;
        var userName = _currentUserService.UserName;

        payment.Approve(userId, userName);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<SupplierPaymentDto>.Success(_mapper.Map<SupplierPaymentDto>(payment));
    }
}

public class ProcessSupplierPaymentHandler : IRequestHandler<ProcessSupplierPaymentCommand, Result<SupplierPaymentDto>>
{
    private readonly PurchaseDbContext _context;
    private readonly IMapper _mapper;
    private readonly ICurrentUserService _currentUserService;

    public ProcessSupplierPaymentHandler(PurchaseDbContext context, IMapper mapper, ICurrentUserService currentUserService)
    {
        _context = context;
        _mapper = mapper;
        _currentUserService = currentUserService;
    }

    public async Task<Result<SupplierPaymentDto>> Handle(ProcessSupplierPaymentCommand request, CancellationToken cancellationToken)
    {
        var payment = await _context.SupplierPayments
            .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);

        if (payment == null)
            return Result<SupplierPaymentDto>.Failure(Error.NotFound("SupplierPayment", "Supplier payment not found"));

        var userId = _currentUserService.UserId ?? Guid.Empty;
        var userName = _currentUserService.UserName;

        if (!string.IsNullOrEmpty(request.Dto.TransactionReference))
            payment.SetTransactionReference(request.Dto.TransactionReference);

        payment.Process(userId, userName);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<SupplierPaymentDto>.Success(_mapper.Map<SupplierPaymentDto>(payment));
    }
}

public class CompleteSupplierPaymentHandler : IRequestHandler<CompleteSupplierPaymentCommand, Result<SupplierPaymentDto>>
{
    private readonly PurchaseDbContext _context;
    private readonly IMapper _mapper;

    public CompleteSupplierPaymentHandler(PurchaseDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<SupplierPaymentDto>> Handle(CompleteSupplierPaymentCommand request, CancellationToken cancellationToken)
    {
        var payment = await _context.SupplierPayments
            .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);

        if (payment == null)
            return Result<SupplierPaymentDto>.Failure(Error.NotFound("SupplierPayment", "Supplier payment not found"));

        payment.Complete();
        await _context.SaveChangesAsync(cancellationToken);

        return Result<SupplierPaymentDto>.Success(_mapper.Map<SupplierPaymentDto>(payment));
    }
}

public class ReconcileSupplierPaymentHandler : IRequestHandler<ReconcileSupplierPaymentCommand, Result<SupplierPaymentDto>>
{
    private readonly PurchaseDbContext _context;
    private readonly IMapper _mapper;

    public ReconcileSupplierPaymentHandler(PurchaseDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<SupplierPaymentDto>> Handle(ReconcileSupplierPaymentCommand request, CancellationToken cancellationToken)
    {
        var payment = await _context.SupplierPayments
            .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);

        if (payment == null)
            return Result<SupplierPaymentDto>.Failure(Error.NotFound("SupplierPayment", "Supplier payment not found"));

        payment.MarkAsReconciled(request.Dto.ReconciliationReference);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<SupplierPaymentDto>.Success(_mapper.Map<SupplierPaymentDto>(payment));
    }
}

public class DeleteSupplierPaymentHandler : IRequestHandler<DeleteSupplierPaymentCommand, Result>
{
    private readonly PurchaseDbContext _context;

    public DeleteSupplierPaymentHandler(PurchaseDbContext context)
    {
        _context = context;
    }

    public async Task<Result> Handle(DeleteSupplierPaymentCommand request, CancellationToken cancellationToken)
    {
        var payment = await _context.SupplierPayments
            .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);

        if (payment == null)
            return Result.Failure(Error.NotFound("SupplierPayment", "Supplier payment not found"));

        if (payment.Status != SupplierPaymentStatus.Draft)
            return Result.Failure(Error.Conflict("SupplierPayment.Status", "Only draft payments can be deleted"));

        _context.SupplierPayments.Remove(payment);
        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}

public class GetPendingApprovalPaymentsHandler : IRequestHandler<GetPendingApprovalPaymentsQuery, Result<List<SupplierPaymentListDto>>>
{
    private readonly PurchaseDbContext _context;

    public GetPendingApprovalPaymentsHandler(PurchaseDbContext context)
    {
        _context = context;
    }

    public async Task<Result<List<SupplierPaymentListDto>>> Handle(GetPendingApprovalPaymentsQuery request, CancellationToken cancellationToken)
    {
        var payments = await _context.SupplierPayments
            .Where(p => p.Status == SupplierPaymentStatus.PendingApproval)
            .OrderBy(p => p.CreatedAt)
            .Select(p => new SupplierPaymentListDto
            {
                Id = p.Id,
                PaymentNumber = p.PaymentNumber,
                PaymentDate = p.PaymentDate,
                SupplierName = p.SupplierName,
                Status = p.Status.ToString(),
                Type = p.Type.ToString(),
                Method = p.Method.ToString(),
                Amount = p.Amount,
                Currency = p.Currency,
                PurchaseInvoiceNumber = p.PurchaseInvoiceNumber,
                IsReconciled = p.IsReconciled,
                CreatedAt = p.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return Result<List<SupplierPaymentListDto>>.Success(payments);
    }
}
