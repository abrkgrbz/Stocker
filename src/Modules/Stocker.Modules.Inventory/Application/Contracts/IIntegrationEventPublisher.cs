using MediatR;

namespace Stocker.Modules.Inventory.Application.Contracts;

/// <summary>
/// Service for publishing integration events to other modules.
/// </summary>
public interface IIntegrationEventPublisher
{
    /// <summary>
    /// Publishes an integration event to all subscribers.
    /// </summary>
    Task PublishAsync<TEvent>(TEvent integrationEvent, CancellationToken cancellationToken = default)
        where TEvent : INotification;

    /// <summary>
    /// Publishes multiple integration events to all subscribers.
    /// </summary>
    Task PublishManyAsync<TEvent>(IEnumerable<TEvent> integrationEvents, CancellationToken cancellationToken = default)
        where TEvent : INotification;
}
