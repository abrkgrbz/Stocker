using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Stocker.Modules.Inventory.Infrastructure.Persistence.BulkOperations;

/// <summary>
/// Result of a bulk operation.
/// </summary>
public class BulkOperationResult
{
    public int SuccessCount { get; set; }
    public int FailureCount { get; set; }
    public int TotalCount => SuccessCount + FailureCount;
    public List<BulkOperationError> Errors { get; set; } = new();
    public TimeSpan Duration { get; set; }

    public bool IsFullySuccessful => FailureCount == 0;
    public bool IsPartiallySuccessful => SuccessCount > 0 && FailureCount > 0;
}

/// <summary>
/// Individual error in a bulk operation.
/// </summary>
public class BulkOperationError
{
    public int Index { get; set; }
    public string? EntityId { get; set; }
    public string ErrorMessage { get; set; } = string.Empty;
    public string? ErrorCode { get; set; }
}

/// <summary>
/// Service for executing bulk operations with batching and error handling.
/// Processes items in configurable batch sizes within transactions.
/// </summary>
public class BulkOperationService
{
    private readonly ILogger<BulkOperationService> _logger;

    /// <summary>
    /// Default batch size for bulk operations.
    /// </summary>
    public const int DefaultBatchSize = 100;

    /// <summary>
    /// Maximum allowed batch size.
    /// </summary>
    public const int MaxBatchSize = 1000;

