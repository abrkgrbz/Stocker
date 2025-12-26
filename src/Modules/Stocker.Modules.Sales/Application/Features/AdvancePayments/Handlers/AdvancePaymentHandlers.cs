using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Application.Features.AdvancePayments.Commands;
using Stocker.Modules.Sales.Application.Features.AdvancePayments.Queries;
using Stocker.Modules.Sales.Domain.Entities;
using Stocker.Modules.Sales.Infrastructure.Persistence;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.Sales.Application.Features.AdvancePayments.Handlers;

public class GetAdvancePaymentsHandler : IRequestHandler<GetAdvancePaymentsQuery, Result<PagedResult<AdvancePaymentListDto>>>
{
    private readonly SalesDbContext _dbContext;
    private readonly ITenantService _tenantService;

    public GetAdvancePaymentsHandler(SalesDbContext dbContext, ITenantService tenantService)
    {
        _dbContext = dbContext;
        _tenantService = tenantService;
    }

    public async Task<Result<PagedResult<AdvancePaymentListDto>>> Handle(GetAdvancePaymentsQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantService.GetCurrentTenantId() ?? throw new InvalidOperationException("Tenant ID is required");

        var query = _dbContext.AdvancePayments
            .Where(ap => ap.TenantId == tenantId)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var searchTerm = request.SearchTerm.ToLower();
            query = query.Where(ap =>
                ap.PaymentNumber.ToLower().Contains(searchTerm) ||
                ap.CustomerName.ToLower().Contains(searchTerm));
        }

        if (!string.IsNullOrWhiteSpace(request.Status))
        {
            if (Enum.TryParse<AdvancePaymentStatus>(request.Status, true, out var status))
                query = query.Where(ap => ap.Status == status);
        }

        if (request.CustomerId.HasValue)
            query = query.Where(ap => ap.CustomerId == request.CustomerId.Value);

        if (request.SalesOrderId.HasValue)
            query = query.Where(ap => ap.SalesOrderId == request.SalesOrderId.Value);

        if (request.FromDate.HasValue)
            query = query.Where(ap => ap.PaymentDate >= request.FromDate.Value);

        if (request.ToDate.HasValue)
            query = query.Where(ap => ap.PaymentDate <= request.ToDate.Value);

        if (request.IsCaptured.HasValue)
            query = query.Where(ap => ap.IsCaptured == request.IsCaptured.Value);

        query = request.SortBy?.ToLower() switch
        {
            "paymentnumber" => request.SortDescending
                ? query.OrderByDescending(ap => ap.PaymentNumber)
                : query.OrderBy(ap => ap.PaymentNumber),
            "customername" => request.SortDescending
                ? query.OrderByDescending(ap => ap.CustomerName)
                : query.OrderBy(ap => ap.CustomerName),
            "amount" => request.SortDescending
                ? query.OrderByDescending(ap => ap.Amount)
                : query.OrderBy(ap => ap.Amount),
            "status" => request.SortDescending
                ? query.OrderByDescending(ap => ap.Status)
                : query.OrderBy(ap => ap.Status),
            _ => request.SortDescending
                ? query.OrderByDescending(ap => ap.PaymentDate)
                : query.OrderBy(ap => ap.PaymentDate)
        };

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        var result = new PagedResult<AdvancePaymentListDto>(
            items.Select(AdvancePaymentListDto.FromEntity),
            request.Page,
            request.PageSize,
            totalCount);

        return Result<PagedResult<AdvancePaymentListDto>>.Success(result);
    }
}

public class GetAdvancePaymentByIdHandler : IRequestHandler<GetAdvancePaymentByIdQuery, Result<AdvancePaymentDto>>
{
    private readonly SalesDbContext _dbContext;
    private readonly ITenantService _tenantService;

    public GetAdvancePaymentByIdHandler(SalesDbContext dbContext, ITenantService tenantService)
    {
        _dbContext = dbContext;
        _tenantService = tenantService;
    }

    public async Task<Result<AdvancePaymentDto>> Handle(GetAdvancePaymentByIdQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantService.GetCurrentTenantId() ?? throw new InvalidOperationException("Tenant ID is required");

        var payment = await _dbContext.AdvancePayments
            .FirstOrDefaultAsync(ap => ap.Id == request.Id && ap.TenantId == tenantId, cancellationToken);

        if (payment == null)
            return Result<AdvancePaymentDto>.Failure(Error.NotFound("AdvancePayment", "Advance payment not found"));

        return Result<AdvancePaymentDto>.Success(AdvancePaymentDto.FromEntity(payment));
    }
}

