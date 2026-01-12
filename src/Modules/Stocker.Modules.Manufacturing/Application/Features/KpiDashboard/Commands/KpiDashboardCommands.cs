using MediatR;
using Stocker.Modules.Manufacturing.Application.DTOs;
using Stocker.Modules.Manufacturing.Domain.Entities;
using Stocker.Modules.Manufacturing.Domain.Enums;
using Stocker.Modules.Manufacturing.Interfaces;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.Manufacturing.Application.Features.KpiDashboard.Commands;

// KPI Definition Commands
public record CreateKpiDefinitionCommand(CreateKpiDefinitionRequest Request) : IRequest<KpiDefinitionDto>;

public class CreateKpiDefinitionCommandHandler : IRequestHandler<CreateKpiDefinitionCommand, KpiDefinitionDto>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public CreateKpiDefinitionCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<KpiDefinitionDto> Handle(CreateKpiDefinitionCommand command, CancellationToken cancellationToken)
    {
        var _ = _unitOfWork.TenantId;
        var request = command.Request;

        var type = Enum.Parse<KpiType>(request.Type);
        var defaultPeriod = Enum.Parse<KpiPeriodType>(request.DefaultPeriod);

        var kpi = new KpiDefinition(request.Code, request.Name, type);

        if (!string.IsNullOrEmpty(request.Description))
            kpi.SetDescription(request.Description);

        kpi.SetUnit(request.Unit);

        if (!string.IsNullOrEmpty(request.Formula))
            kpi.SetFormula(request.Formula);

        kpi.SetTargets(request.TargetValue, request.MinThreshold, request.MaxThreshold, request.TolerancePercent);
        kpi.SetHigherBetter(request.IsHigherBetter);
        kpi.SetDefaultPeriod(defaultPeriod);
        kpi.SetDisplayProperties(0, request.Category, request.Color, request.IconName);

        _unitOfWork.KpiDefinitions.Add(kpi);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToDto(kpi);
    }

    private static KpiDefinitionDto MapToDto(KpiDefinition k) => new(
        k.Id, k.Code, k.Name, k.Description, k.Type.ToString(), k.Unit, k.Formula,
        k.TargetValue, k.MinThreshold, k.MaxThreshold, k.TolerancePercent,
        k.IsHigherBetter, k.DefaultPeriod.ToString(), k.IsActive, k.DisplayOrder,
        k.Category, k.Color, k.IconName);
}

public record UpdateKpiDefinitionCommand(int Id, UpdateKpiDefinitionRequest Request) : IRequest;

public class UpdateKpiDefinitionCommandHandler : IRequestHandler<UpdateKpiDefinitionCommand>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public UpdateKpiDefinitionCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(UpdateKpiDefinitionCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var kpi = await _unitOfWork.KpiDefinitions.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"ID '{command.Id}' olan KPI tanımı bulunamadı.");

        if (kpi.TenantId != tenantId)
            throw new UnauthorizedAccessException("Bu KPI tanımına erişim yetkiniz yok.");

        var request = command.Request;

        if (!string.IsNullOrEmpty(request.Description))
            kpi.SetDescription(request.Description);

        kpi.SetTargets(request.TargetValue, request.MinThreshold, request.MaxThreshold, request.TolerancePercent);
        kpi.SetDisplayProperties(kpi.DisplayOrder, request.Category, request.Color, request.IconName);

        _unitOfWork.KpiDefinitions.Update(kpi);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}

public record DeleteKpiDefinitionCommand(int Id) : IRequest;

public class DeleteKpiDefinitionCommandHandler : IRequestHandler<DeleteKpiDefinitionCommand>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public DeleteKpiDefinitionCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(DeleteKpiDefinitionCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var kpi = await _unitOfWork.KpiDefinitions.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"ID '{command.Id}' olan KPI tanımı bulunamadı.");

        if (kpi.TenantId != tenantId)
            throw new UnauthorizedAccessException("Bu KPI tanımını silme yetkiniz yok.");

        _unitOfWork.KpiDefinitions.Delete(kpi);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}

// KPI Value Commands
public record CreateKpiValueCommand(CreateKpiValueRequest Request) : IRequest<KpiValueDto>;

