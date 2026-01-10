using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Purchase.Domain.Events;

namespace Stocker.Modules.Purchase.Application.EventHandlers;

#region SupplierPayment Event Handlers

/// <summary>
/// Tedarikçi ödemesi oluşturulduğunda tetiklenen handler
/// </summary>
public class SupplierPaymentCreatedEventHandler : INotificationHandler<SupplierPaymentCreatedDomainEvent>
{
    private readonly ILogger<SupplierPaymentCreatedEventHandler> _logger;

    public SupplierPaymentCreatedEventHandler(ILogger<SupplierPaymentCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(SupplierPaymentCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Tedarikçi ödemesi oluşturuldu: {PaymentNumber}, Tedarikçi: {SupplierName}, Tutar: {Amount} {Currency}, Yöntem: {PaymentMethod}, Tenant: {TenantId}",
            notification.PaymentNumber,
            notification.SupplierName,
            notification.Amount,
            notification.Currency,
            notification.PaymentMethod,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Tedarikçi ödemesi onaylandığında tetiklenen handler
/// </summary>
public class SupplierPaymentApprovedEventHandler : INotificationHandler<SupplierPaymentApprovedDomainEvent>
{
    private readonly ILogger<SupplierPaymentApprovedEventHandler> _logger;

    public SupplierPaymentApprovedEventHandler(ILogger<SupplierPaymentApprovedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(SupplierPaymentApprovedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Tedarikçi ödemesi onaylandı: {PaymentNumber}, Onaylayan: {ApprovedById}, Tenant: {TenantId}",
            notification.PaymentNumber,
            notification.ApprovedById,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Tedarikçi ödemesi gerçekleştirildiğinde tetiklenen handler
/// </summary>
public class SupplierPaymentExecutedEventHandler : INotificationHandler<SupplierPaymentExecutedDomainEvent>
{
    private readonly ILogger<SupplierPaymentExecutedEventHandler> _logger;

    public SupplierPaymentExecutedEventHandler(ILogger<SupplierPaymentExecutedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(SupplierPaymentExecutedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Tedarikçi ödemesi gerçekleştirildi: {PaymentNumber}, Tutar: {Amount} {Currency}, Referans: {TransactionReference}, Tenant: {TenantId}",
            notification.PaymentNumber,
            notification.Amount,
            notification.Currency,
            notification.TransactionReference,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Tedarikçi ödeme planı oluşturulduğunda tetiklenen handler
/// </summary>
public class SupplierPaymentScheduleCreatedEventHandler : INotificationHandler<SupplierPaymentScheduleCreatedDomainEvent>
{
    private readonly ILogger<SupplierPaymentScheduleCreatedEventHandler> _logger;

    public SupplierPaymentScheduleCreatedEventHandler(ILogger<SupplierPaymentScheduleCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(SupplierPaymentScheduleCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Tedarikçi ödeme planı oluşturuldu: {SupplierName}, Taksit: {InstallmentCount}, Toplam: {TotalAmount}, Tenant: {TenantId}",
            notification.SupplierName,
            notification.InstallmentCount,
            notification.TotalAmount,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

#endregion
