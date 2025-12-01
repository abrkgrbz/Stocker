using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Domain.Enums;

namespace Stocker.Modules.Inventory.Domain.Repositories;

/// <summary>
/// Repository interface for SerialNumber entity
/// </summary>
public interface ISerialNumberRepository : IInventoryRepository<SerialNumber>
{
    /// <summary>
    /// Gets a serial number by serial
    /// </summary>
    Task<SerialNumber?> GetBySerialAsync(string serial, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets serial numbers by product
    /// </summary>
    Task<IReadOnlyList<SerialNumber>> GetByProductAsync(int productId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets serial numbers by status
    /// </summary>
    Task<IReadOnlyList<SerialNumber>> GetByStatusAsync(SerialNumberStatus status, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets serial numbers by warehouse
    /// </summary>
    Task<IReadOnlyList<SerialNumber>> GetByWarehouseAsync(int warehouseId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets serial numbers by customer
    /// </summary>
    Task<IReadOnlyList<SerialNumber>> GetByCustomerAsync(Guid customerId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets serial numbers under warranty
    /// </summary>
    Task<IReadOnlyList<SerialNumber>> GetUnderWarrantyAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets serial numbers with expiring warranty
    /// </summary>
    Task<IReadOnlyList<SerialNumber>> GetExpiringWarrantyAsync(int withinDays, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets available serial numbers for a product
    /// </summary>
    Task<IReadOnlyList<SerialNumber>> GetAvailableByProductAsync(int productId, int warehouseId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if a serial number exists
    /// </summary>
    Task<bool> ExistsAsync(string serial, CancellationToken cancellationToken = default);
}
