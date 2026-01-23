using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Inventory.Domain.Services;

namespace Stocker.Modules.Inventory.Infrastructure.BackgroundServices;

/// <summary>
/// Background service that periodically cleans up expired stock reservations.
/// Releases reserved quantities back to available stock when reservations expire.
/// Runs every 5 minutes to minimize "dead stock" from forgotten reservations.
/// </summary>
public class ReservationCleanupService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<ReservationCleanupService> _logger;
    private static readonly TimeSpan Interval = TimeSpan.FromMinutes(5);

    public ReservationCleanupService(
        IServiceScopeFactory scopeFactory,
        ILogger<ReservationCleanupService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("ReservationCleanupService started. Interval: {Interval}", Interval);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await Task.Delay(Interval, stoppingToken);
                await ProcessExpiredReservationsAsync(stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                // Graceful shutdown
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing expired reservations. Will retry next interval.");
            }
        }

        _logger.LogInformation("ReservationCleanupService stopped.");
    }

    private async Task ProcessExpiredReservationsAsync(CancellationToken cancellationToken)
    {
        using var scope = _scopeFactory.CreateScope();
        var reservationService = scope.ServiceProvider.GetRequiredService<IStockReservationService>();

        var processedCount = await reservationService.ProcessExpiredReservationsAsync(cancellationToken);

        if (processedCount > 0)
        {
            _logger.LogInformation("Processed {Count} expired reservations. Reserved quantities released back to available stock.", processedCount);
        }
    }
}
