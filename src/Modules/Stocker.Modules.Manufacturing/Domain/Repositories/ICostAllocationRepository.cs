using Stocker.Modules.Manufacturing.Domain.Entities;

namespace Stocker.Modules.Manufacturing.Domain.Repositories;

public interface ICostAllocationRepository
{
    Task<CostAllocation?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<CostAllocation?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default);
    Task<CostAllocation?> GetByAllocationNumberAsync(Guid tenantId, string allocationNumber, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<CostAllocation>> GetAllAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<CostAllocation>> GetByProductionOrderAsync(Guid productionOrderId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<CostAllocation>> GetByProductAsync(Guid tenantId, Guid productId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<CostAllocation>> GetByWorkCenterAsync(Guid workCenterId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<CostAllocation>> GetByPeriodAsync(Guid tenantId, int year, int month, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<CostAllocation>> GetByStatusAsync(Guid tenantId, string status, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<CostAllocation>> GetPendingPostingAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<CostAllocation>> GetByCostingMethodAsync(Guid tenantId, string costingMethod, CancellationToken cancellationToken = default);
    Task<string> GenerateAllocationNumberAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task AddAsync(CostAllocation allocation, CancellationToken cancellationToken = default);
    void Update(CostAllocation allocation);
    void Delete(CostAllocation allocation);
}
