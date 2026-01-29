using Stocker.Modules.Manufacturing.Domain.Entities;

namespace Stocker.Modules.Manufacturing.Domain.Repositories;

public interface IQualityInspectionRepository
{
    Task<QualityInspection?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<QualityInspection?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default);
    Task<QualityInspection?> GetByInspectionNumberAsync(Guid tenantId, string inspectionNumber, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<QualityInspection>> GetAllAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<QualityInspection>> GetByProductionOrderAsync(int productionOrderId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<QualityInspection>> GetByProductAsync(Guid tenantId, Guid productId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<QualityInspection>> GetByTypeAsync(Guid tenantId, string inspectionType, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<QualityInspection>> GetByResultAsync(Guid tenantId, string result, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<QualityInspection>> GetByInspectorAsync(Guid inspectorId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<QualityInspection>> GetByDateRangeAsync(Guid tenantId, DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<QualityInspection>> GetOpenAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<QualityInspection>> GetWithNonConformanceAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<string> GenerateInspectionNumberAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task AddAsync(QualityInspection inspection, CancellationToken cancellationToken = default);
    void Update(QualityInspection inspection);
    void Delete(QualityInspection inspection);
}
