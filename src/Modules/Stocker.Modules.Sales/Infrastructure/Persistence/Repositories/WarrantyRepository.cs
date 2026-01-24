using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Sales.Domain.Entities;
using Stocker.Modules.Sales.Domain.Repositories;

namespace Stocker.Modules.Sales.Infrastructure.Persistence.Repositories;

/// <summary>
/// Repository implementation for Warranty entity
/// </summary>
public class WarrantyRepository : BaseRepository<Warranty>, IWarrantyRepository
{
    public WarrantyRepository(SalesDbContext context) : base(context)
    {
    }

    public async Task<Warranty?> GetByWarrantyNumberAsync(string warrantyNumber, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .FirstOrDefaultAsync(w => w.WarrantyNumber == warrantyNumber, cancellationToken);
    }

    public async Task<Warranty?> GetWithClaimsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(w => w.Claims)
            .FirstOrDefaultAsync(w => w.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<Warranty>> GetByCustomerIdAsync(Guid customerId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(w => w.CustomerId == customerId)
            .OrderByDescending(w => w.StartDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Warranty>> GetByProductIdAsync(Guid productId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(w => w.ProductId == productId)
            .OrderByDescending(w => w.StartDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Warranty>> GetByStatusAsync(WarrantyStatus status, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(w => w.Status == status)
            .OrderByDescending(w => w.StartDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Warranty>> GetExpiringWarrantiesAsync(int daysUntilExpiry = 30, CancellationToken cancellationToken = default)
    {
        var expiryDate = DateTime.UtcNow.AddDays(daysUntilExpiry);
        return await _dbSet
            .Where(w => w.EndDate <= expiryDate &&
                        w.Status == WarrantyStatus.Active)
            .OrderBy(w => w.EndDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<string> GenerateWarrantyNumberAsync(CancellationToken cancellationToken = default)
    {
        var today = DateTime.UtcNow;
        var prefix = $"WRT-{today:yyyyMMdd}-";

        var lastWarranty = await _dbSet
            .Where(w => w.WarrantyNumber.StartsWith(prefix))
            .OrderByDescending(w => w.WarrantyNumber)
            .FirstOrDefaultAsync(cancellationToken);

        if (lastWarranty == null)
        {
            return $"{prefix}0001";
        }

        var lastNumber = lastWarranty.WarrantyNumber.Replace(prefix, "");
        if (int.TryParse(lastNumber, out var number))
        {
            return $"{prefix}{(number + 1):D4}";
        }

        return $"{prefix}0001";
    }
}
