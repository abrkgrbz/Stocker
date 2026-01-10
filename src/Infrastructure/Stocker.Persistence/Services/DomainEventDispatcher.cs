using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.Primitives;

namespace Stocker.Persistence.Services;

/// <summary>
/// Dispatches domain events to their handlers using MediatR.
/// This service is injected into DbContexts to enable domain event publishing
/// after successful database operations.
/// </summary>
public class DomainEventDispatcher : IDomainEventDispatcher
{
    private readonly IMediator _mediator;
    private readonly ILogger<DomainEventDispatcher> _logger;

    public DomainEventDispatcher(IMediator mediator, ILogger<DomainEventDispatcher> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <inheritdoc />
    public async Task DispatchEventsAsync(IEnumerable<IDomainEvent> domainEvents, CancellationToken cancellationToken = default)
    {
        var events = domainEvents.ToList();

        if (events.Count == 0)
            return;

        _logger.LogDebug("Dispatching {EventCount} domain event(s)", events.Count);

        foreach (var domainEvent in events)
        {
            try
            {
                _logger.LogDebug(
                    "Publishing domain event {EventType} with Id {EventId}",
                    domainEvent.GetType().Name,
                    domainEvent.Id);

                await _mediator.Publish(domainEvent, cancellationToken);

                _logger.LogDebug(
                    "Successfully published domain event {EventType} with Id {EventId}",
                    domainEvent.GetType().Name,
                    domainEvent.Id);
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Error publishing domain event {EventType} with Id {EventId}",
                    domainEvent.GetType().Name,
                    domainEvent.Id);

                // Re-throw to ensure the caller knows about the failure
                // In production, you might want to implement retry logic or dead-letter queue
                throw;
            }
        }

        _logger.LogDebug("Completed dispatching {EventCount} domain event(s)", events.Count);
    }
}
