using Microsoft.EntityFrameworkCore;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Primitives;
using Stocker.SharedKernel.Specifications;
using System.Linq.Expressions;

namespace Stocker.Persistence.Repositories;

/// <summary>
/// Generic repository implementation with read and write operations
/// </summary>
public class GenericRepository<TEntity, TContext> : GenericRepository<TEntity, Guid, TContext>, IRepository<TEntity>
    where TEntity : Entity<Guid>
    where TContext : DbContext
{
    public GenericRepository(TContext context) : base(context)
    {
    }
}

public class GenericRepository<TEntity, TId, TContext> : IRepository<TEntity, TId>
    where TEntity : Entity<TId>
    where TId : notnull
    where TContext : DbContext
{
    protected readonly TContext Context;
    protected readonly DbSet<TEntity> DbSet;

    public GenericRepository(TContext context)
    {
        Context = context ?? throw new ArgumentNullException(nameof(context));
        DbSet = context.Set<TEntity>();
    }

    #region Read Operations

    public virtual IQueryable<TEntity> AsQueryable()
    {
        return DbSet.AsQueryable();
    }

    public virtual async Task<TEntity?> GetByIdAsync(TId id, CancellationToken cancellationToken = default)
    {
        return await DbSet.FindAsync(new object[] { id }, cancellationToken);
    }

    public virtual async Task<IReadOnlyList<TEntity>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet.ToListAsync(cancellationToken);
    }

    public virtual async Task<IReadOnlyList<TEntity>> GetAllAsync(params Expression<Func<TEntity, object>>[] includes)
    {
        var query = DbSet.AsQueryable();
        foreach (var include in includes)
        {
            query = query.Include(include);
        }
        return await query.ToListAsync();
    }

    public virtual async Task<IReadOnlyList<TEntity>> FindAsync(
        Expression<Func<TEntity, bool>> predicate, 
        CancellationToken cancellationToken = default)
    {
        return await DbSet.Where(predicate).ToListAsync(cancellationToken);
    }

    public virtual async Task<IReadOnlyList<TEntity>> FindAsync(
        ISpecification<TEntity> specification, 
        CancellationToken cancellationToken = default)
    {
        var query = ApplySpecification(specification);
        return await query.ToListAsync(cancellationToken);
    }

    public virtual async Task<TEntity?> SingleOrDefaultAsync(
        Expression<Func<TEntity, bool>> predicate, 
        CancellationToken cancellationToken = default)
    {
        return await DbSet.SingleOrDefaultAsync(predicate, cancellationToken);
    }

    public virtual async Task<TEntity?> SingleOrDefaultAsync(
        ISpecification<TEntity> specification, 
        CancellationToken cancellationToken = default)
    {
        var query = ApplySpecification(specification);
        return await query.SingleOrDefaultAsync(cancellationToken);
    }

    public virtual async Task<bool> AnyAsync(
        Expression<Func<TEntity, bool>> predicate, 
        CancellationToken cancellationToken = default)
    {
        return await DbSet.AnyAsync(predicate, cancellationToken);
    }

    public virtual async Task<bool> AnyAsync(
        ISpecification<TEntity> specification, 
        CancellationToken cancellationToken = default)
    {
        var query = ApplySpecification(specification);
        return await query.AnyAsync(cancellationToken);
    }

    public virtual async Task<int> CountAsync(
        Expression<Func<TEntity, bool>> predicate, 
        CancellationToken cancellationToken = default)
    {
        return await DbSet.CountAsync(predicate, cancellationToken);
    }

    public virtual async Task<int> CountAsync(
        ISpecification<TEntity> specification, 
        CancellationToken cancellationToken = default)
    {
        var query = ApplySpecification(specification);
        return await query.CountAsync(cancellationToken);
    }

    public virtual async Task<(IReadOnlyList<TEntity> Items, int TotalCount)> GetPagedAsync(
        int pageIndex,
        int pageSize,
        Expression<Func<TEntity, bool>>? predicate = null,
        Func<IQueryable<TEntity>, IOrderedQueryable<TEntity>>? orderBy = null,
        CancellationToken cancellationToken = default)
    {
        var query = DbSet.AsQueryable();

        if (predicate != null)
        {
            query = query.Where(predicate);
        }

        var totalCount = await query.CountAsync(cancellationToken);

        if (orderBy != null)
        {
            query = orderBy(query);
        }

        var items = await query
            .Skip(pageIndex * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public virtual async Task<(IReadOnlyList<TEntity> Items, int TotalCount)> GetPagedAsync(
        ISpecification<TEntity> specification,
        int pageIndex,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        var query = ApplySpecification(specification);
        var totalCount = await query.CountAsync(cancellationToken);

        query = query.Skip(pageIndex * pageSize).Take(pageSize);
        var items = await query.ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    #endregion

    #region Write Operations

    public virtual async Task<TEntity> AddAsync(TEntity entity, CancellationToken cancellationToken = default)
    {
        await DbSet.AddAsync(entity, cancellationToken);
        return entity;
    }

    public virtual async Task AddRangeAsync(IEnumerable<TEntity> entities, CancellationToken cancellationToken = default)
    {
        await DbSet.AddRangeAsync(entities, cancellationToken);
    }

    public virtual void Update(TEntity entity)
    {
        DbSet.Update(entity);
    }

    public virtual void UpdateRange(IEnumerable<TEntity> entities)
    {
        DbSet.UpdateRange(entities);
    }

    public virtual void Remove(TEntity entity)
    {
        DbSet.Remove(entity);
    }

    public virtual void RemoveRange(IEnumerable<TEntity> entities)
    {
        DbSet.RemoveRange(entities);
    }

    public virtual async Task RemoveByIdAsync(TId id, CancellationToken cancellationToken = default)
    {
        var entity = await GetByIdAsync(id, cancellationToken);
        if (entity != null)
        {
            Remove(entity);
        }
    }

    #endregion

    #region Private Methods

    protected IQueryable<TEntity> ApplySpecification(ISpecification<TEntity> specification)
    {
        return SpecificationEvaluator.GetQuery(DbSet.AsQueryable(), specification);
    }

    #endregion
}