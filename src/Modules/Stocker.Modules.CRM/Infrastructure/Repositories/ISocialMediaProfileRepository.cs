using Stocker.Modules.CRM.Domain.Entities;

namespace Stocker.Modules.CRM.Infrastructure.Repositories;

public interface ISocialMediaProfileRepository
{
    System.Threading.Tasks.Task<List<SocialMediaProfile>> GetAllAsync(
        Guid? customerId = null,
        Guid? contactId = null,
        SocialMediaPlatform? platform = null,
        bool? isActive = null,
        int skip = 0,
        int take = 100,
        CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task<SocialMediaProfile?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task<List<SocialMediaProfile>> GetByCustomerIdAsync(Guid customerId, CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task<List<SocialMediaProfile>> GetByContactIdAsync(Guid contactId, CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task<List<SocialMediaProfile>> GetInfluencersAsync(InfluencerLevel minLevel, CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task<int> GetTotalCountAsync(
        Guid? customerId = null,
        Guid? contactId = null,
        SocialMediaPlatform? platform = null,
        bool? isActive = null,
        CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task<SocialMediaProfile> CreateAsync(SocialMediaProfile profile, CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task UpdateAsync(SocialMediaProfile profile, CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
