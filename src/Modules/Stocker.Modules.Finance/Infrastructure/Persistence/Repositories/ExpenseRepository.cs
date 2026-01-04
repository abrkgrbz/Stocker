using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Finance.Domain.Entities;
using Stocker.Modules.Finance.Domain.Enums;
using Stocker.Modules.Finance.Domain.Repositories;

namespace Stocker.Modules.Finance.Infrastructure.Persistence.Repositories;

/// <summary>
/// Repository implementation for Expense entity
/// </summary>
public class ExpenseRepository : FinanceGenericRepository<Expense>, IExpenseRepository
{
    public ExpenseRepository(FinanceDbContext context) : base(context)
    {
    }

    public async Task<Expense?> GetByExpenseNumberAsync(string expenseNumber, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .FirstOrDefaultAsync(e => e.ExpenseNumber == expenseNumber, cancellationToken);
    }

    public async Task<string> GetNextExpenseNumberAsync(int year, CancellationToken cancellationToken = default)
    {
        var maxNumber = await _dbSet
            .Where(e => e.ExpenseDate.Year == year)
            .Select(e => e.ExpenseNumber)
            .OrderByDescending(n => n)
            .FirstOrDefaultAsync(cancellationToken);

        if (string.IsNullOrEmpty(maxNumber))
        {
            return $"GDR-{year}-000001";
        }

        // Parse existing number and increment
        var parts = maxNumber.Split('-');
        if (parts.Length >= 3 && int.TryParse(parts[2], out var sequence))
        {
            return $"GDR-{year}-{(sequence + 1):D6}";
        }

        return $"GDR-{year}-000001";
    }

    public async Task<IReadOnlyList<Expense>> GetByCategoryAsync(ExpenseMainCategory category, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(e => e.Category == category)
            .OrderByDescending(e => e.ExpenseDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Expense>> GetByStatusAsync(ExpenseStatus status, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(e => e.Status == status)
            .OrderByDescending(e => e.ExpenseDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Expense>> GetByCostCenterAsync(int costCenterId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(e => e.CostCenterId == costCenterId)
            .OrderByDescending(e => e.ExpenseDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Expense>> GetByProjectAsync(int projectId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(e => e.ProjectId == projectId)
            .OrderByDescending(e => e.ExpenseDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Expense>> GetByDateRangeAsync(
        DateTime startDate,
        DateTime endDate,
        CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(e => e.ExpenseDate >= startDate && e.ExpenseDate <= endDate)
            .OrderByDescending(e => e.ExpenseDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Expense>> GetUnpaidExpensesAsync(CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(e => !e.IsPaid && e.Status == ExpenseStatus.Approved)
            .OrderBy(e => e.ExpenseDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Expense>> GetPendingApprovalAsync(CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(e => e.Status == ExpenseStatus.PendingApproval)
            .OrderBy(e => e.ExpenseDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<Dictionary<ExpenseMainCategory, decimal>> GetTotalByCategoryAsync(
        DateTime startDate,
        DateTime endDate,
        CancellationToken cancellationToken = default)
    {
        var totals = await _dbSet
            .Where(e => e.ExpenseDate >= startDate &&
                       e.ExpenseDate <= endDate &&
                       e.Status == ExpenseStatus.Approved)
            .GroupBy(e => e.Category)
            .Select(g => new
            {
                Category = g.Key,
                Total = g.Sum(e => e.GrossAmount.Amount)
            })
            .ToListAsync(cancellationToken);

        return totals.ToDictionary(t => t.Category, t => t.Total);
    }
}
