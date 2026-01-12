using Stocker.Modules.Manufacturing.Domain.Entities;
using Stocker.Modules.Manufacturing.Domain.Enums;

namespace Stocker.Modules.Manufacturing.Domain.Repositories;

/// <summary>
/// Bakım planı repository interface
/// </summary>
public interface IMaintenancePlanRepository
{
    Task<MaintenancePlan?> GetByIdAsync(Guid tenantId, int id, CancellationToken cancellationToken = default);
    Task<MaintenancePlan?> GetByIdWithDetailsAsync(Guid tenantId, int id, CancellationToken cancellationToken = default);
    Task<MaintenancePlan?> GetByCodeAsync(Guid tenantId, string code, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<MaintenancePlan>> GetAllAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<MaintenancePlan>> GetByMachineIdAsync(Guid tenantId, int machineId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<MaintenancePlan>> GetByWorkCenterIdAsync(Guid tenantId, int workCenterId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<MaintenancePlan>> GetActivePlansAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<MaintenancePlan>> GetDuePlansAsync(Guid tenantId, DateTime asOfDate, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<MaintenancePlan>> GetOverduePlansAsync(Guid tenantId, DateTime asOfDate, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<MaintenancePlan>> GetByTypeAsync(Guid tenantId, MaintenanceType maintenanceType, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<MaintenancePlan>> GetUpcomingPlansAsync(Guid tenantId, DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default);
    Task<bool> ExistsWithCodeAsync(Guid tenantId, string code, int? excludeId = null, CancellationToken cancellationToken = default);
    Task AddAsync(MaintenancePlan entity, CancellationToken cancellationToken = default);
    Task DeleteAsync(MaintenancePlan entity, CancellationToken cancellationToken = default);
}

/// <summary>
/// Bakım görevi repository interface
/// </summary>
public interface IMaintenanceTaskRepository
{
    Task<MaintenanceTask?> GetByIdAsync(Guid tenantId, int id, CancellationToken cancellationToken = default);
    Task<MaintenanceTask?> GetByIdWithPlanAsync(Guid tenantId, int id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<MaintenanceTask>> GetByPlanIdAsync(Guid tenantId, int maintenancePlanId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<MaintenanceTask>> GetActiveTasksByPlanAsync(Guid tenantId, int maintenancePlanId, CancellationToken cancellationToken = default);
    Task<int> GetMaxSequenceAsync(Guid tenantId, int maintenancePlanId, CancellationToken cancellationToken = default);
    Task AddAsync(MaintenanceTask entity, CancellationToken cancellationToken = default);
    Task DeleteAsync(MaintenanceTask entity, CancellationToken cancellationToken = default);
}

/// <summary>
/// Bakım kaydı repository interface
/// </summary>
public interface IMaintenanceRecordRepository
{
    Task<MaintenanceRecord?> GetByIdAsync(Guid tenantId, int id, CancellationToken cancellationToken = default);
    Task<MaintenanceRecord?> GetByIdWithDetailsAsync(Guid tenantId, int id, CancellationToken cancellationToken = default);
    Task<MaintenanceRecord?> GetByRecordNumberAsync(Guid tenantId, string recordNumber, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<MaintenanceRecord>> GetAllAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<MaintenanceRecord>> GetByPlanIdAsync(Guid tenantId, int maintenancePlanId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<MaintenanceRecord>> GetByMachineIdAsync(Guid tenantId, int machineId, DateTime? startDate = null, DateTime? endDate = null, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<MaintenanceRecord>> GetByWorkCenterIdAsync(Guid tenantId, int workCenterId, DateTime? startDate = null, DateTime? endDate = null, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<MaintenanceRecord>> GetByStatusAsync(Guid tenantId, MaintenanceRecordStatus status, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<MaintenanceRecord>> GetPendingRecordsAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<MaintenanceRecord>> GetByDateRangeAsync(Guid tenantId, DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<MaintenanceRecord>> GetByTypeAsync(Guid tenantId, MaintenanceType maintenanceType, DateTime? startDate = null, DateTime? endDate = null, CancellationToken cancellationToken = default);
    Task<MaintenanceRecord?> GetLastRecordForMachineAsync(Guid tenantId, int machineId, CancellationToken cancellationToken = default);
    Task<decimal> GetTotalCostByMachineAsync(Guid tenantId, int machineId, DateTime? startDate = null, DateTime? endDate = null, CancellationToken cancellationToken = default);
    Task<string> GenerateRecordNumberAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<bool> ExistsWithRecordNumberAsync(Guid tenantId, string recordNumber, int? excludeId = null, CancellationToken cancellationToken = default);
    Task AddAsync(MaintenanceRecord entity, CancellationToken cancellationToken = default);
    Task DeleteAsync(MaintenanceRecord entity, CancellationToken cancellationToken = default);
}

/// <summary>
/// Yedek parça repository interface
/// </summary>
public interface ISparePartRepository
{
    Task<SparePart?> GetByIdAsync(Guid tenantId, int id, CancellationToken cancellationToken = default);
    Task<SparePart?> GetByIdWithDetailsAsync(Guid tenantId, int id, CancellationToken cancellationToken = default);
    Task<SparePart?> GetByCodeAsync(Guid tenantId, string code, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<SparePart>> GetAllAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<SparePart>> GetActivePartsAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<SparePart>> GetByCategoryAsync(Guid tenantId, string category, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<SparePart>> GetByCriticalityAsync(Guid tenantId, SparePartCriticality criticality, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<SparePart>> GetLowStockPartsAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<SparePart>> GetByMachineCompatibilityAsync(Guid tenantId, int machineId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<SparePart>> SearchAsync(Guid tenantId, string searchTerm, CancellationToken cancellationToken = default);
    Task<bool> ExistsWithCodeAsync(Guid tenantId, string code, int? excludeId = null, CancellationToken cancellationToken = default);
    Task AddAsync(SparePart entity, CancellationToken cancellationToken = default);
    Task DeleteAsync(SparePart entity, CancellationToken cancellationToken = default);
}

/// <summary>
/// Makine sayaç repository interface
/// </summary>
public interface IMachineCounterRepository
{
    Task<MachineCounter?> GetByIdAsync(Guid tenantId, int id, CancellationToken cancellationToken = default);
    Task<MachineCounter?> GetByMachineAndNameAsync(Guid tenantId, int machineId, string counterName, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<MachineCounter>> GetByMachineIdAsync(Guid tenantId, int machineId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<MachineCounter>> GetCountersNeedingMaintenanceAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<MachineCounter>> GetCountersAtWarningLevelAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<MachineCounter>> GetCountersAtCriticalLevelAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task AddAsync(MachineCounter entity, CancellationToken cancellationToken = default);
    Task DeleteAsync(MachineCounter entity, CancellationToken cancellationToken = default);
}
