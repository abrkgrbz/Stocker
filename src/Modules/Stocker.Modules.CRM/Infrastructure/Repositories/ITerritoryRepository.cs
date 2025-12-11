using Stocker.Modules.CRM.Domain.Entities;

namespace Stocker.Modules.CRM.Infrastructure.Repositories;

public interface ITerritoryRepository
{
    System.Threading.Tasks.Task<List<Territory>> GetAllAsync(
        TerritoryType? territoryType = null,
        bool? isActive = null,
        Guid? parentTerritoryId = null,
        int skip = 0,
        int take = 100,
        CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task<Territory?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task<Territory?> GetByCodeAsync(string code, CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task<List<Territory>> GetChildTerritoriesAsync(Guid parentId, CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task<List<Territory>> GetByUserIdAsync(int userId, CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task<List<Territory>> GetBySalesTeamIdAsync(Guid salesTeamId, CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task<int> GetTotalCountAsync(
        TerritoryType? territoryType = null,
        bool? isActive = null,
        Guid? parentTerritoryId = null,
        CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task<bool> IsCodeUniqueAsync(string code, Guid? excludeId = null, CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task<Territory> CreateAsync(Territory territory, CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task UpdateAsync(Territory territory, CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
