using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Inventory.Application.Contracts;

namespace Stocker.Modules.Inventory.Infrastructure.Services;

/// <summary>
/// Implementation of integration event publisher using MediatR.
/// Publishes events to other modules through the shared event bus.
/// </summary>
public class IntegrationEventPublisher : IIntegrationEventPublisher
{
    private readonly IPublisher _publisher;
    private readonly ILogger<IntegrationEventPublisher> _logger;

    public IntegrationEventPublisher(
        IPublisher publisher,
        ILogger<IntegrationEventPublisher> logger)
    {
        _publisher = publisher;
        _logger = logger;
    }

    public async Task PublishAsync<TEvent>(
        TEvent integrationEvent,
        CancellationToken cancellationToken = default)
        where TEvent : INotification
    {
        var eventType = typeof(TEvent).Name;

        try
        {
            _logger.LogDebug(
                "Publishing integration event {EventType}",
                eventType);

            await _publisher.Publish(integrationEvent, cancellationToken);

            _logger.LogInformation(
                "Successfully published integration event {EventType}",
                eventType);
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Failed to publish integration event {EventType}",
                eventType);
            throw;
        }
    }

    public async Task PublishManyAsync<TEvent>(
        IEnumerable<TEvent> integrationEvents,
        CancellationToken cancellationToken = default)
        where TEvent : INotification
    {
        var eventType = typeof(TEvent).Name;
        var events = integrationEvents.ToList();

        if (events.Count == 0)
        {
            _logger.LogDebug("No integration events to publish for {EventType}", eventType);
            return;
        }

        _logger.LogDebug(
            "Publishing {Count} integration events of type {EventType}",
            events.Count, eventType);

        var publishedCount = 0;
        var failedCount = 0;

        foreach (var integrationEvent in events)
        {
            try
            {
                await _publisher.Publish(integrationEvent, cancellationToken);
                publishedCount++;
            }
            catch (Exception ex)
            {
                failedCount++;
                _logger.LogError(
                    ex,
                    "Failed to publish integration event {EventType} ({Index}/{Total})",
                    eventType, publishedCount + failedCount, events.Count);
            }
        }

        if (failedCount > 0)
        {
            _logger.LogWarning(
                "Published {PublishedCount}/{Total} integration events of type {EventType}. {FailedCount} failed.",
                publishedCount, events.Count, eventType, failedCount);
        }
        else
        {
            _logger.LogInformation(
                "Successfully published all {Count} integration events of type {EventType}",
                events.Count, eventType);
        }
    }
}
