using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Sales.Domain.Entities;
using Stocker.Modules.Sales.Domain.Repositories;

namespace Stocker.Modules.Sales.Infrastructure.Persistence.Repositories;

/// <summary>
/// Repository implementation for managing processed request records (idempotency).
/// </summary>
public class ProcessedRequestRepository : IProcessedRequestRepository
{
    private readonly SalesDbContext _context;

    public ProcessedRequestRepository(SalesDbContext context)
    {
        _context = context;
    }

    /// <inheritdoc />
    public async Task<bool> ExistsAsync(Guid requestId, CancellationToken cancellationToken = default)
    {
        return await _context.ProcessedRequests
            .AnyAsync(pr => pr.Id == requestId, cancellationToken);
    }

    /// <inheritdoc />
    public async Task AddAsync(ProcessedRequest processedRequest, CancellationToken cancellationToken = default)
    {
        await _context.ProcessedRequests.AddAsync(processedRequest, cancellationToken);
    }

    /// <inheritdoc />
    public async Task<int> CleanupAsync(DateTime olderThan, CancellationToken cancellationToken = default)
    {
        // Use ExecuteDeleteAsync for bulk delete without loading entities
        return await _context.ProcessedRequests
            .Where(pr => pr.ProcessedAt < olderThan)
            .ExecuteDeleteAsync(cancellationToken);
    }
}