public class GetAdvancePaymentStatisticsHandler : IRequestHandler<GetAdvancePaymentStatisticsQuery, Result<AdvancePaymentStatisticsDto>>
{
    private readonly SalesDbContext _dbContext;
    private readonly ITenantService _tenantService;

    public GetAdvancePaymentStatisticsHandler(SalesDbContext dbContext, ITenantService tenantService)
    {
        _dbContext = dbContext;
        _tenantService = tenantService;
    }

    public async Task<Result<AdvancePaymentStatisticsDto>> Handle(GetAdvancePaymentStatisticsQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantService.GetCurrentTenantId() ?? throw new InvalidOperationException("Tenant ID is required");

        var query = _dbContext.AdvancePayments
            .Where(ap => ap.TenantId == tenantId);

        if (request.FromDate.HasValue)
            query = query.Where(ap => ap.PaymentDate >= request.FromDate.Value);

        if (request.ToDate.HasValue)
            query = query.Where(ap => ap.PaymentDate <= request.ToDate.Value);

        var payments = await query.ToListAsync(cancellationToken);

        var stats = new AdvancePaymentStatisticsDto
        {
            TotalPayments = payments.Count,
            PendingPayments = payments.Count(p => p.Status == AdvancePaymentStatus.Pending),
            CapturedPayments = payments.Count(p => p.Status == AdvancePaymentStatus.Captured),
            AppliedPayments = payments.Count(p => p.Status == AdvancePaymentStatus.PartiallyApplied || p.Status == AdvancePaymentStatus.FullyApplied),
            RefundedPayments = payments.Count(p => p.Status == AdvancePaymentStatus.Refunded),
            TotalAmount = payments.Where(p => p.Status != AdvancePaymentStatus.Cancelled).Sum(p => p.Amount),
            AppliedAmount = payments.Sum(p => p.AppliedAmount),
            RemainingAmount = payments.Where(p => p.Status != AdvancePaymentStatus.Cancelled && p.Status != AdvancePaymentStatus.Refunded).Sum(p => p.RemainingAmount),
            RefundedAmount = payments.Sum(p => p.RefundedAmount),
            Currency = "TRY"
        };

        return Result<AdvancePaymentStatisticsDto>.Success(stats);
    }
}

public class CreateAdvancePaymentHandler : IRequestHandler<CreateAdvancePaymentCommand, Result<AdvancePaymentDto>>
{
    private readonly SalesDbContext _dbContext;
    private readonly ITenantService _tenantService;
    private readonly ILogger<CreateAdvancePaymentHandler> _logger;
    private readonly ICurrentUserService _currentUserService;

    public CreateAdvancePaymentHandler(
        SalesDbContext dbContext,
        ITenantService tenantService,
        ILogger<CreateAdvancePaymentHandler> logger,
        ICurrentUserService currentUserService)
    {
        _dbContext = dbContext;
        _tenantService = tenantService;
        _logger = logger;
        _currentUserService = currentUserService;
    }

