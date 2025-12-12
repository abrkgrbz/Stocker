using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CMS.Domain.Entities;
using Stocker.Modules.CMS.Domain.Enums;
using Stocker.Modules.CMS.Domain.Repositories;
using Stocker.Modules.CMS.Infrastructure.Persistence;

namespace Stocker.Modules.CMS.Infrastructure.Repositories;

public class BlogRepository : IBlogRepository
{
    private readonly CMSDbContext _context;

    public BlogRepository(CMSDbContext context)
    {
        _context = context;
    }

    // Categories
    public async Task<BlogCategory?> GetCategoryByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.BlogCategories
            .Include(c => c.Posts)
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
    }

    public async Task<BlogCategory?> GetCategoryBySlugAsync(string slug, CancellationToken cancellationToken = default)
    {
        return await _context.BlogCategories
            .Include(c => c.Posts)
            .FirstOrDefaultAsync(c => c.Slug == slug, cancellationToken);
    }

    public async Task<IEnumerable<BlogCategory>> GetAllCategoriesAsync(CancellationToken cancellationToken = default)
    {
        return await _context.BlogCategories
            .Include(c => c.Posts)
            .OrderBy(c => c.SortOrder)
            .ToListAsync(cancellationToken);
    }

    public async Task<BlogCategory> AddCategoryAsync(BlogCategory category, CancellationToken cancellationToken = default)
    {
        await _context.BlogCategories.AddAsync(category, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        return category;
    }

    public async Task UpdateCategoryAsync(BlogCategory category, CancellationToken cancellationToken = default)
    {
        _context.BlogCategories.Update(category);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteCategoryAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var category = await _context.BlogCategories.FindAsync(new object[] { id }, cancellationToken);
        if (category != null)
        {
            _context.BlogCategories.Remove(category);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }

    // Posts
    public async Task<BlogPost?> GetPostByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.BlogPosts
            .Include(p => p.Category)
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
    }

    public async Task<BlogPost?> GetPostBySlugAsync(string slug, CancellationToken cancellationToken = default)
    {
        return await _context.BlogPosts
            .Include(p => p.Category)
            .FirstOrDefaultAsync(p => p.Slug == slug, cancellationToken);
    }

    public async Task<IEnumerable<BlogPost>> GetAllPostsAsync(CancellationToken cancellationToken = default)
    {
        return await _context.BlogPosts
            .Include(p => p.Category)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<BlogPost>> GetPublishedPostsAsync(CancellationToken cancellationToken = default)
    {
        return await _context.BlogPosts
            .Include(p => p.Category)
            .Where(p => p.Status == BlogPostStatus.Published)
            .OrderByDescending(p => p.PublishedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<BlogPost>> GetPostsByCategoryAsync(Guid categoryId, CancellationToken cancellationToken = default)
    {
        return await _context.BlogPosts
            .Include(p => p.Category)
            .Where(p => p.CategoryId == categoryId)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<BlogPost> AddPostAsync(BlogPost post, CancellationToken cancellationToken = default)
    {
        await _context.BlogPosts.AddAsync(post, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        return post;
    }

    public async Task UpdatePostAsync(BlogPost post, CancellationToken cancellationToken = default)
    {
        _context.BlogPosts.Update(post);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeletePostAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var post = await _context.BlogPosts.FindAsync(new object[] { id }, cancellationToken);
        if (post != null)
        {
            _context.BlogPosts.Remove(post);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task IncrementViewCountAsync(Guid id, CancellationToken cancellationToken = default)
    {
        await _context.BlogPosts
            .Where(p => p.Id == id)
            .ExecuteUpdateAsync(s => s.SetProperty(p => p.ViewCount, p => p.ViewCount + 1), cancellationToken);
    }
}
