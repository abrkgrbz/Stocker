using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Manufacturing.Domain.Entities;
using Stocker.Modules.Manufacturing.Domain.Enums;
using Stocker.Modules.Manufacturing.Domain.Repositories;
using Stocker.Modules.Manufacturing.Infrastructure.Data;

namespace Stocker.Modules.Manufacturing.Infrastructure.Repositories;

public class KpiDefinitionRepository : IKpiDefinitionRepository
{
    private readonly ManufacturingDbContext _context;

    public KpiDefinitionRepository(ManufacturingDbContext context)
    {
        _context = context;
    }

    public async Task<KpiDefinition?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        => await _context.KpiDefinitions.FindAsync(new object[] { id }, cancellationToken);

    public async Task<KpiDefinition?> GetByCodeAsync(string code, CancellationToken cancellationToken = default)
        => await _context.KpiDefinitions.FirstOrDefaultAsync(k => k.Code == code, cancellationToken);

    public async Task<KpiDefinition?> GetWithValuesAsync(int id, CancellationToken cancellationToken = default)
        => await _context.KpiDefinitions
            .Include(k => k.Values.OrderByDescending(v => v.PeriodStart).Take(100))
            .FirstOrDefaultAsync(k => k.Id == id, cancellationToken);

    public async Task<KpiDefinition?> GetWithTargetsAsync(int id, CancellationToken cancellationToken = default)
        => await _context.KpiDefinitions
            .Include(k => k.Targets)
            .FirstOrDefaultAsync(k => k.Id == id, cancellationToken);

    public async Task<IReadOnlyList<KpiDefinition>> GetAllAsync(CancellationToken cancellationToken = default)
        => await _context.KpiDefinitions.OrderBy(k => k.DisplayOrder).ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<KpiDefinition>> GetActiveAsync(CancellationToken cancellationToken = default)
        => await _context.KpiDefinitions.Where(k => k.IsActive).OrderBy(k => k.DisplayOrder).ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<KpiDefinition>> GetByTypeAsync(KpiType type, CancellationToken cancellationToken = default)
        => await _context.KpiDefinitions.Where(k => k.Type == type).OrderBy(k => k.DisplayOrder).ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<KpiDefinition>> GetByCategoryAsync(string category, CancellationToken cancellationToken = default)
        => await _context.KpiDefinitions.Where(k => k.Category == category).OrderBy(k => k.DisplayOrder).ToListAsync(cancellationToken);

    public void Add(KpiDefinition kpiDefinition) => _context.KpiDefinitions.Add(kpiDefinition);
    public void Update(KpiDefinition kpiDefinition) => _context.KpiDefinitions.Update(kpiDefinition);
    public void Delete(KpiDefinition kpiDefinition) => _context.KpiDefinitions.Remove(kpiDefinition);
}

public class KpiValueRepository : IKpiValueRepository
{
    private readonly ManufacturingDbContext _context;

    public KpiValueRepository(ManufacturingDbContext context)
    {
        _context = context;
    }

    public async Task<KpiValue?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        => await _context.KpiValues.Include(v => v.KpiDefinition).FirstOrDefaultAsync(v => v.Id == id, cancellationToken);

