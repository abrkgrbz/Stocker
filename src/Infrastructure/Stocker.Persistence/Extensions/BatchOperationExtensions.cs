using Microsoft.EntityFrameworkCore;

namespace Stocker.Persistence.Extensions;

/// <summary>
/// Batch (toplu) işlem extension metodları - Performans optimizasyonu
/// </summary>
public static class BatchOperationExtensions
{
    /// <summary>
    /// Batch insert işlemi (büyük veri setleri için)
    /// </summary>
    public static async Task BulkInsertAsync<T>(
        this DbContext context,
        IEnumerable<T> entities,
        int batchSize = 1000,
        CancellationToken cancellationToken = default) where T : class
    {
        var entityList = entities.ToList();
        if (entityList.Count == 0) return;

        var dbSet = context.Set<T>();

        foreach (var batch in entityList.Chunk(batchSize))
        {
            await dbSet.AddRangeAsync(batch, cancellationToken);
            await context.SaveChangesAsync(cancellationToken);
        }
    }

    /// <summary>
    /// Batch update işlemi (entity tracking ile)
    /// </summary>
    public static async Task BulkUpdateAsync<T>(
        this DbContext context,
        IEnumerable<T> entities,
        int batchSize = 1000,
        CancellationToken cancellationToken = default) where T : class
    {
        var entityList = entities.ToList();
        if (entityList.Count == 0) return;

        foreach (var batch in entityList.Chunk(batchSize))
        {
            context.UpdateRange(batch);
            await context.SaveChangesAsync(cancellationToken);
        }
    }

    /// <summary>
    /// Batch delete işlemi (entity tracking ile)
    /// </summary>
    public static async Task BulkDeleteAsync<T>(
        this DbContext context,
        IEnumerable<T> entities,
        int batchSize = 1000,
        CancellationToken cancellationToken = default) where T : class
    {
        var entityList = entities.ToList();
        if (entityList.Count == 0) return;

        foreach (var batch in entityList.Chunk(batchSize))
        {
            context.RemoveRange(batch);
            await context.SaveChangesAsync(cancellationToken);
        }
    }

    /// <summary>
    /// Toplu işlem için transaction wrapper
    /// </summary>
    public static async Task<TResult> ExecuteInTransactionAsync<TResult>(
        this DbContext context,
        Func<CancellationToken, Task<TResult>> operation,
        CancellationToken cancellationToken = default)
    {
        var strategy = context.Database.CreateExecutionStrategy();

        return await strategy.ExecuteAsync(async ct =>
        {
            await using var transaction = await context.Database.BeginTransactionAsync(ct);
            try
            {
                var result = await operation(ct);
                await transaction.CommitAsync(ct);
                return result;
            }
            catch
            {
                await transaction.RollbackAsync(ct);
                throw;
            }
        }, cancellationToken);
    }

    /// <summary>
    /// Toplu işlem için transaction wrapper (void)
    /// </summary>
    public static async Task ExecuteInTransactionAsync(
        this DbContext context,
        Func<CancellationToken, Task> operation,
        CancellationToken cancellationToken = default)
    {
        var strategy = context.Database.CreateExecutionStrategy();

        await strategy.ExecuteAsync(async ct =>
        {
            await using var transaction = await context.Database.BeginTransactionAsync(ct);
            try
            {
                await operation(ct);
                await transaction.CommitAsync(ct);
            }
            catch
            {
                await transaction.RollbackAsync(ct);
                throw;
            }
        }, cancellationToken);
    }

    /// <summary>
    /// Upsert işlemi (Insert or Update)
    /// </summary>
    public static async Task<T> UpsertAsync<T>(
        this DbContext context,
        T entity,
        Func<T, object> keySelector,
        CancellationToken cancellationToken = default) where T : class
    {
        var dbSet = context.Set<T>();
        var key = keySelector(entity);

        var existing = await dbSet.FindAsync(new[] { key }, cancellationToken);

        if (existing == null)
        {
            await dbSet.AddAsync(entity, cancellationToken);
        }
        else
        {
            context.Entry(existing).CurrentValues.SetValues(entity);
        }

        await context.SaveChangesAsync(cancellationToken);
        return existing ?? entity;
    }

    /// <summary>
    /// Batch upsert işlemi
    /// </summary>
    public static async Task BulkUpsertAsync<T, TKey>(
        this DbContext context,
        IEnumerable<T> entities,
        Func<T, TKey> keySelector,
        int batchSize = 500,
        CancellationToken cancellationToken = default) where T : class where TKey : notnull
    {
        var entityList = entities.ToList();
        if (entityList.Count == 0) return;

        var dbSet = context.Set<T>();

        foreach (var batch in entityList.Chunk(batchSize))
        {
            var keys = batch.Select(keySelector).ToList();

            // Mevcut kayıtları bul
            var existingKeys = new HashSet<TKey>();

            // Her bir key için kontrol (optimize edilebilir - raw SQL ile)
            foreach (var entity in batch)
            {
                var key = keySelector(entity);
                var existing = await dbSet.FindAsync(new object[] { key! }, cancellationToken);

                if (existing != null)
                {
                    existingKeys.Add(key);
                    context.Entry(existing).CurrentValues.SetValues(entity);
                }
                else
                {
                    await dbSet.AddAsync(entity, cancellationToken);
                }
            }

            await context.SaveChangesAsync(cancellationToken);
        }
    }

    /// <summary>
    /// Soft delete batch işlemi (IsDeleted flag ile)
    /// </summary>
    public static async Task<int> SoftDeleteBatchAsync<T>(
        this DbContext context,
        IQueryable<T> query,
        CancellationToken cancellationToken = default) where T : class
    {
        // EF Core 7+ ExecuteUpdateAsync kullanır
        return await query.ExecuteUpdateAsync(setters =>
            setters.SetProperty(e => EF.Property<bool>(e, "IsDeleted"), true)
                   .SetProperty(e => EF.Property<DateTime?>(e, "DeletedAt"), DateTime.UtcNow),
            cancellationToken);
    }

    /// <summary>
    /// Batch property update işlemi
    /// </summary>
    public static async Task<int> UpdatePropertyBatchAsync<T, TProperty>(
        this DbContext context,
        IQueryable<T> query,
        string propertyName,
        TProperty value,
        CancellationToken cancellationToken = default) where T : class
    {
        return await query.ExecuteUpdateAsync(setters =>
            setters.SetProperty(e => EF.Property<TProperty>(e, propertyName), value),
            cancellationToken);
    }

    /// <summary>
    /// Batch delete (hard delete) - EF Core 7+
    /// </summary>
    public static async Task<int> DeleteBatchAsync<T>(
        this DbContext context,
        IQueryable<T> query,
        CancellationToken cancellationToken = default) where T : class
    {
        return await query.ExecuteDeleteAsync(cancellationToken);
    }

    /// <summary>
    /// Change tracker temizleme (memory optimization)
    /// </summary>
    public static void ClearChangeTracker(this DbContext context)
    {
        context.ChangeTracker.Clear();
    }

    /// <summary>
    /// Detach all entities (memory optimization)
    /// </summary>
    public static void DetachAllEntities(this DbContext context)
    {
        var changedEntries = context.ChangeTracker.Entries()
            .Where(e => e.State != EntityState.Detached)
            .ToList();

        foreach (var entry in changedEntries)
        {
            entry.State = EntityState.Detached;
        }
    }
}
