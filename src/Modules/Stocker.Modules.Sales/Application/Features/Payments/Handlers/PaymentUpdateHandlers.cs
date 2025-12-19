using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Application.Features.Payments.Commands;
using Stocker.Modules.Sales.Domain.Entities;
using Stocker.Modules.Sales.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Application.Features.Payments.Handlers;

/// <summary>
/// Handler for UpdatePaymentCommand
/// Uses ISalesUnitOfWork for consistent data access
/// </summary>
public class UpdatePaymentHandler : IRequestHandler<UpdatePaymentCommand, Result<PaymentDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;
    private readonly ILogger<UpdatePaymentHandler> _logger;

    public UpdatePaymentHandler(
        ISalesUnitOfWork unitOfWork,
        ILogger<UpdatePaymentHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result<PaymentDto>> Handle(UpdatePaymentCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var payment = await _unitOfWork.Payments.GetByIdAsync(request.Id, cancellationToken);

        if (payment == null || payment.TenantId != tenantId)
            return Result<PaymentDto>.Failure(Error.NotFound("Payment", "Payment not found"));

        if (payment.Status == PaymentStatus.Completed)
            return Result<PaymentDto>.Failure(Error.Conflict("Payment", "Completed payments cannot be updated"));

        if (!string.IsNullOrEmpty(request.ReferenceNumber))
            payment.SetReference(request.ReferenceNumber);

        if (!string.IsNullOrEmpty(request.BankName) || !string.IsNullOrEmpty(request.BankAccountNumber))
            payment.SetBankDetails(request.BankName, request.BankAccountNumber);

        if (!string.IsNullOrEmpty(request.Notes))
            payment.SetNotes(request.Notes);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Payment {PaymentId} updated for tenant {TenantId}", payment.Id, tenantId);

        return Result<PaymentDto>.Success(PaymentDto.FromEntity(payment));
    }
}

/// <summary>
/// Handler for RefundPaymentCommand
/// Uses ISalesUnitOfWork for consistent data access
/// </summary>
public class RefundPaymentHandler : IRequestHandler<RefundPaymentCommand, Result<PaymentDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;
    private readonly ILogger<RefundPaymentHandler> _logger;

    public RefundPaymentHandler(
        ISalesUnitOfWork unitOfWork,
        ILogger<RefundPaymentHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result<PaymentDto>> Handle(RefundPaymentCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var payment = await _unitOfWork.Payments.GetByIdAsync(request.Id, cancellationToken);

        if (payment == null || payment.TenantId != tenantId)
            return Result<PaymentDto>.Failure(Error.NotFound("Payment", "Payment not found"));

        var result = payment.Refund(request.Reason);
        if (!result.IsSuccess)
            return Result<PaymentDto>.Failure(result.Error);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Payment {PaymentId} refunded for tenant {TenantId}", payment.Id, tenantId);

        return Result<PaymentDto>.Success(PaymentDto.FromEntity(payment));
    }
}