    public async Task<IReadOnlyList<KpiValue>> GetByKpiDefinitionAsync(int kpiDefinitionId, CancellationToken cancellationToken = default)
        => await _context.KpiValues
            .Where(v => v.KpiDefinitionId == kpiDefinitionId)
            .OrderByDescending(v => v.PeriodStart)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<KpiValue>> GetByDateRangeAsync(int kpiDefinitionId, DateTime start, DateTime end, CancellationToken cancellationToken = default)
        => await _context.KpiValues
            .Where(v => v.KpiDefinitionId == kpiDefinitionId && v.PeriodStart >= start && v.PeriodEnd <= end)
            .OrderBy(v => v.PeriodStart)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<KpiValue>> GetByPeriodTypeAsync(int kpiDefinitionId, KpiPeriodType periodType, CancellationToken cancellationToken = default)
        => await _context.KpiValues
            .Where(v => v.KpiDefinitionId == kpiDefinitionId && v.PeriodType == periodType)
            .OrderByDescending(v => v.PeriodStart)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<KpiValue>> GetByWorkCenterAsync(int workCenterId, DateTime start, DateTime end, CancellationToken cancellationToken = default)
        => await _context.KpiValues
            .Include(v => v.KpiDefinition)
            .Where(v => v.WorkCenterId == workCenterId && v.PeriodStart >= start && v.PeriodEnd <= end)
            .OrderBy(v => v.PeriodStart)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<KpiValue>> GetByProductAsync(int productId, DateTime start, DateTime end, CancellationToken cancellationToken = default)
        => await _context.KpiValues
            .Include(v => v.KpiDefinition)
            .Where(v => v.ProductId == productId && v.PeriodStart >= start && v.PeriodEnd <= end)
            .OrderBy(v => v.PeriodStart)
            .ToListAsync(cancellationToken);

    public async Task<KpiValue?> GetLatestAsync(int kpiDefinitionId, CancellationToken cancellationToken = default)
        => await _context.KpiValues
            .Where(v => v.KpiDefinitionId == kpiDefinitionId)
            .OrderByDescending(v => v.PeriodEnd)
            .FirstOrDefaultAsync(cancellationToken);

    public async Task<IReadOnlyList<KpiValue>> GetLatestByTypeAsync(KpiType type, int count, CancellationToken cancellationToken = default)
        => await _context.KpiValues
            .Include(v => v.KpiDefinition)
            .Where(v => v.KpiDefinition!.Type == type)
            .OrderByDescending(v => v.PeriodEnd)
            .Take(count)
            .ToListAsync(cancellationToken);

    public void Add(KpiValue kpiValue) => _context.KpiValues.Add(kpiValue);
    public void Update(KpiValue kpiValue) => _context.KpiValues.Update(kpiValue);
    public void Delete(KpiValue kpiValue) => _context.KpiValues.Remove(kpiValue);
}

public class KpiTargetRepository : IKpiTargetRepository
{
    private readonly ManufacturingDbContext _context;

    public KpiTargetRepository(ManufacturingDbContext context)
    {
        _context = context;
    }

    public async Task<KpiTarget?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        => await _context.KpiTargets.Include(t => t.KpiDefinition).FirstOrDefaultAsync(t => t.Id == id, cancellationToken);

    public async Task<IReadOnlyList<KpiTarget>> GetByKpiDefinitionAsync(int kpiDefinitionId, CancellationToken cancellationToken = default)
        => await _context.KpiTargets
            .Where(t => t.KpiDefinitionId == kpiDefinitionId)
            .OrderByDescending(t => t.Year)
            .ThenByDescending(t => t.Month)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<KpiTarget>> GetByYearAsync(int year, CancellationToken cancellationToken = default)
        => await _context.KpiTargets
            .Include(t => t.KpiDefinition)
            .Where(t => t.Year == year)
            .ToListAsync(cancellationToken);

    public async Task<KpiTarget?> GetCurrentTargetAsync(int kpiDefinitionId, int year, int? month, CancellationToken cancellationToken = default)
        => await _context.KpiTargets
            .Where(t => t.KpiDefinitionId == kpiDefinitionId && t.Year == year && t.Month == month)
            .FirstOrDefaultAsync(cancellationToken);

    public async Task<IReadOnlyList<KpiTarget>> GetPendingApprovalAsync(CancellationToken cancellationToken = default)
        => await _context.KpiTargets
            .Include(t => t.KpiDefinition)
            .Where(t => !t.IsApproved)
            .OrderByDescending(t => t.SetDate)
            .ToListAsync(cancellationToken);

    public void Add(KpiTarget kpiTarget) => _context.KpiTargets.Add(kpiTarget);
    public void Update(KpiTarget kpiTarget) => _context.KpiTargets.Update(kpiTarget);
    public void Delete(KpiTarget kpiTarget) => _context.KpiTargets.Remove(kpiTarget);
}

