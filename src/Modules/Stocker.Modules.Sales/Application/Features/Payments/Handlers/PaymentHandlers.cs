using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Application.Features.Payments.Commands;
using Stocker.Modules.Sales.Application.Features.Payments.Queries;
using Stocker.Modules.Sales.Domain.Entities;
using Stocker.Modules.Sales.Interfaces;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Application.Features.Payments.Handlers;

/// <summary>
/// Handler for CreatePaymentCommand
/// Uses ISalesUnitOfWork for consistent data access
/// </summary>
public class CreatePaymentHandler : IRequestHandler<CreatePaymentCommand, Result<PaymentDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;
    private readonly ILogger<CreatePaymentHandler> _logger;

    public CreatePaymentHandler(
        ISalesUnitOfWork unitOfWork,
        ILogger<CreatePaymentHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result<PaymentDto>> Handle(CreatePaymentCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var paymentNumber = await _unitOfWork.Payments.GeneratePaymentNumberAsync(cancellationToken);

        var paymentResult = Payment.Create(
            tenantId,
            paymentNumber,
            request.PaymentDate,
            request.Amount,
            request.Method,
            request.InvoiceId,
            request.CustomerId,
            request.CustomerName,
            request.Currency);

        if (!paymentResult.IsSuccess)
            return Result<PaymentDto>.Failure(paymentResult.Error);

        var payment = paymentResult.Value;

        if (!string.IsNullOrEmpty(request.ReferenceNumber))
            payment.SetReference(request.ReferenceNumber);

        if (!string.IsNullOrEmpty(request.BankName) || !string.IsNullOrEmpty(request.BankAccountNumber))
            payment.SetBankDetails(request.BankName, request.BankAccountNumber);

        if (!string.IsNullOrEmpty(request.CheckNumber))
            payment.SetCheckDetails(request.CheckNumber, request.CheckDueDate);

        if (!string.IsNullOrEmpty(request.CardLastFourDigits))
            payment.SetCardDetails(request.CardLastFourDigits, request.CardType);

        if (!string.IsNullOrEmpty(request.TransactionId))
            payment.SetTransactionId(request.TransactionId);

        if (!string.IsNullOrEmpty(request.Notes))
            payment.SetNotes(request.Notes);

        await _unitOfWork.Payments.AddAsync(payment, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Payment {PaymentNumber} created for tenant {TenantId}", paymentNumber, tenantId);

        return Result<PaymentDto>.Success(PaymentDto.FromEntity(payment));
    }
}

/// <summary>
/// Handler for GetPaymentsQuery
/// Uses ISalesUnitOfWork for consistent data access
/// </summary>
public class GetPaymentsHandler : IRequestHandler<GetPaymentsQuery, Result<PagedResult<PaymentListDto>>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public GetPaymentsHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PagedResult<PaymentListDto>>> Handle(GetPaymentsQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var query = _unitOfWork.Payments.AsQueryable()
            .Where(p => p.TenantId == tenantId)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var searchTerm = request.SearchTerm.ToLower();
            query = query.Where(p =>
                p.PaymentNumber.ToLower().Contains(searchTerm) ||
                (p.CustomerName != null && p.CustomerName.ToLower().Contains(searchTerm)) ||
                (p.ReferenceNumber != null && p.ReferenceNumber.ToLower().Contains(searchTerm)));
        }

        if (!string.IsNullOrWhiteSpace(request.Status))
        {
            if (Enum.TryParse<PaymentStatus>(request.Status, true, out var status))
                query = query.Where(p => p.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(request.Method))
        {
            if (Enum.TryParse<PaymentMethod>(request.Method, true, out var method))
                query = query.Where(p => p.Method == method);
        }

        if (request.CustomerId.HasValue)
            query = query.Where(p => p.CustomerId == request.CustomerId.Value);

        if (request.InvoiceId.HasValue)
            query = query.Where(p => p.InvoiceId == request.InvoiceId.Value);

        if (request.FromDate.HasValue)
            query = query.Where(p => p.PaymentDate >= request.FromDate.Value);

        if (request.ToDate.HasValue)
            query = query.Where(p => p.PaymentDate <= request.ToDate.Value);

        query = request.SortBy?.ToLower() switch
        {
            "paymentnumber" => request.SortDescending
                ? query.OrderByDescending(p => p.PaymentNumber)
                : query.OrderBy(p => p.PaymentNumber),
            "customername" => request.SortDescending
                ? query.OrderByDescending(p => p.CustomerName)
                : query.OrderBy(p => p.CustomerName),
            "amount" => request.SortDescending
                ? query.OrderByDescending(p => p.Amount)
                : query.OrderBy(p => p.Amount),
            "status" => request.SortDescending
                ? query.OrderByDescending(p => p.Status)
                : query.OrderBy(p => p.Status),
            _ => request.SortDescending
                ? query.OrderByDescending(p => p.PaymentDate)
                : query.OrderBy(p => p.PaymentDate)
        };

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        var result = new PagedResult<PaymentListDto>(
            items.Select(PaymentListDto.FromEntity),
            request.Page,
            request.PageSize,
            totalCount);

        return Result<PagedResult<PaymentListDto>>.Success(result);
    }
}

