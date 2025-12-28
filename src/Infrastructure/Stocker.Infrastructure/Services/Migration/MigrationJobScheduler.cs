using Hangfire;
using Stocker.Application.Common.Interfaces;
using Stocker.Infrastructure.BackgroundJobs.Jobs;

namespace Stocker.Infrastructure.Services.Migration;

/// <summary>
/// Hangfire implementation of IMigrationJobScheduler
/// </summary>
public class MigrationJobScheduler : IMigrationJobScheduler
{
    /// <summary>
    /// Enqueues a validation job for the given session
    /// </summary>
    public void EnqueueValidationJob(Guid sessionId)
    {
        BackgroundJob.Enqueue<MigrationValidationJob>(job => job.ExecuteAsync(sessionId, CancellationToken.None));
    }

    /// <summary>
    /// Enqueues an import job for the given session
    /// </summary>
    public string EnqueueImportJob(Guid sessionId)
    {
        return BackgroundJob.Enqueue<MigrationImportJob>(job => job.ExecuteAsync(sessionId, CancellationToken.None));
    }
}
