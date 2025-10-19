using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Domain.Repositories;

namespace Stocker.Modules.CRM.Infrastructure.Persistence.Repositories;

/// <summary>
/// Repository implementation for CustomerSegment
/// </summary>
public class CustomerSegmentRepository : BaseRepository<CustomerSegment>, ICustomerSegmentRepository
{
    public CustomerSegmentRepository(CRMDbContext context) : base(context)
    {
    }

    public async Task<List<CustomerSegment>> GetByTenantAsync(
        Guid tenantId,
        CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(s => s.TenantId == tenantId)
            .OrderBy(s => s.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<CustomerSegment>> GetActiveByTenantAsync(
        Guid tenantId,
        CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(s => s.TenantId == tenantId && s.IsActive)
            .OrderBy(s => s.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<CustomerSegment?> GetByIdWithMembersAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(s => s.Members)
                .ThenInclude(m => m.Customer)
            .FirstOrDefaultAsync(s => s.Id == id, cancellationToken);
    }

    public async Task<bool> ExistsAsync(
        Guid tenantId,
        string name,
        CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .AnyAsync(
                s => s.TenantId == tenantId &&
                     s.Name == name,
                cancellationToken);
    }
}
