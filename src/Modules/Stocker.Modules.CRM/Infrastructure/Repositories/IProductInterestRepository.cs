using Stocker.Modules.CRM.Domain.Entities;

namespace Stocker.Modules.CRM.Infrastructure.Repositories;

public interface IProductInterestRepository
{
    System.Threading.Tasks.Task<List<ProductInterest>> GetAllAsync(
        Guid? customerId = null,
        Guid? contactId = null,
        Guid? leadId = null,
        int? productId = null,
        InterestStatus? status = null,
        InterestLevel? interestLevel = null,
        int skip = 0,
        int take = 100,
        CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task<ProductInterest?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task<List<ProductInterest>> GetByCustomerIdAsync(Guid customerId, CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task<List<ProductInterest>> GetByLeadIdAsync(Guid leadId, CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task<List<ProductInterest>> GetByProductIdAsync(int productId, CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task<List<ProductInterest>> GetHighInterestAsync(CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task<List<ProductInterest>> GetFollowUpDueAsync(CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task<int> GetTotalCountAsync(
        Guid? customerId = null,
        int? productId = null,
        InterestStatus? status = null,
        CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task<ProductInterest> CreateAsync(ProductInterest productInterest, CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task UpdateAsync(ProductInterest productInterest, CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
