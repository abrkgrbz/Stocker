using Microsoft.EntityFrameworkCore;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.Modules.HR.Infrastructure.Persistence;

namespace Stocker.Modules.HR.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for JobApplication entity
/// </summary>
public class JobApplicationRepository : BaseRepository<JobApplication>, IJobApplicationRepository
{
    public JobApplicationRepository(HRDbContext context) : base(context)
    {
    }

    public async System.Threading.Tasks.Task<JobApplication?> GetByCodeAsync(string applicationCode, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(ja => ja.JobPosting)
            .Include(ja => ja.ReferredByEmployee)
            .Include(ja => ja.CreatedEmployee)
            .Where(ja => !ja.IsDeleted && ja.ApplicationCode == applicationCode)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<IReadOnlyList<JobApplication>> GetByJobPostingIdAsync(int jobPostingId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(ja => ja.JobPosting)
            .Include(ja => ja.ReferredByEmployee)
            .Where(ja => !ja.IsDeleted && ja.JobPostingId == jobPostingId)
            .OrderByDescending(ja => ja.ApplicationDate)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<IReadOnlyList<JobApplication>> GetByStatusAsync(ApplicationStatus status, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(ja => ja.JobPosting)
            .Include(ja => ja.ReferredByEmployee)
            .Where(ja => !ja.IsDeleted && ja.Status == status)
            .OrderByDescending(ja => ja.ApplicationDate)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<IReadOnlyList<JobApplication>> GetByStageAsync(ApplicationStage stage, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(ja => ja.JobPosting)
            .Include(ja => ja.ReferredByEmployee)
            .Where(ja => !ja.IsDeleted && ja.CurrentStage == stage)
            .OrderByDescending(ja => ja.LastStageChangeDate)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<IReadOnlyList<JobApplication>> GetBySourceAsync(ApplicationSource source, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(ja => ja.JobPosting)
            .Include(ja => ja.ReferredByEmployee)
            .Where(ja => !ja.IsDeleted && ja.Source == source)
            .OrderByDescending(ja => ja.ApplicationDate)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<JobApplication?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(ja => ja.JobPosting)
            .Include(ja => ja.ReferredByEmployee)
            .Where(ja => !ja.IsDeleted && ja.Email == email)
            .OrderByDescending(ja => ja.ApplicationDate)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<IReadOnlyList<JobApplication>> GetReferredByEmployeeAsync(int employeeId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(ja => ja.JobPosting)
            .Include(ja => ja.ReferredByEmployee)
            .Where(ja => !ja.IsDeleted && ja.ReferredByEmployeeId == employeeId)
            .OrderByDescending(ja => ja.ApplicationDate)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<IReadOnlyList<JobApplication>> GetShortlistedAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(ja => ja.JobPosting)
            .Include(ja => ja.ReferredByEmployee)
            .Where(ja => !ja.IsDeleted && ja.Status == ApplicationStatus.Shortlisted)
            .OrderByDescending(ja => ja.LastStageChangeDate)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<IReadOnlyList<JobApplication>> GetWithOffersAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(ja => ja.JobPosting)
            .Include(ja => ja.ReferredByEmployee)
            .Where(ja => !ja.IsDeleted && ja.OfferExtended)
            .OrderByDescending(ja => ja.OfferDate)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<IReadOnlyList<JobApplication>> GetHiredAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(ja => ja.JobPosting)
            .Include(ja => ja.ReferredByEmployee)
            .Include(ja => ja.CreatedEmployee)
            .Where(ja => !ja.IsDeleted && ja.Status == ApplicationStatus.Hired)
            .OrderByDescending(ja => ja.HireDate)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<IReadOnlyList<JobApplication>> GetInTalentPoolAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(ja => ja.JobPosting)
            .Include(ja => ja.ReferredByEmployee)
            .Where(ja => !ja.IsDeleted && ja.InTalentPool)
            .OrderByDescending(ja => ja.ApplicationDate)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<IReadOnlyList<JobApplication>> GetSubmittedInRangeAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(ja => ja.JobPosting)
            .Include(ja => ja.ReferredByEmployee)
            .Where(ja => !ja.IsDeleted && ja.ApplicationDate >= startDate && ja.ApplicationDate <= endDate)
            .OrderByDescending(ja => ja.ApplicationDate)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<JobApplication?> GetWithInterviewsAsync(int applicationId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(ja => ja.JobPosting)
            .Include(ja => ja.ReferredByEmployee)
            .Include(ja => ja.Interviews)
                .ThenInclude(i => i.Interviewer)
            .Where(ja => !ja.IsDeleted && ja.Id == applicationId)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<IReadOnlyList<JobApplication>> SearchAsync(string searchTerm, CancellationToken cancellationToken = default)
    {
        var term = searchTerm.ToLower();
        return await DbSet
            .Include(ja => ja.JobPosting)
            .Include(ja => ja.ReferredByEmployee)
            .Where(ja => !ja.IsDeleted &&
                (ja.FirstName.ToLower().Contains(term) ||
                 ja.LastName.ToLower().Contains(term) ||
                 ja.Email.ToLower().Contains(term) ||
                 ja.ApplicationCode.ToLower().Contains(term)))
            .OrderByDescending(ja => ja.ApplicationDate)
            .ToListAsync(cancellationToken);
    }
}
