using Stocker.Modules.HR.Domain.Entities;

namespace Stocker.Modules.HR.Domain.Repositories;

/// <summary>
/// Repository interface for Interview entity
/// </summary>
public interface IInterviewRepository : IHRRepository<Interview>
{
    /// <summary>
    /// Gets interviews for a specific job application
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<Interview>> GetByJobApplicationIdAsync(int jobApplicationId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets interviews by interviewer
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<Interview>> GetByInterviewerAsync(int interviewerId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets interviews by status
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<Interview>> GetByStatusAsync(InterviewStatus status, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets interviews by type
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<Interview>> GetByTypeAsync(InterviewType interviewType, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets scheduled interviews in date range
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<Interview>> GetScheduledInRangeAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets upcoming interviews for an interviewer
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<Interview>> GetUpcomingForInterviewerAsync(int interviewerId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets today's interviews
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<Interview>> GetTodaysInterviewsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets interviews pending evaluation
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<Interview>> GetPendingEvaluationAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets interviews by recommendation
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<Interview>> GetByRecommendationAsync(InterviewRecommendation recommendation, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets interviews with feedback
    /// </summary>
    System.Threading.Tasks.Task<Interview?> GetWithFeedbackAsync(int interviewId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets interviews by format
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<Interview>> GetByFormatAsync(InterviewFormat format, CancellationToken cancellationToken = default);
}
