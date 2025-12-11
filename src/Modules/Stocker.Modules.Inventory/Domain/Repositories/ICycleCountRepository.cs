using Stocker.Modules.Inventory.Domain.Entities;

namespace Stocker.Modules.Inventory.Domain.Repositories;

/// <summary>
/// Repository interface for CycleCount entity
/// </summary>
public interface ICycleCountRepository : IInventoryRepository<CycleCount>
{
    /// <summary>
    /// Gets cycle count by ID with items
    /// </summary>
    Task<CycleCount?> GetByIdAsync(int id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets cycle count by plan number
    /// </summary>
    Task<CycleCount?> GetByPlanNumberAsync(string planNumber, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets cycle counts by warehouse
    /// </summary>
    Task<IReadOnlyList<CycleCount>> GetByWarehouseAsync(int warehouseId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets cycle counts by status
    /// </summary>
    Task<IReadOnlyList<CycleCount>> GetByStatusAsync(CycleCountStatus status, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets cycle counts by type
    /// </summary>
    Task<IReadOnlyList<CycleCount>> GetByTypeAsync(CycleCountType countType, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets planned cycle counts
    /// </summary>
    Task<IReadOnlyList<CycleCount>> GetPlannedAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets cycle counts in progress
    /// </summary>
    Task<IReadOnlyList<CycleCount>> GetInProgressAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets cycle counts by date range
    /// </summary>
    Task<IReadOnlyList<CycleCount>> GetByScheduledDateRangeAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets cycle counts assigned to user
    /// </summary>
    Task<IReadOnlyList<CycleCount>> GetByAssignedUserAsync(Guid userId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets upcoming scheduled cycle counts
    /// </summary>
    Task<IReadOnlyList<CycleCount>> GetUpcomingAsync(int daysAhead, CancellationToken cancellationToken = default);
}
