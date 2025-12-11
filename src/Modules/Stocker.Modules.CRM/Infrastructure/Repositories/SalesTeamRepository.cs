using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Infrastructure.Persistence;

namespace Stocker.Modules.CRM.Infrastructure.Repositories;

public class SalesTeamRepository : ISalesTeamRepository
{
    private readonly CRMDbContext _context;

    public SalesTeamRepository(CRMDbContext context)
    {
        _context = context;
    }

    public async System.Threading.Tasks.Task<List<SalesTeam>> GetAllAsync(
        bool? isActive = null,
        Guid? territoryId = null,
        string? searchTerm = null,
        int skip = 0,
        int take = 100,
        CancellationToken cancellationToken = default)
    {
        var query = _context.SalesTeams.AsQueryable();

        if (isActive.HasValue)
            query = query.Where(s => s.IsActive == isActive.Value);

        if (territoryId.HasValue)
            query = query.Where(s => s.TerritoryId == territoryId.Value);

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            searchTerm = searchTerm.ToLower();
            query = query.Where(s =>
                s.Name.ToLower().Contains(searchTerm) ||
                s.Code.ToLower().Contains(searchTerm) ||
                (s.Description != null && s.Description.ToLower().Contains(searchTerm)));
        }

        return await query
            .OrderBy(s => s.Name)
            .Skip(skip)
            .Take(take)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<SalesTeam?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.SalesTeams
            .Include(s => s.ParentTeam)
            .Include(s => s.Territory)
            .Include(s => s.Members)
            .FirstOrDefaultAsync(s => s.Id == id, cancellationToken);
    }

    public async System.Threading.Tasks.Task<SalesTeam?> GetByCodeAsync(string code, CancellationToken cancellationToken = default)
    {
        return await _context.SalesTeams
            .FirstOrDefaultAsync(s => s.Code == code, cancellationToken);
    }

    public async System.Threading.Tasks.Task<List<SalesTeam>> GetByTeamLeaderIdAsync(int teamLeaderId, CancellationToken cancellationToken = default)
    {
        return await _context.SalesTeams
            .Where(s => s.TeamLeaderId == teamLeaderId && s.IsActive)
            .OrderBy(s => s.Name)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<List<SalesTeam>> GetActiveTeamsAsync(CancellationToken cancellationToken = default)
    {
        return await _context.SalesTeams
            .Where(s => s.IsActive)
            .OrderBy(s => s.Name)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<List<SalesTeam>> GetTeamsByMemberAsync(int userId, CancellationToken cancellationToken = default)
    {
        return await _context.SalesTeams
            .Where(s => s.Members.Any(m => m.UserId == userId && m.IsActive))
            .OrderBy(s => s.Name)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<int> GetTotalCountAsync(
        bool? isActive = null,
        CancellationToken cancellationToken = default)
    {
        var query = _context.SalesTeams.AsQueryable();

        if (isActive.HasValue)
            query = query.Where(s => s.IsActive == isActive.Value);

        return await query.CountAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<SalesTeam> CreateAsync(SalesTeam salesTeam, CancellationToken cancellationToken = default)
    {
        _context.SalesTeams.Add(salesTeam);
        await _context.SaveChangesAsync(cancellationToken);
        return salesTeam;
    }

    public async System.Threading.Tasks.Task UpdateAsync(SalesTeam salesTeam, CancellationToken cancellationToken = default)
    {
        _context.SalesTeams.Update(salesTeam);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var salesTeam = await GetByIdAsync(id, cancellationToken);
        if (salesTeam != null)
        {
            _context.SalesTeams.Remove(salesTeam);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }

    public async System.Threading.Tasks.Task<bool> CodeExistsAsync(string code, Guid? excludeId = null, CancellationToken cancellationToken = default)
    {
        var query = _context.SalesTeams.Where(s => s.Code == code);

        if (excludeId.HasValue)
            query = query.Where(s => s.Id != excludeId.Value);

        return await query.AnyAsync(cancellationToken);
    }
}