    public async Task<Result<AdvancePaymentDto>> Handle(CreateAdvancePaymentCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantService.GetCurrentTenantId() ?? throw new InvalidOperationException("Tenant ID is required");

        var paymentNumber = await GeneratePaymentNumberAsync(tenantId, cancellationToken);

        var paymentResult = AdvancePayment.Create(
            tenantId,
            paymentNumber,
            request.CustomerId,
            request.CustomerName,
            request.Amount,
            request.Currency);

        if (!paymentResult.IsSuccess)
            return Result<AdvancePaymentDto>.Failure(paymentResult.Error);

        var payment = paymentResult.Value;

        if (!string.IsNullOrEmpty(request.CustomerTaxNumber))
            payment.SetCustomerDetails(request.CustomerTaxNumber);

        payment.SetExchangeRate(request.ExchangeRate);
        payment.SetPaymentDetails(request.PaymentMethod, request.PaymentReference, request.BankName, request.BankAccountNumber);

        if (!string.IsNullOrEmpty(request.Notes))
            payment.SetNotes(request.Notes);

        var userId = _currentUserService.UserId;
        if (userId.HasValue)
            payment.SetCreator(userId.Value, _currentUserService.UserName);

        await _dbContext.AdvancePayments.AddAsync(payment, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Advance payment {PaymentNumber} created for tenant {TenantId}", paymentNumber, tenantId);

        return Result<AdvancePaymentDto>.Success(AdvancePaymentDto.FromEntity(payment));
    }

    private async Task<string> GeneratePaymentNumberAsync(Guid tenantId, CancellationToken cancellationToken)
    {
        var today = DateTime.UtcNow;
        var prefix = $"AP{today:yyyyMMdd}";

        var lastPayment = await _dbContext.AdvancePayments
            .Where(ap => ap.TenantId == tenantId && ap.PaymentNumber.StartsWith(prefix))
            .OrderByDescending(ap => ap.PaymentNumber)
            .FirstOrDefaultAsync(cancellationToken);

        var sequence = 1;
        if (lastPayment != null)
        {
            var lastSequence = lastPayment.PaymentNumber.Substring(prefix.Length);
            if (int.TryParse(lastSequence, out var parsed))
                sequence = parsed + 1;
        }

        return $"{prefix}{sequence:D4}";
    }
}

public class CaptureAdvancePaymentHandler : IRequestHandler<CaptureAdvancePaymentCommand, Result<AdvancePaymentDto>>
{
    private readonly SalesDbContext _dbContext;
    private readonly ITenantService _tenantService;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<CaptureAdvancePaymentHandler> _logger;

    public CaptureAdvancePaymentHandler(
        SalesDbContext dbContext,
        ITenantService tenantService,
        ICurrentUserService currentUserService,
        ILogger<CaptureAdvancePaymentHandler> logger)
    {
        _dbContext = dbContext;
        _tenantService = tenantService;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<Result<AdvancePaymentDto>> Handle(CaptureAdvancePaymentCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantService.GetCurrentTenantId() ?? throw new InvalidOperationException("Tenant ID is required");

        var payment = await _dbContext.AdvancePayments
            .FirstOrDefaultAsync(ap => ap.Id == request.Id && ap.TenantId == tenantId, cancellationToken);

        if (payment == null)
            return Result<AdvancePaymentDto>.Failure(Error.NotFound("AdvancePayment", "Advance payment not found"));

        var userId = _currentUserService.UserId ?? Guid.Empty;
        var result = payment.Capture(userId, _currentUserService.UserName);

        if (!result.IsSuccess)
            return Result<AdvancePaymentDto>.Failure(result.Error);

        await _dbContext.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Advance payment {PaymentId} captured for tenant {TenantId}", payment.Id, tenantId);

        return Result<AdvancePaymentDto>.Success(AdvancePaymentDto.FromEntity(payment));
    }
}

public class ApplyAdvancePaymentHandler : IRequestHandler<ApplyAdvancePaymentCommand, Result<AdvancePaymentDto>>
{
    private readonly SalesDbContext _dbContext;
    private readonly ITenantService _tenantService;
    private readonly ILogger<ApplyAdvancePaymentHandler> _logger;

    public ApplyAdvancePaymentHandler(
        SalesDbContext dbContext,
        ITenantService tenantService,
        ILogger<ApplyAdvancePaymentHandler> logger)
    {
        _dbContext = dbContext;
        _tenantService = tenantService;
        _logger = logger;
    }

    public async Task<Result<AdvancePaymentDto>> Handle(ApplyAdvancePaymentCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantService.GetCurrentTenantId() ?? throw new InvalidOperationException("Tenant ID is required");

        var payment = await _dbContext.AdvancePayments
            .FirstOrDefaultAsync(ap => ap.Id == request.Id && ap.TenantId == tenantId, cancellationToken);

        if (payment == null)
            return Result<AdvancePaymentDto>.Failure(Error.NotFound("AdvancePayment", "Advance payment not found"));

        var result = payment.ApplyToInvoice(request.InvoiceId, request.InvoiceNumber, request.AmountToApply);

        if (!result.IsSuccess)
            return Result<AdvancePaymentDto>.Failure(result.Error);

        await _dbContext.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Applied {Amount} from advance payment {PaymentId} to invoice {InvoiceId}",
            request.AmountToApply, payment.Id, request.InvoiceId);

        return Result<AdvancePaymentDto>.Success(AdvancePaymentDto.FromEntity(payment));
    }
}

public class RefundAdvancePaymentHandler : IRequestHandler<RefundAdvancePaymentCommand, Result<AdvancePaymentDto>>
{
    private readonly SalesDbContext _dbContext;
    private readonly ITenantService _tenantService;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<RefundAdvancePaymentHandler> _logger;

