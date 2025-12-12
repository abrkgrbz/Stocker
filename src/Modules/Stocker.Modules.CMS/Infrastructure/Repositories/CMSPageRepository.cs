using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CMS.Domain.Entities;
using Stocker.Modules.CMS.Domain.Enums;
using Stocker.Modules.CMS.Domain.Repositories;
using Stocker.Modules.CMS.Infrastructure.Persistence;

namespace Stocker.Modules.CMS.Infrastructure.Repositories;

public class CMSPageRepository : ICMSPageRepository
{
    private readonly CMSDbContext _context;

    public CMSPageRepository(CMSDbContext context)
    {
        _context = context;
    }

    public async Task<CMSPage?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Pages.FindAsync(new object[] { id }, cancellationToken);
    }

    public async Task<CMSPage?> GetBySlugAsync(string slug, CancellationToken cancellationToken = default)
    {
        return await _context.Pages
            .FirstOrDefaultAsync(p => p.Slug == slug, cancellationToken);
    }

    public async Task<IEnumerable<CMSPage>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Pages
            .OrderBy(p => p.SortOrder)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<CMSPage>> GetPublishedAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Pages
            .Where(p => p.Status == PageStatus.Published)
            .OrderBy(p => p.SortOrder)
            .ToListAsync(cancellationToken);
    }

    public async Task<CMSPage> AddAsync(CMSPage page, CancellationToken cancellationToken = default)
    {
        await _context.Pages.AddAsync(page, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        return page;
    }

    public async Task UpdateAsync(CMSPage page, CancellationToken cancellationToken = default)
    {
        _context.Pages.Update(page);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var page = await GetByIdAsync(id, cancellationToken);
        if (page != null)
        {
            _context.Pages.Remove(page);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
