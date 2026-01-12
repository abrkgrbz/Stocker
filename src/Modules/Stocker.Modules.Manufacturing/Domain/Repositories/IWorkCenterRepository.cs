using Stocker.Modules.Manufacturing.Domain.Entities;

namespace Stocker.Modules.Manufacturing.Domain.Repositories;

public interface IWorkCenterRepository
{
    Task<WorkCenter?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<WorkCenter?> GetByCodeAsync(Guid tenantId, string code, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<WorkCenter>> GetAllAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<WorkCenter>> GetActiveAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<WorkCenter>> GetByTypeAsync(Guid tenantId, string type, CancellationToken cancellationToken = default);
    Task<bool> ExistsAsync(Guid tenantId, string code, CancellationToken cancellationToken = default);
    Task<bool> HasActiveOperationsAsync(int id, CancellationToken cancellationToken = default);
    Task AddAsync(WorkCenter workCenter, CancellationToken cancellationToken = default);
    void Update(WorkCenter workCenter);
    void Delete(WorkCenter workCenter);
}
