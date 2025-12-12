using Stocker.Modules.CMS.Domain.Entities;

namespace Stocker.Modules.CMS.Domain.Repositories;

public interface IDocCategoryRepository
{
    Task<DocCategory?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<DocCategory?> GetByIdWithArticlesAsync(Guid id, CancellationToken cancellationToken = default);
    Task<DocCategory?> GetBySlugAsync(string slug, CancellationToken cancellationToken = default);
    Task<IEnumerable<DocCategory>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<DocCategory>> GetAllWithArticlesAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<DocCategory>> GetActiveAsync(CancellationToken cancellationToken = default);
    Task<DocCategory> AddAsync(DocCategory entity, CancellationToken cancellationToken = default);
    Task UpdateAsync(DocCategory entity, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}

public interface IDocArticleRepository
{
    Task<DocArticle?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<DocArticle?> GetBySlugAsync(string slug, CancellationToken cancellationToken = default);
    Task<IEnumerable<DocArticle>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<DocArticle>> GetActiveAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<DocArticle>> GetByCategoryIdAsync(Guid categoryId, CancellationToken cancellationToken = default);
    Task<IEnumerable<DocArticle>> GetPopularAsync(CancellationToken cancellationToken = default);
    Task<DocArticle> AddAsync(DocArticle entity, CancellationToken cancellationToken = default);
    Task UpdateAsync(DocArticle entity, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    Task IncrementViewCountAsync(Guid id, CancellationToken cancellationToken = default);
}
