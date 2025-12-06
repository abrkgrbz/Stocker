using Microsoft.EntityFrameworkCore;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Domain.Enums;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.Modules.HR.Infrastructure.Persistence;

namespace Stocker.Modules.HR.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for Expense entity
/// </summary>
public class ExpenseRepository : BaseRepository<Expense>, IExpenseRepository
{
    public ExpenseRepository(HRDbContext context) : base(context)
    {
    }

    public async Task<Expense?> GetByNumberAsync(string expenseNumber, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(e => !e.IsDeleted)
            .FirstOrDefaultAsync(e => e.ExpenseNumber == expenseNumber, cancellationToken);
    }

    public async Task<IReadOnlyList<Expense>> GetByEmployeeAsync(int employeeId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(e => !e.IsDeleted && e.EmployeeId == employeeId)
            .OrderByDescending(e => e.ExpenseDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Expense>> GetByEmployeeAndDateRangeAsync(int employeeId, DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(e => !e.IsDeleted
                && e.EmployeeId == employeeId
                && e.ExpenseDate >= startDate
                && e.ExpenseDate <= endDate)
            .OrderByDescending(e => e.ExpenseDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Expense>> GetByStatusAsync(ExpenseStatus status, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(e => e.Employee)
            .Where(e => !e.IsDeleted && e.Status == status)
            .OrderByDescending(e => e.ExpenseDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Expense>> GetPendingApprovalAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(e => e.Employee)
            .Where(e => !e.IsDeleted && e.Status == ExpenseStatus.Pending)
            .OrderBy(e => e.CreatedDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Expense>> GetByTypeAsync(ExpenseType expenseType, DateTime? startDate = null, DateTime? endDate = null, CancellationToken cancellationToken = default)
    {
        var query = DbSet
            .Where(e => !e.IsDeleted && e.ExpenseType == expenseType);

        if (startDate.HasValue)
            query = query.Where(e => e.ExpenseDate >= startDate.Value);

        if (endDate.HasValue)
            query = query.Where(e => e.ExpenseDate <= endDate.Value);

        return await query
            .OrderByDescending(e => e.ExpenseDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Expense>> GetApprovedUnpaidAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(e => e.Employee)
            .Where(e => !e.IsDeleted
                && e.Status == ExpenseStatus.Approved
                && !e.PaidDate.HasValue)
            .OrderBy(e => e.ApprovedDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<(int Count, decimal TotalAmount, decimal ApprovedAmount, decimal PaidAmount)> GetEmployeeSummaryAsync(int employeeId, int year, int? month = null, CancellationToken cancellationToken = default)
    {
        var query = DbSet
            .Where(e => !e.IsDeleted
                && e.EmployeeId == employeeId
                && e.ExpenseDate.Year == year);

        if (month.HasValue)
            query = query.Where(e => e.ExpenseDate.Month == month.Value);

        var expenses = await query.ToListAsync(cancellationToken);

        var count = expenses.Count;
        var totalAmount = expenses.Sum(e => e.Amount);
        var approvedAmount = expenses.Where(e => e.Status == ExpenseStatus.Approved || e.Status == ExpenseStatus.Paid)
            .Sum(e => e.Amount);
        var paidAmount = expenses.Where(e => e.Status == ExpenseStatus.Paid)
            .Sum(e => e.Amount);

        return (count, totalAmount, approvedAmount, paidAmount);
    }

    public async Task<bool> ExistsWithNumberAsync(string expenseNumber, int? excludeExpenseId = null, CancellationToken cancellationToken = default)
    {
        var query = DbSet.Where(e => !e.IsDeleted && e.ExpenseNumber == expenseNumber);

        if (excludeExpenseId.HasValue)
            query = query.Where(e => e.Id != excludeExpenseId.Value);

        return await query.AnyAsync(cancellationToken);
    }
}
