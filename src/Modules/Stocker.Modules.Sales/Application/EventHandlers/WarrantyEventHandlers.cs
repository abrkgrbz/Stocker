using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Sales.Domain.Events;

namespace Stocker.Modules.Sales.Application.EventHandlers;

#region Warranty Event Handlers

/// <summary>
/// Garanti kaydı oluşturulduğunda tetiklenen handler
/// </summary>
public class WarrantyRegisteredEventHandler : INotificationHandler<WarrantyRegisteredDomainEvent>
{
    private readonly ILogger<WarrantyRegisteredEventHandler> _logger;

    public WarrantyRegisteredEventHandler(ILogger<WarrantyRegisteredEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(WarrantyRegisteredDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Garanti kaydedildi: {WarrantyNumber}, Ürün: {ProductName}, Geçerlilik: {StartDate} - {EndDate}, Tenant: {TenantId}",
            notification.WarrantyNumber,
            notification.ProductName,
            notification.StartDate,
            notification.EndDate,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Garanti talebi oluşturulduğunda tetiklenen handler
/// </summary>
public class WarrantyClaimCreatedEventHandler : INotificationHandler<WarrantyClaimCreatedDomainEvent>
{
    private readonly ILogger<WarrantyClaimCreatedEventHandler> _logger;

    public WarrantyClaimCreatedEventHandler(ILogger<WarrantyClaimCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(WarrantyClaimCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Garanti talebi oluşturuldu: {ClaimNumber}, Sorun: {IssueDescription}, Tenant: {TenantId}",
            notification.ClaimNumber,
            notification.IssueDescription,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Garanti talebi onaylandığında tetiklenen handler
/// </summary>
public class WarrantyClaimApprovedEventHandler : INotificationHandler<WarrantyClaimApprovedDomainEvent>
{
    private readonly ILogger<WarrantyClaimApprovedEventHandler> _logger;

    public WarrantyClaimApprovedEventHandler(ILogger<WarrantyClaimApprovedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(WarrantyClaimApprovedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Garanti talebi onaylandı: {ClaimNumber}, Çözüm: {Resolution}, Tenant: {TenantId}",
            notification.ClaimNumber,
            notification.Resolution,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Garanti talebi reddedildiğinde tetiklenen handler
/// </summary>
public class WarrantyClaimRejectedEventHandler : INotificationHandler<WarrantyClaimRejectedDomainEvent>
{
    private readonly ILogger<WarrantyClaimRejectedEventHandler> _logger;

    public WarrantyClaimRejectedEventHandler(ILogger<WarrantyClaimRejectedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(WarrantyClaimRejectedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Garanti talebi reddedildi: {ClaimNumber}, Sebep: {RejectionReason}, Tenant: {TenantId}",
            notification.ClaimNumber,
            notification.RejectionReason,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Garanti süresi dolduğunda tetiklenen handler
/// </summary>
public class WarrantyExpiredEventHandler : INotificationHandler<WarrantyExpiredDomainEvent>
{
    private readonly ILogger<WarrantyExpiredEventHandler> _logger;

    public WarrantyExpiredEventHandler(ILogger<WarrantyExpiredEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(WarrantyExpiredDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Garanti süresi doldu: {WarrantyNumber}, Tenant: {TenantId}",
            notification.WarrantyNumber,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

#endregion
