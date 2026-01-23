using Stocker.Modules.Inventory.Domain.Entities;

namespace Stocker.Modules.Inventory.Domain.Repositories;

public interface IProcessedRequestRepository
{
    Task<bool> ExistsAsync(Guid requestId, CancellationToken cancellationToken = default);
    Task AddAsync(ProcessedRequest processedRequest, CancellationToken cancellationToken = default);
}