/// <summary>
/// Handler for GetPaymentByIdQuery
/// Uses ISalesUnitOfWork for consistent data access
/// </summary>
public class GetPaymentByIdHandler : IRequestHandler<GetPaymentByIdQuery, Result<PaymentDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public GetPaymentByIdHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PaymentDto>> Handle(GetPaymentByIdQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var payment = await _unitOfWork.Payments.GetByIdAsync(request.Id, cancellationToken);

        if (payment == null || payment.TenantId != tenantId)
            return Result<PaymentDto>.Failure(Error.NotFound("Payment", "Payment not found"));

        return Result<PaymentDto>.Success(PaymentDto.FromEntity(payment));
    }
}

/// <summary>
/// Handler for GetPaymentsByInvoiceQuery
/// Uses ISalesUnitOfWork for consistent data access
/// </summary>
public class GetPaymentsByInvoiceHandler : IRequestHandler<GetPaymentsByInvoiceQuery, Result<List<PaymentDto>>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public GetPaymentsByInvoiceHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<List<PaymentDto>>> Handle(GetPaymentsByInvoiceQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var payments = await _unitOfWork.Payments.AsQueryable()
            .Where(p => p.InvoiceId == request.InvoiceId && p.TenantId == tenantId)
            .OrderByDescending(p => p.PaymentDate)
            .ToListAsync(cancellationToken);

        return Result<List<PaymentDto>>.Success(payments.Select(PaymentDto.FromEntity).ToList());
    }
}

/// <summary>
/// Handler for ConfirmPaymentCommand
/// Uses ISalesUnitOfWork for consistent data access
/// </summary>
public class ConfirmPaymentHandler : IRequestHandler<ConfirmPaymentCommand, Result<PaymentDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;
    private readonly ILogger<ConfirmPaymentHandler> _logger;

    public ConfirmPaymentHandler(
        ISalesUnitOfWork unitOfWork,
        ILogger<ConfirmPaymentHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result<PaymentDto>> Handle(ConfirmPaymentCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var payment = await _unitOfWork.Payments.GetByIdAsync(request.Id, cancellationToken);

        if (payment == null || payment.TenantId != tenantId)
            return Result<PaymentDto>.Failure(Error.NotFound("Payment", "Payment not found"));

        var result = payment.Confirm();
        if (!result.IsSuccess)
            return Result<PaymentDto>.Failure(result.Error);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Payment {PaymentId} confirmed for tenant {TenantId}", payment.Id, tenantId);

        return Result<PaymentDto>.Success(PaymentDto.FromEntity(payment));
    }
}

