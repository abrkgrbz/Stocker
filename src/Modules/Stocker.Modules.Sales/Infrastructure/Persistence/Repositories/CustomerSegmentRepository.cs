using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Sales.Domain.Entities;
using Stocker.Modules.Sales.Domain.Repositories;

namespace Stocker.Modules.Sales.Infrastructure.Persistence.Repositories;

public class CustomerSegmentRepository : BaseRepository<CustomerSegment>, ICustomerSegmentRepository
{
    public CustomerSegmentRepository(SalesDbContext context) : base(context) { }

    public async Task<CustomerSegment?> GetByCodeAsync(string code, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .FirstOrDefaultAsync(s => s.Code == code, cancellationToken);
    }

    public async Task<CustomerSegment?> GetDefaultAsync(CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .FirstOrDefaultAsync(s => s.IsDefault && s.IsActive, cancellationToken);
    }

    public async Task<IReadOnlyList<CustomerSegment>> GetActiveAsync(CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(s => s.IsActive)
            .OrderBy(s => s.Priority)
            .ThenBy(s => s.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<CustomerSegment>> GetByPriorityAsync(SegmentPriority priority, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(s => s.Priority == priority && s.IsActive)
            .OrderBy(s => s.Name)
            .ToListAsync(cancellationToken);
    }
}
