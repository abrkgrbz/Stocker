using Stocker.Modules.Manufacturing.Domain.Entities;

namespace Stocker.Modules.Manufacturing.Domain.Repositories;

public interface IBillOfMaterialRepository
{
    Task<BillOfMaterial?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<BillOfMaterial?> GetByIdWithLinesAsync(int id, CancellationToken cancellationToken = default);
    Task<BillOfMaterial?> GetByCodeAsync(Guid tenantId, string code, CancellationToken cancellationToken = default);
    Task<BillOfMaterial?> GetByProductAsync(Guid tenantId, int productId, CancellationToken cancellationToken = default);
    Task<BillOfMaterial?> GetActiveByProductAsync(Guid tenantId, int productId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<BillOfMaterial>> GetAllAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<BillOfMaterial>> GetByStatusAsync(Guid tenantId, string status, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<BillOfMaterial>> GetVersionsAsync(Guid tenantId, int productId, CancellationToken cancellationToken = default);
    Task<int> GetNextVersionAsync(Guid tenantId, int productId, CancellationToken cancellationToken = default);
    Task<bool> ExistsAsync(Guid tenantId, string code, CancellationToken cancellationToken = default);
    Task<bool> HasActiveProductionOrdersAsync(int id, CancellationToken cancellationToken = default);
    Task AddAsync(BillOfMaterial bom, CancellationToken cancellationToken = default);
    void Update(BillOfMaterial bom);
    void Delete(BillOfMaterial bom);
}
