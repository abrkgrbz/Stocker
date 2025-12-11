using Microsoft.EntityFrameworkCore;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.Modules.HR.Infrastructure.Persistence;

namespace Stocker.Modules.HR.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for Overtime entity
/// </summary>
public class OvertimeRepository : BaseRepository<Overtime>, IOvertimeRepository
{
    public OvertimeRepository(HRDbContext context) : base(context)
    {
    }

    public override async System.Threading.Tasks.Task<Overtime?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(o => o.Employee)
            .Include(o => o.ApprovedBy)
            .Include(o => o.Payroll)
            .Where(o => !o.IsDeleted && o.Id == id)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<IReadOnlyList<Overtime>> GetAllAsync(
        int? employeeId = null,
        OvertimeStatus? status = null,
        DateOnly? dateFrom = null,
        DateOnly? dateTo = null,
        OvertimeType? overtimeType = null,
        bool? isPaid = null,
        int? skip = null,
        int? take = null,
        CancellationToken cancellationToken = default)
    {
        var query = DbSet
            .Include(o => o.Employee)
            .Include(o => o.ApprovedBy)
            .Where(o => !o.IsDeleted);

        if (employeeId.HasValue)
            query = query.Where(o => o.EmployeeId == employeeId.Value);

        if (status.HasValue)
            query = query.Where(o => o.Status == status.Value);

        if (dateFrom.HasValue)
            query = query.Where(o => o.Date >= dateFrom.Value);

        if (dateTo.HasValue)
            query = query.Where(o => o.Date <= dateTo.Value);

        if (overtimeType.HasValue)
            query = query.Where(o => o.OvertimeType == overtimeType.Value);

        if (isPaid.HasValue)
            query = query.Where(o => o.IsPaid == isPaid.Value);

        query = query.OrderByDescending(o => o.Date).ThenByDescending(o => o.StartTime);

        if (skip.HasValue)
            query = query.Skip(skip.Value);

        if (take.HasValue)
            query = query.Take(take.Value);

        return await query.ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<IReadOnlyList<Overtime>> GetByEmployeeAsync(int employeeId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(o => o.Employee)
            .Include(o => o.ApprovedBy)
            .Where(o => !o.IsDeleted && o.EmployeeId == employeeId)
            .OrderByDescending(o => o.Date)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<IReadOnlyList<Overtime>> GetByStatusAsync(OvertimeStatus status, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(o => o.Employee)
            .Include(o => o.ApprovedBy)
            .Where(o => !o.IsDeleted && o.Status == status)
            .OrderByDescending(o => o.Date)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<IReadOnlyList<Overtime>> GetByDateRangeAsync(DateOnly startDate, DateOnly endDate, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(o => o.Employee)
            .Include(o => o.ApprovedBy)
            .Where(o => !o.IsDeleted && o.Date >= startDate && o.Date <= endDate)
            .OrderByDescending(o => o.Date)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<IReadOnlyList<Overtime>> GetPendingApprovalsAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(o => o.Employee)
            .Where(o => !o.IsDeleted && o.Status == OvertimeStatus.Pending)
            .OrderBy(o => o.RequestDate)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<IReadOnlyList<Overtime>> GetUnpaidAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(o => o.Employee)
            .Include(o => o.ApprovedBy)
            .Where(o => !o.IsDeleted && o.Status == OvertimeStatus.Approved && !o.IsPaid)
            .OrderByDescending(o => o.Date)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<Overtime> CreateAsync(Overtime overtime, CancellationToken cancellationToken = default)
    {
        await DbSet.AddAsync(overtime, cancellationToken);
        await Context.SaveChangesAsync(cancellationToken);
        return overtime;
    }

    public async System.Threading.Tasks.Task<Overtime> UpdateAsync(Overtime overtime, CancellationToken cancellationToken = default)
    {
        DbSet.Update(overtime);
        await Context.SaveChangesAsync(cancellationToken);
        return overtime;
    }

    public async System.Threading.Tasks.Task DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var overtime = await GetByIdAsync(id, cancellationToken);
        if (overtime != null)
        {
            overtime.Delete(string.Empty);
            await Context.SaveChangesAsync(cancellationToken);
        }
    }
}