/// <summary>
/// Handler for CompletePaymentCommand
/// Uses ISalesUnitOfWork for consistent data access
/// </summary>
public class CompletePaymentHandler : IRequestHandler<CompletePaymentCommand, Result<PaymentDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;
    private readonly ILogger<CompletePaymentHandler> _logger;

    public CompletePaymentHandler(
        ISalesUnitOfWork unitOfWork,
        ILogger<CompletePaymentHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result<PaymentDto>> Handle(CompletePaymentCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var payment = await _unitOfWork.Payments.AsQueryable()
            .Include(p => p.Invoice)
            .FirstOrDefaultAsync(p => p.Id == request.Id && p.TenantId == tenantId, cancellationToken);

        if (payment == null)
            return Result<PaymentDto>.Failure(Error.NotFound("Payment", "Payment not found"));

        var result = payment.Complete();
        if (!result.IsSuccess)
            return Result<PaymentDto>.Failure(result.Error);

        // Record payment on invoice if linked
        if (payment.InvoiceId.HasValue && payment.Invoice != null)
        {
            payment.Invoice.RecordPayment(payment.Amount);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Payment {PaymentId} completed for tenant {TenantId}", payment.Id, tenantId);

        return Result<PaymentDto>.Success(PaymentDto.FromEntity(payment));
    }
}

/// <summary>
/// Handler for RejectPaymentCommand
/// Uses ISalesUnitOfWork for consistent data access
/// </summary>
public class RejectPaymentHandler : IRequestHandler<RejectPaymentCommand, Result<PaymentDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;
    private readonly ILogger<RejectPaymentHandler> _logger;

    public RejectPaymentHandler(
        ISalesUnitOfWork unitOfWork,
        ILogger<RejectPaymentHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result<PaymentDto>> Handle(RejectPaymentCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var payment = await _unitOfWork.Payments.GetByIdAsync(request.Id, cancellationToken);

        if (payment == null || payment.TenantId != tenantId)
            return Result<PaymentDto>.Failure(Error.NotFound("Payment", "Payment not found"));

        var result = payment.Reject(request.Reason);
        if (!result.IsSuccess)
            return Result<PaymentDto>.Failure(result.Error);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Payment {PaymentId} rejected for tenant {TenantId}", payment.Id, tenantId);

        return Result<PaymentDto>.Success(PaymentDto.FromEntity(payment));
    }
}

/// <summary>
/// Handler for GetPaymentStatisticsQuery
/// Uses ISalesUnitOfWork for consistent data access
/// </summary>
public class GetPaymentStatisticsHandler : IRequestHandler<GetPaymentStatisticsQuery, Result<PaymentStatisticsDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public GetPaymentStatisticsHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PaymentStatisticsDto>> Handle(GetPaymentStatisticsQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var query = _unitOfWork.Payments.AsQueryable()
            .Where(p => p.TenantId == tenantId);

        if (request.FromDate.HasValue)
            query = query.Where(p => p.PaymentDate >= request.FromDate.Value);

        if (request.ToDate.HasValue)
            query = query.Where(p => p.PaymentDate <= request.ToDate.Value);

        var payments = await query.ToListAsync(cancellationToken);

        var amountByMethod = payments
            .Where(p => p.Status == PaymentStatus.Completed)
            .GroupBy(p => p.Method.ToString())
            .ToDictionary(g => g.Key, g => g.Sum(p => p.Amount));

        var stats = new PaymentStatisticsDto
        {
            TotalPayments = payments.Count,
            PendingPayments = payments.Count(p => p.Status == PaymentStatus.Pending || p.Status == PaymentStatus.Confirmed),
            CompletedPayments = payments.Count(p => p.Status == PaymentStatus.Completed),
            RejectedPayments = payments.Count(p => p.Status == PaymentStatus.Rejected),
            RefundedPayments = payments.Count(p => p.Status == PaymentStatus.Refunded),
            TotalAmount = payments.Sum(p => p.Amount),
            CompletedAmount = payments.Where(p => p.Status == PaymentStatus.Completed).Sum(p => p.Amount),
            RefundedAmount = payments.Where(p => p.Status == PaymentStatus.Refunded).Sum(p => p.Amount),
            AmountByMethod = amountByMethod,
            Currency = "TRY"
        };

        return Result<PaymentStatisticsDto>.Success(stats);
    }
}

/// <summary>
/// Handler for DeletePaymentCommand
/// Uses ISalesUnitOfWork for consistent data access
/// </summary>
public class DeletePaymentHandler : IRequestHandler<DeletePaymentCommand, Result>
{
    private readonly ISalesUnitOfWork _unitOfWork;
    private readonly ILogger<DeletePaymentHandler> _logger;

    public DeletePaymentHandler(
        ISalesUnitOfWork unitOfWork,
        ILogger<DeletePaymentHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result> Handle(DeletePaymentCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var payment = await _unitOfWork.Payments.GetByIdAsync(request.Id, cancellationToken);

        if (payment == null || payment.TenantId != tenantId)
            return Result.Failure(Error.NotFound("Payment", "Payment not found"));

        if (payment.Status == PaymentStatus.Completed)
            return Result.Failure(Error.Conflict("Payment", "Completed payments cannot be deleted"));

        _unitOfWork.Payments.Remove(payment);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Payment {PaymentId} deleted for tenant {TenantId}", payment.Id, tenantId);

        return Result.Success();
    }
}
