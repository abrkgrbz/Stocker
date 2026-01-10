using Stocker.SharedKernel.Primitives;

namespace Stocker.Application.Common.Interfaces;

/// <summary>
/// Interface for dispatching domain events to their handlers via MediatR.
/// This abstraction allows the infrastructure layer to publish domain events
/// without directly depending on MediatR in the domain/persistence layer.
/// </summary>
public interface IDomainEventDispatcher
{
    /// <summary>
    /// Dispatches a collection of domain events to their respective handlers.
    /// Events are published as MediatR notifications.
    /// </summary>
    /// <param name="domainEvents">The domain events to dispatch</param>
    /// <param name="cancellationToken">Cancellation token</param>
    Task DispatchEventsAsync(IEnumerable<IDomainEvent> domainEvents, CancellationToken cancellationToken = default);
}
