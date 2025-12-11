using Microsoft.EntityFrameworkCore;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.Modules.HR.Infrastructure.Persistence;

namespace Stocker.Modules.HR.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for JobPosting entity
/// </summary>
public class JobPostingRepository : BaseRepository<JobPosting>, IJobPostingRepository
{
    public JobPostingRepository(HRDbContext context) : base(context)
    {
    }

    public async System.Threading.Tasks.Task<JobPosting?> GetByCodeAsync(string postingCode, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(jp => jp.Department)
            .Include(jp => jp.Position)
            .Include(jp => jp.HiringManager)
            .Include(jp => jp.WorkLocation)
            .Where(jp => !jp.IsDeleted && jp.PostingCode == postingCode)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<IReadOnlyList<JobPosting>> GetByStatusAsync(JobPostingStatus status, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(jp => jp.Department)
            .Include(jp => jp.Position)
            .Include(jp => jp.HiringManager)
            .Where(jp => !jp.IsDeleted && jp.Status == status)
            .OrderByDescending(jp => jp.PostedDate)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<IReadOnlyList<JobPosting>> GetByDepartmentAsync(int departmentId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(jp => jp.Department)
            .Include(jp => jp.Position)
            .Include(jp => jp.HiringManager)
            .Where(jp => !jp.IsDeleted && jp.DepartmentId == departmentId)
            .OrderByDescending(jp => jp.PostedDate)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<IReadOnlyList<JobPosting>> GetByPositionAsync(int positionId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(jp => jp.Department)
            .Include(jp => jp.Position)
            .Include(jp => jp.HiringManager)
            .Where(jp => !jp.IsDeleted && jp.PositionId == positionId)
            .OrderByDescending(jp => jp.PostedDate)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<IReadOnlyList<JobPosting>> GetByHiringManagerAsync(int hiringManagerId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(jp => jp.Department)
            .Include(jp => jp.Position)
            .Include(jp => jp.HiringManager)
            .Where(jp => !jp.IsDeleted && jp.HiringManagerId == hiringManagerId)
            .OrderByDescending(jp => jp.PostedDate)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<IReadOnlyList<JobPosting>> GetByEmploymentTypeAsync(JobEmploymentType employmentType, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(jp => jp.Department)
            .Include(jp => jp.Position)
            .Where(jp => !jp.IsDeleted && jp.EmploymentType == employmentType)
            .OrderByDescending(jp => jp.PostedDate)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<IReadOnlyList<JobPosting>> GetByExperienceLevelAsync(ExperienceLevel experienceLevel, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(jp => jp.Department)
            .Include(jp => jp.Position)
            .Where(jp => !jp.IsDeleted && jp.ExperienceLevel == experienceLevel)
            .OrderByDescending(jp => jp.PostedDate)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<IReadOnlyList<JobPosting>> GetByRemoteWorkTypeAsync(RemoteWorkType remoteWorkType, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(jp => jp.Department)
            .Include(jp => jp.Position)
            .Where(jp => !jp.IsDeleted && jp.RemoteWorkType == remoteWorkType)
            .OrderByDescending(jp => jp.PostedDate)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<IReadOnlyList<JobPosting>> GetOpenPostingsAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(jp => jp.Department)
            .Include(jp => jp.Position)
            .Include(jp => jp.HiringManager)
            .Where(jp => !jp.IsDeleted && jp.Status == JobPostingStatus.Open)
            .OrderByDescending(jp => jp.PostedDate)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<IReadOnlyList<JobPosting>> GetActivePostingsAsync(CancellationToken cancellationToken = default)
    {
        var today = DateTime.UtcNow;

        return await DbSet
            .Include(jp => jp.Department)
            .Include(jp => jp.Position)
            .Include(jp => jp.HiringManager)
            .Where(jp => !jp.IsDeleted &&
                   jp.Status == JobPostingStatus.Open &&
                   (!jp.ApplicationDeadline.HasValue || jp.ApplicationDeadline.Value >= today))
            .OrderByDescending(jp => jp.PostedDate)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<IReadOnlyList<JobPosting>> GetInternalPostingsAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(jp => jp.Department)
            .Include(jp => jp.Position)
            .Where(jp => !jp.IsDeleted && jp.IsInternal)
            .OrderByDescending(jp => jp.PostedDate)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<IReadOnlyList<JobPosting>> GetFeaturedPostingsAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(jp => jp.Department)
            .Include(jp => jp.Position)
            .Where(jp => !jp.IsDeleted && jp.IsFeatured && jp.Status == JobPostingStatus.Open)
            .OrderByDescending(jp => jp.PostedDate)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<IReadOnlyList<JobPosting>> GetUrgentPostingsAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(jp => jp.Department)
            .Include(jp => jp.Position)
            .Where(jp => !jp.IsDeleted && jp.IsUrgent && jp.Status == JobPostingStatus.Open)
            .OrderByDescending(jp => jp.PostedDate)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<JobPosting?> GetWithApplicationsAsync(int postingId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(jp => jp.Department)
            .Include(jp => jp.Position)
            .Include(jp => jp.HiringManager)
            .Include(jp => jp.Applications)
            .Where(jp => !jp.IsDeleted && jp.Id == postingId)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<IReadOnlyList<JobPosting>> GetExpiredPostingsAsync(CancellationToken cancellationToken = default)
    {
        var today = DateTime.UtcNow;

        return await DbSet
            .Include(jp => jp.Department)
            .Include(jp => jp.Position)
            .Where(jp => !jp.IsDeleted &&
                   jp.ApplicationDeadline.HasValue &&
                   jp.ApplicationDeadline.Value < today &&
                   jp.Status == JobPostingStatus.Open)
            .OrderBy(jp => jp.ApplicationDeadline)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<IReadOnlyList<JobPosting>> SearchAsync(string searchTerm, CancellationToken cancellationToken = default)
    {
        var term = searchTerm.ToLower();
        return await DbSet
            .Include(jp => jp.Department)
            .Include(jp => jp.Position)
            .Include(jp => jp.HiringManager)
            .Where(jp => !jp.IsDeleted &&
                (jp.Title.ToLower().Contains(term) ||
                 jp.PostingCode.ToLower().Contains(term) ||
                 jp.Description.ToLower().Contains(term)))
            .OrderByDescending(jp => jp.PostedDate)
            .ToListAsync(cancellationToken);
    }
}
