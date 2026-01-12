using MediatR;
using Stocker.Modules.Manufacturing.Application.DTOs;
using Stocker.Modules.Manufacturing.Domain.Entities;
using Stocker.Modules.Manufacturing.Domain.Enums;
using Stocker.Modules.Manufacturing.Interfaces;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.Manufacturing.Application.Features.KpiDashboard.Queries;

// KPI Definition Queries
public record GetKpiDefinitionsQuery : IRequest<IReadOnlyList<KpiDefinitionListDto>>;

public class GetKpiDefinitionsQueryHandler : IRequestHandler<GetKpiDefinitionsQuery, IReadOnlyList<KpiDefinitionListDto>>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetKpiDefinitionsQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<KpiDefinitionListDto>> Handle(GetKpiDefinitionsQuery request, CancellationToken cancellationToken)
    {
        var _ = _unitOfWork.TenantId;
        var kpis = await _unitOfWork.KpiDefinitions.GetActiveAsync(cancellationToken);
        return kpis.Select(k => new KpiDefinitionListDto(
            k.Id, k.Code, k.Name, k.Type.ToString(), k.Unit, k.TargetValue, k.IsActive, k.Category)).ToList();
    }
}

public record GetKpiDefinitionByIdQuery(int Id) : IRequest<KpiDefinitionDto?>;

public class GetKpiDefinitionByIdQueryHandler : IRequestHandler<GetKpiDefinitionByIdQuery, KpiDefinitionDto?>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetKpiDefinitionByIdQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<KpiDefinitionDto?> Handle(GetKpiDefinitionByIdQuery request, CancellationToken cancellationToken)
    {
        var _ = _unitOfWork.TenantId;
        var kpi = await _unitOfWork.KpiDefinitions.GetByIdAsync(request.Id, cancellationToken);
        if (kpi == null) return null;

        return MapToDto(kpi);
    }

    private static KpiDefinitionDto MapToDto(KpiDefinition k) => new(
        k.Id, k.Code, k.Name, k.Description, k.Type.ToString(), k.Unit, k.Formula,
        k.TargetValue, k.MinThreshold, k.MaxThreshold, k.TolerancePercent,
        k.IsHigherBetter, k.DefaultPeriod.ToString(), k.IsActive, k.DisplayOrder,
        k.Category, k.Color, k.IconName);
}

// KPI Value Queries
public record GetKpiValuesQuery(int KpiDefinitionId, DateTime? StartDate, DateTime? EndDate) : IRequest<IReadOnlyList<KpiValueListDto>>;

public class GetKpiValuesQueryHandler : IRequestHandler<GetKpiValuesQuery, IReadOnlyList<KpiValueListDto>>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetKpiValuesQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<KpiValueListDto>> Handle(GetKpiValuesQuery request, CancellationToken cancellationToken)
    {
        var _ = _unitOfWork.TenantId;

        var kpi = await _unitOfWork.KpiDefinitions.GetByIdAsync(request.KpiDefinitionId, cancellationToken);
        if (kpi == null) return new List<KpiValueListDto>();

        IReadOnlyList<KpiValue> values;
        if (request.StartDate.HasValue && request.EndDate.HasValue)
        {
            values = await _unitOfWork.KpiValues.GetByDateRangeAsync(request.KpiDefinitionId, request.StartDate.Value, request.EndDate.Value, cancellationToken);
        }
        else
        {
            values = await _unitOfWork.KpiValues.GetByKpiDefinitionAsync(request.KpiDefinitionId, cancellationToken);
        }

        return values.Select(v => new KpiValueListDto(
            v.Id, kpi.Code, kpi.Name, v.PeriodStart, v.PeriodEnd, v.Value, v.Status.ToString(), v.ChangePercent)).ToList();
    }
}

public record GetLatestKpiValueQuery(int KpiDefinitionId) : IRequest<KpiValueDto?>;

public class GetLatestKpiValueQueryHandler : IRequestHandler<GetLatestKpiValueQuery, KpiValueDto?>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetLatestKpiValueQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<KpiValueDto?> Handle(GetLatestKpiValueQuery request, CancellationToken cancellationToken)
    {
        var _ = _unitOfWork.TenantId;

        var kpi = await _unitOfWork.KpiDefinitions.GetByIdAsync(request.KpiDefinitionId, cancellationToken);
        var value = await _unitOfWork.KpiValues.GetLatestAsync(request.KpiDefinitionId, cancellationToken);

        if (value == null) return null;

        return new KpiValueDto(
            value.Id, value.KpiDefinitionId, kpi?.Code, kpi?.Name,
            value.PeriodStart, value.PeriodEnd, value.PeriodType.ToString(),
            value.Value, value.PreviousValue, value.ChangePercent,
            value.Status.ToString(), value.TargetValue, value.Variance, value.VariancePercent,
            value.Component1, value.Component1Name, value.Component2, value.Component2Name,
            value.Component3, value.Component3Name,
            value.WorkCenterId, value.ProductId, value.ProductionOrderId,
            value.Notes, value.CalculatedDate, value.CalculatedBy);
    }
}

