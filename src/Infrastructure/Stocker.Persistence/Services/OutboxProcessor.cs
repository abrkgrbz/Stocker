using System.Text.Json;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.Primitives;

namespace Stocker.Persistence.Services;

/// <summary>
/// Background processor that reads messages from the outbox and publishes them.
/// Should be called periodically by a hosted service or scheduled job.
/// </summary>
public class OutboxProcessor
{
    private readonly IServiceScopeFactory _serviceScopeFactory;
    private readonly ILogger<OutboxProcessor> _logger;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public OutboxProcessor(
        IServiceScopeFactory serviceScopeFactory,
        ILogger<OutboxProcessor> logger)
    {
        _serviceScopeFactory = serviceScopeFactory;
        _logger = logger;
    }

    /// <summary>
    /// Processes pending outbox messages
    /// </summary>
    /// <param name="batchSize">Number of messages to process in one batch</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Number of successfully processed messages</returns>
    public async Task<int> ProcessAsync(int batchSize = 20, CancellationToken cancellationToken = default)
    {
        using var scope = _serviceScopeFactory.CreateScope();
        var outboxRepository = scope.ServiceProvider.GetRequiredService<IOutboxRepository>();
        var mediator = scope.ServiceProvider.GetRequiredService<IMediator>();

        var messages = await outboxRepository.GetUnprocessedAsync(batchSize, cancellationToken);

        if (messages.Count == 0)
        {
            _logger.LogDebug("No pending outbox messages to process");
            return 0;
        }

        _logger.LogInformation("Processing {MessageCount} outbox message(s)", messages.Count);

        var processedCount = 0;

        foreach (var message in messages)
        {
            try
            {
                var domainEvent = DeserializeEvent(message.Type, message.Content);

                if (domainEvent == null)
                {
                    _logger.LogWarning(
                        "Could not deserialize outbox message {MessageId} of type {EventType}",
                        message.Id,
                        message.Type);

                    message.MarkAsFailed("Deserialization failed: Event type not found");
                    await outboxRepository.UpdateAsync(message, cancellationToken);
                    continue;
                }

                await mediator.Publish(domainEvent, cancellationToken);

                message.MarkAsProcessed();
                await outboxRepository.UpdateAsync(message, cancellationToken);

                processedCount++;

                _logger.LogDebug(
                    "Successfully processed outbox message {MessageId} of type {EventType}",
                    message.Id,
                    domainEvent.GetType().Name);
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Error processing outbox message {MessageId} of type {EventType}. Retry {RetryCount}/{MaxRetries}",
                    message.Id,
                    message.Type,
                    message.RetryCount + 1,
                    Domain.Common.Entities.OutboxMessage.MaxRetryAttempts);

                message.MarkAsFailed(ex.Message);
                await outboxRepository.UpdateAsync(message, cancellationToken);
            }
        }

        _logger.LogInformation(
            "Completed processing outbox messages. Processed: {ProcessedCount}/{TotalCount}",
            processedCount,
            messages.Count);

        return processedCount;
    }

    /// <summary>
    /// Cleans up old processed messages
    /// </summary>
    /// <param name="retentionDays">Keep messages for this many days</param>
    public async Task<int> CleanupAsync(int retentionDays = 7, CancellationToken cancellationToken = default)
    {
        using var scope = _serviceScopeFactory.CreateScope();
        var outboxRepository = scope.ServiceProvider.GetRequiredService<IOutboxRepository>();

        var cutoffDate = DateTime.UtcNow.AddDays(-retentionDays);
        var deletedCount = await outboxRepository.DeleteProcessedAsync(cutoffDate, cancellationToken);

        if (deletedCount > 0)
        {
            _logger.LogInformation(
                "Cleaned up {DeletedCount} old outbox messages older than {CutoffDate}",
                deletedCount,
                cutoffDate);
        }

        return deletedCount;
    }

    private IDomainEvent? DeserializeEvent(string typeName, string content)
    {
        try
        {
            var eventType = Type.GetType(typeName);

            if (eventType == null)
            {
                _logger.LogWarning("Could not find type: {TypeName}", typeName);
                return null;
            }

            var deserialized = JsonSerializer.Deserialize(content, eventType, JsonOptions);
            return deserialized as IDomainEvent;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deserializing event of type {TypeName}", typeName);
            return null;
        }
    }
}
