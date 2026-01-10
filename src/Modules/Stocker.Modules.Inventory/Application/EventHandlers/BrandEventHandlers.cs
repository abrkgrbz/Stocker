using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Inventory.Domain.Events;

namespace Stocker.Modules.Inventory.Application.EventHandlers;

/// <summary>
/// Marka oluşturulduğunda çalışan event handler.
/// </summary>
public class BrandCreatedEventHandler : INotificationHandler<BrandCreatedDomainEvent>
{
    private readonly ILogger<BrandCreatedEventHandler> _logger;

    public BrandCreatedEventHandler(ILogger<BrandCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(BrandCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Brand created: {BrandCode} ({BrandName})",
            notification.Code,
            notification.Name);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Marka güncellendiğinde çalışan event handler.
/// </summary>
public class BrandUpdatedEventHandler : INotificationHandler<BrandUpdatedDomainEvent>
{
    private readonly ILogger<BrandUpdatedEventHandler> _logger;

    public BrandUpdatedEventHandler(ILogger<BrandUpdatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(BrandUpdatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Brand updated: {BrandCode} ({BrandName}), Website: {Website}",
            notification.Code,
            notification.Name,
            notification.Website ?? "Not specified");

        return Task.CompletedTask;
    }
}

/// <summary>
/// Marka aktifleştirildiğinde çalışan event handler.
/// </summary>
public class BrandActivatedEventHandler : INotificationHandler<BrandActivatedDomainEvent>
{
    private readonly ILogger<BrandActivatedEventHandler> _logger;

    public BrandActivatedEventHandler(ILogger<BrandActivatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(BrandActivatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Brand activated: {BrandCode} ({BrandName})",
            notification.Code,
            notification.Name);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Marka pasifleştirildiğinde çalışan event handler.
/// </summary>
public class BrandDeactivatedEventHandler : INotificationHandler<BrandDeactivatedDomainEvent>
{
    private readonly ILogger<BrandDeactivatedEventHandler> _logger;

    public BrandDeactivatedEventHandler(ILogger<BrandDeactivatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(BrandDeactivatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Brand deactivated: {BrandCode} ({BrandName})",
            notification.Code,
            notification.Name);

        return Task.CompletedTask;
    }
}
