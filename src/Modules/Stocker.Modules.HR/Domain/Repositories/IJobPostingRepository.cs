using Stocker.Modules.HR.Domain.Entities;

namespace Stocker.Modules.HR.Domain.Repositories;

/// <summary>
/// Repository interface for JobPosting entity
/// </summary>
public interface IJobPostingRepository : IHRRepository<JobPosting>
{
    /// <summary>
    /// Gets a job posting by code
    /// </summary>
    System.Threading.Tasks.Task<JobPosting?> GetByCodeAsync(string postingCode, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets job postings by status
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<JobPosting>> GetByStatusAsync(JobPostingStatus status, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets job postings by department
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<JobPosting>> GetByDepartmentAsync(int departmentId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets job postings by position
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<JobPosting>> GetByPositionAsync(int positionId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets job postings by hiring manager
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<JobPosting>> GetByHiringManagerAsync(int hiringManagerId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets job postings by employment type
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<JobPosting>> GetByEmploymentTypeAsync(JobEmploymentType employmentType, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets job postings by experience level
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<JobPosting>> GetByExperienceLevelAsync(ExperienceLevel experienceLevel, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets job postings by remote work type
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<JobPosting>> GetByRemoteWorkTypeAsync(RemoteWorkType remoteWorkType, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets open job postings
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<JobPosting>> GetOpenPostingsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets active job postings (open and not expired)
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<JobPosting>> GetActivePostingsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets internal job postings
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<JobPosting>> GetInternalPostingsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets featured job postings
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<JobPosting>> GetFeaturedPostingsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets urgent job postings
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<JobPosting>> GetUrgentPostingsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets job postings with applications
    /// </summary>
    System.Threading.Tasks.Task<JobPosting?> GetWithApplicationsAsync(int postingId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets expired job postings
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<JobPosting>> GetExpiredPostingsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Searches job postings by title or description
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<JobPosting>> SearchAsync(string searchTerm, CancellationToken cancellationToken = default);
}
