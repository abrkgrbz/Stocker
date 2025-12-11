using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Infrastructure.Persistence;

namespace Stocker.Modules.CRM.Infrastructure.Repositories;

public class SocialMediaProfileRepository : ISocialMediaProfileRepository
{
    private readonly CRMDbContext _context;

    public SocialMediaProfileRepository(CRMDbContext context)
    {
        _context = context;
    }

    public async System.Threading.Tasks.Task<List<SocialMediaProfile>> GetAllAsync(
        Guid? customerId = null,
        Guid? contactId = null,
        SocialMediaPlatform? platform = null,
        bool? isActive = null,
        int skip = 0,
        int take = 100,
        CancellationToken cancellationToken = default)
    {
        var query = _context.SocialMediaProfiles.AsQueryable();

        if (customerId.HasValue)
            query = query.Where(p => p.CustomerId == customerId.Value);
        if (contactId.HasValue)
            query = query.Where(p => p.ContactId == contactId.Value);
        if (platform.HasValue)
            query = query.Where(p => p.Platform == platform.Value);
        if (isActive.HasValue)
            query = query.Where(p => p.IsActive == isActive.Value);

        return await query
            .OrderByDescending(p => p.FollowersCount)
            .Skip(skip)
            .Take(take)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<SocialMediaProfile?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.SocialMediaProfiles
            .Include(p => p.Customer)
            .Include(p => p.Contact)
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
    }

    public async System.Threading.Tasks.Task<List<SocialMediaProfile>> GetByCustomerIdAsync(Guid customerId, CancellationToken cancellationToken = default)
    {
        return await _context.SocialMediaProfiles
            .Where(p => p.CustomerId == customerId)
            .OrderBy(p => p.Platform)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<List<SocialMediaProfile>> GetByContactIdAsync(Guid contactId, CancellationToken cancellationToken = default)
    {
        return await _context.SocialMediaProfiles
            .Where(p => p.ContactId == contactId)
            .OrderBy(p => p.Platform)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<List<SocialMediaProfile>> GetInfluencersAsync(InfluencerLevel minLevel, CancellationToken cancellationToken = default)
    {
        return await _context.SocialMediaProfiles
            .Where(p => p.IsActive && p.InfluencerLevel.HasValue && p.InfluencerLevel.Value >= minLevel)
            .OrderByDescending(p => p.InfluenceScore)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<int> GetTotalCountAsync(
        Guid? customerId = null,
        Guid? contactId = null,
        SocialMediaPlatform? platform = null,
        bool? isActive = null,
        CancellationToken cancellationToken = default)
    {
        var query = _context.SocialMediaProfiles.AsQueryable();

        if (customerId.HasValue)
            query = query.Where(p => p.CustomerId == customerId.Value);
        if (contactId.HasValue)
            query = query.Where(p => p.ContactId == contactId.Value);
        if (platform.HasValue)
            query = query.Where(p => p.Platform == platform.Value);
        if (isActive.HasValue)
            query = query.Where(p => p.IsActive == isActive.Value);

        return await query.CountAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<SocialMediaProfile> CreateAsync(SocialMediaProfile profile, CancellationToken cancellationToken = default)
    {
        _context.SocialMediaProfiles.Add(profile);
        await _context.SaveChangesAsync(cancellationToken);
        return profile;
    }

    public async System.Threading.Tasks.Task UpdateAsync(SocialMediaProfile profile, CancellationToken cancellationToken = default)
    {
        _context.SocialMediaProfiles.Update(profile);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var profile = await GetByIdAsync(id, cancellationToken);
        if (profile != null)
        {
            _context.SocialMediaProfiles.Remove(profile);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
