using Stocker.Modules.CMS.Domain.Entities;

namespace Stocker.Modules.CMS.Domain.Repositories;

public interface ICMSSettingRepository
{
    Task<CMSSetting?> GetByKeyAsync(string key, CancellationToken cancellationToken = default);
    Task<IEnumerable<CMSSetting>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<CMSSetting>> GetByGroupAsync(string group, CancellationToken cancellationToken = default);
    Task<CMSSetting> UpsertAsync(CMSSetting setting, CancellationToken cancellationToken = default);
    Task DeleteAsync(string key, CancellationToken cancellationToken = default);
}
