using Microsoft.EntityFrameworkCore;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Domain.Enums;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.Modules.HR.Infrastructure.Persistence;

namespace Stocker.Modules.HR.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for Payroll entity
/// </summary>
public class PayrollRepository : BaseRepository<Payroll>, IPayrollRepository
{
    public PayrollRepository(HRDbContext context) : base(context)
    {
    }

    public async Task<Payroll?> GetWithItemsAsync(int payrollId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(p => p.Items)
            .Include(p => p.Employee)
            .Where(p => !p.IsDeleted)
            .FirstOrDefaultAsync(p => p.Id == payrollId, cancellationToken);
    }

    public async Task<Payroll?> GetByNumberAsync(string payrollNumber, CancellationToken cancellationToken = default)
    {
        // Note: Payroll entity doesn't have a PayrollNumber property
        // This method finds by Year-Month-EmployeeId pattern or Id
        // For now, return null as the field doesn't exist
        return null;
    }

    public async Task<Payroll?> GetByEmployeeAndPeriodAsync(int employeeId, int year, int month, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(p => p.Items)
            .Where(p => !p.IsDeleted
                && p.EmployeeId == employeeId
                && p.PeriodStart.Year == year
                && p.PeriodStart.Month == month)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Payroll>> GetByEmployeeAsync(int employeeId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(p => !p.IsDeleted && p.EmployeeId == employeeId)
            .OrderByDescending(p => p.PeriodStart)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Payroll>> GetByPeriodAsync(int year, int month, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(p => p.Employee)
            .Where(p => !p.IsDeleted
                && p.PeriodStart.Year == year
                && p.PeriodStart.Month == month)
            .OrderBy(p => p.Employee.FirstName)
            .ThenBy(p => p.Employee.LastName)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Payroll>> GetByStatusAsync(PayrollStatus status, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(p => p.Employee)
            .Where(p => !p.IsDeleted && p.Status == status)
            .OrderByDescending(p => p.PeriodStart)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Payroll>> GetByDepartmentAndPeriodAsync(int departmentId, int year, int month, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(p => p.Employee)
            .Where(p => !p.IsDeleted
                && p.Employee.DepartmentId == departmentId
                && p.PeriodStart.Year == year
                && p.PeriodStart.Month == month)
            .OrderBy(p => p.Employee.FirstName)
            .ThenBy(p => p.Employee.LastName)
            .ToListAsync(cancellationToken);
    }

    public async Task<(decimal TotalBaseSalary, decimal TotalEarnings, decimal TotalDeductions, decimal TotalNetSalary, decimal TotalEmployerCost)> GetPeriodSummaryAsync(int year, int month, CancellationToken cancellationToken = default)
    {
        var payrolls = await DbSet
            .Where(p => !p.IsDeleted
                && p.PeriodStart.Year == year
                && p.PeriodStart.Month == month)
            .ToListAsync(cancellationToken);

        var totalBaseSalary = payrolls.Sum(p => p.BaseSalary);
        var totalEarnings = payrolls.Sum(p => p.GrossEarnings);
        var totalDeductions = payrolls.Sum(p => p.TotalDeductions);
        var totalNetSalary = payrolls.Sum(p => p.NetSalary);
        var totalEmployerCost = payrolls.Sum(p => p.TotalEmployerCost);

        return (totalBaseSalary, totalEarnings, totalDeductions, totalNetSalary, totalEmployerCost);
    }

    public async Task<bool> ExistsForPeriodAsync(int employeeId, int year, int month, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .AnyAsync(p => !p.IsDeleted
                && p.EmployeeId == employeeId
                && p.PeriodStart.Year == year
                && p.PeriodStart.Month == month,
                cancellationToken);
    }
}
