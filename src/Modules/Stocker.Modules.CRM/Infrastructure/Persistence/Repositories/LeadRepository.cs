using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Domain.Enums;
using Stocker.Modules.CRM.Domain.Repositories;

namespace Stocker.Modules.CRM.Infrastructure.Persistence.Repositories;

/// <summary>
/// Repository implementation for Lead entity
/// </summary>
public class LeadRepository : BaseRepository<Lead>, ILeadRepository
{
    public LeadRepository(CRMDbContext context) : base(context)
    {
    }

    public async Task<IReadOnlyList<Lead>> GetByStatusAsync(LeadStatus status, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(l => l.Status == status)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Lead>> GetByRatingAsync(LeadRating rating, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(l => l.Rating == rating)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Lead>> GetByAssignedUserAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(l => l.AssignedToUserId == userId)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Lead>> GetUnassignedLeadsAsync(CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(l => l.AssignedToUserId == null)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Lead>> GetQualifiedLeadsAsync(CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(l => l.Status == LeadStatus.Qualified && l.ConvertedToCustomerId == null)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Lead>> GetConvertedLeadsAsync(CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(l => l.ConvertedToCustomerId != null)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Lead>> SearchAsync(string searchTerm, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(searchTerm))
        {
            return new List<Lead>();
        }

        var searchLower = searchTerm.ToLower();

        return await _dbSet
            .Where(l => l.FirstName.ToLower().Contains(searchLower) ||
                       l.LastName.ToLower().Contains(searchLower) ||
                       (l.CompanyName != null && l.CompanyName.ToLower().Contains(searchLower)) ||
                       l.Email.ToLower().Contains(searchLower))
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> ExistsWithEmailAsync(string email, Guid? excludeLeadId = null, CancellationToken cancellationToken = default)
    {
        var query = _dbSet.Where(l => l.Email.ToLower() == email.ToLower());

        if (excludeLeadId.HasValue)
        {
            query = query.Where(l => l.Id != excludeLeadId.Value);
        }

        return await query.AnyAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Lead>> GetBySourceAsync(string source, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(l => l.Source == source)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Lead>> GetHighScoringLeadsAsync(int minimumScore = 70, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(l => l.Score >= minimumScore)
            .OrderByDescending(l => l.Score)
            .ToListAsync(cancellationToken);
    }

    public IQueryable<Lead> GetQueryable()
    {
        return _dbSet.AsQueryable();
    }
}