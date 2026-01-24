using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Sales.Domain.Entities;
using Stocker.Modules.Sales.Domain.Repositories;

namespace Stocker.Modules.Sales.Infrastructure.Persistence.Repositories;

public class SalesPipelineRepository : BaseRepository<SalesPipeline>, ISalesPipelineRepository
{
    public SalesPipelineRepository(SalesDbContext context) : base(context) { }

    public async Task<SalesPipeline?> GetByCodeAsync(string code, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(p => p.Stages)
            .FirstOrDefaultAsync(p => p.Code == code, cancellationToken);
    }

    public async Task<SalesPipeline?> GetWithStagesAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(p => p.Stages.OrderBy(s => s.OrderIndex))
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
    }

    public async Task<SalesPipeline?> GetDefaultAsync(CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(p => p.Stages.OrderBy(s => s.OrderIndex))
            .FirstOrDefaultAsync(p => p.IsDefault && p.IsActive, cancellationToken);
    }

    public async Task<IReadOnlyList<SalesPipeline>> GetActiveAsync(CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(p => p.Stages.OrderBy(s => s.OrderIndex))
            .Where(p => p.IsActive)
            .OrderBy(p => p.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<SalesPipeline>> GetByTypeAsync(PipelineType type, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(p => p.Stages.OrderBy(s => s.OrderIndex))
            .Where(p => p.Type == type)
            .OrderBy(p => p.Name)
            .ToListAsync(cancellationToken);
    }
}
