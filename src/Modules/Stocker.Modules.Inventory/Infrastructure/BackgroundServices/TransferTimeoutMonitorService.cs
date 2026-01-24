using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Inventory.Domain.Repositories;

namespace Stocker.Modules.Inventory.Infrastructure.BackgroundServices;

/// <summary>
/// Background service that monitors InTransit transfers for timeouts.
/// Identifies transfers that have exceeded their expected arrival date or maximum transit duration.
/// Logs warnings for overdue transfers to enable proactive follow-up.
/// Runs every 30 minutes.
/// </summary>
public class TransferTimeoutMonitorService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<TransferTimeoutMonitorService> _logger;
    private static readonly TimeSpan Interval = TimeSpan.FromMinutes(30);
    private static readonly TimeSpan MaxTransitDuration = TimeSpan.FromDays(7);

    /// <summary>
    /// Last known count of overdue transfers. Exposed for health check monitoring.
    /// </summary>
    internal static int LastOverdueTransferCount { get; private set; }

    /// <summary>
    /// Last time the overdue check was executed successfully.
    /// </summary>
    internal static DateTime? LastCheckTime { get; private set; }

    public TransferTimeoutMonitorService(
        IServiceScopeFactory scopeFactory,
        ILogger<TransferTimeoutMonitorService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("TransferTimeoutMonitorService started. Interval: {Interval}, MaxTransitDuration: {MaxTransitDuration}",
            Interval, MaxTransitDuration);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await Task.Delay(Interval, stoppingToken);
                await CheckOverdueTransfersAsync(stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking overdue transfers. Will retry next interval.");
            }
        }

        _logger.LogInformation("TransferTimeoutMonitorService stopped.");
    }

    private async Task CheckOverdueTransfersAsync(CancellationToken cancellationToken)
    {
        using var scope = _scopeFactory.CreateScope();
        var transferRepository = scope.ServiceProvider.GetRequiredService<IStockTransferRepository>();

        var overdueTransfers = await transferRepository.GetOverdueInTransitAsync(MaxTransitDuration, cancellationToken);

        LastOverdueTransferCount = overdueTransfers.Count;
        LastCheckTime = DateTime.UtcNow;

        if (overdueTransfers.Count > 0)
        {
            _logger.LogWarning("Found {Count} overdue InTransit transfers requiring attention.", overdueTransfers.Count);

            foreach (var transfer in overdueTransfers)
            {
                var daysInTransit = transfer.ShippedDate.HasValue
                    ? (DateTime.UtcNow - transfer.ShippedDate.Value).TotalDays
                    : 0;

                var isExpectedArrivalOverdue = transfer.ExpectedArrivalDate.HasValue &&
                    transfer.ExpectedArrivalDate.Value < DateTime.UtcNow;

                _logger.LogWarning(
                    "Overdue transfer: {TransferNumber} (ID: {TransferId}) | " +
                    "Source: {SourceWarehouse} -> Dest: {DestWarehouse} | " +
                    "Days in transit: {DaysInTransit:F1} | " +
                    "Expected arrival overdue: {IsOverdue} | " +
                    "Expected: {ExpectedArrival}",
                    transfer.TransferNumber,
                    transfer.Id,
                    transfer.SourceWarehouse?.Name ?? transfer.SourceWarehouseId.ToString(),
                    transfer.DestinationWarehouse?.Name ?? transfer.DestinationWarehouseId.ToString(),
                    daysInTransit,
                    isExpectedArrivalOverdue,
                    transfer.ExpectedArrivalDate?.ToString("yyyy-MM-dd") ?? "N/A");
            }
        }
    }
}
