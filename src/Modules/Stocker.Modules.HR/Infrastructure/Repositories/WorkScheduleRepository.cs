using Microsoft.EntityFrameworkCore;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.Modules.HR.Infrastructure.Persistence;

namespace Stocker.Modules.HR.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for WorkSchedule entity
/// </summary>
public class WorkScheduleRepository : BaseRepository<WorkSchedule>, IWorkScheduleRepository
{
    public WorkScheduleRepository(HRDbContext context) : base(context)
    {
    }

    public async Task<IReadOnlyList<WorkSchedule>> GetByEmployeeAsync(int employeeId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(ws => ws.Shift)
            .Where(ws => !ws.IsDeleted && ws.EmployeeId == employeeId)
            .OrderByDescending(ws => ws.Date)
            .ToListAsync(cancellationToken);
    }

    public async Task<WorkSchedule?> GetActiveByEmployeeAsync(int employeeId, CancellationToken cancellationToken = default)
    {
        var today = DateTime.UtcNow.Date;
        return await DbSet
            .Include(ws => ws.Shift)
            .Where(ws => !ws.IsDeleted &&
                   ws.EmployeeId == employeeId &&
                   ws.Date == today &&
                   ws.IsWorkDay)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<WorkSchedule>> GetByShiftAsync(int shiftId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(ws => ws.Employee)
            .Where(ws => !ws.IsDeleted && ws.ShiftId == shiftId)
            .OrderBy(ws => ws.Date)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<WorkSchedule>> GetByDateRangeAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(ws => ws.Employee)
            .Include(ws => ws.Shift)
            .Where(ws => !ws.IsDeleted &&
                   ws.Date >= startDate.Date &&
                   ws.Date <= endDate.Date)
            .OrderBy(ws => ws.Date)
            .ThenBy(ws => ws.Employee.LastName)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<WorkSchedule>> GetActiveForDateAsync(DateTime date, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(ws => ws.Employee)
            .Include(ws => ws.Shift)
            .Where(ws => !ws.IsDeleted &&
                   ws.Date == date.Date &&
                   ws.IsWorkDay)
            .OrderBy(ws => ws.Employee.LastName)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> HasOverlappingScheduleAsync(int employeeId, DateTime startDate, DateTime? endDate, int? excludeScheduleId = null, CancellationToken cancellationToken = default)
    {
        var effectiveEndDate = endDate ?? startDate;
        var query = DbSet.Where(ws => !ws.IsDeleted &&
                                ws.EmployeeId == employeeId &&
                                ws.Date >= startDate.Date &&
                                ws.Date <= effectiveEndDate.Date);

        if (excludeScheduleId.HasValue)
        {
            query = query.Where(ws => ws.Id != excludeScheduleId.Value);
        }

        return await query.AnyAsync(cancellationToken);
    }
}
