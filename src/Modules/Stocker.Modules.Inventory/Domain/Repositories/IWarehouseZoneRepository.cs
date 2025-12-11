using Stocker.Modules.Inventory.Domain.Entities;

namespace Stocker.Modules.Inventory.Domain.Repositories;

/// <summary>
/// Repository interface for WarehouseZone entity
/// </summary>
public interface IWarehouseZoneRepository : IInventoryRepository<WarehouseZone>
{
    /// <summary>
    /// Gets a warehouse zone by ID with locations
    /// </summary>
    Task<WarehouseZone?> GetByIdAsync(int id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets zones by warehouse
    /// </summary>
    Task<IReadOnlyList<WarehouseZone>> GetByWarehouseAsync(int warehouseId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all active warehouse zones
    /// </summary>
    Task<IReadOnlyList<WarehouseZone>> GetActiveAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets zone by warehouse and code
    /// </summary>
    Task<WarehouseZone?> GetByWarehouseAndCodeAsync(int warehouseId, string code, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets zone by code within a warehouse (alias for GetByWarehouseAndCodeAsync)
    /// </summary>
    Task<WarehouseZone?> GetByCodeAsync(int warehouseId, string code, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets active zones by warehouse
    /// </summary>
    Task<IReadOnlyList<WarehouseZone>> GetActiveByWarehouseAsync(int warehouseId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets zones by type
    /// </summary>
    Task<IReadOnlyList<WarehouseZone>> GetByZoneTypeAsync(ZoneType zoneType, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets temperature controlled zones
    /// </summary>
    Task<IReadOnlyList<WarehouseZone>> GetTemperatureControlledAsync(int warehouseId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets hazardous zones
    /// </summary>
    Task<IReadOnlyList<WarehouseZone>> GetHazardousAsync(int warehouseId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets quarantine zones
    /// </summary>
    Task<IReadOnlyList<WarehouseZone>> GetQuarantineZonesAsync(int warehouseId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if code exists in warehouse
    /// </summary>
    Task<bool> ExistsWithCodeAsync(int warehouseId, string code, int? excludeId = null, CancellationToken cancellationToken = default);
}
