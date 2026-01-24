using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Sales.Domain.Entities;
using Stocker.Modules.Sales.Domain.Repositories;

namespace Stocker.Modules.Sales.Infrastructure.Persistence.Repositories;

/// <summary>
/// Repository implementation for PriceList entity
/// </summary>
public class PriceListRepository : BaseRepository<PriceList>, IPriceListRepository
{
    public PriceListRepository(SalesDbContext context) : base(context)
    {
    }

    public async Task<PriceList?> GetByCodeAsync(string code, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .FirstOrDefaultAsync(p => p.Code == code.ToUpperInvariant(), cancellationToken);
    }

    public async Task<PriceList?> GetWithItemsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(p => p.Items)
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
    }

    public async Task<PriceList?> GetWithCustomersAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(p => p.AssignedCustomers)
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
    }

    public async Task<PriceList?> GetFullAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(p => p.Items)
            .Include(p => p.AssignedCustomers)
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<PriceList>> GetActiveListsAsync(CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(p => p.IsActive)
            .OrderBy(p => p.Priority)
            .ThenBy(p => p.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<PriceList>> GetByTypeAsync(PriceListType type, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(p => p.Type == type)
            .OrderBy(p => p.Priority)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<PriceList>> GetByCustomerIdAsync(Guid customerId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(p => p.AssignedCustomers)
            .Where(p => p.IsActive && p.AssignedCustomers.Any(c => c.CustomerId == customerId && c.IsActive))
            .OrderBy(p => p.Priority)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<PriceList>> GetValidAtDateAsync(DateTime date, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(p => p.IsActive && p.ValidFrom <= date && (!p.ValidTo.HasValue || p.ValidTo.Value >= date))
            .OrderBy(p => p.Priority)
            .ToListAsync(cancellationToken);
    }
}
