using Stocker.Modules.CRM.Domain.Entities;

namespace Stocker.Modules.CRM.Infrastructure.Repositories;

public interface IReferralRepository
{
    System.Threading.Tasks.Task<List<Referral>> GetAllAsync(
        Guid? referrerCustomerId = null,
        Guid? referredCustomerId = null,
        ReferralStatus? status = null,
        ReferralType? referralType = null,
        bool? rewardPaid = null,
        int skip = 0,
        int take = 100,
        CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task<Referral?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task<Referral?> GetByCodeAsync(string referralCode, CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task<List<Referral>> GetByReferrerCustomerIdAsync(Guid customerId, CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task<List<Referral>> GetPendingRewardsAsync(CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task<List<Referral>> GetExpiredReferralsAsync(CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task<int> GetTotalCountAsync(
        ReferralStatus? status = null,
        bool? rewardPaid = null,
        CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task<Referral> CreateAsync(Referral referral, CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task UpdateAsync(Referral referral, CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task<bool> CodeExistsAsync(string code, CancellationToken cancellationToken = default);
}
