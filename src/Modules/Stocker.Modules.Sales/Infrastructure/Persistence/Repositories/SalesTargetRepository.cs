using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Sales.Domain.Entities;
using Stocker.Modules.Sales.Domain.Repositories;

namespace Stocker.Modules.Sales.Infrastructure.Persistence.Repositories;

public class SalesTargetRepository : BaseRepository<SalesTarget>, ISalesTargetRepository
{
    public SalesTargetRepository(SalesDbContext context) : base(context) { }

    public async Task<SalesTarget?> GetByCodeAsync(string targetCode, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(t => t.Periods)
            .Include(t => t.ProductTargets)
            .FirstOrDefaultAsync(t => t.TargetCode == targetCode, cancellationToken);
    }

    public async Task<IReadOnlyList<SalesTarget>> GetBySalesRepresentativeAsync(Guid salesRepId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(t => t.SalesRepresentativeId == salesRepId)
            .OrderByDescending(t => t.Year)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<SalesTarget>> GetByTeamAsync(Guid teamId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(t => t.SalesTeamId == teamId)
            .OrderByDescending(t => t.Year)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<SalesTarget>> GetByYearAsync(int year, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(t => t.Periods)
            .Where(t => t.Year == year)
            .OrderBy(t => t.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<SalesTarget>> GetByStatusAsync(SalesTargetStatus status, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(t => t.Status == status)
            .OrderByDescending(t => t.Year)
            .ThenBy(t => t.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<SalesTarget>> GetActiveAsync(CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(t => t.Periods)
            .Where(t => t.Status == SalesTargetStatus.Active)
            .OrderByDescending(t => t.Year)
            .ThenBy(t => t.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<string> GenerateTargetCodeAsync(CancellationToken cancellationToken = default)
    {
        var lastCode = await _dbSet
            .OrderByDescending(t => t.TargetCode)
            .Select(t => t.TargetCode)
            .FirstOrDefaultAsync(cancellationToken);

        if (string.IsNullOrEmpty(lastCode))
            return "TGT-000001";

        var parts = lastCode.Split('-');
        if (parts.Length == 2 && int.TryParse(parts[1], out var num))
            return $"TGT-{(num + 1):D6}";

        return $"TGT-{DateTime.UtcNow:yyyyMMddHHmmss}";
    }
}