// Dashboard Queries
public record GetDashboardConfigurationsQuery : IRequest<IReadOnlyList<DashboardConfigurationListDto>>;

public class GetDashboardConfigurationsQueryHandler : IRequestHandler<GetDashboardConfigurationsQuery, IReadOnlyList<DashboardConfigurationListDto>>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUser;

    public GetDashboardConfigurationsQueryHandler(
        IManufacturingUnitOfWork unitOfWork,
        ICurrentUserService currentUser)
    {
        _unitOfWork = unitOfWork;
        _currentUser = currentUser;
    }

    public async Task<IReadOnlyList<DashboardConfigurationListDto>> Handle(GetDashboardConfigurationsQuery request, CancellationToken cancellationToken)
    {
        var _ = _unitOfWork.TenantId;
        var userName = _currentUser.UserName ?? "";

        var dashboards = await _unitOfWork.DashboardConfigurations.GetByUserAsync(userName, cancellationToken);
        return dashboards.Select(d => new DashboardConfigurationListDto(
            d.Id, d.Code, d.Name, d.IsDefault, d.IsPublic, d.IsActive, d.Widgets.Count)).ToList();
    }
}

public record GetDashboardWithWidgetsQuery(int Id) : IRequest<DashboardConfigurationDto?>;

public class GetDashboardWithWidgetsQueryHandler : IRequestHandler<GetDashboardWithWidgetsQuery, DashboardConfigurationDto?>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetDashboardWithWidgetsQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<DashboardConfigurationDto?> Handle(GetDashboardWithWidgetsQuery request, CancellationToken cancellationToken)
    {
        var _ = _unitOfWork.TenantId;

        var dashboard = await _unitOfWork.DashboardConfigurations.GetWithWidgetsAsync(request.Id, cancellationToken);
        if (dashboard == null) return null;

        var widgets = dashboard.Widgets.Select(w => new DashboardWidgetDto(
            w.Id, w.DashboardConfigurationId, w.Title, w.Type.ToString(),
            w.KpiDefinitionId, w.KpiDefinition?.Code, w.KpiDefinition?.Name,
            w.PositionX, w.PositionY, w.Width, w.Height,
            w.ConfigurationJson, w.DataSourceQuery,
            w.DefaultPeriod?.ToString(), w.WorkCenterId, w.ProductId,
            w.ShowTrend, w.ShowTarget, w.IsVisible, w.DisplayOrder)).ToList();

        return new DashboardConfigurationDto(
            dashboard.Id, dashboard.Code, dashboard.Name, dashboard.Description,
            dashboard.IsDefault, dashboard.IsPublic, dashboard.CreatedBy,
            dashboard.RefreshIntervalSeconds, dashboard.LayoutJson, dashboard.IsActive, widgets);
    }
}

public record GetDefaultDashboardQuery : IRequest<DashboardConfigurationDto?>;

public class GetDefaultDashboardQueryHandler : IRequestHandler<GetDefaultDashboardQuery, DashboardConfigurationDto?>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetDefaultDashboardQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<DashboardConfigurationDto?> Handle(GetDefaultDashboardQuery request, CancellationToken cancellationToken)
    {
        var _ = _unitOfWork.TenantId;

        var dashboard = await _unitOfWork.DashboardConfigurations.GetDefaultAsync(cancellationToken);
        if (dashboard == null) return null;

        dashboard = await _unitOfWork.DashboardConfigurations.GetWithWidgetsAsync(dashboard.Id, cancellationToken);
        if (dashboard == null) return null;

        var widgets = dashboard.Widgets.Select(w => new DashboardWidgetDto(
            w.Id, w.DashboardConfigurationId, w.Title, w.Type.ToString(),
            w.KpiDefinitionId, w.KpiDefinition?.Code, w.KpiDefinition?.Name,
            w.PositionX, w.PositionY, w.Width, w.Height,
            w.ConfigurationJson, w.DataSourceQuery,
            w.DefaultPeriod?.ToString(), w.WorkCenterId, w.ProductId,
            w.ShowTrend, w.ShowTarget, w.IsVisible, w.DisplayOrder)).ToList();

        return new DashboardConfigurationDto(
            dashboard.Id, dashboard.Code, dashboard.Name, dashboard.Description,
            dashboard.IsDefault, dashboard.IsPublic, dashboard.CreatedBy,
            dashboard.RefreshIntervalSeconds, dashboard.LayoutJson, dashboard.IsActive, widgets);
    }
}

