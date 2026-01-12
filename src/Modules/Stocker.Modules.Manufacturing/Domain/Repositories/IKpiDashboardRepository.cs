using Stocker.Modules.Manufacturing.Domain.Entities;
using Stocker.Modules.Manufacturing.Domain.Enums;

namespace Stocker.Modules.Manufacturing.Domain.Repositories;

public interface IKpiDefinitionRepository
{
    Task<KpiDefinition?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<KpiDefinition?> GetByCodeAsync(string code, CancellationToken cancellationToken = default);
    Task<KpiDefinition?> GetWithValuesAsync(int id, CancellationToken cancellationToken = default);
    Task<KpiDefinition?> GetWithTargetsAsync(int id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<KpiDefinition>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<KpiDefinition>> GetActiveAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<KpiDefinition>> GetByTypeAsync(KpiType type, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<KpiDefinition>> GetByCategoryAsync(string category, CancellationToken cancellationToken = default);

    void Add(KpiDefinition kpiDefinition);
    void Update(KpiDefinition kpiDefinition);
    void Delete(KpiDefinition kpiDefinition);
}

public interface IKpiValueRepository
{
    Task<KpiValue?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<KpiValue>> GetByKpiDefinitionAsync(int kpiDefinitionId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<KpiValue>> GetByDateRangeAsync(int kpiDefinitionId, DateTime start, DateTime end, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<KpiValue>> GetByPeriodTypeAsync(int kpiDefinitionId, KpiPeriodType periodType, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<KpiValue>> GetByWorkCenterAsync(int workCenterId, DateTime start, DateTime end, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<KpiValue>> GetByProductAsync(int productId, DateTime start, DateTime end, CancellationToken cancellationToken = default);
    Task<KpiValue?> GetLatestAsync(int kpiDefinitionId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<KpiValue>> GetLatestByTypeAsync(KpiType type, int count, CancellationToken cancellationToken = default);

    void Add(KpiValue kpiValue);
    void Update(KpiValue kpiValue);
    void Delete(KpiValue kpiValue);
}

public interface IKpiTargetRepository
{
    Task<KpiTarget?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<KpiTarget>> GetByKpiDefinitionAsync(int kpiDefinitionId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<KpiTarget>> GetByYearAsync(int year, CancellationToken cancellationToken = default);
    Task<KpiTarget?> GetCurrentTargetAsync(int kpiDefinitionId, int year, int? month, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<KpiTarget>> GetPendingApprovalAsync(CancellationToken cancellationToken = default);

    void Add(KpiTarget kpiTarget);
    void Update(KpiTarget kpiTarget);
    void Delete(KpiTarget kpiTarget);
}

public interface IDashboardConfigurationRepository
{
    Task<DashboardConfiguration?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<DashboardConfiguration?> GetByCodeAsync(string code, CancellationToken cancellationToken = default);
    Task<DashboardConfiguration?> GetWithWidgetsAsync(int id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<DashboardConfiguration>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<DashboardConfiguration>> GetActiveAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<DashboardConfiguration>> GetPublicAsync(CancellationToken cancellationToken = default);
    Task<DashboardConfiguration?> GetDefaultAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<DashboardConfiguration>> GetByUserAsync(string userName, CancellationToken cancellationToken = default);

    void Add(DashboardConfiguration dashboard);
    void Update(DashboardConfiguration dashboard);
    void Delete(DashboardConfiguration dashboard);
    void AddWidget(DashboardWidget widget);
    void UpdateWidget(DashboardWidget widget);
    void DeleteWidget(DashboardWidget widget);
}

public interface IOeeRecordRepository
{
    Task<OeeRecord?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<OeeRecord>> GetByWorkCenterAsync(int workCenterId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<OeeRecord>> GetByDateRangeAsync(DateTime start, DateTime end, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<OeeRecord>> GetByWorkCenterAndDateRangeAsync(int workCenterId, DateTime start, DateTime end, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<OeeRecord>> GetByProductionOrderAsync(int productionOrderId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<OeeRecord>> GetPendingValidationAsync(CancellationToken cancellationToken = default);
    Task<decimal> GetAverageOeeAsync(int workCenterId, DateTime start, DateTime end, CancellationToken cancellationToken = default);

    void Add(OeeRecord record);
    void Update(OeeRecord record);
    void Delete(OeeRecord record);
}

public interface IProductionPerformanceSummaryRepository
{
    Task<ProductionPerformanceSummary?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ProductionPerformanceSummary>> GetByPeriodTypeAsync(KpiPeriodType periodType, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ProductionPerformanceSummary>> GetByDateRangeAsync(DateTime start, DateTime end, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ProductionPerformanceSummary>> GetByWorkCenterAsync(int workCenterId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ProductionPerformanceSummary>> GetByProductAsync(int productId, CancellationToken cancellationToken = default);
    Task<ProductionPerformanceSummary?> GetLatestAsync(KpiPeriodType periodType, int? workCenterId, CancellationToken cancellationToken = default);

    void Add(ProductionPerformanceSummary summary);
    void Update(ProductionPerformanceSummary summary);
    void Delete(ProductionPerformanceSummary summary);
}
