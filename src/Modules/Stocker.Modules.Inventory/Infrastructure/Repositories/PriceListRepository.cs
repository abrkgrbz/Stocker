using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.Modules.Inventory.Infrastructure.Persistence;

namespace Stocker.Modules.Inventory.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for PriceList entity
/// </summary>
public class PriceListRepository : BaseRepository<PriceList>, IPriceListRepository
{
    public PriceListRepository(InventoryDbContext context) : base(context)
    {
    }

    public async Task<PriceList?> GetWithItemsAsync(int priceListId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(p => p.Items.Where(i => !i.IsDeleted))
                .ThenInclude(i => i.Product)
            .Where(p => !p.IsDeleted && p.Id == priceListId)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<PriceList?> GetByCodeAsync(string code, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(p => !p.IsDeleted && p.Code == code)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<PriceList?> GetDefaultPriceListAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(p => !p.IsDeleted && p.IsDefault && p.IsActive)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<PriceList>> GetActivePriceListsAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(p => !p.IsDeleted && p.IsActive)
            .OrderBy(p => p.Priority)
            .ThenBy(p => p.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<PriceList>> GetValidPriceListsAsync(CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        return await DbSet
            .Where(p => !p.IsDeleted && p.IsActive)
            .Where(p => (!p.ValidFrom.HasValue || p.ValidFrom.Value <= now) &&
                       (!p.ValidTo.HasValue || p.ValidTo.Value >= now))
            .OrderBy(p => p.Priority)
            .ThenBy(p => p.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<PriceList>> GetByCustomerGroupAsync(int customerGroupId, CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        return await DbSet
            .Where(p => !p.IsDeleted && p.IsActive && p.CustomerGroupId == customerGroupId)
            .Where(p => (!p.ValidFrom.HasValue || p.ValidFrom.Value <= now) &&
                       (!p.ValidTo.HasValue || p.ValidTo.Value >= now))
            .OrderBy(p => p.Priority)
            .ToListAsync(cancellationToken);
    }

    public async Task<PriceListItem?> GetProductPriceAsync(int productId, int? customerGroupId = null, decimal? quantity = null, CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;

        // Build query for applicable price lists
        var query = DbSet
            .Where(p => !p.IsDeleted && p.IsActive)
            .Where(p => (!p.ValidFrom.HasValue || p.ValidFrom.Value <= now) &&
                       (!p.ValidTo.HasValue || p.ValidTo.Value >= now));

        // Filter by customer group if provided
        if (customerGroupId.HasValue)
        {
            query = query.Where(p => p.CustomerGroupId == null || p.CustomerGroupId == customerGroupId.Value);
        }
        else
        {
            query = query.Where(p => p.CustomerGroupId == null);
        }

        // Get price list items for the product, ordered by priority
        var priceListItem = await query
            .OrderBy(p => p.Priority)
            .SelectMany(p => p.Items.Where(i => !i.IsDeleted && i.ProductId == productId))
            .Where(i => (!i.MinQuantity.HasValue || (quantity.HasValue && quantity.Value >= i.MinQuantity.Value)) &&
                       (!i.MaxQuantity.HasValue || (quantity.HasValue && quantity.Value <= i.MaxQuantity.Value)))
            .FirstOrDefaultAsync(cancellationToken);

        return priceListItem;
    }

    public async Task<bool> ExistsWithCodeAsync(string code, int? excludePriceListId = null, CancellationToken cancellationToken = default)
    {
        var query = DbSet.Where(p => !p.IsDeleted && p.Code == code);

        if (excludePriceListId.HasValue)
        {
            query = query.Where(p => p.Id != excludePriceListId.Value);
        }

        return await query.AnyAsync(cancellationToken);
    }
}
