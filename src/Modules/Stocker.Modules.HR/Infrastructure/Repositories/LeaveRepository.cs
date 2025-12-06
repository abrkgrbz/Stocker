using Microsoft.EntityFrameworkCore;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Domain.Enums;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.Modules.HR.Infrastructure.Persistence;

namespace Stocker.Modules.HR.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for Leave entity
/// </summary>
public class LeaveRepository : BaseRepository<Leave>, ILeaveRepository
{
    public LeaveRepository(HRDbContext context) : base(context)
    {
    }

    public async Task<Leave?> GetWithDetailsAsync(int leaveId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(l => l.Employee)
            .Include(l => l.LeaveType)
            .Where(l => !l.IsDeleted && l.Id == leaveId)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Leave>> GetByEmployeeAsync(int employeeId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(l => l.LeaveType)
            .Where(l => !l.IsDeleted && l.EmployeeId == employeeId)
            .OrderByDescending(l => l.StartDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Leave>> GetByEmployeeAndYearAsync(int employeeId, int year, CancellationToken cancellationToken = default)
    {
        var startOfYear = new DateTime(year, 1, 1);
        var endOfYear = new DateTime(year, 12, 31);

        return await DbSet
            .Include(l => l.LeaveType)
            .Where(l => !l.IsDeleted &&
                   l.EmployeeId == employeeId &&
                   l.StartDate >= startOfYear &&
                   l.EndDate <= endOfYear)
            .OrderByDescending(l => l.StartDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Leave>> GetByStatusAsync(LeaveStatus status, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(l => l.Employee)
            .Include(l => l.LeaveType)
            .Where(l => !l.IsDeleted && l.Status == status)
            .OrderByDescending(l => l.RequestDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Leave>> GetPendingForApprovalAsync(int? approverId = null, CancellationToken cancellationToken = default)
    {
        var query = DbSet
            .Include(l => l.Employee)
            .Include(l => l.LeaveType)
            .Where(l => !l.IsDeleted && l.Status == LeaveStatus.Pending);

        if (approverId.HasValue)
        {
            // Filter by approver - typically the employee's manager
            query = query.Where(l => l.Employee.ManagerId == approverId.Value);
        }

        return await query
            .OrderBy(l => l.RequestDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Leave>> GetByDateRangeAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(l => l.Employee)
            .Include(l => l.LeaveType)
            .Where(l => !l.IsDeleted &&
                   ((l.StartDate >= startDate && l.StartDate <= endDate) ||
                    (l.EndDate >= startDate && l.EndDate <= endDate) ||
                    (l.StartDate <= startDate && l.EndDate >= endDate)))
            .OrderBy(l => l.StartDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Leave>> GetByDepartmentAndDateRangeAsync(int departmentId, DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(l => l.Employee)
            .Include(l => l.LeaveType)
            .Where(l => !l.IsDeleted &&
                   l.Employee.DepartmentId == departmentId &&
                   ((l.StartDate >= startDate && l.StartDate <= endDate) ||
                    (l.EndDate >= startDate && l.EndDate <= endDate) ||
                    (l.StartDate <= startDate && l.EndDate >= endDate)))
            .OrderBy(l => l.StartDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Leave>> GetActiveTodayAsync(CancellationToken cancellationToken = default)
    {
        var today = DateTime.UtcNow.Date;
        return await DbSet
            .Include(l => l.Employee)
            .Include(l => l.LeaveType)
            .Where(l => !l.IsDeleted &&
                   l.Status == LeaveStatus.Approved &&
                   l.StartDate <= today &&
                   l.EndDate >= today)
            .OrderBy(l => l.Employee.LastName)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Leave>> GetUpcomingAsync(int days = 30, CancellationToken cancellationToken = default)
    {
        var today = DateTime.UtcNow.Date;
        var endDate = today.AddDays(days);

        return await DbSet
            .Include(l => l.Employee)
            .Include(l => l.LeaveType)
            .Where(l => !l.IsDeleted &&
                   l.Status == LeaveStatus.Approved &&
                   l.StartDate >= today &&
                   l.StartDate <= endDate)
            .OrderBy(l => l.StartDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> HasOverlappingLeaveAsync(int employeeId, DateTime startDate, DateTime endDate, int? excludeLeaveId = null, CancellationToken cancellationToken = default)
    {
        var query = DbSet.Where(l => !l.IsDeleted &&
                                l.EmployeeId == employeeId &&
                                l.Status != LeaveStatus.Rejected &&
                                l.Status != LeaveStatus.Cancelled &&
                                ((l.StartDate <= endDate && l.EndDate >= startDate)));

        if (excludeLeaveId.HasValue)
        {
            query = query.Where(l => l.Id != excludeLeaveId.Value);
        }

        return await query.AnyAsync(cancellationToken);
    }

    public async Task<decimal> GetUsedDaysAsync(int employeeId, int leaveTypeId, int year, CancellationToken cancellationToken = default)
    {
        var startOfYear = new DateTime(year, 1, 1);
        var endOfYear = new DateTime(year, 12, 31);

        var leaves = await DbSet
            .Where(l => !l.IsDeleted &&
                   l.EmployeeId == employeeId &&
                   l.LeaveTypeId == leaveTypeId &&
                   (l.Status == LeaveStatus.Approved || l.Status == LeaveStatus.Taken) &&
                   l.StartDate >= startOfYear &&
                   l.StartDate <= endOfYear)
            .ToListAsync(cancellationToken);

        return leaves.Sum(l => l.TotalDays);
    }
}
