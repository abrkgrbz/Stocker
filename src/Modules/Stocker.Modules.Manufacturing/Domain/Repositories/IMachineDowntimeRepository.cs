using Stocker.Modules.Manufacturing.Domain.Entities;

namespace Stocker.Modules.Manufacturing.Domain.Repositories;

public interface IMachineDowntimeRepository
{
    Task<MachineDowntime?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<MachineDowntime?> GetByDowntimeNumberAsync(Guid tenantId, string downtimeNumber, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<MachineDowntime>> GetAllAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<MachineDowntime>> GetByMachineAsync(Guid machineId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<MachineDowntime>> GetByWorkCenterAsync(Guid workCenterId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<MachineDowntime>> GetByTypeAsync(Guid tenantId, string downtimeType, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<MachineDowntime>> GetByCategoryAsync(Guid tenantId, string category, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<MachineDowntime>> GetByDateRangeAsync(Guid tenantId, DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<MachineDowntime>> GetOpenAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<MachineDowntime>> GetByProductionOrderAsync(Guid productionOrderId, CancellationToken cancellationToken = default);
    Task<decimal> GetTotalDowntimeMinutesAsync(Guid machineId, DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default);
    Task<string> GenerateDowntimeNumberAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task AddAsync(MachineDowntime downtime, CancellationToken cancellationToken = default);
    void Update(MachineDowntime downtime);
    void Delete(MachineDowntime downtime);
}
