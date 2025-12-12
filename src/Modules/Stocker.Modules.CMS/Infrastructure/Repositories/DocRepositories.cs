using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CMS.Domain.Entities;
using Stocker.Modules.CMS.Domain.Repositories;
using Stocker.Modules.CMS.Infrastructure.Persistence;

namespace Stocker.Modules.CMS.Infrastructure.Repositories;

public class DocCategoryRepository : IDocCategoryRepository
{
    private readonly CMSDbContext _context;

    public DocCategoryRepository(CMSDbContext context)
    {
        _context = context;
    }

    public async Task<DocCategory?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.DocCategories.FindAsync(new object[] { id }, cancellationToken);
    }

    public async Task<DocCategory?> GetByIdWithArticlesAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.DocCategories
            .Include(c => c.Articles)
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
    }

    public async Task<DocCategory?> GetBySlugAsync(string slug, CancellationToken cancellationToken = default)
    {
        return await _context.DocCategories
            .FirstOrDefaultAsync(c => c.Slug == slug, cancellationToken);
    }

    public async Task<IEnumerable<DocCategory>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.DocCategories
            .OrderBy(c => c.SortOrder)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<DocCategory>> GetAllWithArticlesAsync(CancellationToken cancellationToken = default)
    {
        return await _context.DocCategories
            .Include(c => c.Articles.OrderBy(a => a.SortOrder))
            .OrderBy(c => c.SortOrder)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<DocCategory>> GetActiveAsync(CancellationToken cancellationToken = default)
    {
        return await _context.DocCategories
            .Include(c => c.Articles.Where(a => a.IsActive).OrderBy(a => a.SortOrder))
            .Where(c => c.IsActive)
            .OrderBy(c => c.SortOrder)
            .ToListAsync(cancellationToken);
    }

    public async Task<DocCategory> AddAsync(DocCategory entity, CancellationToken cancellationToken = default)
    {
        await _context.DocCategories.AddAsync(entity, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        return entity;
    }

    public async Task UpdateAsync(DocCategory entity, CancellationToken cancellationToken = default)
    {
        _context.DocCategories.Update(entity);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await GetByIdAsync(id, cancellationToken);
        if (entity != null)
        {
            _context.DocCategories.Remove(entity);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}

public class DocArticleRepository : IDocArticleRepository
{
    private readonly CMSDbContext _context;

    public DocArticleRepository(CMSDbContext context)
    {
        _context = context;
    }

    public async Task<DocArticle?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.DocArticles.FindAsync(new object[] { id }, cancellationToken);
    }

    public async Task<DocArticle?> GetBySlugAsync(string slug, CancellationToken cancellationToken = default)
    {
        return await _context.DocArticles
            .Include(a => a.Category)
            .FirstOrDefaultAsync(a => a.Slug == slug, cancellationToken);
    }

    public async Task<IEnumerable<DocArticle>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.DocArticles
            .Include(a => a.Category)
            .OrderBy(a => a.SortOrder)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<DocArticle>> GetActiveAsync(CancellationToken cancellationToken = default)
    {
        return await _context.DocArticles
            .Include(a => a.Category)
            .Where(a => a.IsActive)
            .OrderBy(a => a.SortOrder)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<DocArticle>> GetByCategoryIdAsync(Guid categoryId, CancellationToken cancellationToken = default)
    {
        return await _context.DocArticles
            .Where(a => a.CategoryId == categoryId && a.IsActive)
            .OrderBy(a => a.SortOrder)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<DocArticle>> GetPopularAsync(CancellationToken cancellationToken = default)
    {
        return await _context.DocArticles
            .Include(a => a.Category)
            .Where(a => a.IsActive)
            .OrderByDescending(a => a.ViewCount)
            .Take(10)
            .ToListAsync(cancellationToken);
    }

    public async Task<DocArticle> AddAsync(DocArticle entity, CancellationToken cancellationToken = default)
    {
        await _context.DocArticles.AddAsync(entity, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        return entity;
    }

    public async Task UpdateAsync(DocArticle entity, CancellationToken cancellationToken = default)
    {
        _context.DocArticles.Update(entity);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await GetByIdAsync(id, cancellationToken);
        if (entity != null)
        {
            _context.DocArticles.Remove(entity);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task IncrementViewCountAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await GetByIdAsync(id, cancellationToken);
        if (entity != null)
        {
            entity.ViewCount++;
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
