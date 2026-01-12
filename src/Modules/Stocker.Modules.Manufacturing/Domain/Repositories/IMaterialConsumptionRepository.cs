using Stocker.Modules.Manufacturing.Domain.Entities;

namespace Stocker.Modules.Manufacturing.Domain.Repositories;

public interface IMaterialConsumptionRepository
{
    Task<MaterialConsumption?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<MaterialConsumption>> GetByProductionOrderAsync(Guid productionOrderId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<MaterialConsumption>> GetByOperationAsync(Guid productionOperationId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<MaterialConsumption>> GetByProductAsync(Guid tenantId, Guid productId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<MaterialConsumption>> GetByLotAsync(Guid tenantId, string lotNumber, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<MaterialConsumption>> GetByDateRangeAsync(Guid tenantId, DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<MaterialConsumption>> GetPendingPostingAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<decimal> GetTotalConsumedAsync(Guid productionOrderId, Guid productId, CancellationToken cancellationToken = default);
    Task<string> GenerateConsumptionNumberAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task AddAsync(MaterialConsumption consumption, CancellationToken cancellationToken = default);
    void Update(MaterialConsumption consumption);
    void Delete(MaterialConsumption consumption);
}