    public BulkOperationService(ILogger<BulkOperationService> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Execute a bulk create operation with batching.
    /// </summary>
    public async Task<BulkOperationResult> BulkCreateAsync<T>(
        DbContext dbContext,
        IReadOnlyList<T> entities,
        int batchSize = DefaultBatchSize,
        CancellationToken cancellationToken = default) where T : class
    {
        var result = new BulkOperationResult();
        var stopwatch = System.Diagnostics.Stopwatch.StartNew();

        batchSize = Math.Min(batchSize, MaxBatchSize);
        var batches = entities.Chunk(batchSize);

        _logger.LogInformation("Starting bulk create: {Count} entities in batches of {BatchSize}", entities.Count, batchSize);

        foreach (var (batch, batchIndex) in batches.Select((b, i) => (b, i)))
        {
            try
            {
                await dbContext.Set<T>().AddRangeAsync(batch, cancellationToken);
                await dbContext.SaveChangesAsync(cancellationToken);
                result.SuccessCount += batch.Length;

                _logger.LogDebug("Bulk create batch {BatchIndex} completed: {Count} entities", batchIndex, batch.Length);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Bulk create batch {BatchIndex} failed", batchIndex);

                // Detach failed entities and try individually
                foreach (var entity in batch)
                {
                    dbContext.Entry(entity).State = EntityState.Detached;
                }

                // Retry individually to identify failures
                foreach (var (entity, itemIndex) in batch.Select((e, i) => (e, i)))
                {
                    try
                    {
                        await dbContext.Set<T>().AddAsync(entity, cancellationToken);
                        await dbContext.SaveChangesAsync(cancellationToken);
                        result.SuccessCount++;
                    }
                    catch (Exception itemEx)
                    {
                        dbContext.Entry(entity).State = EntityState.Detached;
                        result.FailureCount++;
                        result.Errors.Add(new BulkOperationError
                        {
                            Index = batchIndex * batchSize + itemIndex,
                            ErrorMessage = itemEx.InnerException?.Message ?? itemEx.Message,
                            ErrorCode = "BulkCreate.ItemFailed"
                        });
                    }
                }
            }
        }

        stopwatch.Stop();
        result.Duration = stopwatch.Elapsed;

        _logger.LogInformation("Bulk create completed: {Success}/{Total} succeeded in {Duration}ms",
            result.SuccessCount, result.TotalCount, result.Duration.TotalMilliseconds);

        return result;
    }

    /// <summary>
    /// Execute a bulk update operation with validation.
    /// </summary>
    public async Task<BulkOperationResult> BulkUpdateAsync<T>(
        DbContext dbContext,
        IReadOnlyList<T> entities,
        Action<T> updateAction,
        int batchSize = DefaultBatchSize,
        CancellationToken cancellationToken = default) where T : class
    {
        var result = new BulkOperationResult();
        var stopwatch = System.Diagnostics.Stopwatch.StartNew();

        batchSize = Math.Min(batchSize, MaxBatchSize);

        _logger.LogInformation("Starting bulk update: {Count} entities in batches of {BatchSize}", entities.Count, batchSize);

        var batches = entities.Chunk(batchSize);

        foreach (var (batch, batchIndex) in batches.Select((b, i) => (b, i)))
        {
            try
            {
                foreach (var entity in batch)
                {
                    updateAction(entity);
                    dbContext.Entry(entity).State = EntityState.Modified;
                }

                await dbContext.SaveChangesAsync(cancellationToken);
                result.SuccessCount += batch.Length;
            }
            catch (DbUpdateConcurrencyException ex)
            {
                _logger.LogWarning(ex, "Concurrency conflict in bulk update batch {BatchIndex}", batchIndex);

                // Detach all and retry individually
                foreach (var entity in batch)
                {
                    dbContext.Entry(entity).State = EntityState.Detached;
                }

                foreach (var (entity, itemIndex) in batch.Select((e, i) => (e, i)))
                {
                    try
                    {
                        updateAction(entity);
                        dbContext.Entry(entity).State = EntityState.Modified;
                        await dbContext.SaveChangesAsync(cancellationToken);
                        result.SuccessCount++;
                    }
                    catch (Exception itemEx)
                    {
                        dbContext.Entry(entity).State = EntityState.Detached;
                        result.FailureCount++;
                        result.Errors.Add(new BulkOperationError
                        {
                            Index = batchIndex * batchSize + itemIndex,
                            ErrorMessage = itemEx.InnerException?.Message ?? itemEx.Message,
                            ErrorCode = "BulkUpdate.ConcurrencyConflict"
                        });
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Bulk update batch {BatchIndex} failed", batchIndex);
                result.FailureCount += batch.Length;
                result.Errors.Add(new BulkOperationError
                {
                    Index = batchIndex * batchSize,
                    ErrorMessage = ex.InnerException?.Message ?? ex.Message,
                    ErrorCode = "BulkUpdate.BatchFailed"
                });

                foreach (var entity in batch)
                {
                    dbContext.Entry(entity).State = EntityState.Detached;
                }
            }
        }

        stopwatch.Stop();
        result.Duration = stopwatch.Elapsed;

        _logger.LogInformation("Bulk update completed: {Success}/{Total} succeeded in {Duration}ms",
            result.SuccessCount, result.TotalCount, result.Duration.TotalMilliseconds);

        return result;
    }

    /// <summary>
    /// Execute a bulk delete operation.
    /// </summary>
    public async Task<BulkOperationResult> BulkDeleteAsync<T>(
        DbContext dbContext,
        IReadOnlyList<T> entities,
        int batchSize = DefaultBatchSize,
        CancellationToken cancellationToken = default) where T : class
    {
        var result = new BulkOperationResult();
        var stopwatch = System.Diagnostics.Stopwatch.StartNew();

        batchSize = Math.Min(batchSize, MaxBatchSize);

        _logger.LogInformation("Starting bulk delete: {Count} entities in batches of {BatchSize}", entities.Count, batchSize);

        var batches = entities.Chunk(batchSize);

        foreach (var (batch, batchIndex) in batches.Select((b, i) => (b, i)))
        {
            try
            {
                dbContext.Set<T>().RemoveRange(batch);
                await dbContext.SaveChangesAsync(cancellationToken);
                result.SuccessCount += batch.Length;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Bulk delete batch {BatchIndex} failed, retrying individually", batchIndex);

                foreach (var entity in batch)
                {
                    dbContext.Entry(entity).State = EntityState.Detached;
                }

                foreach (var (entity, itemIndex) in batch.Select((e, i) => (e, i)))
                {
                    try
                    {
                        dbContext.Set<T>().Remove(entity);
                        await dbContext.SaveChangesAsync(cancellationToken);
                        result.SuccessCount++;
                    }
                    catch (Exception itemEx)
                    {
                        dbContext.Entry(entity).State = EntityState.Detached;
                        result.FailureCount++;
                        result.Errors.Add(new BulkOperationError
                        {
                            Index = batchIndex * batchSize + itemIndex,
                            ErrorMessage = itemEx.InnerException?.Message ?? itemEx.Message,
                            ErrorCode = "BulkDelete.ItemFailed"
                        });
                    }
                }
            }
        }

        stopwatch.Stop();
        result.Duration = stopwatch.Elapsed;

        _logger.LogInformation("Bulk delete completed: {Success}/{Total} succeeded in {Duration}ms",
            result.SuccessCount, result.TotalCount, result.Duration.TotalMilliseconds);

        return result;
    }

    /// <summary>
    /// Execute a bulk stock adjustment operation (optimized for inventory).
    /// </summary>
    public async Task<BulkOperationResult> BulkStockAdjustAsync(
        DbContext dbContext,
        IReadOnlyList<(int StockId, decimal QuantityChange)> adjustments,
        CancellationToken cancellationToken = default)
    {
        var result = new BulkOperationResult();
        var stopwatch = System.Diagnostics.Stopwatch.StartNew();

        _logger.LogInformation("Starting bulk stock adjustment: {Count} items", adjustments.Count);

        foreach (var (adjustment, index) in adjustments.Select((a, i) => (a, i)))
        {
            try
            {
                // Use ExecuteUpdate for efficient single-query updates
                var affected = await dbContext.Database.ExecuteSqlRawAsync(
                    "UPDATE \"Stocks\" SET \"Quantity\" = \"Quantity\" + {0}, \"UpdatedAt\" = {1} WHERE \"Id\" = {2}",
                    new object[] { adjustment.QuantityChange, DateTime.UtcNow, adjustment.StockId },
                    cancellationToken);

                if (affected > 0)
                    result.SuccessCount++;
                else
                {
                    result.FailureCount++;
                    result.Errors.Add(new BulkOperationError
                    {
                        Index = index,
                        EntityId = adjustment.StockId.ToString(),
                        ErrorMessage = "Stock record not found",
                        ErrorCode = "BulkAdjust.NotFound"
                    });
                }
            }
            catch (Exception ex)
            {
                result.FailureCount++;
                result.Errors.Add(new BulkOperationError
                {
                    Index = index,
                    EntityId = adjustment.StockId.ToString(),
                    ErrorMessage = ex.Message,
                    ErrorCode = "BulkAdjust.Failed"
                });
            }
        }

        stopwatch.Stop();
        result.Duration = stopwatch.Elapsed;

        _logger.LogInformation("Bulk stock adjustment completed: {Success}/{Total} in {Duration}ms",
            result.SuccessCount, result.TotalCount, result.Duration.TotalMilliseconds);

        return result;
    }
}
