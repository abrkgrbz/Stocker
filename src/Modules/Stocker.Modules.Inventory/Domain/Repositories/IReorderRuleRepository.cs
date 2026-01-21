using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Domain.Enums;

namespace Stocker.Modules.Inventory.Domain.Repositories;

/// <summary>
/// Repository interface for ReorderRule entity
/// </summary>
public interface IReorderRuleRepository : IInventoryRepository<ReorderRule>
{
    /// <summary>
    /// Gets reorder rule by ID with related entities
    /// </summary>
    Task<ReorderRule?> GetByIdAsync(int id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all active reorder rules
    /// </summary>
    Task<IReadOnlyList<ReorderRule>> GetActiveAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets reorder rules by status
    /// </summary>
    Task<IReadOnlyList<ReorderRule>> GetByStatusAsync(ReorderRuleStatus status, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets reorder rules for a specific product
    /// </summary>
    Task<IReadOnlyList<ReorderRule>> GetByProductAsync(int productId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets reorder rules for a specific category
    /// </summary>
    Task<IReadOnlyList<ReorderRule>> GetByCategoryAsync(int categoryId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets reorder rules for a specific warehouse
    /// </summary>
    Task<IReadOnlyList<ReorderRule>> GetByWarehouseAsync(int warehouseId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets reorder rules for a specific supplier
    /// </summary>
    Task<IReadOnlyList<ReorderRule>> GetBySupplierAsync(int supplierId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets scheduled reorder rules that need to run
    /// </summary>
    Task<IReadOnlyList<ReorderRule>> GetScheduledDueAsync(DateTime beforeTime, CancellationToken cancellationToken = default);
}
