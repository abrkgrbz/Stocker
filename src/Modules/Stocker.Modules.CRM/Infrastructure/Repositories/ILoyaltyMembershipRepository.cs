using Stocker.Modules.CRM.Domain.Entities;

namespace Stocker.Modules.CRM.Infrastructure.Repositories;

public interface ILoyaltyMembershipRepository
{
    System.Threading.Tasks.Task<List<LoyaltyMembership>> GetAllAsync(
        Guid? loyaltyProgramId = null,
        Guid? customerId = null,
        bool? isActive = null,
        int skip = 0,
        int take = 100,
        CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task<LoyaltyMembership?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task<LoyaltyMembership?> GetByMembershipNumberAsync(string membershipNumber, CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task<LoyaltyMembership?> GetByCustomerAndProgramAsync(Guid customerId, Guid programId, CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task<List<LoyaltyMembership>> GetByCustomerIdAsync(Guid customerId, CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task<List<LoyaltyMembership>> GetByProgramIdAsync(Guid programId, CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task<List<LoyaltyMembership>> GetExpiringPointsAsync(int daysUntilExpiry, CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task<int> GetTotalCountAsync(
        Guid? loyaltyProgramId = null,
        Guid? customerId = null,
        bool? isActive = null,
        CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task<bool> IsMembershipNumberUniqueAsync(string membershipNumber, Guid? excludeId = null, CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task<LoyaltyMembership> CreateAsync(LoyaltyMembership membership, CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task UpdateAsync(LoyaltyMembership membership, CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
