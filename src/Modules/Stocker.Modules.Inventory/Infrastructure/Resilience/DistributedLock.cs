using System.Collections.Concurrent;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;

namespace Stocker.Modules.Inventory.Infrastructure.Resilience;

/// <summary>
/// Distributed lock interface for coordinating concurrent access to shared resources.
/// </summary>
public interface IDistributedLockService
{
    /// <summary>
    /// Acquire a lock on the specified resource. Returns a disposable handle.
    /// </summary>
    Task<IDistributedLockHandle?> AcquireAsync(string resource, TimeSpan? expiry = null, TimeSpan? waitTimeout = null, CancellationToken cancellationToken = default);
}

/// <summary>
/// Handle representing an acquired distributed lock. Dispose to release.
/// </summary>
public interface IDistributedLockHandle : IAsyncDisposable
{
    string Resource { get; }
    bool IsAcquired { get; }
}

/// <summary>
/// In-process distributed lock implementation using SemaphoreSlim.
/// Suitable for single-instance deployments. For multi-instance, replace with Redis-based implementation.
/// </summary>
public class InMemoryDistributedLockService : IDistributedLockService
{
    private readonly ConcurrentDictionary<string, SemaphoreSlim> _locks = new();
    private readonly ILogger<InMemoryDistributedLockService> _logger;

    public InMemoryDistributedLockService(ILogger<InMemoryDistributedLockService> logger)
    {
        _logger = logger;
    }

    public async Task<IDistributedLockHandle?> AcquireAsync(
        string resource,
        TimeSpan? expiry = null,
        TimeSpan? waitTimeout = null,
        CancellationToken cancellationToken = default)
    {
        var semaphore = _locks.GetOrAdd(resource, _ => new SemaphoreSlim(1, 1));
        var timeout = waitTimeout ?? TimeSpan.FromSeconds(10);

        var acquired = await semaphore.WaitAsync(timeout, cancellationToken);

        if (!acquired)
        {
            _logger.LogWarning("Failed to acquire lock on resource '{Resource}' within {Timeout}ms", resource, timeout.TotalMilliseconds);
            return null;
        }

        _logger.LogDebug("Lock acquired on resource '{Resource}'", resource);

        var handle = new InMemoryLockHandle(resource, semaphore, _logger, expiry ?? TimeSpan.FromMinutes(1));
        return handle;
    }
}

/// <summary>
/// Lock handle that releases the semaphore on dispose and auto-expires.
/// </summary>
internal class InMemoryLockHandle : IDistributedLockHandle
{
    private readonly SemaphoreSlim _semaphore;
    private readonly ILogger _logger;
    private readonly CancellationTokenSource _expiryCts;
    private volatile bool _released;

    public string Resource { get; }
    public bool IsAcquired => !_released;

    public InMemoryLockHandle(string resource, SemaphoreSlim semaphore, ILogger logger, TimeSpan expiry)
    {
        Resource = resource;
        _semaphore = semaphore;
        _logger = logger;
        _released = false;

        // Auto-expire the lock to prevent deadlocks
        _expiryCts = new CancellationTokenSource();
        _ = AutoExpireAsync(expiry, _expiryCts.Token);
    }

    private async Task AutoExpireAsync(TimeSpan expiry, CancellationToken cancellationToken)
    {
        try
        {
            await Task.Delay(expiry, cancellationToken);
            if (!_released)
            {
                _logger.LogWarning("Lock on resource '{Resource}' auto-expired after {Expiry}s", Resource, expiry.TotalSeconds);
                Release();
            }
        }
        catch (OperationCanceledException)
        {
            // Expected when disposed before expiry
        }
    }

    private void Release()
    {
        if (!_released)
        {
            _released = true;
            _semaphore.Release();
            _logger.LogDebug("Lock released on resource '{Resource}'", Resource);
        }
    }

    public ValueTask DisposeAsync()
    {
        _expiryCts.Cancel();
        _expiryCts.Dispose();
        Release();
        return ValueTask.CompletedTask;
    }
}

/// <summary>
/// Well-known lock resource names for inventory operations.
/// </summary>
public static class InventoryLockResources
{
    /// <summary>
    /// Lock for stock quantity updates on a specific product/warehouse combination.
    /// Format: stock:{tenantId}:{productId}:{warehouseId}
    /// </summary>
    public static string StockUpdate(Guid tenantId, int productId, int warehouseId)
        => $"stock:{tenantId}:{productId}:{warehouseId}";

    /// <summary>
    /// Lock for stock transfer operations.
    /// Format: transfer:{tenantId}:{transferId}
    /// </summary>
    public static string StockTransfer(Guid tenantId, int transferId)
        => $"transfer:{tenantId}:{transferId}";

    /// <summary>
    /// Lock for inventory adjustment operations.
    /// Format: adjustment:{tenantId}:{adjustmentId}
    /// </summary>
    public static string InventoryAdjustment(Guid tenantId, int adjustmentId)
        => $"adjustment:{tenantId}:{adjustmentId}";

    /// <summary>
    /// Lock for stock reservation operations.
    /// Format: reservation:{tenantId}:{productId}:{warehouseId}
    /// </summary>
    public static string StockReservation(Guid tenantId, int productId, int warehouseId)
        => $"reservation:{tenantId}:{productId}:{warehouseId}";

    /// <summary>
    /// Lock for sequence number generation.
    /// Format: sequence:{tenantId}:{productId}:{warehouseId}
    /// </summary>
    public static string SequenceNumber(Guid tenantId, int productId, int warehouseId)
        => $"sequence:{tenantId}:{productId}:{warehouseId}";
}
