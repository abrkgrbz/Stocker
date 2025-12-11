using Stocker.Modules.Inventory.Domain.Entities;

namespace Stocker.Modules.Inventory.Domain.Repositories;

/// <summary>
/// Repository interface for QualityControl entity
/// </summary>
public interface IQualityControlRepository : IInventoryRepository<QualityControl>
{
    /// <summary>
    /// Gets quality control record by ID with items and attachments
    /// </summary>
    Task<QualityControl?> GetByIdAsync(int id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets quality control record by QC number
    /// </summary>
    Task<QualityControl?> GetByQcNumberAsync(string qcNumber, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets quality control records by product
    /// </summary>
    Task<IReadOnlyList<QualityControl>> GetByProductAsync(int productId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets quality control records by supplier
    /// </summary>
    Task<IReadOnlyList<QualityControl>> GetBySupplierAsync(int supplierId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets quality control records by status
    /// </summary>
    Task<IReadOnlyList<QualityControl>> GetByStatusAsync(QualityControlStatus status, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets quality control records by type
    /// </summary>
    Task<IReadOnlyList<QualityControl>> GetByTypeAsync(QualityControlType qcType, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets pending quality control records
    /// </summary>
    Task<IReadOnlyList<QualityControl>> GetPendingAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets quality control records by date range
    /// </summary>
    Task<IReadOnlyList<QualityControl>> GetByDateRangeAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets failed quality control records by product
    /// </summary>
    Task<IReadOnlyList<QualityControl>> GetFailedByProductAsync(int productId, CancellationToken cancellationToken = default);
}