public class DashboardConfigurationRepository : IDashboardConfigurationRepository
{
    private readonly ManufacturingDbContext _context;

    public DashboardConfigurationRepository(ManufacturingDbContext context)
    {
        _context = context;
    }

    public async Task<DashboardConfiguration?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        => await _context.DashboardConfigurations.FindAsync(new object[] { id }, cancellationToken);

    public async Task<DashboardConfiguration?> GetByCodeAsync(string code, CancellationToken cancellationToken = default)
        => await _context.DashboardConfigurations.FirstOrDefaultAsync(d => d.Code == code, cancellationToken);

    public async Task<DashboardConfiguration?> GetWithWidgetsAsync(int id, CancellationToken cancellationToken = default)
        => await _context.DashboardConfigurations
            .Include(d => d.Widgets.OrderBy(w => w.DisplayOrder))
            .ThenInclude(w => w.KpiDefinition)
            .FirstOrDefaultAsync(d => d.Id == id, cancellationToken);

    public async Task<IReadOnlyList<DashboardConfiguration>> GetAllAsync(CancellationToken cancellationToken = default)
        => await _context.DashboardConfigurations.ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<DashboardConfiguration>> GetActiveAsync(CancellationToken cancellationToken = default)
        => await _context.DashboardConfigurations.Where(d => d.IsActive).ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<DashboardConfiguration>> GetPublicAsync(CancellationToken cancellationToken = default)
        => await _context.DashboardConfigurations.Where(d => d.IsPublic && d.IsActive).ToListAsync(cancellationToken);

    public async Task<DashboardConfiguration?> GetDefaultAsync(CancellationToken cancellationToken = default)
        => await _context.DashboardConfigurations.FirstOrDefaultAsync(d => d.IsDefault && d.IsActive, cancellationToken);

    public async Task<IReadOnlyList<DashboardConfiguration>> GetByUserAsync(string userName, CancellationToken cancellationToken = default)
        => await _context.DashboardConfigurations
            .Where(d => d.CreatedBy == userName || d.IsPublic)
            .Where(d => d.IsActive)
            .ToListAsync(cancellationToken);

    public void Add(DashboardConfiguration dashboard) => _context.DashboardConfigurations.Add(dashboard);
    public void Update(DashboardConfiguration dashboard) => _context.DashboardConfigurations.Update(dashboard);
    public void Delete(DashboardConfiguration dashboard) => _context.DashboardConfigurations.Remove(dashboard);
    public void AddWidget(DashboardWidget widget) => _context.DashboardWidgets.Add(widget);
    public void UpdateWidget(DashboardWidget widget) => _context.DashboardWidgets.Update(widget);
    public void DeleteWidget(DashboardWidget widget) => _context.DashboardWidgets.Remove(widget);
}

public class OeeRecordRepository : IOeeRecordRepository
{
    private readonly ManufacturingDbContext _context;

    public OeeRecordRepository(ManufacturingDbContext context)
    {
        _context = context;
    }

    public async Task<OeeRecord?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        => await _context.OeeRecords.FindAsync(new object[] { id }, cancellationToken);

