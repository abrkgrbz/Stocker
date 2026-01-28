using Stocker.Modules.Inventory.Domain.Entities;

namespace Stocker.Modules.Inventory.Domain.Repositories;

/// <summary>
/// Repository interface for Supplier entity
/// </summary>
public interface ISupplierRepository : IInventoryRepository<Supplier>
{
    /// <summary>
    /// Gets a supplier with products
    /// </summary>
    Task<Supplier?> GetWithProductsAsync(int supplierId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a supplier by code
    /// </summary>
    Task<Supplier?> GetByCodeAsync(string code, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets active suppliers
    /// </summary>
    Task<IReadOnlyList<Supplier>> GetActiveSuppliersAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Searches suppliers by name or code
    /// </summary>
    Task<IReadOnlyList<Supplier>> SearchAsync(string searchTerm, CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if a supplier with the given code exists
    /// </summary>
    Task<bool> ExistsWithCodeAsync(string code, int? excludeSupplierId = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets an Inventory supplier by its linked PurchaseSupplierId
    /// </summary>
    Task<Supplier?> GetByPurchaseSupplierIdAsync(Guid purchaseSupplierId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all Inventory suppliers that are linked to Purchase suppliers
    /// </summary>
    Task<IReadOnlyList<Supplier>> GetLinkedSuppliersAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all Inventory suppliers that are NOT linked to any Purchase supplier
    /// </summary>
    Task<IReadOnlyList<Supplier>> GetUnlinkedSuppliersAsync(CancellationToken cancellationToken = default);
}