public class CreateKpiValueCommandHandler : IRequestHandler<CreateKpiValueCommand, KpiValueDto>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUser;

    public CreateKpiValueCommandHandler(
        IManufacturingUnitOfWork unitOfWork,
        ICurrentUserService currentUser)
    {
        _unitOfWork = unitOfWork;
        _currentUser = currentUser;
    }

    public async Task<KpiValueDto> Handle(CreateKpiValueCommand command, CancellationToken cancellationToken)
    {
        var _ = _unitOfWork.TenantId;
        var userName = _currentUser.UserName;
        var request = command.Request;

        var kpi = await _unitOfWork.KpiDefinitions.GetByIdAsync(request.KpiDefinitionId, cancellationToken)
            ?? throw new KeyNotFoundException($"ID '{request.KpiDefinitionId}' olan KPI tanımı bulunamadı.");

        var periodType = Enum.Parse<KpiPeriodType>(request.PeriodType);
        var value = new KpiValue(request.KpiDefinitionId, request.PeriodStart, request.PeriodEnd, periodType, request.Value);

        // Get previous value for comparison
        var previousValue = await _unitOfWork.KpiValues.GetLatestAsync(request.KpiDefinitionId, cancellationToken);
        if (previousValue != null)
        {
            value.SetPreviousValue(previousValue.Value);
        }

        // Set target and calculate status
        value.SetTarget(kpi.TargetValue, kpi.IsHigherBetter);

        // Set components if provided
        if (request.Component1.HasValue || request.Component2.HasValue || request.Component3.HasValue)
        {
            value.SetComponents(
                request.Component1, request.Component1Name,
                request.Component2, request.Component2Name,
                request.Component3, request.Component3Name);
        }

        // Set context
        value.SetContext(request.WorkCenterId, request.ProductId, request.ProductionOrderId);

        if (!string.IsNullOrEmpty(request.Notes))
            value.SetNotes(request.Notes);

        if (!string.IsNullOrEmpty(userName))
            value.SetCalculatedBy(userName);

        _unitOfWork.KpiValues.Add(value);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new KpiValueDto(
            value.Id, value.KpiDefinitionId, kpi.Code, kpi.Name,
            value.PeriodStart, value.PeriodEnd, value.PeriodType.ToString(),
            value.Value, value.PreviousValue, value.ChangePercent,
            value.Status.ToString(), value.TargetValue, value.Variance, value.VariancePercent,
            value.Component1, value.Component1Name, value.Component2, value.Component2Name,
            value.Component3, value.Component3Name,
            value.WorkCenterId, value.ProductId, value.ProductionOrderId,
            value.Notes, value.CalculatedDate, value.CalculatedBy);
    }
}

// KPI Target Commands
public record CreateKpiTargetCommand(CreateKpiTargetRequest Request) : IRequest<KpiTargetDto>;

public class CreateKpiTargetCommandHandler : IRequestHandler<CreateKpiTargetCommand, KpiTargetDto>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUser;

    public CreateKpiTargetCommandHandler(
        IManufacturingUnitOfWork unitOfWork,
        ICurrentUserService currentUser)
    {
        _unitOfWork = unitOfWork;
        _currentUser = currentUser;
    }

    public async Task<KpiTargetDto> Handle(CreateKpiTargetCommand command, CancellationToken cancellationToken)
    {
        var _ = _unitOfWork.TenantId;
        var userName = _currentUser.UserName;
        var request = command.Request;

        var kpi = await _unitOfWork.KpiDefinitions.GetByIdAsync(request.KpiDefinitionId, cancellationToken)
            ?? throw new KeyNotFoundException($"ID '{request.KpiDefinitionId}' olan KPI tanımı bulunamadı.");

        var target = new KpiTarget(request.KpiDefinitionId, request.Year, request.TargetValue);
        target.SetPeriod(request.Month, request.Quarter);
        target.SetTargetRange(request.StretchTarget, request.MinimumTarget);
        target.SetScope(request.WorkCenterId, request.ProductId);

        if (!string.IsNullOrEmpty(request.Notes))
            target.SetNotes(request.Notes);

        if (!string.IsNullOrEmpty(userName))
            target.SetSetBy(userName);

        _unitOfWork.KpiTargets.Add(target);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new KpiTargetDto(
            target.Id, target.KpiDefinitionId, kpi.Code, kpi.Name,
            target.Year, target.Month, target.Quarter,
            target.TargetValue, target.StretchTarget, target.MinimumTarget,
            target.WorkCenterId, target.ProductId, target.Notes,
            target.SetBy, target.SetDate, target.IsApproved,
            target.ApprovedBy, target.ApprovedDate);
    }
}

public record ApproveKpiTargetCommand(int Id) : IRequest;

public class ApproveKpiTargetCommandHandler : IRequestHandler<ApproveKpiTargetCommand>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUser;

    public ApproveKpiTargetCommandHandler(
        IManufacturingUnitOfWork unitOfWork,
        ICurrentUserService currentUser)
    {
        _unitOfWork = unitOfWork;
        _currentUser = currentUser;
    }

    public async Task Handle(ApproveKpiTargetCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var userName = _currentUser.UserName ?? throw new UnauthorizedAccessException("Kullanıcı bilgisi bulunamadı.");

        var target = await _unitOfWork.KpiTargets.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"ID '{command.Id}' olan KPI hedefi bulunamadı.");

        if (target.TenantId != tenantId)
            throw new UnauthorizedAccessException("Bu hedefe erişim yetkiniz yok.");

        target.Approve(userName);

        _unitOfWork.KpiTargets.Update(target);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}

