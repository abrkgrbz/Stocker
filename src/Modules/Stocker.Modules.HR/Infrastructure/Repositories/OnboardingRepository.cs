using Microsoft.EntityFrameworkCore;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.Modules.HR.Infrastructure.Persistence;

namespace Stocker.Modules.HR.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for Onboarding entity
/// </summary>
public class OnboardingRepository : BaseRepository<Onboarding>, IOnboardingRepository
{
    public OnboardingRepository(HRDbContext context) : base(context)
    {
    }

    public override async System.Threading.Tasks.Task<Onboarding?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(o => o.Employee)
            .Include(o => o.Buddy)
            .Include(o => o.HrResponsible)
            .Include(o => o.Template)
            .Include(o => o.Tasks)
            .Where(o => !o.IsDeleted && o.Id == id)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<IReadOnlyList<Onboarding>> GetAllAsync(
        int? employeeId = null,
        OnboardingStatus? status = null,
        DateTime? startDateFrom = null,
        DateTime? startDateTo = null,
        int? skip = null,
        int? take = null,
        CancellationToken cancellationToken = default)
    {
        var query = DbSet
            .Include(o => o.Employee)
            .Include(o => o.Buddy)
            .Include(o => o.HrResponsible)
            .Where(o => !o.IsDeleted);

        if (employeeId.HasValue)
            query = query.Where(o => o.EmployeeId == employeeId.Value);

        if (status.HasValue)
            query = query.Where(o => o.Status == status.Value);

        if (startDateFrom.HasValue)
            query = query.Where(o => o.StartDate >= startDateFrom.Value);

        if (startDateTo.HasValue)
            query = query.Where(o => o.StartDate <= startDateTo.Value);

        query = query.OrderByDescending(o => o.StartDate);

        if (skip.HasValue)
            query = query.Skip(skip.Value);

        if (take.HasValue)
            query = query.Take(take.Value);

        return await query.ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<IReadOnlyList<Onboarding>> GetByEmployeeAsync(int employeeId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(o => o.Employee)
            .Include(o => o.Buddy)
            .Include(o => o.HrResponsible)
            .Where(o => !o.IsDeleted && o.EmployeeId == employeeId)
            .OrderByDescending(o => o.StartDate)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<IReadOnlyList<Onboarding>> GetByStatusAsync(OnboardingStatus status, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(o => o.Employee)
            .Include(o => o.Buddy)
            .Include(o => o.HrResponsible)
            .Where(o => !o.IsDeleted && o.Status == status)
            .OrderByDescending(o => o.StartDate)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<IReadOnlyList<Onboarding>> GetByBuddyAsync(int buddyId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(o => o.Employee)
            .Include(o => o.Buddy)
            .Include(o => o.HrResponsible)
            .Where(o => !o.IsDeleted && o.BuddyId == buddyId)
            .OrderByDescending(o => o.StartDate)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<IReadOnlyList<Onboarding>> GetByHrResponsibleAsync(int hrResponsibleId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(o => o.Employee)
            .Include(o => o.Buddy)
            .Include(o => o.HrResponsible)
            .Where(o => !o.IsDeleted && o.HrResponsibleId == hrResponsibleId)
            .OrderByDescending(o => o.StartDate)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<Onboarding> CreateAsync(Onboarding onboarding, CancellationToken cancellationToken = default)
    {
        await DbSet.AddAsync(onboarding, cancellationToken);
        await Context.SaveChangesAsync(cancellationToken);
        return onboarding;
    }

    public async System.Threading.Tasks.Task<Onboarding> UpdateAsync(Onboarding onboarding, CancellationToken cancellationToken = default)
    {
        DbSet.Update(onboarding);
        await Context.SaveChangesAsync(cancellationToken);
        return onboarding;
    }

    public async System.Threading.Tasks.Task DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var onboarding = await GetByIdAsync(id, cancellationToken);
        if (onboarding != null)
        {
            onboarding.Delete(string.Empty);
            await Context.SaveChangesAsync(cancellationToken);
        }
    }
}
