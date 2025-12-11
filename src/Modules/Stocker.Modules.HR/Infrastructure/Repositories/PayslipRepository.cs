using Microsoft.EntityFrameworkCore;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.Modules.HR.Infrastructure.Persistence;

namespace Stocker.Modules.HR.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for Payslip entity
/// </summary>
public class PayslipRepository : BaseRepository<Payslip>, IPayslipRepository
{
    public PayslipRepository(HRDbContext context) : base(context)
    {
    }

    public override async System.Threading.Tasks.Task<Payslip?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(p => p.Employee)
            .Include(p => p.Payroll)
            .Include(p => p.Items)
            .Where(p => !p.IsDeleted && p.Id == id)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<IReadOnlyList<Payslip>> GetAllAsync(
        int? employeeId = null,
        int? payrollId = null,
        int? year = null,
        int? month = null,
        PayslipStatus? status = null,
        int? skip = null,
        int? take = null,
        CancellationToken cancellationToken = default)
    {
        var query = DbSet
            .Include(p => p.Employee)
            .Include(p => p.Payroll)
            .Where(p => !p.IsDeleted);

        if (employeeId.HasValue)
            query = query.Where(p => p.EmployeeId == employeeId.Value);

        if (payrollId.HasValue)
            query = query.Where(p => p.PayrollId == payrollId.Value);

        if (year.HasValue)
            query = query.Where(p => p.Year == year.Value);

        if (month.HasValue)
            query = query.Where(p => p.Month == month.Value);

        if (status.HasValue)
            query = query.Where(p => p.Status == status.Value);

        query = query.OrderByDescending(p => p.Year).ThenByDescending(p => p.Month);

        if (skip.HasValue)
            query = query.Skip(skip.Value);

        if (take.HasValue)
            query = query.Take(take.Value);

        return await query.ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<IReadOnlyList<Payslip>> GetByEmployeeAsync(int employeeId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(p => p.Employee)
            .Include(p => p.Payroll)
            .Where(p => !p.IsDeleted && p.EmployeeId == employeeId)
            .OrderByDescending(p => p.Year).ThenByDescending(p => p.Month)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<IReadOnlyList<Payslip>> GetByPayrollAsync(int payrollId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(p => p.Employee)
            .Include(p => p.Payroll)
            .Where(p => !p.IsDeleted && p.PayrollId == payrollId)
            .OrderBy(p => p.Employee.LastName).ThenBy(p => p.Employee.FirstName)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<IReadOnlyList<Payslip>> GetByPeriodAsync(int year, int month, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(p => p.Employee)
            .Include(p => p.Payroll)
            .Where(p => !p.IsDeleted && p.Year == year && p.Month == month)
            .OrderBy(p => p.Employee.LastName).ThenBy(p => p.Employee.FirstName)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<Payslip?> GetByEmployeeAndPeriodAsync(int employeeId, int year, int month, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(p => p.Employee)
            .Include(p => p.Payroll)
            .Where(p => !p.IsDeleted && p.EmployeeId == employeeId && p.Year == year && p.Month == month)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<Payslip?> GetByNumberAsync(string payslipNumber, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(p => p.Employee)
            .Include(p => p.Payroll)
            .Include(p => p.Items)
            .Where(p => !p.IsDeleted && p.PayslipNumber == payslipNumber)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<IReadOnlyList<Payslip>> GetByStatusAsync(PayslipStatus status, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(p => p.Employee)
            .Include(p => p.Payroll)
            .Where(p => !p.IsDeleted && p.Status == status)
            .OrderByDescending(p => p.Year).ThenByDescending(p => p.Month)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<Payslip> CreateAsync(Payslip payslip, CancellationToken cancellationToken = default)
    {
        await DbSet.AddAsync(payslip, cancellationToken);
        await Context.SaveChangesAsync(cancellationToken);
        return payslip;
    }

    public async System.Threading.Tasks.Task<Payslip> UpdateAsync(Payslip payslip, CancellationToken cancellationToken = default)
    {
        DbSet.Update(payslip);
        await Context.SaveChangesAsync(cancellationToken);
        return payslip;
    }

    public async System.Threading.Tasks.Task DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var payslip = await GetByIdAsync(id, cancellationToken);
        if (payslip != null)
        {
            payslip.Delete(string.Empty);
            await Context.SaveChangesAsync(cancellationToken);
        }
    }
}
