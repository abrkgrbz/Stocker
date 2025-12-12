using Stocker.Modules.CMS.Domain.Entities;

namespace Stocker.Modules.CMS.Domain.Repositories;

public interface IBlogRepository
{
    // Categories
    Task<BlogCategory?> GetCategoryByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<BlogCategory?> GetCategoryBySlugAsync(string slug, CancellationToken cancellationToken = default);
    Task<IEnumerable<BlogCategory>> GetAllCategoriesAsync(CancellationToken cancellationToken = default);
    Task<BlogCategory> AddCategoryAsync(BlogCategory category, CancellationToken cancellationToken = default);
    Task UpdateCategoryAsync(BlogCategory category, CancellationToken cancellationToken = default);
    Task DeleteCategoryAsync(Guid id, CancellationToken cancellationToken = default);

    // Posts
    Task<BlogPost?> GetPostByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<BlogPost?> GetPostBySlugAsync(string slug, CancellationToken cancellationToken = default);
    Task<IEnumerable<BlogPost>> GetAllPostsAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<BlogPost>> GetPublishedPostsAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<BlogPost>> GetPostsByCategoryAsync(Guid categoryId, CancellationToken cancellationToken = default);
    Task<BlogPost> AddPostAsync(BlogPost post, CancellationToken cancellationToken = default);
    Task UpdatePostAsync(BlogPost post, CancellationToken cancellationToken = default);
    Task DeletePostAsync(Guid id, CancellationToken cancellationToken = default);
    Task IncrementViewCountAsync(Guid id, CancellationToken cancellationToken = default);
}