// Dashboard Configuration Commands
public record CreateDashboardConfigurationCommand(CreateDashboardConfigurationRequest Request) : IRequest<DashboardConfigurationDto>;

public class CreateDashboardConfigurationCommandHandler : IRequestHandler<CreateDashboardConfigurationCommand, DashboardConfigurationDto>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUser;

    public CreateDashboardConfigurationCommandHandler(
        IManufacturingUnitOfWork unitOfWork,
        ICurrentUserService currentUser)
    {
        _unitOfWork = unitOfWork;
        _currentUser = currentUser;
    }

    public async Task<DashboardConfigurationDto> Handle(CreateDashboardConfigurationCommand command, CancellationToken cancellationToken)
    {
        var _ = _unitOfWork.TenantId;
        var userName = _currentUser.UserName;
        var request = command.Request;

        var dashboard = new DashboardConfiguration(request.Code, request.Name);

        if (!string.IsNullOrEmpty(request.Description))
            dashboard.SetDescription(request.Description);

        dashboard.SetAsDefault(request.IsDefault);
        dashboard.SetAsPublic(request.IsPublic);
        dashboard.SetRefreshInterval(request.RefreshIntervalSeconds);

        if (!string.IsNullOrEmpty(request.LayoutJson))
            dashboard.SetLayout(request.LayoutJson);

        if (!string.IsNullOrEmpty(userName))
            dashboard.SetCreatedBy(userName);

        _unitOfWork.DashboardConfigurations.Add(dashboard);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new DashboardConfigurationDto(
            dashboard.Id, dashboard.Code, dashboard.Name, dashboard.Description,
            dashboard.IsDefault, dashboard.IsPublic, dashboard.CreatedBy,
            dashboard.RefreshIntervalSeconds, dashboard.LayoutJson, dashboard.IsActive, null);
    }
}

public record UpdateDashboardConfigurationCommand(int Id, UpdateDashboardConfigurationRequest Request) : IRequest;

public class UpdateDashboardConfigurationCommandHandler : IRequestHandler<UpdateDashboardConfigurationCommand>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public UpdateDashboardConfigurationCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(UpdateDashboardConfigurationCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var dashboard = await _unitOfWork.DashboardConfigurations.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"ID '{command.Id}' olan dashboard bulunamadı.");

        if (dashboard.TenantId != tenantId)
            throw new UnauthorizedAccessException("Bu dashboard'a erişim yetkiniz yok.");

        var request = command.Request;

        if (!string.IsNullOrEmpty(request.Description))
            dashboard.SetDescription(request.Description);

        if (request.IsDefault.HasValue)
            dashboard.SetAsDefault(request.IsDefault.Value);

        if (request.IsPublic.HasValue)
            dashboard.SetAsPublic(request.IsPublic.Value);

        if (request.RefreshIntervalSeconds.HasValue)
            dashboard.SetRefreshInterval(request.RefreshIntervalSeconds.Value);

        if (!string.IsNullOrEmpty(request.LayoutJson))
            dashboard.SetLayout(request.LayoutJson);

        _unitOfWork.DashboardConfigurations.Update(dashboard);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}

public record DeleteDashboardConfigurationCommand(int Id) : IRequest;

public class DeleteDashboardConfigurationCommandHandler : IRequestHandler<DeleteDashboardConfigurationCommand>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public DeleteDashboardConfigurationCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(DeleteDashboardConfigurationCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var dashboard = await _unitOfWork.DashboardConfigurations.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"ID '{command.Id}' olan dashboard bulunamadı.");

        if (dashboard.TenantId != tenantId)
            throw new UnauthorizedAccessException("Bu dashboard'ı silme yetkiniz yok.");

        _unitOfWork.DashboardConfigurations.Delete(dashboard);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}

// Dashboard Widget Commands
public record CreateDashboardWidgetCommand(CreateDashboardWidgetRequest Request) : IRequest<DashboardWidgetDto>;