    public RefundAdvancePaymentHandler(
        SalesDbContext dbContext,
        ITenantService tenantService,
        ICurrentUserService currentUserService,
        ILogger<RefundAdvancePaymentHandler> logger)
    {
        _dbContext = dbContext;
        _tenantService = tenantService;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<Result<AdvancePaymentDto>> Handle(RefundAdvancePaymentCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantService.GetCurrentTenantId() ?? throw new InvalidOperationException("Tenant ID is required");

        var payment = await _dbContext.AdvancePayments
            .FirstOrDefaultAsync(ap => ap.Id == request.Id && ap.TenantId == tenantId, cancellationToken);

        if (payment == null)
            return Result<AdvancePaymentDto>.Failure(Error.NotFound("AdvancePayment", "Advance payment not found"));

        var userId = _currentUserService.UserId ?? Guid.Empty;
        var result = payment.Refund(userId, request.Reason);

        if (!result.IsSuccess)
            return Result<AdvancePaymentDto>.Failure(result.Error);

        await _dbContext.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Advance payment {PaymentId} refunded for tenant {TenantId}", payment.Id, tenantId);

        return Result<AdvancePaymentDto>.Success(AdvancePaymentDto.FromEntity(payment));
    }
}

public class CancelAdvancePaymentHandler : IRequestHandler<CancelAdvancePaymentCommand, Result<AdvancePaymentDto>>
{
    private readonly SalesDbContext _dbContext;
    private readonly ITenantService _tenantService;
    private readonly ILogger<CancelAdvancePaymentHandler> _logger;

    public CancelAdvancePaymentHandler(
        SalesDbContext dbContext,
        ITenantService tenantService,
        ILogger<CancelAdvancePaymentHandler> logger)
    {
        _dbContext = dbContext;
        _tenantService = tenantService;
        _logger = logger;
    }

    public async Task<Result<AdvancePaymentDto>> Handle(CancelAdvancePaymentCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantService.GetCurrentTenantId() ?? throw new InvalidOperationException("Tenant ID is required");

        var payment = await _dbContext.AdvancePayments
            .FirstOrDefaultAsync(ap => ap.Id == request.Id && ap.TenantId == tenantId, cancellationToken);

        if (payment == null)
            return Result<AdvancePaymentDto>.Failure(Error.NotFound("AdvancePayment", "Advance payment not found"));

        var result = payment.Cancel(request.Reason);

        if (!result.IsSuccess)
            return Result<AdvancePaymentDto>.Failure(result.Error);

        await _dbContext.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Advance payment {PaymentId} cancelled for tenant {TenantId}", payment.Id, tenantId);

        return Result<AdvancePaymentDto>.Success(AdvancePaymentDto.FromEntity(payment));
    }
}

public class DeleteAdvancePaymentHandler : IRequestHandler<DeleteAdvancePaymentCommand, Result>
{
    private readonly SalesDbContext _dbContext;
    private readonly ITenantService _tenantService;
    private readonly ILogger<DeleteAdvancePaymentHandler> _logger;

    public DeleteAdvancePaymentHandler(
        SalesDbContext dbContext,
        ITenantService tenantService,
        ILogger<DeleteAdvancePaymentHandler> logger)
    {
        _dbContext = dbContext;
        _tenantService = tenantService;
        _logger = logger;
    }

    public async Task<Result> Handle(DeleteAdvancePaymentCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantService.GetCurrentTenantId() ?? throw new InvalidOperationException("Tenant ID is required");

        var payment = await _dbContext.AdvancePayments
            .FirstOrDefaultAsync(ap => ap.Id == request.Id && ap.TenantId == tenantId, cancellationToken);

        if (payment == null)
            return Result.Failure(Error.NotFound("AdvancePayment", "Advance payment not found"));

        if (payment.Status != AdvancePaymentStatus.Pending && payment.Status != AdvancePaymentStatus.Cancelled)
            return Result.Failure(Error.Conflict("AdvancePayment", "Only pending or cancelled payments can be deleted"));

        _dbContext.AdvancePayments.Remove(payment);
        await _dbContext.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Advance payment {PaymentId} deleted for tenant {TenantId}", payment.Id, tenantId);

        return Result.Success();
    }
}
