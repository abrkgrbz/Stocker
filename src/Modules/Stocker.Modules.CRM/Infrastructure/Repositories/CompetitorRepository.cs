using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Infrastructure.Persistence;

namespace Stocker.Modules.CRM.Infrastructure.Repositories;

public class CompetitorRepository : ICompetitorRepository
{
    private readonly CRMDbContext _context;

    public CompetitorRepository(CRMDbContext context)
    {
        _context = context;
    }

    public async System.Threading.Tasks.Task<List<Competitor>> GetAllAsync(
        bool? isActive = null,
        ThreatLevel? threatLevel = null,
        string? searchTerm = null,
        int skip = 0,
        int take = 100,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Competitors.AsQueryable();

        if (isActive.HasValue)
            query = query.Where(c => c.IsActive == isActive.Value);

        if (threatLevel.HasValue)
            query = query.Where(c => c.ThreatLevel == threatLevel.Value);

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            searchTerm = searchTerm.ToLower();
            query = query.Where(c =>
                c.Name.ToLower().Contains(searchTerm) ||
                (c.Code != null && c.Code.ToLower().Contains(searchTerm)) ||
                (c.Description != null && c.Description.ToLower().Contains(searchTerm)));
        }

        return await query
            .OrderBy(c => c.Name)
            .Skip(skip)
            .Take(take)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<Competitor?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Competitors
            .Include(c => c.Products)
            .Include(c => c.Strengths)
            .Include(c => c.Weaknesses)
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
    }

    public async System.Threading.Tasks.Task<Competitor?> GetByCodeAsync(string code, CancellationToken cancellationToken = default)
    {
        return await _context.Competitors
            .FirstOrDefaultAsync(c => c.Code == code, cancellationToken);
    }

    public async System.Threading.Tasks.Task<List<Competitor>> GetByThreatLevelAsync(ThreatLevel threatLevel, CancellationToken cancellationToken = default)
    {
        return await _context.Competitors
            .Where(c => c.ThreatLevel == threatLevel && c.IsActive)
            .OrderBy(c => c.Name)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<List<Competitor>> GetActiveCompetitorsAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Competitors
            .Where(c => c.IsActive)
            .OrderBy(c => c.Name)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<int> GetTotalCountAsync(
        bool? isActive = null,
        ThreatLevel? threatLevel = null,
        string? searchTerm = null,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Competitors.AsQueryable();

        if (isActive.HasValue)
            query = query.Where(c => c.IsActive == isActive.Value);

        if (threatLevel.HasValue)
            query = query.Where(c => c.ThreatLevel == threatLevel.Value);

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            searchTerm = searchTerm.ToLower();
            query = query.Where(c =>
                c.Name.ToLower().Contains(searchTerm) ||
                (c.Code != null && c.Code.ToLower().Contains(searchTerm)) ||
                (c.Description != null && c.Description.ToLower().Contains(searchTerm)));
        }

        return await query.CountAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<Competitor> CreateAsync(Competitor competitor, CancellationToken cancellationToken = default)
    {
        _context.Competitors.Add(competitor);
        await _context.SaveChangesAsync(cancellationToken);
        return competitor;
    }

    public async System.Threading.Tasks.Task UpdateAsync(Competitor competitor, CancellationToken cancellationToken = default)
    {
        _context.Competitors.Update(competitor);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var competitor = await GetByIdAsync(id, cancellationToken);
        if (competitor != null)
        {
            _context.Competitors.Remove(competitor);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }

    public async System.Threading.Tasks.Task<bool> ExistsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Competitors.AnyAsync(c => c.Id == id, cancellationToken);
    }

    public async System.Threading.Tasks.Task<bool> CodeExistsAsync(string code, Guid? excludeId = null, CancellationToken cancellationToken = default)
    {
        var query = _context.Competitors.Where(c => c.Code == code);

        if (excludeId.HasValue)
            query = query.Where(c => c.Id != excludeId.Value);

        return await query.AnyAsync(cancellationToken);
    }
}
