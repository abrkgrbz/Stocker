using Stocker.Modules.Sales.Domain.Entities;

namespace Stocker.Modules.Sales.Domain.Repositories;

/// <summary>
/// Repository interface for managing processed request records (idempotency).
/// </summary>
public interface IProcessedRequestRepository
{
    /// <summary>
    /// Checks if a request with the given ID has already been processed.
    /// </summary>
    /// <param name="requestId">The request ID to check.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>True if the request has been processed, false otherwise.</returns>
    Task<bool> ExistsAsync(Guid requestId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Records a processed request.
    /// </summary>
    /// <param name="processedRequest">The processed request to record.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    Task AddAsync(ProcessedRequest processedRequest, CancellationToken cancellationToken = default);

    /// <summary>
    /// Cleans up old processed request records.
    /// This can be called periodically to prevent the table from growing indefinitely.
    /// </summary>
    /// <param name="olderThan">Remove records older than this date.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The number of records deleted.</returns>
    Task<int> CleanupAsync(DateTime olderThan, CancellationToken cancellationToken = default);
}
