using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CMS.Domain.Entities;
using Stocker.Modules.CMS.Domain.Repositories;
using Stocker.Modules.CMS.Infrastructure.Persistence;

namespace Stocker.Modules.CMS.Infrastructure.Repositories;

public class TeamMemberRepository : ITeamMemberRepository
{
    private readonly CMSDbContext _context;

    public TeamMemberRepository(CMSDbContext context)
    {
        _context = context;
    }

    public async Task<TeamMember?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.TeamMembers.FindAsync(new object[] { id }, cancellationToken);
    }

    public async Task<IEnumerable<TeamMember>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.TeamMembers
            .OrderBy(t => t.SortOrder)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<TeamMember>> GetActiveAsync(CancellationToken cancellationToken = default)
    {
        return await _context.TeamMembers
            .Where(t => t.IsActive)
            .OrderBy(t => t.SortOrder)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<TeamMember>> GetLeadershipAsync(CancellationToken cancellationToken = default)
    {
        return await _context.TeamMembers
            .Where(t => t.IsActive && t.IsLeadership)
            .OrderBy(t => t.SortOrder)
            .ToListAsync(cancellationToken);
    }

    public async Task<TeamMember> AddAsync(TeamMember entity, CancellationToken cancellationToken = default)
    {
        await _context.TeamMembers.AddAsync(entity, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        return entity;
    }

    public async Task UpdateAsync(TeamMember entity, CancellationToken cancellationToken = default)
    {
        _context.TeamMembers.Update(entity);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await GetByIdAsync(id, cancellationToken);
        if (entity != null)
        {
            _context.TeamMembers.Remove(entity);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}

public class CompanyValueRepository : ICompanyValueRepository
{
    private readonly CMSDbContext _context;

    public CompanyValueRepository(CMSDbContext context)
    {
        _context = context;
    }

    public async Task<CompanyValue?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.CompanyValues.FindAsync(new object[] { id }, cancellationToken);
    }

    public async Task<IEnumerable<CompanyValue>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.CompanyValues
            .OrderBy(v => v.SortOrder)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<CompanyValue>> GetActiveAsync(CancellationToken cancellationToken = default)
    {
        return await _context.CompanyValues
            .Where(v => v.IsActive)
            .OrderBy(v => v.SortOrder)
            .ToListAsync(cancellationToken);
    }

    public async Task<CompanyValue> AddAsync(CompanyValue entity, CancellationToken cancellationToken = default)
    {
        await _context.CompanyValues.AddAsync(entity, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        return entity;
    }

    public async Task UpdateAsync(CompanyValue entity, CancellationToken cancellationToken = default)
    {
        _context.CompanyValues.Update(entity);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await GetByIdAsync(id, cancellationToken);
        if (entity != null)
        {
            _context.CompanyValues.Remove(entity);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}

public class ContactInfoRepository : IContactInfoRepository
{
    private readonly CMSDbContext _context;

    public ContactInfoRepository(CMSDbContext context)
    {
        _context = context;
    }

    public async Task<ContactInfo?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.ContactInfos.FindAsync(new object[] { id }, cancellationToken);
    }

    public async Task<IEnumerable<ContactInfo>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.ContactInfos
            .OrderBy(c => c.SortOrder)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<ContactInfo>> GetActiveAsync(CancellationToken cancellationToken = default)
    {
        return await _context.ContactInfos
            .Where(c => c.IsActive)
            .OrderBy(c => c.SortOrder)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<ContactInfo>> GetByTypeAsync(string type, CancellationToken cancellationToken = default)
    {
        return await _context.ContactInfos
            .Where(c => c.IsActive && c.Type == type)
            .OrderBy(c => c.SortOrder)
            .ToListAsync(cancellationToken);
    }

    public async Task<ContactInfo> AddAsync(ContactInfo entity, CancellationToken cancellationToken = default)
    {
        await _context.ContactInfos.AddAsync(entity, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        return entity;
    }

    public async Task UpdateAsync(ContactInfo entity, CancellationToken cancellationToken = default)
    {
        _context.ContactInfos.Update(entity);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await GetByIdAsync(id, cancellationToken);
        if (entity != null)
        {
            _context.ContactInfos.Remove(entity);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}

public class SocialLinkRepository : ISocialLinkRepository
{
    private readonly CMSDbContext _context;

    public SocialLinkRepository(CMSDbContext context)
    {
        _context = context;
    }

    public async Task<SocialLink?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.SocialLinks.FindAsync(new object[] { id }, cancellationToken);
    }

    public async Task<IEnumerable<SocialLink>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.SocialLinks
            .OrderBy(s => s.SortOrder)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<SocialLink>> GetActiveAsync(CancellationToken cancellationToken = default)
    {
        return await _context.SocialLinks
            .Where(s => s.IsActive)
            .OrderBy(s => s.SortOrder)
            .ToListAsync(cancellationToken);
    }

    public async Task<SocialLink> AddAsync(SocialLink entity, CancellationToken cancellationToken = default)
    {
        await _context.SocialLinks.AddAsync(entity, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        return entity;
    }

    public async Task UpdateAsync(SocialLink entity, CancellationToken cancellationToken = default)
    {
        _context.SocialLinks.Update(entity);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await GetByIdAsync(id, cancellationToken);
        if (entity != null)
        {
            _context.SocialLinks.Remove(entity);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
