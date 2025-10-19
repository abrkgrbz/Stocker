using Stocker.Modules.CRM.Domain.Entities;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.CRM.Domain.Repositories;

/// <summary>
/// Repository interface for Deal entity
/// </summary>
public interface IDealRepository : IRepository<Deal>
{
    /// <summary>
    /// Gets a deal with its products
    /// </summary>
    Task<Deal?> GetWithProductsAsync(Guid dealId, Guid tenantId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all deals for a customer
    /// </summary>
    Task<IReadOnlyList<Deal>> GetByCustomerIdAsync(Guid customerId, Guid tenantId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all deals in a specific pipeline stage
    /// </summary>
    Task<IReadOnlyList<Deal>> GetByStageIdAsync(Guid stageId, Guid tenantId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all open deals for a specific owner
    /// </summary>
    Task<IReadOnlyList<Deal>> GetOpenDealsByOwnerAsync(int ownerId, Guid tenantId, CancellationToken cancellationToken = default);
}
