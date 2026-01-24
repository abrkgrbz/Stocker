using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Application.Services;

/// <summary>
/// Service for resource-level authorization within the Sales module.
/// Validates that the current user has access to specific resources
/// beyond tenant-level isolation (e.g., territory-based, ownership-based).
/// </summary>
public interface IResourceAuthorizationService
{
    /// <summary>
    /// Checks if the current user can access a sales order.
    /// Managers can access all orders; sales reps can only access orders
    /// in their assigned territories or where they are the sales person.
    /// </summary>
    Task<Result<bool>> CanAccessSalesOrderAsync(Guid orderId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if the current user can modify a sales order.
    /// Only the assigned sales person or a manager can modify orders.
    /// </summary>
    Task<Result<bool>> CanModifySalesOrderAsync(Guid orderId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the list of territory IDs the current user is assigned to.
    /// Returns empty list for managers (they have access to all territories).
    /// </summary>
    Task<IReadOnlyList<Guid>> GetUserTerritoryIdsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if the current user has manager-level access (bypasses resource checks).
    /// </summary>
    bool IsManager();
}
