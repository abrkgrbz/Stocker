using Microsoft.EntityFrameworkCore;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.Modules.HR.Infrastructure.Persistence;

namespace Stocker.Modules.HR.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for TimeSheet entity
/// </summary>
public class TimeSheetRepository : BaseRepository<TimeSheet>, ITimeSheetRepository
{
    public TimeSheetRepository(HRDbContext context) : base(context)
    {
    }

    public override async System.Threading.Tasks.Task<TimeSheet?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(t => t.Employee)
            .Include(t => t.ApprovedBy)
            .Include(t => t.Entries)
            .Where(t => !t.IsDeleted && t.Id == id)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<IReadOnlyList<TimeSheet>> GetAllAsync(
        int? employeeId = null,
        TimeSheetStatus? status = null,
        DateOnly? periodStartFrom = null,
        DateOnly? periodStartTo = null,
        bool? isLocked = null,
        int? skip = null,
        int? take = null,
        CancellationToken cancellationToken = default)
    {
        var query = DbSet
            .Include(t => t.Employee)
            .Include(t => t.ApprovedBy)
            .Where(t => !t.IsDeleted);

        if (employeeId.HasValue)
            query = query.Where(t => t.EmployeeId == employeeId.Value);

        if (status.HasValue)
            query = query.Where(t => t.Status == status.Value);

        if (periodStartFrom.HasValue)
            query = query.Where(t => t.PeriodStart >= periodStartFrom.Value);

        if (periodStartTo.HasValue)
            query = query.Where(t => t.PeriodStart <= periodStartTo.Value);

        if (isLocked.HasValue)
            query = query.Where(t => t.IsLocked == isLocked.Value);

        query = query.OrderByDescending(t => t.PeriodStart);

        if (skip.HasValue)
            query = query.Skip(skip.Value);

        if (take.HasValue)
            query = query.Take(take.Value);

        return await query.ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<IReadOnlyList<TimeSheet>> GetByEmployeeAsync(int employeeId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(t => t.Employee)
            .Include(t => t.ApprovedBy)
            .Include(t => t.Entries)
            .Where(t => !t.IsDeleted && t.EmployeeId == employeeId)
            .OrderByDescending(t => t.PeriodStart)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<IReadOnlyList<TimeSheet>> GetByStatusAsync(TimeSheetStatus status, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(t => t.Employee)
            .Include(t => t.ApprovedBy)
            .Where(t => !t.IsDeleted && t.Status == status)
            .OrderByDescending(t => t.PeriodStart)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<IReadOnlyList<TimeSheet>> GetByPeriodAsync(DateOnly periodStart, DateOnly periodEnd, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(t => t.Employee)
            .Include(t => t.ApprovedBy)
            .Where(t => !t.IsDeleted && t.PeriodStart >= periodStart && t.PeriodEnd <= periodEnd)
            .OrderByDescending(t => t.PeriodStart)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<TimeSheet?> GetByEmployeeAndPeriodAsync(int employeeId, DateOnly periodStart, DateOnly periodEnd, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(t => t.Employee)
            .Include(t => t.ApprovedBy)
            .Where(t => !t.IsDeleted && t.EmployeeId == employeeId && t.PeriodStart == periodStart && t.PeriodEnd == periodEnd)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<IReadOnlyList<TimeSheet>> GetPendingApprovalsAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(t => t.Employee)
            .Where(t => !t.IsDeleted && t.Status == TimeSheetStatus.Submitted)
            .OrderBy(t => t.SubmittedDate)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<IReadOnlyList<TimeSheet>> GetLockedAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(t => t.Employee)
            .Include(t => t.ApprovedBy)
            .Where(t => !t.IsDeleted && t.IsLocked)
            .OrderByDescending(t => t.PeriodStart)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<TimeSheet> CreateAsync(TimeSheet timeSheet, CancellationToken cancellationToken = default)
    {
        await DbSet.AddAsync(timeSheet, cancellationToken);
        await Context.SaveChangesAsync(cancellationToken);
        return timeSheet;
    }

    public async System.Threading.Tasks.Task<TimeSheet> UpdateAsync(TimeSheet timeSheet, CancellationToken cancellationToken = default)
    {
        DbSet.Update(timeSheet);
        await Context.SaveChangesAsync(cancellationToken);
        return timeSheet;
    }

    public async System.Threading.Tasks.Task DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var timeSheet = await GetByIdAsync(id, cancellationToken);
        if (timeSheet != null)
        {
            timeSheet.Delete(string.Empty);
            await Context.SaveChangesAsync(cancellationToken);
        }
    }
}
