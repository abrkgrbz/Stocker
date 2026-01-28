using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace Stocker.Persistence.Extensions;

/// <summary>
/// IQueryable extension metodları - Query Performance optimizasyonları
/// </summary>
public static class QueryableExtensions
{
    /// <summary>
    /// Koşula göre Where uygular (conditional filtering)
    /// </summary>
    public static IQueryable<T> WhereIf<T>(
        this IQueryable<T> query,
        bool condition,
        Expression<Func<T, bool>> predicate)
    {
        return condition ? query.Where(predicate) : query;
    }

    /// <summary>
    /// Nullable değer varsa Where uygular
    /// </summary>
    public static IQueryable<T> WhereIfNotNull<T, TValue>(
        this IQueryable<T> query,
        TValue? value,
        Expression<Func<T, bool>> predicate) where TValue : struct
    {
        return value.HasValue ? query.Where(predicate) : query;
    }

    /// <summary>
    /// String boş değilse Where uygular
    /// </summary>
    public static IQueryable<T> WhereIfNotEmpty<T>(
        this IQueryable<T> query,
        string? value,
        Expression<Func<T, bool>> predicate)
    {
        return !string.IsNullOrWhiteSpace(value) ? query.Where(predicate) : query;
    }

    /// <summary>
    /// Koşula göre OrderBy veya OrderByDescending uygular
    /// </summary>
    public static IOrderedQueryable<T> OrderByDirection<T, TKey>(
        this IQueryable<T> query,
        Expression<Func<T, TKey>> keySelector,
        bool descending = false)
    {
        return descending
            ? query.OrderByDescending(keySelector)
            : query.OrderBy(keySelector);
    }

    /// <summary>
    /// Koşula göre ThenBy veya ThenByDescending uygular
    /// </summary>
    public static IOrderedQueryable<T> ThenByDirection<T, TKey>(
        this IOrderedQueryable<T> query,
        Expression<Func<T, TKey>> keySelector,
        bool descending = false)
    {
        return descending
            ? query.ThenByDescending(keySelector)
            : query.ThenBy(keySelector);
    }

    /// <summary>
    /// Sayfalama uygular (offset-based)
    /// </summary>
    public static IQueryable<T> Paginate<T>(
        this IQueryable<T> query,
        int pageNumber,
        int pageSize)
    {
        if (pageNumber < 1) pageNumber = 1;
        if (pageSize < 1) pageSize = 10;
        if (pageSize > 100) pageSize = 100;

        return query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize);
    }

    /// <summary>
    /// Cursor-based sayfalama için (daha performanslı)
    /// </summary>
    public static IQueryable<T> PaginateWithCursor<T, TKey>(
        this IQueryable<T> query,
        Expression<Func<T, TKey>> keySelector,
        TKey? cursor,
        int pageSize,
        bool descending = false) where TKey : IComparable<TKey>
    {
        if (pageSize < 1) pageSize = 10;
        if (pageSize > 100) pageSize = 100;

        if (cursor != null)
        {
            var parameter = keySelector.Parameters[0];
            var memberAccess = keySelector.Body;

            Expression comparison = descending
                ? Expression.LessThan(memberAccess, Expression.Constant(cursor, typeof(TKey)))
                : Expression.GreaterThan(memberAccess, Expression.Constant(cursor, typeof(TKey)));

            var lambda = Expression.Lambda<Func<T, bool>>(comparison, parameter);
            query = query.Where(lambda);
        }

        return descending
            ? query.OrderByDescending(keySelector).Take(pageSize)
            : query.OrderBy(keySelector).Take(pageSize);
    }

    /// <summary>
    /// Select projection ile sadece gerekli alanları çeker (performance)
    /// </summary>
    public static IQueryable<TResult> SelectOnly<T, TResult>(
        this IQueryable<T> query,
        Expression<Func<T, TResult>> selector)
    {
        return query.Select(selector);
    }

    /// <summary>
    /// Distinct with selector (custom equality)
    /// </summary>
    public static IQueryable<T> DistinctBy<T, TKey>(
        this IQueryable<T> query,
        Expression<Func<T, TKey>> keySelector)
    {
        return query.GroupBy(keySelector).Select(g => g.First());
    }

    /// <summary>
    /// Split query için (large includes optimization)
    /// </summary>
    public static IQueryable<T> AsSplitQueryIfNeeded<T>(
        this IQueryable<T> query,
        int includeCount) where T : class
    {
        // 3'ten fazla include varsa split query kullan (Cartesian explosion prevention)
        return includeCount > 3 ? query.AsSplitQuery() : query;
    }

    /// <summary>
    /// Count ile birlikte data çeker (single query optimization)
    /// </summary>
    public static async Task<(List<T> Items, int TotalCount)> ToListWithCountAsync<T>(
        this IQueryable<T> query,
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    /// <summary>
    /// Batch olarak chunks halinde işler (memory optimization)
    /// </summary>
    public static async IAsyncEnumerable<List<T>> ToChunksAsync<T>(
        this IQueryable<T> query,
        int chunkSize,
        [System.Runtime.CompilerServices.EnumeratorCancellation] CancellationToken cancellationToken = default)
    {
        var skip = 0;
        List<T> chunk;

        do
        {
            chunk = await query
                .Skip(skip)
                .Take(chunkSize)
                .ToListAsync(cancellationToken);

            if (chunk.Count > 0)
            {
                yield return chunk;
                skip += chunkSize;
            }
        } while (chunk.Count == chunkSize);
    }

    /// <summary>
    /// FirstOrDefault ile birlikte tracking disabled (read-only optimization)
    /// </summary>
    public static Task<T?> FirstOrDefaultReadOnlyAsync<T>(
        this IQueryable<T> query,
        CancellationToken cancellationToken = default) where T : class
    {
        return query.AsNoTracking().FirstOrDefaultAsync(cancellationToken);
    }

    /// <summary>
    /// FirstOrDefault ile predicate ve tracking disabled
    /// </summary>
    public static Task<T?> FirstOrDefaultReadOnlyAsync<T>(
        this IQueryable<T> query,
        Expression<Func<T, bool>> predicate,
        CancellationToken cancellationToken = default) where T : class
    {
        return query.AsNoTracking().FirstOrDefaultAsync(predicate, cancellationToken);
    }

    /// <summary>
    /// Exists check (performans için Any kullanır)
    /// </summary>
    public static Task<bool> ExistsAsync<T>(
        this IQueryable<T> query,
        CancellationToken cancellationToken = default)
    {
        return query.AnyAsync(cancellationToken);
    }

    /// <summary>
    /// Exists check with predicate
    /// </summary>
    public static Task<bool> ExistsAsync<T>(
        this IQueryable<T> query,
        Expression<Func<T, bool>> predicate,
        CancellationToken cancellationToken = default)
    {
        return query.AnyAsync(predicate, cancellationToken);
    }
}
