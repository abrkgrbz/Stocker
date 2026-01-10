using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Inventory.Domain.Events;

namespace Stocker.Modules.Inventory.Application.EventHandlers;

#region PackagingType Event Handlers

public class PackagingTypeCreatedEventHandler : INotificationHandler<PackagingTypeCreatedDomainEvent>
{
    private readonly ILogger<PackagingTypeCreatedEventHandler> _logger;

    public PackagingTypeCreatedEventHandler(ILogger<PackagingTypeCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(PackagingTypeCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Packaging type created: {Code} - {Name}",
            notification.Code,
            notification.Name);

        return Task.CompletedTask;
    }
}

public class PackagingTypeUpdatedEventHandler : INotificationHandler<PackagingTypeUpdatedDomainEvent>
{
    private readonly ILogger<PackagingTypeUpdatedEventHandler> _logger;

    public PackagingTypeUpdatedEventHandler(ILogger<PackagingTypeUpdatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(PackagingTypeUpdatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Packaging type updated: {Code} - {Name}",
            notification.Code,
            notification.Name);

        return Task.CompletedTask;
    }
}

public class PackagingTypeDeletedEventHandler : INotificationHandler<PackagingTypeDeletedDomainEvent>
{
    private readonly ILogger<PackagingTypeDeletedEventHandler> _logger;

    public PackagingTypeDeletedEventHandler(ILogger<PackagingTypeDeletedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(PackagingTypeDeletedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Packaging type deleted: {Code} - {Name}",
            notification.Code,
            notification.Name);

        return Task.CompletedTask;
    }
}

#endregion
