using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Infrastructure.Persistence;

namespace Stocker.Modules.CRM.Infrastructure.Repositories;

public class TerritoryRepository : ITerritoryRepository
{
    private readonly CRMDbContext _context;

    public TerritoryRepository(CRMDbContext context)
    {
        _context = context;
    }

    public async System.Threading.Tasks.Task<List<Territory>> GetAllAsync(
        TerritoryType? territoryType = null,
        bool? isActive = null,
        Guid? parentTerritoryId = null,
        int skip = 0,
        int take = 100,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Territories.Include(t => t.Assignments).AsQueryable();

        if (territoryType.HasValue)
            query = query.Where(t => t.TerritoryType == territoryType.Value);
        if (isActive.HasValue)
            query = query.Where(t => t.IsActive == isActive.Value);
        if (parentTerritoryId.HasValue)
            query = query.Where(t => t.ParentTerritoryId == parentTerritoryId.Value);

        return await query
            .OrderBy(t => t.HierarchyLevel)
            .ThenBy(t => t.Name)
            .Skip(skip)
            .Take(take)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<Territory?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Territories
            .Include(t => t.Assignments)
            .Include(t => t.ParentTerritory)
            .Include(t => t.AssignedSalesTeam)
            .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);
    }

    public async System.Threading.Tasks.Task<Territory?> GetByCodeAsync(string code, CancellationToken cancellationToken = default)
    {
        return await _context.Territories
            .Include(t => t.Assignments)
            .FirstOrDefaultAsync(t => t.Code == code, cancellationToken);
    }

    public async System.Threading.Tasks.Task<List<Territory>> GetChildTerritoriesAsync(Guid parentId, CancellationToken cancellationToken = default)
    {
        return await _context.Territories
            .Include(t => t.Assignments)
            .Where(t => t.ParentTerritoryId == parentId)
            .OrderBy(t => t.Name)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<List<Territory>> GetByUserIdAsync(int userId, CancellationToken cancellationToken = default)
    {
        return await _context.Territories
            .Include(t => t.Assignments)
            .Where(t => t.Assignments.Any(a => a.UserId == userId && a.IsActive))
            .OrderBy(t => t.Name)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<List<Territory>> GetBySalesTeamIdAsync(Guid salesTeamId, CancellationToken cancellationToken = default)
    {
        return await _context.Territories
            .Include(t => t.Assignments)
            .Where(t => t.AssignedSalesTeamId == salesTeamId)
            .OrderBy(t => t.Name)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<int> GetTotalCountAsync(
        TerritoryType? territoryType = null,
        bool? isActive = null,
        Guid? parentTerritoryId = null,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Territories.AsQueryable();

        if (territoryType.HasValue)
            query = query.Where(t => t.TerritoryType == territoryType.Value);
        if (isActive.HasValue)
            query = query.Where(t => t.IsActive == isActive.Value);
        if (parentTerritoryId.HasValue)
            query = query.Where(t => t.ParentTerritoryId == parentTerritoryId.Value);

        return await query.CountAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<bool> IsCodeUniqueAsync(string code, Guid? excludeId = null, CancellationToken cancellationToken = default)
    {
        var query = _context.Territories.Where(t => t.Code == code);
        if (excludeId.HasValue)
            query = query.Where(t => t.Id != excludeId.Value);
        return !await query.AnyAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<Territory> CreateAsync(Territory territory, CancellationToken cancellationToken = default)
    {
        _context.Territories.Add(territory);
        await _context.SaveChangesAsync(cancellationToken);
        return territory;
    }

    public async System.Threading.Tasks.Task UpdateAsync(Territory territory, CancellationToken cancellationToken = default)
    {
        _context.Territories.Update(territory);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var territory = await GetByIdAsync(id, cancellationToken);
        if (territory != null)
        {
            _context.Territories.Remove(territory);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
