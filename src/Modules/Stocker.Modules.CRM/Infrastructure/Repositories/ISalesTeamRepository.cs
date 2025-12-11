using Stocker.Modules.CRM.Domain.Entities;

namespace Stocker.Modules.CRM.Infrastructure.Repositories;

public interface ISalesTeamRepository
{
    System.Threading.Tasks.Task<List<SalesTeam>> GetAllAsync(
        bool? isActive = null,
        Guid? territoryId = null,
        string? searchTerm = null,
        int skip = 0,
        int take = 100,
        CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task<SalesTeam?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task<SalesTeam?> GetByCodeAsync(string code, CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task<List<SalesTeam>> GetByTeamLeaderIdAsync(int teamLeaderId, CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task<List<SalesTeam>> GetActiveTeamsAsync(CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task<List<SalesTeam>> GetTeamsByMemberAsync(int userId, CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task<int> GetTotalCountAsync(
        bool? isActive = null,
        CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task<SalesTeam> CreateAsync(SalesTeam salesTeam, CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task UpdateAsync(SalesTeam salesTeam, CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task<bool> CodeExistsAsync(string code, Guid? excludeId = null, CancellationToken cancellationToken = default);
}
