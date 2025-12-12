using Stocker.Modules.CMS.Domain.Entities;

namespace Stocker.Modules.CMS.Domain.Repositories;

public interface ICMSPageRepository
{
    Task<CMSPage?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<CMSPage?> GetBySlugAsync(string slug, CancellationToken cancellationToken = default);
    Task<IEnumerable<CMSPage>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<CMSPage>> GetPublishedAsync(CancellationToken cancellationToken = default);
    Task<CMSPage> AddAsync(CMSPage page, CancellationToken cancellationToken = default);
    Task UpdateAsync(CMSPage page, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