public class CreateDashboardWidgetCommandHandler : IRequestHandler<CreateDashboardWidgetCommand, DashboardWidgetDto>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public CreateDashboardWidgetCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<DashboardWidgetDto> Handle(CreateDashboardWidgetCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var request = command.Request;

        var dashboard = await _unitOfWork.DashboardConfigurations.GetByIdAsync(request.DashboardConfigurationId, cancellationToken)
            ?? throw new KeyNotFoundException($"ID '{request.DashboardConfigurationId}' olan dashboard bulunamadı.");

        if (dashboard.TenantId != tenantId)
            throw new UnauthorizedAccessException("Bu dashboard'a widget ekleme yetkiniz yok.");

        var widgetType = Enum.Parse<DashboardWidgetType>(request.Type);
        var widget = new DashboardWidget(request.DashboardConfigurationId, request.Title, widgetType, request.KpiDefinitionId);

        widget.SetPosition(request.PositionX, request.PositionY);
        widget.SetSize(request.Width, request.Height);

        if (!string.IsNullOrEmpty(request.ConfigurationJson))
            widget.SetConfiguration(request.ConfigurationJson);

        if (!string.IsNullOrEmpty(request.DataSourceQuery))
            widget.SetDataSource(request.DataSourceQuery);

        if (!string.IsNullOrEmpty(request.DefaultPeriod))
            widget.SetDefaultPeriod(Enum.Parse<KpiPeriodType>(request.DefaultPeriod));

        widget.SetScope(request.WorkCenterId, request.ProductId);
        widget.SetDisplayOptions(request.ShowTrend, request.ShowTarget);

        _unitOfWork.DashboardConfigurations.AddWidget(widget);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        KpiDefinition? kpi = null;
        if (request.KpiDefinitionId.HasValue)
            kpi = await _unitOfWork.KpiDefinitions.GetByIdAsync(request.KpiDefinitionId.Value, cancellationToken);

        return new DashboardWidgetDto(
            widget.Id, widget.DashboardConfigurationId, widget.Title, widget.Type.ToString(),
            widget.KpiDefinitionId, kpi?.Code, kpi?.Name,
            widget.PositionX, widget.PositionY, widget.Width, widget.Height,
            widget.ConfigurationJson, widget.DataSourceQuery,
            widget.DefaultPeriod?.ToString(), widget.WorkCenterId, widget.ProductId,
            widget.ShowTrend, widget.ShowTarget, widget.IsVisible, widget.DisplayOrder);
    }
}

// OEE Record Commands
public record CreateOeeRecordCommand(CreateOeeRecordRequest Request) : IRequest<OeeRecordDto>;

public class CreateOeeRecordCommandHandler : IRequestHandler<CreateOeeRecordCommand, OeeRecordDto>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUser;

    public CreateOeeRecordCommandHandler(
        IManufacturingUnitOfWork unitOfWork,
        ICurrentUserService currentUser)
    {
        _unitOfWork = unitOfWork;
        _currentUser = currentUser;
    }

    public async Task<OeeRecordDto> Handle(CreateOeeRecordCommand command, CancellationToken cancellationToken)
    {
        var _ = _unitOfWork.TenantId;
        var userName = _currentUser.UserName;
        var request = command.Request;

        var record = new OeeRecord(request.WorkCenterId, request.RecordDate, request.ShiftStart, request.ShiftEnd);

        if (!string.IsNullOrEmpty(request.ShiftName))
            record.SetShiftName(request.ShiftName);

        record.SetTimeComponents(
            request.PlannedProductionTime,
            request.ActualProductionTime,
            request.DowntimeMinutes,
            request.SetupMinutes,
            request.BreakMinutes);

        record.SetProductionComponents(
            request.PlannedQuantity,
            request.ActualQuantity,
            request.GoodQuantity,
            request.DefectQuantity,
            request.ReworkQuantity,
            request.ScrapQuantity);

        record.SetCycleTimes(request.IdealCycleTime, request.ActualCycleTime);

        if (request.ProductionOrderId.HasValue || request.ProductId.HasValue)
            record.SetProductionOrderContext(request.ProductionOrderId, null, request.ProductId, null);

        if (!string.IsNullOrEmpty(request.Notes))
            record.SetNotes(request.Notes);

        if (!string.IsNullOrEmpty(userName))
            record.SetRecordedBy(userName);

        _unitOfWork.OeeRecords.Add(record);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

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

public record ValidateOeeRecordCommand(int Id) : IRequest;

public class ValidateOeeRecordCommandHandler : IRequestHandler<ValidateOeeRecordCommand>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUser;

    public ValidateOeeRecordCommandHandler(
        IManufacturingUnitOfWork unitOfWork,
        ICurrentUserService currentUser)
    {
        _unitOfWork = unitOfWork;
        _currentUser = currentUser;
    }

    public async Task Handle(ValidateOeeRecordCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var userName = _currentUser.UserName ?? throw new UnauthorizedAccessException("Kullanıcı bilgisi bulunamadı.");

        var record = await _unitOfWork.OeeRecords.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"ID '{command.Id}' olan OEE kaydı bulunamadı.");

        if (record.TenantId != tenantId)
            throw new UnauthorizedAccessException("Bu kayda erişim yetkiniz yok.");

        record.Validate(userName);

        _unitOfWork.OeeRecords.Update(record);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
