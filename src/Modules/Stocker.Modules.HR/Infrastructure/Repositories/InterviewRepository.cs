using Microsoft.EntityFrameworkCore;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.Modules.HR.Infrastructure.Persistence;

namespace Stocker.Modules.HR.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for Interview entity
/// </summary>
public class InterviewRepository : BaseRepository<Interview>, IInterviewRepository
{
    public InterviewRepository(HRDbContext context) : base(context)
    {
    }

    public async System.Threading.Tasks.Task<IReadOnlyList<Interview>> GetByJobApplicationIdAsync(int jobApplicationId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(i => i.JobApplication)
            .Include(i => i.Interviewer)
            .Where(i => !i.IsDeleted && i.JobApplicationId == jobApplicationId)
            .OrderBy(i => i.Round)
            .ThenBy(i => i.ScheduledDateTime)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<IReadOnlyList<Interview>> GetByInterviewerAsync(int interviewerId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(i => i.JobApplication)
            .Include(i => i.Interviewer)
            .Where(i => !i.IsDeleted && i.InterviewerId == interviewerId)
            .OrderByDescending(i => i.ScheduledDateTime)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<IReadOnlyList<Interview>> GetByStatusAsync(InterviewStatus status, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(i => i.JobApplication)
            .Include(i => i.Interviewer)
            .Where(i => !i.IsDeleted && i.Status == status)
            .OrderBy(i => i.ScheduledDateTime)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<IReadOnlyList<Interview>> GetByTypeAsync(InterviewType interviewType, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(i => i.JobApplication)
            .Include(i => i.Interviewer)
            .Where(i => !i.IsDeleted && i.InterviewType == interviewType)
            .OrderByDescending(i => i.ScheduledDateTime)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<IReadOnlyList<Interview>> GetScheduledInRangeAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(i => i.JobApplication)
            .Include(i => i.Interviewer)
            .Where(i => !i.IsDeleted && i.ScheduledDateTime >= startDate && i.ScheduledDateTime <= endDate)
            .OrderBy(i => i.ScheduledDateTime)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<IReadOnlyList<Interview>> GetUpcomingForInterviewerAsync(int interviewerId, CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;

        return await DbSet
            .Include(i => i.JobApplication)
            .Include(i => i.Interviewer)
            .Where(i => !i.IsDeleted &&
                   i.InterviewerId == interviewerId &&
                   i.ScheduledDateTime >= now &&
                   (i.Status == InterviewStatus.Scheduled || i.Status == InterviewStatus.Confirmed))
            .OrderBy(i => i.ScheduledDateTime)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<IReadOnlyList<Interview>> GetTodaysInterviewsAsync(CancellationToken cancellationToken = default)
    {
        var today = DateTime.UtcNow.Date;
        var tomorrow = today.AddDays(1);

        return await DbSet
            .Include(i => i.JobApplication)
            .Include(i => i.Interviewer)
            .Where(i => !i.IsDeleted &&
                   i.ScheduledDateTime >= today &&
                   i.ScheduledDateTime < tomorrow)
            .OrderBy(i => i.ScheduledDateTime)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<IReadOnlyList<Interview>> GetPendingEvaluationAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(i => i.JobApplication)
            .Include(i => i.Interviewer)
            .Where(i => !i.IsDeleted &&
                   i.Status == InterviewStatus.Completed &&
                   !i.OverallRating.HasValue)
            .OrderBy(i => i.ActualDateTime)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<IReadOnlyList<Interview>> GetByRecommendationAsync(InterviewRecommendation recommendation, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(i => i.JobApplication)
            .Include(i => i.Interviewer)
            .Where(i => !i.IsDeleted && i.Recommendation == recommendation)
            .OrderByDescending(i => i.ActualDateTime)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<Interview?> GetWithFeedbackAsync(int interviewId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(i => i.JobApplication)
            .Include(i => i.Interviewer)
            .Where(i => !i.IsDeleted && i.Id == interviewId)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<IReadOnlyList<Interview>> GetByFormatAsync(InterviewFormat format, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(i => i.JobApplication)
            .Include(i => i.Interviewer)
            .Where(i => !i.IsDeleted && i.Format == format)
            .OrderByDescending(i => i.ScheduledDateTime)
            .ToListAsync(cancellationToken);
    }
}
