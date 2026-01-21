using Stocker.Modules.Inventory.Domain.Entities;

namespace Stocker.Modules.Inventory.Domain.Repositories;

/// <summary>
/// Repository interface for ConsignmentStock entity
/// </summary>
public interface IConsignmentStockRepository : IInventoryRepository<ConsignmentStock>
{
    /// <summary>
    /// Gets consignment stock by ID
    /// </summary>
    Task<ConsignmentStock?> GetByIdAsync(int id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets consignment stock by ID with movements included
    /// </summary>
    Task<ConsignmentStock?> GetByIdWithMovementsAsync(int id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets consignment stock by number
    /// </summary>
    Task<ConsignmentStock?> GetByNumberAsync(string consignmentNumber, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets consignment stocks by supplier
    /// </summary>
    Task<IReadOnlyList<ConsignmentStock>> GetBySupplierAsync(int supplierId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets consignment stocks by product
    /// </summary>
    Task<IReadOnlyList<ConsignmentStock>> GetByProductAsync(int productId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets consignment stocks by warehouse
    /// </summary>
    Task<IReadOnlyList<ConsignmentStock>> GetByWarehouseAsync(int warehouseId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets consignment stocks by status
    /// </summary>
    Task<IReadOnlyList<ConsignmentStock>> GetByStatusAsync(ConsignmentStatus status, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets active consignment stocks
    /// </summary>
    Task<IReadOnlyList<ConsignmentStock>> GetActiveAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets consignment stocks requiring reconciliation
    /// </summary>
    Task<IReadOnlyList<ConsignmentStock>> GetRequiringReconciliationAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets expiring consignment stocks
    /// </summary>
    Task<IReadOnlyList<ConsignmentStock>> GetExpiringAsync(DateTime beforeDate, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets consignment stocks with outstanding balance
    /// </summary>
    Task<IReadOnlyList<ConsignmentStock>> GetWithOutstandingBalanceAsync(CancellationToken cancellationToken = default);
}
