using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.Modules.Inventory.Infrastructure.Persistence;

namespace Stocker.Modules.Inventory.Infrastructure.Repositories;

public class ProcessedRequestRepository : IProcessedRequestRepository
{
    private readonly InventoryDbContext _context;

    public ProcessedRequestRepository(InventoryDbContext context)
    {
        _context = context;
    }

    public async Task<bool> ExistsAsync(Guid requestId, CancellationToken cancellationToken = default)
    {
        return await _context.ProcessedRequests
            .AnyAsync(pr => pr.Id == requestId, cancellationToken);
    }

    public async Task AddAsync(ProcessedRequest processedRequest, CancellationToken cancellationToken = default)
    {
        await _context.ProcessedRequests.AddAsync(processedRequest, cancellationToken);
    }
}
