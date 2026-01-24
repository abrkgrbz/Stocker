using Microsoft.Extensions.Logging;
using Stocker.Modules.Inventory.Application.Services;

namespace Stocker.Modules.Inventory.Infrastructure.Resilience;

/// <summary>
/// Resilient wrapper for IStockAlertNotificationService with circuit breaker.
/// SignalR notifications are fire-and-forget safe - failures don't break business logic.
/// </summary>
public class ResilientNotificationService : IStockAlertNotificationService
{
    private readonly IStockAlertNotificationService _innerService;
    private readonly CircuitBreaker _circuitBreaker;
    private readonly ILogger<ResilientNotificationService> _logger;

    public ResilientNotificationService(
        IStockAlertNotificationService innerService,
        CircuitBreakerRegistry registry,
        ILogger<ResilientNotificationService> logger)
    {
        _innerService = innerService;
        _logger = logger;
        _circuitBreaker = registry.GetOrCreate(InventoryCircuitBreakers.SignalRNotification, options =>
        {
            options.FailureThreshold = 5;
            options.OpenDuration = TimeSpan.FromSeconds(60);
            options.SuccessThresholdInHalfOpen = 3;
            options.OperationTimeout = TimeSpan.FromSeconds(5);
        });
    }

    public async Task NotifyLowStockAsync(StockAlertDto alert, CancellationToken cancellationToken = default)
    {
        await SafeExecuteAsync(
            ct => _innerService.NotifyLowStockAsync(alert, ct),
            "low-stock", alert.ProductId, cancellationToken);
    }

    public async Task NotifyOutOfStockAsync(StockAlertDto alert, CancellationToken cancellationToken = default)
    {
        await SafeExecuteAsync(
            ct => _innerService.NotifyOutOfStockAsync(alert, ct),
            "out-of-stock", alert.ProductId, cancellationToken);
    }

    public async Task NotifyExpiringStockAsync(ExpiringStockAlertDto alert, CancellationToken cancellationToken = default)
    {
        await SafeExecuteAsync(
            ct => _innerService.NotifyExpiringStockAsync(alert, ct),
            "expiring-stock", alert.ProductId, cancellationToken);
    }

    public async Task NotifyExpiredStockAsync(ExpiringStockAlertDto alert, CancellationToken cancellationToken = default)
    {
        await SafeExecuteAsync(
            ct => _innerService.NotifyExpiredStockAsync(alert, ct),
            "expired-stock", alert.ProductId, cancellationToken);
    }

    public async Task NotifyTransferStatusChangedAsync(TransferStatusAlertDto alert, CancellationToken cancellationToken = default)
    {
        await SafeExecuteAsync(
            ct => _innerService.NotifyTransferStatusChangedAsync(alert, ct),
            "transfer-status", alert.TransferId, cancellationToken);
    }

    public async Task NotifyStockCountPendingAsync(StockCountAlertDto alert, CancellationToken cancellationToken = default)
    {
        await SafeExecuteAsync(
            ct => _innerService.NotifyStockCountPendingAsync(alert, ct),
            "stock-count", alert.StockCountId, cancellationToken);
    }

    public async Task NotifyStockAdjustedAsync(StockAdjustmentAlertDto alert, CancellationToken cancellationToken = default)
    {
        await SafeExecuteAsync(
            ct => _innerService.NotifyStockAdjustedAsync(alert, ct),
            "stock-adjusted", alert.ProductId, cancellationToken);
    }

    public async Task NotifyBatchAlertsAsync(IEnumerable<StockAlertDto> alerts, CancellationToken cancellationToken = default)
    {
        await SafeExecuteAsync(
            ct => _innerService.NotifyBatchAlertsAsync(alerts, ct),
            "batch-alerts", 0, cancellationToken);
    }

    private async Task SafeExecuteAsync(Func<CancellationToken, Task> action, string alertType, int entityId, CancellationToken cancellationToken)
    {
        try
        {
            await _circuitBreaker.ExecuteAsync(action, cancellationToken);
        }
        catch (CircuitBreakerOpenException)
        {
            _logger.LogWarning("SignalR circuit open, {AlertType} notification dropped for entity {EntityId}", alertType, entityId);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to send {AlertType} notification for entity {EntityId}, continuing", alertType, entityId);
        }
    }
}
