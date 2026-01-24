using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Sales.Domain.Entities;
using Stocker.Modules.Sales.Domain.Repositories;

namespace Stocker.Modules.Sales.Infrastructure.Persistence.Repositories;

public class OpportunityRepository : BaseRepository<Opportunity>, IOpportunityRepository
{
    public OpportunityRepository(SalesDbContext context) : base(context) { }

    public async Task<Opportunity?> GetByNumberAsync(string opportunityNumber, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .FirstOrDefaultAsync(o => o.OpportunityNumber == opportunityNumber, cancellationToken);
    }

    public async Task<IReadOnlyList<Opportunity>> GetByCustomerIdAsync(Guid customerId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(o => o.CustomerId == customerId)
            .OrderByDescending(o => o.CreatedDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Opportunity>> GetBySalesPersonIdAsync(Guid salesPersonId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(o => o.SalesPersonId == salesPersonId)
            .OrderByDescending(o => o.CreatedDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Opportunity>> GetByStageAsync(OpportunityStage stage, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(o => o.Stage == stage)
            .OrderByDescending(o => o.CreatedDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Opportunity>> GetByPipelineIdAsync(Guid pipelineId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(o => o.PipelineId == pipelineId)
            .OrderByDescending(o => o.CreatedDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Opportunity>> GetOpenAsync(CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(o => !o.IsWon && !o.IsLost)
            .OrderByDescending(o => o.CreatedDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<string> GenerateOpportunityNumberAsync(CancellationToken cancellationToken = default)
    {
        var lastNumber = await _dbSet
            .OrderByDescending(o => o.CreatedAt)
            .Select(o => o.OpportunityNumber)
            .FirstOrDefaultAsync(cancellationToken);

        if (string.IsNullOrEmpty(lastNumber))
            return "OPP-000001";

        var parts = lastNumber.Split('-');
        if (parts.Length == 2 && int.TryParse(parts[1], out var num))
            return $"OPP-{(num + 1):D6}";

        return $"OPP-{DateTime.UtcNow:yyyyMMddHHmmss}";
    }
}
