using Stocker.Modules.Inventory.Domain.Entities;

namespace Stocker.Modules.Inventory.Domain.Repositories;

/// <summary>
/// Repository interface for PriceList entity
/// </summary>
public interface IPriceListRepository : IInventoryRepository<PriceList>
{
    /// <summary>
    /// Gets a price list with items
    /// </summary>
    Task<PriceList?> GetWithItemsAsync(int priceListId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a price list by code
    /// </summary>
    Task<PriceList?> GetByCodeAsync(string code, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the default price list
    /// </summary>
    Task<PriceList?> GetDefaultPriceListAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets active price lists
    /// </summary>
    Task<IReadOnlyList<PriceList>> GetActivePriceListsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets valid price lists (active and within validity period)
    /// </summary>
    Task<IReadOnlyList<PriceList>> GetValidPriceListsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets price lists by customer group
    /// </summary>
    Task<IReadOnlyList<PriceList>> GetByCustomerGroupAsync(int customerGroupId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets product price from applicable price lists
    /// </summary>
    Task<PriceListItem?> GetProductPriceAsync(int productId, int? customerGroupId = null, decimal? quantity = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if a price list with the given code exists
    /// </summary>
    Task<bool> ExistsWithCodeAsync(string code, int? excludePriceListId = null, CancellationToken cancellationToken = default);
}