    public async Task<IReadOnlyList<OeeRecord>> GetByWorkCenterAsync(int workCenterId, CancellationToken cancellationToken = default)
        => await _context.OeeRecords
            .Where(o => o.WorkCenterId == workCenterId)
            .OrderByDescending(o => o.RecordDate)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<OeeRecord>> GetByDateRangeAsync(DateTime start, DateTime end, CancellationToken cancellationToken = default)
        => await _context.OeeRecords
            .Where(o => o.RecordDate >= start && o.RecordDate <= end)
            .OrderBy(o => o.RecordDate)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<OeeRecord>> GetByWorkCenterAndDateRangeAsync(int workCenterId, DateTime start, DateTime end, CancellationToken cancellationToken = default)
        => await _context.OeeRecords
            .Where(o => o.WorkCenterId == workCenterId && o.RecordDate >= start && o.RecordDate <= end)
            .OrderBy(o => o.RecordDate)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<OeeRecord>> GetByProductionOrderAsync(int productionOrderId, CancellationToken cancellationToken = default)
        => await _context.OeeRecords
            .Where(o => o.ProductionOrderId == productionOrderId)
            .OrderBy(o => o.ShiftStart)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<OeeRecord>> GetPendingValidationAsync(CancellationToken cancellationToken = default)
        => await _context.OeeRecords
            .Where(o => !o.IsValidated)
            .OrderByDescending(o => o.RecordDate)
            .ToListAsync(cancellationToken);

    public async Task<decimal> GetAverageOeeAsync(int workCenterId, DateTime start, DateTime end, CancellationToken cancellationToken = default)
    {
        var records = await _context.OeeRecords
            .Where(o => o.WorkCenterId == workCenterId && o.RecordDate >= start && o.RecordDate <= end)
            .ToListAsync(cancellationToken);

        return records.Count > 0 ? records.Average(o => o.OeeValue) : 0;
    }

    public void Add(OeeRecord record) => _context.OeeRecords.Add(record);
    public void Update(OeeRecord record) => _context.OeeRecords.Update(record);
    public void Delete(OeeRecord record) => _context.OeeRecords.Remove(record);
}

public class ProductionPerformanceSummaryRepository : IProductionPerformanceSummaryRepository
{
    private readonly ManufacturingDbContext _context;

    public ProductionPerformanceSummaryRepository(ManufacturingDbContext context)
    {
        _context = context;
    }

    public async Task<ProductionPerformanceSummary?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        => await _context.ProductionPerformanceSummaries.FindAsync(new object[] { id }, cancellationToken);

    public async Task<IReadOnlyList<ProductionPerformanceSummary>> GetByPeriodTypeAsync(KpiPeriodType periodType, CancellationToken cancellationToken = default)
        => await _context.ProductionPerformanceSummaries
            .Where(p => p.PeriodType == periodType)
            .OrderByDescending(p => p.PeriodStart)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<ProductionPerformanceSummary>> GetByDateRangeAsync(DateTime start, DateTime end, CancellationToken cancellationToken = default)
        => await _context.ProductionPerformanceSummaries
            .Where(p => p.PeriodStart >= start && p.PeriodEnd <= end)
            .OrderBy(p => p.PeriodStart)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<ProductionPerformanceSummary>> GetByWorkCenterAsync(int workCenterId, CancellationToken cancellationToken = default)
        => await _context.ProductionPerformanceSummaries
            .Where(p => p.WorkCenterId == workCenterId)
            .OrderByDescending(p => p.PeriodStart)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<ProductionPerformanceSummary>> GetByProductAsync(int productId, CancellationToken cancellationToken = default)
        => await _context.ProductionPerformanceSummaries
            .Where(p => p.ProductId == productId)
            .OrderByDescending(p => p.PeriodStart)
            .ToListAsync(cancellationToken);

    public async Task<ProductionPerformanceSummary?> GetLatestAsync(KpiPeriodType periodType, int? workCenterId, CancellationToken cancellationToken = default)
    {
        var query = _context.ProductionPerformanceSummaries.Where(p => p.PeriodType == periodType);

        if (workCenterId.HasValue)
            query = query.Where(p => p.WorkCenterId == workCenterId);

        return await query.OrderByDescending(p => p.PeriodEnd).FirstOrDefaultAsync(cancellationToken);
    }

    public void Add(ProductionPerformanceSummary summary) => _context.ProductionPerformanceSummaries.Add(summary);
    public void Update(ProductionPerformanceSummary summary) => _context.ProductionPerformanceSummaries.Update(summary);
    public void Delete(ProductionPerformanceSummary summary) => _context.ProductionPerformanceSummaries.Remove(summary);
}
