namespace Stocker.Application.Common.Interfaces;

/// <summary>
/// Interface for scheduling migration background jobs
/// </summary>
public interface IMigrationJobScheduler
{
    /// <summary>
    /// Enqueues a validation job for the specified migration session
    /// </summary>
    /// <param name="tenantId">The tenant ID</param>
    /// <param name="sessionId">The migration session ID</param>
    void EnqueueValidationJob(Guid tenantId, Guid sessionId);

    /// <summary>
    /// Enqueues an import job for the specified migration session
    /// </summary>
    /// <param name="tenantId">The tenant ID</param>
    /// <param name="sessionId">The migration session ID</param>
    /// <returns>The job ID</returns>
    string EnqueueImportJob(Guid tenantId, Guid sessionId);
}
