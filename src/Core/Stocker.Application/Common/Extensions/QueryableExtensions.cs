using Microsoft.EntityFrameworkCore;
using Stocker.SharedKernel.Pagination;
using System.Linq.Expressions;

namespace Stocker.Application.Common.Extensions;

/// <summary>
/// Extension methods for IQueryable
/// </summary>
public static class QueryableExtensions
{
    /// <summary>
    /// Applies pagination to a queryable
    /// </summary>
    public static async Task<PagedResult<T>> ToPagedResultAsync<T>(
        this IQueryable<T> query,
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        var count = await query.CountAsync(cancellationToken);
        var items = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return PagedResult<T>.Create(items, count, pageNumber, pageSize);
    }

    /// <summary>
    /// Applies pagination to a queryable with PaginationRequest
    /// </summary>
    public static async Task<PagedResult<T>> ToPagedResultAsync<T>(
        this IQueryable<T> query,
        PaginationRequest request,
        CancellationToken cancellationToken = default)
    {
        return await query.ToPagedResultAsync(request.PageNumber, request.PageSize, cancellationToken);
    }

    /// <summary>
    /// Applies ordering to a queryable
    /// </summary>
    public static IQueryable<T> OrderByProperty<T>(
        this IQueryable<T> query,
        string propertyName,
        bool descending = false)
    {
        if (string.IsNullOrWhiteSpace(propertyName))
            return query;

        var entityType = typeof(T);
        var propertyInfo = entityType.GetProperty(propertyName);
        
        if (propertyInfo == null)
            return query;

        var parameter = Expression.Parameter(entityType, "x");
        var property = Expression.Property(parameter, propertyName);
        var lambda = Expression.Lambda(property, parameter);

        var methodName = descending ? "OrderByDescending" : "OrderBy";
        var method = typeof(Queryable).GetMethods()
            .First(m => m.Name == methodName && m.GetParameters().Length == 2)
            .MakeGenericMethod(entityType, propertyInfo.PropertyType);

        return (IQueryable<T>)method.Invoke(null, new object[] { query, lambda })!;
    }

    /// <summary>
    /// Applies conditional Where clause
    /// </summary>
    public static IQueryable<T> WhereIf<T>(
        this IQueryable<T> query,
        bool condition,
        Expression<Func<T, bool>> predicate)
    {
        return condition ? query.Where(predicate) : query;
    }

    /// <summary>
    /// Applies conditional Include
    /// </summary>
    public static IQueryable<T> IncludeIf<T, TProperty>(
        this IQueryable<T> query,
        bool condition,
        Expression<Func<T, TProperty>> navigationPropertyPath)
        where T : class
    {
        return condition ? query.Include(navigationPropertyPath) : query;
    }
}