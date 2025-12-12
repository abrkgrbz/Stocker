using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CMS.Domain.Entities;
using Stocker.Modules.CMS.Domain.Repositories;
using Stocker.Modules.CMS.Infrastructure.Persistence;

namespace Stocker.Modules.CMS.Infrastructure.Repositories;

public class FAQRepository : IFAQRepository
{
    private readonly CMSDbContext _context;

    public FAQRepository(CMSDbContext context)
    {
        _context = context;
    }

    // Categories
    public async Task<FAQCategory?> GetCategoryByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.FAQCategories
            .Include(c => c.Items)
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
    }

    public async Task<FAQCategory?> GetCategoryBySlugAsync(string slug, CancellationToken cancellationToken = default)
    {
        return await _context.FAQCategories
            .Include(c => c.Items)
            .FirstOrDefaultAsync(c => c.Slug == slug, cancellationToken);
    }

    public async Task<IEnumerable<FAQCategory>> GetAllCategoriesAsync(CancellationToken cancellationToken = default)
    {
        return await _context.FAQCategories
            .Include(c => c.Items.OrderBy(i => i.SortOrder))
            .OrderBy(c => c.SortOrder)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<FAQCategory>> GetActiveCategoriesAsync(CancellationToken cancellationToken = default)
    {
        return await _context.FAQCategories
            .Include(c => c.Items.Where(i => i.IsActive).OrderBy(i => i.SortOrder))
            .Where(c => c.IsActive)
            .OrderBy(c => c.SortOrder)
            .ToListAsync(cancellationToken);
    }

    public async Task<FAQCategory> AddCategoryAsync(FAQCategory category, CancellationToken cancellationToken = default)
    {
        await _context.FAQCategories.AddAsync(category, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        return category;
    }

    public async Task UpdateCategoryAsync(FAQCategory category, CancellationToken cancellationToken = default)
    {
        _context.FAQCategories.Update(category);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteCategoryAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var category = await _context.FAQCategories.FindAsync(new object[] { id }, cancellationToken);
        if (category != null)
        {
            _context.FAQCategories.Remove(category);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }

    // Items
    public async Task<FAQItem?> GetItemByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.FAQItems
            .Include(i => i.Category)
            .FirstOrDefaultAsync(i => i.Id == id, cancellationToken);
    }

    public async Task<IEnumerable<FAQItem>> GetAllItemsAsync(CancellationToken cancellationToken = default)
    {
        return await _context.FAQItems
            .Include(i => i.Category)
            .OrderBy(i => i.Category.SortOrder)
            .ThenBy(i => i.SortOrder)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<FAQItem>> GetItemsByCategoryAsync(Guid categoryId, CancellationToken cancellationToken = default)
    {
        return await _context.FAQItems
            .Include(i => i.Category)
            .Where(i => i.CategoryId == categoryId)
            .OrderBy(i => i.SortOrder)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<FAQItem>> GetActiveItemsAsync(CancellationToken cancellationToken = default)
    {
        return await _context.FAQItems
            .Include(i => i.Category)
            .Where(i => i.IsActive && i.Category.IsActive)
            .OrderBy(i => i.Category.SortOrder)
            .ThenBy(i => i.SortOrder)
            .ToListAsync(cancellationToken);
    }

    public async Task<FAQItem> AddItemAsync(FAQItem item, CancellationToken cancellationToken = default)
    {
        await _context.FAQItems.AddAsync(item, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        return item;
    }

    public async Task UpdateItemAsync(FAQItem item, CancellationToken cancellationToken = default)
    {
        _context.FAQItems.Update(item);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteItemAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var item = await _context.FAQItems.FindAsync(new object[] { id }, cancellationToken);
        if (item != null)
        {
            _context.FAQItems.Remove(item);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task IncrementViewCountAsync(Guid id, CancellationToken cancellationToken = default)
    {
        await _context.FAQItems
            .Where(i => i.Id == id)
            .ExecuteUpdateAsync(s => s.SetProperty(i => i.ViewCount, i => i.ViewCount + 1), cancellationToken);
    }

    public async Task IncrementHelpfulCountAsync(Guid id, bool helpful, CancellationToken cancellationToken = default)
    {
        if (helpful)
        {
            await _context.FAQItems
                .Where(i => i.Id == id)
                .ExecuteUpdateAsync(s => s.SetProperty(i => i.HelpfulCount, i => i.HelpfulCount + 1), cancellationToken);
        }
        else
        {
            await _context.FAQItems
                .Where(i => i.Id == id)
                .ExecuteUpdateAsync(s => s.SetProperty(i => i.NotHelpfulCount, i => i.NotHelpfulCount + 1), cancellationToken);
        }
    }
}
