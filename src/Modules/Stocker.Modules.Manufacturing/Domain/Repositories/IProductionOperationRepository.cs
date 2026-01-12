using Stocker.Modules.Manufacturing.Domain.Entities;

namespace Stocker.Modules.Manufacturing.Domain.Repositories;

public interface IProductionOperationRepository
{
    Task<ProductionOperation?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ProductionOperation>> GetByProductionOrderAsync(Guid productionOrderId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ProductionOperation>> GetByWorkCenterAsync(Guid workCenterId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ProductionOperation>> GetByMachineAsync(Guid machineId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ProductionOperation>> GetByStatusAsync(Guid tenantId, string status, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ProductionOperation>> GetActiveByWorkCenterAsync(Guid workCenterId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ProductionOperation>> GetScheduledAsync(Guid tenantId, DateTime date, CancellationToken cancellationToken = default);
    Task<ProductionOperation?> GetNextOperationAsync(Guid productionOrderId, int currentSequence, CancellationToken cancellationToken = default);
    Task AddAsync(ProductionOperation operation, CancellationToken cancellationToken = default);
    void Update(ProductionOperation operation);
    void Delete(ProductionOperation operation);
}
