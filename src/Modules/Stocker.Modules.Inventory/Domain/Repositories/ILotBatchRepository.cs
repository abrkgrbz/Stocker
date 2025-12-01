using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Domain.Enums;

namespace Stocker.Modules.Inventory.Domain.Repositories;

/// <summary>
/// Repository interface for LotBatch entity
/// </summary>
public interface ILotBatchRepository : IInventoryRepository<LotBatch>
{
    /// <summary>
    /// Gets a lot by lot number
    /// </summary>
    Task<LotBatch?> GetByLotNumberAsync(string lotNumber, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets lots by product
    /// </summary>
    Task<IReadOnlyList<LotBatch>> GetByProductAsync(int productId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets lots by status
    /// </summary>
    Task<IReadOnlyList<LotBatch>> GetByStatusAsync(LotBatchStatus status, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets lots by supplier
    /// </summary>
    Task<IReadOnlyList<LotBatch>> GetBySupplierAsync(int supplierId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets expired lots
    /// </summary>
    Task<IReadOnlyList<LotBatch>> GetExpiredLotsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets lots expiring within specified days
    /// </summary>
    Task<IReadOnlyList<LotBatch>> GetExpiringLotsAsync(int withinDays, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets quarantined lots
    /// </summary>
    Task<IReadOnlyList<LotBatch>> GetQuarantinedLotsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets available lots for a product (approved and with available quantity)
    /// </summary>
    Task<IReadOnlyList<LotBatch>> GetAvailableLotsAsync(int productId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets lots ordered by FEFO (First Expiry First Out)
    /// </summary>
    Task<IReadOnlyList<LotBatch>> GetByFEFOAsync(int productId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if a lot number exists
    /// </summary>
    Task<bool> ExistsAsync(string lotNumber, CancellationToken cancellationToken = default);
}
