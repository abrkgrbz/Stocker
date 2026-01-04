using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Finance.Domain.Entities;
using Stocker.Modules.Finance.Domain.Repositories;

namespace Stocker.Modules.Finance.Infrastructure.Persistence.Repositories;

/// <summary>
/// Repository implementation for Budget entity
/// </summary>
public class BudgetRepository : FinanceGenericRepository<Budget>, IBudgetRepository
{
    public BudgetRepository(FinanceDbContext context) : base(context)
    {
    }

    public async Task<Budget?> GetWithChildrenAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(b => b.ChildBudgets)
            .Include(b => b.ParentBudget)
            .Include(b => b.CostCenter)
            .Include(b => b.Account)
            .FirstOrDefaultAsync(b => b.Id == id, cancellationToken);
    }

    public async Task<Budget?> GetWithItemsAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(b => b.Items)
            .Include(b => b.CostCenter)
            .Include(b => b.Account)
            .FirstOrDefaultAsync(b => b.Id == id, cancellationToken);
    }

    public async Task<Budget?> GetByCodeAsync(string code, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(b => b.ChildBudgets)
            .FirstOrDefaultAsync(b => b.Code == code, cancellationToken);
    }

    public async Task<IReadOnlyList<Budget>> GetByFiscalYearAsync(int fiscalYear, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(b => b.FiscalYear == fiscalYear)
            .OrderBy(b => b.Code)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Budget>> GetByTypeAsync(BudgetType type, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(b => b.Type == type)
            .OrderBy(b => b.Code)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Budget>> GetByCategoryAsync(BudgetCategory category, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(b => b.Category == category)
            .OrderBy(b => b.Code)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Budget>> GetByStatusAsync(BudgetStatus status, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(b => b.Status == status)
            .OrderBy(b => b.Code)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Budget>> GetByCostCenterAsync(int costCenterId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(b => b.CostCenterId == costCenterId)
            .OrderBy(b => b.FiscalYear)
            .ThenBy(b => b.Code)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Budget>> GetByDepartmentAsync(int departmentId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(b => b.DepartmentId == departmentId)
            .OrderBy(b => b.FiscalYear)
            .ThenBy(b => b.Code)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Budget>> GetByProjectAsync(int projectId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(b => b.ProjectId == projectId)
            .OrderBy(b => b.StartDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Budget>> GetByOwnerAsync(int ownerUserId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(b => b.OwnerUserId == ownerUserId)
            .OrderBy(b => b.FiscalYear)
            .ThenBy(b => b.Code)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Budget>> GetChildBudgetsAsync(int parentBudgetId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(b => b.ParentBudgetId == parentBudgetId)
            .OrderBy(b => b.Code)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Budget>> GetActiveBudgetsForPeriodAsync(
        DateTime startDate,
        DateTime endDate,
        CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(b => b.IsActive &&
                       b.StartDate <= endDate &&
                       b.EndDate >= startDate)
            .OrderBy(b => b.Code)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Budget>> GetBudgetsAtRiskAsync(CancellationToken cancellationToken = default)
    {
        // Get budgets that are at warning or critical level
        // We need to load all active budgets and filter in memory because
        // the GetHealthStatus() calculation cannot be translated to SQL
        var activeBudgets = await _dbSet
            .Where(b => b.IsActive && b.Status == BudgetStatus.Active)
            .ToListAsync(cancellationToken);

        return activeBudgets
            .Where(b => b.IsAtWarningLevel() || b.IsAtCriticalLevel() || b.IsOverBudget())
            .OrderByDescending(b => b.GetUsagePercentage())
            .ToList();
    }

    public async Task<bool> CodeExistsAsync(string code, int? excludeId = null, CancellationToken cancellationToken = default)
    {
        var query = _dbSet.Where(b => b.Code == code);

        if (excludeId.HasValue)
        {
            query = query.Where(b => b.Id != excludeId.Value);
        }

        return await query.AnyAsync(cancellationToken);
    }
}
