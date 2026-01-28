using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Stocker.Persistence.Services;

/// <summary>
/// Background service that periodically processes outbox messages.
/// Ensures reliable delivery of domain events even if the application restarts.
/// </summary>
public class OutboxProcessorJob : BackgroundService
{
    private readonly IServiceScopeFactory _serviceScopeFactory;
    private readonly ILogger<OutboxProcessorJob> _logger;
    private readonly OutboxProcessorOptions _options;

    public OutboxProcessorJob(
        IServiceScopeFactory serviceScopeFactory,
        ILogger<OutboxProcessorJob> logger,
        IOptions<OutboxProcessorOptions> options)
    {
        _serviceScopeFactory = serviceScopeFactory;
        _logger = logger;
        _options = options.Value;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Outbox Processor Job started. Interval: {Interval}ms", _options.ProcessingIntervalMs);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _serviceScopeFactory.CreateScope();
                var processor = scope.ServiceProvider.GetRequiredService<OutboxProcessor>();

                // Process pending messages
                var processedCount = await processor.ProcessAsync(_options.BatchSize, stoppingToken);

                if (processedCount > 0)
                {
                    _logger.LogDebug("Processed {Count} outbox messages", processedCount);
                }

                // Periodically cleanup old messages
                if (DateTime.UtcNow.Minute == 0) // Run cleanup once per hour
                {
                    await processor.CleanupAsync(_options.RetentionDays, stoppingToken);
                }
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                // Normal shutdown, don't log as error
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing outbox messages");
            }

            await Task.Delay(_options.ProcessingIntervalMs, stoppingToken);
        }

        _logger.LogInformation("Outbox Processor Job stopped");
    }
}

/// <summary>
/// Configuration options for the outbox processor
/// </summary>
public class OutboxProcessorOptions
{
    public const string SectionName = "OutboxProcessor";

    /// <summary>
    /// Interval between processing runs in milliseconds (default: 10 seconds)
    /// </summary>
    public int ProcessingIntervalMs { get; set; } = 10_000;

    /// <summary>
    /// Number of messages to process in one batch (default: 20)
    /// </summary>
    public int BatchSize { get; set; } = 20;

    /// <summary>
    /// Number of days to retain processed messages (default: 7)
    /// </summary>
    public int RetentionDays { get; set; } = 7;

    /// <summary>
    /// Whether the outbox processor is enabled (default: true)
    /// </summary>
    public bool Enabled { get; set; } = true;
}
