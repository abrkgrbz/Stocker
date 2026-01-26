using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Sales.Domain.Entities;
using Stocker.Modules.Sales.Domain.Repositories;

namespace Stocker.Modules.Sales.Infrastructure.Persistence.Repositories;

/// <summary>
/// Repository implementation for PromotionUsage entity.
/// </summary>
public class PromotionUsageRepository : BaseRepository<PromotionUsage>, IPromotionUsageRepository
{
    public PromotionUsageRepository(SalesDbContext context) : base(context)
    {
    }

    public async Task<int> GetCustomerUsageCountAsync(
        Guid promotionId,
        Guid customerId,
        CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .CountAsync(u => u.PromotionId == promotionId && u.CustomerId == customerId, cancellationToken);
    }

    public async Task<IReadOnlyList<PromotionUsage>> GetByPromotionIdAsync(
        Guid promotionId,
        CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(u => u.PromotionId == promotionId)
            .OrderByDescending(u => u.UsedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<PromotionUsage>> GetByCustomerIdAsync(
        Guid customerId,
        CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(u => u.CustomerId == customerId)
            .OrderByDescending(u => u.UsedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> ExistsForOrderAsync(
        Guid promotionId,
        Guid orderId,
        CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .AnyAsync(u => u.PromotionId == promotionId && u.OrderId == orderId, cancellationToken);
    }
}
