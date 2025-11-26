using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Application.Features.Payments.Commands;
using Stocker.Modules.Sales.Domain.Entities;
using Stocker.Modules.Sales.Infrastructure.Persistence;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Application.Features.Payments.Handlers;

public class UpdatePaymentHandler : IRequestHandler<UpdatePaymentCommand, Result<PaymentDto>>
{
    private readonly SalesDbContext _context;
    private readonly ITenantService _tenantService;
    private readonly ILogger<UpdatePaymentHandler> _logger;

    public UpdatePaymentHandler(
        SalesDbContext context,
        ITenantService tenantService,
        ILogger<UpdatePaymentHandler> logger)
    {
        _context = context;
        _tenantService = tenantService;
        _logger = logger;
    }

    public async Task<Result<PaymentDto>> Handle(UpdatePaymentCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue)
            return Result<PaymentDto>.Failure(Error.Unauthorized("Tenant", "Tenant not found"));

        var payment = await _context.Payments
            .FirstOrDefaultAsync(p => p.Id == request.Id && p.TenantId == tenantId.Value, cancellationToken);

        if (payment == null)
            return Result<PaymentDto>.Failure(Error.NotFound("Payment", "Payment not found"));

        if (payment.Status == PaymentStatus.Completed)
            return Result<PaymentDto>.Failure(Error.Conflict("Payment", "Completed payments cannot be updated"));

        if (!string.IsNullOrEmpty(request.ReferenceNumber))
            payment.SetReference(request.ReferenceNumber);

        if (!string.IsNullOrEmpty(request.BankName) || !string.IsNullOrEmpty(request.BankAccountNumber))
            payment.SetBankDetails(request.BankName, request.BankAccountNumber);

        if (!string.IsNullOrEmpty(request.Notes))
            payment.SetNotes(request.Notes);

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Payment {PaymentId} updated for tenant {TenantId}", payment.Id, tenantId.Value);

        return Result<PaymentDto>.Success(PaymentDto.FromEntity(payment));
    }
}

public class RefundPaymentHandler : IRequestHandler<RefundPaymentCommand, Result<PaymentDto>>
{
    private readonly SalesDbContext _context;
    private readonly ITenantService _tenantService;
    private readonly ILogger<RefundPaymentHandler> _logger;

    public RefundPaymentHandler(
        SalesDbContext context,
        ITenantService tenantService,
        ILogger<RefundPaymentHandler> logger)
    {
        _context = context;
        _tenantService = tenantService;
        _logger = logger;
    }

    public async Task<Result<PaymentDto>> Handle(RefundPaymentCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue)
            return Result<PaymentDto>.Failure(Error.Unauthorized("Tenant", "Tenant not found"));

        var payment = await _context.Payments
            .FirstOrDefaultAsync(p => p.Id == request.Id && p.TenantId == tenantId.Value, cancellationToken);

        if (payment == null)
            return Result<PaymentDto>.Failure(Error.NotFound("Payment", "Payment not found"));

        var result = payment.Refund(request.Reason);
        if (!result.IsSuccess)
            return Result<PaymentDto>.Failure(result.Error);

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Payment {PaymentId} refunded for tenant {TenantId}", payment.Id, tenantId.Value);

        return Result<PaymentDto>.Success(PaymentDto.FromEntity(payment));
    }
}