// OEE Queries
public record GetOeeRecordsQuery(int? WorkCenterId, DateTime? StartDate, DateTime? EndDate) : IRequest<IReadOnlyList<OeeRecordListDto>>;

public class GetOeeRecordsQueryHandler : IRequestHandler<GetOeeRecordsQuery, IReadOnlyList<OeeRecordListDto>>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetOeeRecordsQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<OeeRecordListDto>> Handle(GetOeeRecordsQuery request, CancellationToken cancellationToken)
    {
        var _ = _unitOfWork.TenantId;

        IReadOnlyList<OeeRecord> records;
        if (request.WorkCenterId.HasValue && request.StartDate.HasValue && request.EndDate.HasValue)
        {
            records = await _unitOfWork.OeeRecords.GetByWorkCenterAndDateRangeAsync(request.WorkCenterId.Value, request.StartDate.Value, request.EndDate.Value, cancellationToken);
        }
        else if (request.StartDate.HasValue && request.EndDate.HasValue)
        {
            records = await _unitOfWork.OeeRecords.GetByDateRangeAsync(request.StartDate.Value, request.EndDate.Value, cancellationToken);
        }
        else if (request.WorkCenterId.HasValue)
        {
            records = await _unitOfWork.OeeRecords.GetByWorkCenterAsync(request.WorkCenterId.Value, cancellationToken);
        }
        else
        {
            records = await _unitOfWork.OeeRecords.GetByDateRangeAsync(DateTime.UtcNow.AddDays(-30), DateTime.UtcNow, cancellationToken);
        }

        return records.Select(o => new OeeRecordListDto(
            o.Id, o.WorkCenterCode, o.WorkCenterName, o.RecordDate, o.ShiftName,
            o.Availability, o.Performance, o.Quality, o.OeeValue, o.IsValidated)).ToList();
    }
}

public record GetOeeRecordByIdQuery(int Id) : IRequest<OeeRecordDto?>;

public class GetOeeRecordByIdQueryHandler : IRequestHandler<GetOeeRecordByIdQuery, OeeRecordDto?>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetOeeRecordByIdQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<OeeRecordDto?> Handle(GetOeeRecordByIdQuery request, CancellationToken cancellationToken)
    {
        var _ = _unitOfWork.TenantId;

        var record = await _unitOfWork.OeeRecords.GetByIdAsync(request.Id, cancellationToken);
        if (record == null) return null;

        return MapToDto(record);
    }

    private static OeeRecordDto MapToDto(OeeRecord o) => new(
        o.Id, o.WorkCenterId, o.WorkCenterCode, o.WorkCenterName,
        o.RecordDate, o.ShiftStart, o.ShiftEnd, o.ShiftName,
        o.PlannedProductionTime, o.ActualProductionTime, o.DowntimeMinutes, o.SetupMinutes, o.BreakMinutes,
        o.PlannedQuantity, o.ActualQuantity, o.GoodQuantity, o.DefectQuantity, o.ReworkQuantity, o.ScrapQuantity,
        o.IdealCycleTime, o.ActualCycleTime,
        o.Availability, o.Performance, o.Quality, o.OeeValue,
        o.ProductionOrderId, o.ProductionOrderNumber, o.ProductId, o.ProductCode,
        o.Notes, o.RecordedBy, o.IsValidated, o.ValidatedBy, o.ValidatedDate);
}

public record GetOeeSummaryQuery(DateTime StartDate, DateTime EndDate) : IRequest<DashboardOeeSummaryDto>;

public class GetOeeSummaryQueryHandler : IRequestHandler<GetOeeSummaryQuery, DashboardOeeSummaryDto>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetOeeSummaryQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<DashboardOeeSummaryDto> Handle(GetOeeSummaryQuery request, CancellationToken cancellationToken)
    {
        var _ = _unitOfWork.TenantId;

        var records = await _unitOfWork.OeeRecords.GetByDateRangeAsync(request.StartDate, request.EndDate, cancellationToken);

        if (!records.Any())
        {
            return new DashboardOeeSummaryDto(0, 0, 0, 0, 0, request.StartDate, request.EndDate, new List<OeeByWorkCenterDto>());
        }

        var overallOee = records.Average(r => r.OeeValue);
        var availability = records.Average(r => r.Availability);
        var performance = records.Average(r => r.Performance);
        var quality = records.Average(r => r.Quality);

        var byWorkCenter = records
            .GroupBy(r => new { r.WorkCenterId, r.WorkCenterCode, r.WorkCenterName })
            .Select(g => new OeeByWorkCenterDto(
                g.Key.WorkCenterId,
                g.Key.WorkCenterCode,
                g.Key.WorkCenterName,
                g.Average(r => r.OeeValue),
                g.Average(r => r.Availability),
                g.Average(r => r.Performance),
                g.Average(r => r.Quality)))
            .OrderByDescending(x => x.OeeValue)
            .ToList();

        return new DashboardOeeSummaryDto(
            overallOee, availability, performance, quality,
            records.Count, request.StartDate, request.EndDate, byWorkCenter);
    }
}

