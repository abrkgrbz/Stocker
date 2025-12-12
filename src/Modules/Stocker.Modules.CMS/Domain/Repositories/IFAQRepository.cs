using Stocker.Modules.CMS.Domain.Entities;

namespace Stocker.Modules.CMS.Domain.Repositories;

public interface IFAQRepository
{
    // Categories
    Task<FAQCategory?> GetCategoryByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<FAQCategory?> GetCategoryBySlugAsync(string slug, CancellationToken cancellationToken = default);
    Task<IEnumerable<FAQCategory>> GetAllCategoriesAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<FAQCategory>> GetActiveCategoriesAsync(CancellationToken cancellationToken = default);
    Task<FAQCategory> AddCategoryAsync(FAQCategory category, CancellationToken cancellationToken = default);
    Task UpdateCategoryAsync(FAQCategory category, CancellationToken cancellationToken = default);
    Task DeleteCategoryAsync(Guid id, CancellationToken cancellationToken = default);

    // Items
    Task<FAQItem?> GetItemByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<FAQItem>> GetAllItemsAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<FAQItem>> GetItemsByCategoryAsync(Guid categoryId, CancellationToken cancellationToken = default);
    Task<IEnumerable<FAQItem>> GetActiveItemsAsync(CancellationToken cancellationToken = default);
    Task<FAQItem> AddItemAsync(FAQItem item, CancellationToken cancellationToken = default);
    Task UpdateItemAsync(FAQItem item, CancellationToken cancellationToken = default);
    Task DeleteItemAsync(Guid id, CancellationToken cancellationToken = default);
    Task IncrementViewCountAsync(Guid id, CancellationToken cancellationToken = default);
    Task IncrementHelpfulCountAsync(Guid id, bool helpful, CancellationToken cancellationToken = default);
}
