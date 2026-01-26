using Stocker.Modules.Sales.Domain.Entities;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.Sales.Domain.Repositories;

/// <summary>
/// Repository interface for PromotionUsage entity.
/// Used for tracking customer-specific promotion usage and enforcing per-customer limits.
/// </summary>
public interface IPromotionUsageRepository : IRepository<PromotionUsage>
{
    /// <summary>
    /// Gets the usage count for a specific customer and promotion.
    /// </summary>
    Task<int> GetCustomerUsageCountAsync(
        Guid promotionId,
        Guid customerId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all usage records for a specific promotion.
    /// </summary>
    Task<IReadOnlyList<PromotionUsage>> GetByPromotionIdAsync(
        Guid promotionId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all usage records for a specific customer.
    /// </summary>
    Task<IReadOnlyList<PromotionUsage>> GetByCustomerIdAsync(
        Guid customerId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if a promotion has been used for a specific order.
    /// </summary>
    Task<bool> ExistsForOrderAsync(
        Guid promotionId,
        Guid orderId,
        CancellationToken cancellationToken = default);
}
