using Microsoft.EntityFrameworkCore;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Domain.Enums;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.Modules.HR.Infrastructure.Persistence;

namespace Stocker.Modules.HR.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for LeaveBalance entity
/// </summary>
public class LeaveBalanceRepository : BaseRepository<LeaveBalance>, ILeaveBalanceRepository
{
    public LeaveBalanceRepository(HRDbContext context) : base(context)
    {
    }

    public async Task<LeaveBalance?> GetByEmployeeLeaveTypeAndYearAsync(int employeeId, int leaveTypeId, int year, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(lb => !lb.IsDeleted &&
                   lb.EmployeeId == employeeId &&
                   lb.LeaveTypeId == leaveTypeId &&
                   lb.Year == year)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<LeaveBalance>> GetByEmployeeAndYearAsync(int employeeId, int year, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(lb => lb.LeaveType)
            .Where(lb => !lb.IsDeleted &&
                   lb.EmployeeId == employeeId &&
                   lb.Year == year)
            .OrderBy(lb => lb.LeaveType.DisplayOrder)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<LeaveBalance>> GetByYearAsync(int year, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(lb => lb.Employee)
            .Include(lb => lb.LeaveType)
            .Where(lb => !lb.IsDeleted && lb.Year == year)
            .OrderBy(lb => lb.Employee.LastName)
            .ThenBy(lb => lb.LeaveType.DisplayOrder)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<LeaveBalance>> GetByDepartmentAndYearAsync(int departmentId, int year, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(lb => lb.Employee)
            .Include(lb => lb.LeaveType)
            .Where(lb => !lb.IsDeleted &&
                   lb.Employee.DepartmentId == departmentId &&
                   lb.Year == year)
            .OrderBy(lb => lb.Employee.LastName)
            .ThenBy(lb => lb.LeaveType.DisplayOrder)
            .ToListAsync(cancellationToken);
    }

    public async Task CreateYearlyBalancesAsync(int year, CancellationToken cancellationToken = default)
    {
        var employees = await Context.Set<Employee>()
            .Where(e => !e.IsDeleted && e.Status == EmployeeStatus.Active)
            .ToListAsync(cancellationToken);

        var leaveTypes = await Context.Set<LeaveType>()
            .Where(lt => !lt.IsDeleted && lt.IsActive)
            .ToListAsync(cancellationToken);

        foreach (var employee in employees)
        {
            foreach (var leaveType in leaveTypes)
            {
                var existingBalance = await DbSet
                    .FirstOrDefaultAsync(lb =>
                        lb.EmployeeId == employee.Id &&
                        lb.LeaveTypeId == leaveType.Id &&
                        lb.Year == year,
                        cancellationToken);

                if (existingBalance == null)
                {
                    var balance = new LeaveBalance(
                        employee.Id,
                        leaveType.Id,
                        year,
                        leaveType.DefaultDays);

                    await DbSet.AddAsync(balance, cancellationToken);
                }
            }
        }

        await Context.SaveChangesAsync(cancellationToken);
    }

    public async Task ProcessCarryForwardAsync(int fromYear, int toYear, CancellationToken cancellationToken = default)
    {
        var previousYearBalances = await DbSet
            .Include(lb => lb.LeaveType)
            .Where(lb => !lb.IsDeleted && lb.Year == fromYear)
            .ToListAsync(cancellationToken);

        foreach (var previousBalance in previousYearBalances)
        {
            if (previousBalance.LeaveType != null &&
                previousBalance.LeaveType.IsCarryForward &&
                previousBalance.Available > 0)
            {
                var currentYearBalance = await DbSet
                    .FirstOrDefaultAsync(lb =>
                        lb.EmployeeId == previousBalance.EmployeeId &&
                        lb.LeaveTypeId == previousBalance.LeaveTypeId &&
                        lb.Year == toYear,
                        cancellationToken);

                if (currentYearBalance != null)
                {
                    var carryForwardDays = previousBalance.LeaveType.MaxCarryForwardDays.HasValue
                        ? Math.Min(previousBalance.Available, previousBalance.LeaveType.MaxCarryForwardDays.Value)
                        : previousBalance.Available;

                    currentYearBalance.SetCarriedForward(carryForwardDays);
                }
            }
        }

        await Context.SaveChangesAsync(cancellationToken);
    }
}
