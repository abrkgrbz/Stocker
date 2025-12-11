using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Infrastructure.Persistence;

namespace Stocker.Modules.CRM.Infrastructure.Repositories;

public class LoyaltyProgramRepository : ILoyaltyProgramRepository
{
    private readonly CRMDbContext _context;

    public LoyaltyProgramRepository(CRMDbContext context)
    {
        _context = context;
    }

    public async System.Threading.Tasks.Task<List<LoyaltyProgram>> GetAllAsync(
        LoyaltyProgramType? programType = null,
        bool? isActive = null,
        int skip = 0,
        int take = 100,
        CancellationToken cancellationToken = default)
    {
        var query = _context.LoyaltyPrograms
            .Include(p => p.Tiers)
            .Include(p => p.Rewards)
            .AsQueryable();

        if (programType.HasValue)
            query = query.Where(p => p.ProgramType == programType.Value);
        if (isActive.HasValue)
            query = query.Where(p => p.IsActive == isActive.Value);

        return await query
            .OrderBy(p => p.Name)
            .Skip(skip)
            .Take(take)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<LoyaltyProgram?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.LoyaltyPrograms
            .Include(p => p.Tiers)
            .Include(p => p.Rewards)
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
    }

    public async System.Threading.Tasks.Task<LoyaltyProgram?> GetByCodeAsync(string code, CancellationToken cancellationToken = default)
    {
        return await _context.LoyaltyPrograms
            .Include(p => p.Tiers)
            .Include(p => p.Rewards)
            .FirstOrDefaultAsync(p => p.Code == code, cancellationToken);
    }

    public async System.Threading.Tasks.Task<List<LoyaltyProgram>> GetActiveAsync(CancellationToken cancellationToken = default)
    {
        return await _context.LoyaltyPrograms
            .Include(p => p.Tiers)
            .Include(p => p.Rewards)
            .Where(p => p.IsActive && (p.EndDate == null || p.EndDate > DateTime.UtcNow))
            .OrderBy(p => p.Name)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<int> GetTotalCountAsync(
        LoyaltyProgramType? programType = null,
        bool? isActive = null,
        CancellationToken cancellationToken = default)
    {
        var query = _context.LoyaltyPrograms.AsQueryable();

        if (programType.HasValue)
            query = query.Where(p => p.ProgramType == programType.Value);
        if (isActive.HasValue)
            query = query.Where(p => p.IsActive == isActive.Value);

        return await query.CountAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<bool> IsCodeUniqueAsync(string code, Guid? excludeId = null, CancellationToken cancellationToken = default)
    {
        var query = _context.LoyaltyPrograms.Where(p => p.Code == code);
        if (excludeId.HasValue)
            query = query.Where(p => p.Id != excludeId.Value);
        return !await query.AnyAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<LoyaltyProgram> CreateAsync(LoyaltyProgram program, CancellationToken cancellationToken = default)
    {
        _context.LoyaltyPrograms.Add(program);
        await _context.SaveChangesAsync(cancellationToken);
        return program;
    }

    public async System.Threading.Tasks.Task UpdateAsync(LoyaltyProgram program, CancellationToken cancellationToken = default)
    {
        _context.LoyaltyPrograms.Update(program);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var program = await GetByIdAsync(id, cancellationToken);
        if (program != null)
        {
            _context.LoyaltyPrograms.Remove(program);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
