using Stocker.Modules.HR.Domain.Entities;

namespace Stocker.Modules.HR.Domain.Repositories;

/// <summary>
/// Repository interface for JobApplication entity
/// </summary>
public interface IJobApplicationRepository : IHRRepository<JobApplication>
{
    /// <summary>
    /// Gets a job application by code
    /// </summary>
    System.Threading.Tasks.Task<JobApplication?> GetByCodeAsync(string applicationCode, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets applications for a specific job posting
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<JobApplication>> GetByJobPostingIdAsync(int jobPostingId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets applications by status
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<JobApplication>> GetByStatusAsync(ApplicationStatus status, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets applications by stage
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<JobApplication>> GetByStageAsync(ApplicationStage stage, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets applications by source
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<JobApplication>> GetBySourceAsync(ApplicationSource source, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets applications by email
    /// </summary>
    System.Threading.Tasks.Task<JobApplication?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets applications referred by an employee
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<JobApplication>> GetReferredByEmployeeAsync(int employeeId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets shortlisted applications
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<JobApplication>> GetShortlistedAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets applications with extended offers
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<JobApplication>> GetWithOffersAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets hired applications
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<JobApplication>> GetHiredAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets applications in talent pool
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<JobApplication>> GetInTalentPoolAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets applications submitted in date range
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<JobApplication>> GetSubmittedInRangeAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets applications with interviews
    /// </summary>
    System.Threading.Tasks.Task<JobApplication?> GetWithInterviewsAsync(int applicationId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Searches applications by name or email
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<JobApplication>> SearchAsync(string searchTerm, CancellationToken cancellationToken = default);
}
