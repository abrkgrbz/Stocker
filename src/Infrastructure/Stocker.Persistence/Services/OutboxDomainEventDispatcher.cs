using System.Text.Json;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.Domain.Common.Entities;
using Stocker.SharedKernel.Primitives;

namespace Stocker.Persistence.Services;

/// <summary>
/// Domain event dispatcher that writes events to the outbox table
/// instead of immediately publishing them via MediatR.
/// This ensures events are persisted in the same transaction as the entity changes.
/// </summary>
public class OutboxDomainEventDispatcher : IDomainEventDispatcher
{
    private readonly IOutboxRepository _outboxRepository;
    private readonly ILogger<OutboxDomainEventDispatcher> _logger;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        WriteIndented = false
    };

    public OutboxDomainEventDispatcher(
        IOutboxRepository outboxRepository,
        ILogger<OutboxDomainEventDispatcher> logger)
    {
        _outboxRepository = outboxRepository;
        _logger = logger;
    }

    /// <inheritdoc />
    public async Task DispatchEventsAsync(IEnumerable<IDomainEvent> domainEvents, CancellationToken cancellationToken = default)
    {
        var events = domainEvents.ToList();

        if (events.Count == 0)
            return;

        _logger.LogDebug("Writing {EventCount} domain event(s) to outbox", events.Count);

        var outboxMessages = new List<OutboxMessage>();

        foreach (var domainEvent in events)
        {
            try
            {
                var eventType = domainEvent.GetType().AssemblyQualifiedName
                    ?? domainEvent.GetType().FullName
                    ?? domainEvent.GetType().Name;

                var serializedContent = JsonSerializer.Serialize(domainEvent, domainEvent.GetType(), JsonOptions);

                var outboxMessage = OutboxMessage.Create(
                    domainEvent.Id,
                    eventType,
                    serializedContent,
                    domainEvent.OccurredOnUtc);

                outboxMessages.Add(outboxMessage);

                _logger.LogDebug(
                    "Prepared outbox message for event {EventType} with Id {EventId}",
                    domainEvent.GetType().Name,
                    domainEvent.Id);
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Error serializing domain event {EventType} with Id {EventId}",
                    domainEvent.GetType().Name,
                    domainEvent.Id);
                throw;
            }
        }

        await _outboxRepository.AddRangeAsync(outboxMessages, cancellationToken);

        _logger.LogDebug("Successfully wrote {EventCount} domain event(s) to outbox", events.Count);
    }
}
