using Stocker.Modules.CRM.Domain.Entities;

namespace Stocker.Modules.CRM.Infrastructure.Repositories;

public interface ILoyaltyProgramRepository
{
    System.Threading.Tasks.Task<List<LoyaltyProgram>> GetAllAsync(
        LoyaltyProgramType? programType = null,
        bool? isActive = null,
        int skip = 0,
        int take = 100,
        CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task<LoyaltyProgram?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task<LoyaltyProgram?> GetByCodeAsync(string code, CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task<List<LoyaltyProgram>> GetActiveAsync(CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task<int> GetTotalCountAsync(
        LoyaltyProgramType? programType = null,
        bool? isActive = null,
        CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task<bool> IsCodeUniqueAsync(string code, Guid? excludeId = null, CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task<LoyaltyProgram> CreateAsync(LoyaltyProgram program, CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task UpdateAsync(LoyaltyProgram program, CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
