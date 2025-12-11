using Stocker.Modules.CRM.Domain.Entities;

namespace Stocker.Modules.CRM.Infrastructure.Repositories;

public interface ICompetitorRepository
{
    System.Threading.Tasks.Task<List<Competitor>> GetAllAsync(
        bool? isActive = null,
        ThreatLevel? threatLevel = null,
        string? searchTerm = null,
        int skip = 0,
        int take = 100,
        CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task<Competitor?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task<Competitor?> GetByCodeAsync(string code, CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task<List<Competitor>> GetByThreatLevelAsync(ThreatLevel threatLevel, CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task<List<Competitor>> GetActiveCompetitorsAsync(CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task<int> GetTotalCountAsync(
        bool? isActive = null,
        ThreatLevel? threatLevel = null,
        string? searchTerm = null,
        CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task<Competitor> CreateAsync(Competitor competitor, CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task UpdateAsync(Competitor competitor, CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task<bool> ExistsAsync(Guid id, CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task<bool> CodeExistsAsync(string code, Guid? excludeId = null, CancellationToken cancellationToken = default);
}
