using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Domain.Repositories;

namespace Stocker.Modules.CRM.Infrastructure.Persistence.Repositories;

/// <summary>
/// Repository implementation for CustomerTag
/// </summary>
public class CustomerTagRepository : BaseRepository<CustomerTag>, ICustomerTagRepository
{
    public CustomerTagRepository(CRMDbContext context) : base(context)
    {
    }

    public async Task<List<CustomerTag>> GetByCustomerAsync(
        Guid customerId,
        CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(t => t.CustomerId == customerId)
            .OrderBy(t => t.Tag)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<CustomerTag>> GetByTenantAsync(
        Guid tenantId,
        CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(t => t.TenantId == tenantId)
            .OrderBy(t => t.Tag)
            .ToListAsync(cancellationToken);
    }

    public async Task<CustomerTag?> GetByCustomerAndTagAsync(
        Guid customerId,
        string tag,
        CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .FirstOrDefaultAsync(
                t => t.CustomerId == customerId &&
                     t.Tag == tag,
                cancellationToken);
    }

    public async Task<List<string>> GetDistinctTagsAsync(
        Guid tenantId,
        CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(t => t.TenantId == tenantId)
            .Select(t => t.Tag)
            .Distinct()
            .OrderBy(t => t)
            .ToListAsync(cancellationToken);
    }
}