// Performance Summary Queries
public record GetProductionPerformanceSummariesQuery(string PeriodType, DateTime? StartDate, DateTime? EndDate) : IRequest<IReadOnlyList<ProductionPerformanceSummaryListDto>>;

public class GetProductionPerformanceSummariesQueryHandler : IRequestHandler<GetProductionPerformanceSummariesQuery, IReadOnlyList<ProductionPerformanceSummaryListDto>>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetProductionPerformanceSummariesQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<ProductionPerformanceSummaryListDto>> Handle(GetProductionPerformanceSummariesQuery request, CancellationToken cancellationToken)
    {
        var _ = _unitOfWork.TenantId;

        var periodType = Enum.Parse<KpiPeriodType>(request.PeriodType);
        IReadOnlyList<ProductionPerformanceSummary> summaries;

        if (request.StartDate.HasValue && request.EndDate.HasValue)
        {
            summaries = await _unitOfWork.ProductionPerformanceSummaries.GetByDateRangeAsync(request.StartDate.Value, request.EndDate.Value, cancellationToken);
            summaries = summaries.Where(s => s.PeriodType == periodType).ToList();
        }
        else
        {
            summaries = await _unitOfWork.ProductionPerformanceSummaries.GetByPeriodTypeAsync(periodType, cancellationToken);
        }

        return summaries.Select(s => new ProductionPerformanceSummaryListDto(
            s.Id, s.PeriodStart, s.PeriodEnd, s.PeriodType.ToString(),
            s.WorkCenterCode, s.ProductionEfficiency, s.QualityRate, s.OeeAverage)).ToList();
    }
}

// Dashboard KPI Cards Query
public record GetDashboardKpiCardsQuery : IRequest<IReadOnlyList<DashboardKpiCardDto>>;

public class GetDashboardKpiCardsQueryHandler : IRequestHandler<GetDashboardKpiCardsQuery, IReadOnlyList<DashboardKpiCardDto>>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetDashboardKpiCardsQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<DashboardKpiCardDto>> Handle(GetDashboardKpiCardsQuery request, CancellationToken cancellationToken)
    {
        var _ = _unitOfWork.TenantId;

        var kpis = await _unitOfWork.KpiDefinitions.GetActiveAsync(cancellationToken);
        var result = new List<DashboardKpiCardDto>();

        foreach (var kpi in kpis)
        {
            var latestValue = await _unitOfWork.KpiValues.GetLatestAsync(kpi.Id, cancellationToken);

            result.Add(new DashboardKpiCardDto(
                kpi.Id, kpi.Code, kpi.Name, kpi.Unit,
                latestValue?.Value ?? 0,
                latestValue?.PreviousValue,
                latestValue?.ChangePercent,
                latestValue?.Status.ToString() ?? "Belirsiz",
                latestValue?.TargetValue ?? kpi.TargetValue,
                latestValue?.VariancePercent,
                kpi.Color, kpi.IconName, kpi.IsHigherBetter));
        }

        return result;
    }
}

// KPI Trend Query
public record GetKpiTrendQuery(int KpiDefinitionId, DateTime StartDate, DateTime EndDate) : IRequest<KpiTrendDataDto?>;

public class GetKpiTrendQueryHandler : IRequestHandler<GetKpiTrendQuery, KpiTrendDataDto?>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetKpiTrendQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<KpiTrendDataDto?> Handle(GetKpiTrendQuery request, CancellationToken cancellationToken)
    {
        var _ = _unitOfWork.TenantId;

        var kpi = await _unitOfWork.KpiDefinitions.GetByIdAsync(request.KpiDefinitionId, cancellationToken);
        if (kpi == null) return null;

        var values = await _unitOfWork.KpiValues.GetByDateRangeAsync(request.KpiDefinitionId, request.StartDate, request.EndDate, cancellationToken);

        var dataPoints = values.Select(v => new KpiTrendPointDto(
            v.PeriodStart, v.Value, v.TargetValue ?? kpi.TargetValue)).ToList();

        return new KpiTrendDataDto(kpi.Id, kpi.Code, kpi.Name, dataPoints);
    }
}
