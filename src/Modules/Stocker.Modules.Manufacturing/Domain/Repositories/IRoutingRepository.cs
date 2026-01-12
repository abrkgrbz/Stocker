using Stocker.Modules.Manufacturing.Domain.Entities;

namespace Stocker.Modules.Manufacturing.Domain.Repositories;

public interface IRoutingRepository
{
    Task<Routing?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<Routing?> GetByIdWithOperationsAsync(int id, CancellationToken cancellationToken = default);
    Task<Routing?> GetByCodeAsync(Guid tenantId, string code, CancellationToken cancellationToken = default);
    Task<Routing?> GetByProductAsync(Guid tenantId, int productId, CancellationToken cancellationToken = default);
    Task<Routing?> GetActiveByProductAsync(Guid tenantId, int productId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Routing>> GetAllAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Routing>> GetByStatusAsync(Guid tenantId, string status, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Routing>> GetVersionsAsync(Guid tenantId, int productId, CancellationToken cancellationToken = default);
    Task<int> GetNextVersionAsync(Guid tenantId, int productId, CancellationToken cancellationToken = default);
    Task<bool> ExistsAsync(Guid tenantId, string code, CancellationToken cancellationToken = default);
    Task<bool> HasActiveProductionOrdersAsync(int id, CancellationToken cancellationToken = default);
    Task AddAsync(Routing routing, CancellationToken cancellationToken = default);
    void Update(Routing routing);
    void Delete(Routing routing);
}
