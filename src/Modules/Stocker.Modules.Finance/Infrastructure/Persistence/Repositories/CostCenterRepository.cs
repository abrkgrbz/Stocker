using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Finance.Domain.Entities;
using Stocker.Modules.Finance.Domain.Repositories;

namespace Stocker.Modules.Finance.Infrastructure.Persistence.Repositories;

/// <summary>
/// Repository implementation for CostCenter entity
/// Masraf Merkezi Repository Uygulaması
/// </summary>
public class CostCenterRepository : FinanceGenericRepository<CostCenter>, ICostCenterRepository
{
    public CostCenterRepository(FinanceDbContext context) : base(context)
    {
    }

    /// <inheritdoc />
    public async Task<CostCenter?> GetByCodeAsync(string code, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .FirstOrDefaultAsync(c => c.Code == code, cancellationToken);
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<CostCenter>> GetActiveAsync(CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(c => c.IsActive && !c.IsFrozen)
            .OrderBy(c => c.Level)
            .ThenBy(c => c.SortOrder)
            .ThenBy(c => c.Code)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<CostCenter>> GetByTypeAsync(CostCenterType type, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(c => c.Type == type)
            .OrderBy(c => c.Level)
            .ThenBy(c => c.SortOrder)
            .ThenBy(c => c.Code)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<CostCenter>> GetByCategoryAsync(CostCenterCategory category, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(c => c.Category == category)
            .OrderBy(c => c.Level)
            .ThenBy(c => c.SortOrder)
            .ThenBy(c => c.Code)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<CostCenter>> GetRootCostCentersAsync(CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(c => c.ParentId == null)
            .OrderBy(c => c.SortOrder)
            .ThenBy(c => c.Code)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<CostCenter>> GetChildrenAsync(int parentId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(c => c.ParentId == parentId)
            .OrderBy(c => c.SortOrder)
            .ThenBy(c => c.Code)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<CostCenter?> GetWithChildrenAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(c => c.Children)
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
    }

    /// <inheritdoc />
    public async Task<CostCenter?> GetDefaultAsync(CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .FirstOrDefaultAsync(c => c.IsDefault && c.IsActive, cancellationToken);
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<CostCenter>> GetByDepartmentAsync(int departmentId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(c => c.DepartmentId == departmentId)
            .OrderBy(c => c.Level)
            .ThenBy(c => c.SortOrder)
            .ThenBy(c => c.Code)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<CostCenter>> GetByBranchAsync(int branchId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(c => c.BranchId == branchId)
            .OrderBy(c => c.Level)
            .ThenBy(c => c.SortOrder)
            .ThenBy(c => c.Code)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<CostCenter>> GetBudgetWarningsAsync(CancellationToken cancellationToken = default)
    {
        // Note: IsBudgetWarning() is a method that calculates based on entity state,
        // so we need to load all active cost centers with budgets and filter in memory
        var costCenters = await _dbSet
            .Where(c => c.IsActive && c.AnnualBudget != null)
            .ToListAsync(cancellationToken);

        return costCenters
            .Where(c => c.IsBudgetWarning())
            .OrderByDescending(c => c.GetBudgetUsagePercentage())
            .ToList();
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<CostCenter>> GetOverBudgetAsync(CancellationToken cancellationToken = default)
    {
        // Note: IsOverBudget() is a method that calculates based on entity state,
        // so we need to load all active cost centers with budgets and filter in memory
        var costCenters = await _dbSet
            .Where(c => c.IsActive && c.AnnualBudget != null)
            .ToListAsync(cancellationToken);

        return costCenters
            .Where(c => c.IsOverBudget())
            .OrderByDescending(c => c.GetBudgetUsagePercentage())
            .ToList();
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<CostCenter>> GetDescendantsAsync(int costCenterId, CancellationToken cancellationToken = default)
    {
        var descendants = new List<CostCenter>();
        var queue = new Queue<int>();
        queue.Enqueue(costCenterId);

        while (queue.Count > 0)
        {
            var currentId = queue.Dequeue();
            var children = await _dbSet
                .Where(c => c.ParentId == currentId)
                .ToListAsync(cancellationToken);

            foreach (var child in children)
            {
                descendants.Add(child);
                queue.Enqueue(child.Id);
            }
        }

        return descendants
            .OrderBy(c => c.Level)
            .ThenBy(c => c.SortOrder)
            .ThenBy(c => c.Code)
            .ToList();
    }

    /// <inheritdoc />
    public async Task<bool> IsCodeUniqueAsync(string code, int? excludeId = null, CancellationToken cancellationToken = default)
    {
        var query = _dbSet.Where(c => c.Code == code);

        if (excludeId.HasValue)
        {
            query = query.Where(c => c.Id != excludeId.Value);
        }

        return !await query.AnyAsync(cancellationToken);
    }
}
