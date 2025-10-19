using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Domain.Repositories;

namespace Stocker.Modules.CRM.Infrastructure.Persistence.Repositories;

/// <summary>
/// Repository implementation for Deal entity
/// </summary>
public class DealRepository : BaseRepository<Deal>, IDealRepository
{
    public DealRepository(CRMDbContext context) : base(context)
    {
    }

    public async Task<Deal?> GetWithProductsAsync(Guid dealId, Guid tenantId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(d => d.Products)
            .FirstOrDefaultAsync(d => d.Id == dealId && d.TenantId == tenantId, cancellationToken);
    }

    public async Task<IReadOnlyList<Deal>> GetByCustomerIdAsync(Guid customerId, Guid tenantId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(d => d.CustomerId == customerId && d.TenantId == tenantId)
            .OrderByDescending(d => d.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Deal>> GetByStageIdAsync(Guid stageId, Guid tenantId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(d => d.StageId == stageId && d.TenantId == tenantId)
            .OrderBy(d => d.Priority)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Deal>> GetOpenDealsByOwnerAsync(int ownerId, Guid tenantId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(d => d.OwnerId == ownerId &&
                       d.TenantId == tenantId &&
                       d.Status == Domain.Enums.DealStatus.Open)
            .OrderByDescending(d => d.Priority)
            .ThenByDescending(d => d.CreatedAt)
            .ToListAsync(cancellationToken);
    }
}
