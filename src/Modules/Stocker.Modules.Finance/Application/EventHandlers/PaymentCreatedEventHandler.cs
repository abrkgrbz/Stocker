using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Finance.Domain.Events;

namespace Stocker.Modules.Finance.Application.EventHandlers;

/// <summary>
/// Ödeme oluşturulduğunda çalışan event handler.
/// </summary>
public class PaymentCreatedEventHandler : INotificationHandler<PaymentCreatedDomainEvent>
{
    private readonly ILogger<PaymentCreatedEventHandler> _logger;

    public PaymentCreatedEventHandler(ILogger<PaymentCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public async Task Handle(PaymentCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Payment created: {PaymentId} for Tenant {TenantId}, Amount: {Amount} {Currency}, Type: {PaymentType}",
            notification.PaymentId,
            notification.TenantId,
            notification.Amount,
            notification.Currency,
            notification.PaymentType);

        // TODO: Ödeme işlemleri
        await Task.CompletedTask;
    }
}

/// <summary>
/// Ödeme iptal edildiğinde çalışan event handler.
/// </summary>
public class PaymentCancelledEventHandler : INotificationHandler<PaymentCancelledDomainEvent>
{
    private readonly ILogger<PaymentCancelledEventHandler> _logger;

    public PaymentCancelledEventHandler(ILogger<PaymentCancelledEventHandler> logger)
    {
        _logger = logger;
    }

    public async Task Handle(PaymentCancelledDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Payment cancelled: {PaymentId} for Tenant {TenantId}, Reason: {Reason}, CancelledBy: {CancelledBy}",
            notification.PaymentId,
            notification.TenantId,
            notification.CancellationReason,
            notification.CancelledBy);

        // TODO: İptal işlemleri - bakiye geri yükleme, muhasebe kaydı vs.
        await Task.CompletedTask;
    }
}
