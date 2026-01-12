using Stocker.Modules.Manufacturing.Domain.Entities;
using Stocker.Modules.Manufacturing.Domain.Enums;

namespace Stocker.Modules.Manufacturing.Domain.Repositories;

public interface IMachineRepository
{
    Task<Machine?> GetByIdAsync(Guid tenantId, int id, CancellationToken cancellationToken = default);
    Task<Machine?> GetByCodeAsync(Guid tenantId, string code, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Machine>> GetAllAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Machine>> GetByWorkCenterAsync(Guid tenantId, int workCenterId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Machine>> GetActiveAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Machine>> GetByStatusAsync(Guid tenantId, MachineStatus status, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Machine>> GetRequiringMaintenanceAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<bool> ExistsAsync(Guid tenantId, string code, CancellationToken cancellationToken = default);
    Task<string> GenerateMachineCodeAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task AddAsync(Machine machine, CancellationToken cancellationToken = default);
    Task DeleteAsync(Machine machine, CancellationToken cancellationToken = default);
}
