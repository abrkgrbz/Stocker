using Microsoft.EntityFrameworkCore;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Domain.Enums;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.Modules.HR.Infrastructure.Persistence;

namespace Stocker.Modules.HR.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for Attendance entity
/// </summary>
public class AttendanceRepository : BaseRepository<Attendance>, IAttendanceRepository
{
    public AttendanceRepository(HRDbContext context) : base(context)
    {
    }

    public async Task<Attendance?> GetByEmployeeAndDateAsync(int employeeId, DateTime date, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(a => !a.IsDeleted &&
                   a.EmployeeId == employeeId &&
                   a.Date.Date == date.Date)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Attendance>> GetByEmployeeAndDateRangeAsync(int employeeId, DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(a => !a.IsDeleted &&
                   a.EmployeeId == employeeId &&
                   a.Date >= startDate &&
                   a.Date <= endDate)
            .OrderBy(a => a.Date)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Attendance>> GetByDateAsync(DateTime date, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(a => a.Employee)
            .Where(a => !a.IsDeleted && a.Date.Date == date.Date)
            .OrderBy(a => a.Employee.LastName)
            .ThenBy(a => a.Employee.FirstName)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Attendance>> GetByStatusAsync(AttendanceStatus status, DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(a => a.Employee)
            .Where(a => !a.IsDeleted &&
                   a.Status == status &&
                   a.Date >= startDate &&
                   a.Date <= endDate)
            .OrderBy(a => a.Date)
            .ThenBy(a => a.Employee.LastName)
            .ThenBy(a => a.Employee.FirstName)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Attendance>> GetLateArrivalsAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(a => a.Employee)
            .Where(a => !a.IsDeleted &&
                   a.Date >= startDate &&
                   a.Date <= endDate &&
                   a.LateMinutes.HasValue &&
                   a.LateMinutes.Value > TimeSpan.Zero)
            .OrderBy(a => a.Date)
            .ThenBy(a => a.Employee.LastName)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Attendance>> GetEarlyDeparturesAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(a => a.Employee)
            .Where(a => !a.IsDeleted &&
                   a.Date >= startDate &&
                   a.Date <= endDate &&
                   a.EarlyDepartureMinutes.HasValue &&
                   a.EarlyDepartureMinutes.Value > TimeSpan.Zero)
            .OrderBy(a => a.Date)
            .ThenBy(a => a.Employee.LastName)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Attendance>> GetWithOvertimeAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(a => a.Employee)
            .Where(a => !a.IsDeleted &&
                   a.Date >= startDate &&
                   a.Date <= endDate &&
                   a.OvertimeHours.HasValue &&
                   a.OvertimeHours.Value > TimeSpan.Zero)
            .OrderBy(a => a.Date)
            .ThenBy(a => a.Employee.LastName)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Attendance>> GetByDepartmentAndDateAsync(int departmentId, DateTime date, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(a => a.Employee)
            .Where(a => !a.IsDeleted &&
                   a.Date.Date == date.Date &&
                   a.Employee.DepartmentId == departmentId)
            .OrderBy(a => a.Employee.LastName)
            .ThenBy(a => a.Employee.FirstName)
            .ToListAsync(cancellationToken);
    }

    public async Task<Attendance?> GetTodayAttendanceAsync(int employeeId, CancellationToken cancellationToken = default)
    {
        var today = DateTime.UtcNow.Date;
        return await DbSet
            .Where(a => !a.IsDeleted &&
                   a.EmployeeId == employeeId &&
                   a.Date.Date == today)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<(int Present, int Absent, int Late, int OnLeave, decimal TotalWorkedHours, decimal TotalOvertimeHours)> GetMonthlySummaryAsync(int employeeId, int year, int month, CancellationToken cancellationToken = default)
    {
        var startDate = new DateTime(year, month, 1);
        var endDate = startDate.AddMonths(1).AddDays(-1);

        var attendances = await DbSet
            .Where(a => !a.IsDeleted &&
                   a.EmployeeId == employeeId &&
                   a.Date >= startDate &&
                   a.Date <= endDate)
            .ToListAsync(cancellationToken);

        var present = attendances.Count(a => a.Status == AttendanceStatus.Present);
        var absent = attendances.Count(a => a.Status == AttendanceStatus.Absent);
        var late = attendances.Count(a => a.LateMinutes.HasValue && a.LateMinutes.Value > TimeSpan.Zero);
        var onLeave = attendances.Count(a => a.Status == AttendanceStatus.OnLeave);

        var totalWorkedHours = attendances
            .Where(a => a.WorkHours.HasValue)
            .Sum(a => (decimal)a.WorkHours!.Value.TotalHours);

        var totalOvertimeHours = attendances
            .Where(a => a.OvertimeHours.HasValue)
            .Sum(a => (decimal)a.OvertimeHours!.Value.TotalHours);

        return (present, absent, late, onLeave, totalWorkedHours, totalOvertimeHours);
    }
}
