using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.Manufacturing.Application.DTOs;
using Stocker.Modules.Manufacturing.Application.Features.KpiDashboard.Commands;
using Stocker.Modules.Manufacturing.Application.Features.KpiDashboard.Queries;

namespace Stocker.Modules.Manufacturing.Api.Controllers;

[ApiController]
[Route("api/manufacturing/[controller]")]
[Authorize]
public class KpiDashboardController : ControllerBase
{
    private readonly IMediator _mediator;

    public KpiDashboardController(IMediator mediator)
    {
        _mediator = mediator;
    }

    #region KPI Definitions

    /// <summary>
    /// Tüm aktif KPI tanımlarını listeler
    /// </summary>
    [HttpGet("kpi-definitions")]
    [ProducesResponseType(typeof(IReadOnlyList<KpiDefinitionListDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetKpiDefinitions()
    {
        var result = await _mediator.Send(new GetKpiDefinitionsQuery());
        return Ok(result);
    }

    /// <summary>
    /// Belirli bir KPI tanımını getirir
    /// </summary>
    [HttpGet("kpi-definitions/{id}")]
    [ProducesResponseType(typeof(KpiDefinitionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetKpiDefinition(int id)
    {
        var result = await _mediator.Send(new GetKpiDefinitionByIdQuery(id));
        return result == null ? NotFound() : Ok(result);
    }

    /// <summary>
    /// Yeni KPI tanımı oluşturur
    /// </summary>
    [HttpPost("kpi-definitions")]
    [ProducesResponseType(typeof(KpiDefinitionDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateKpiDefinition([FromBody] CreateKpiDefinitionRequest request)
    {
        var result = await _mediator.Send(new CreateKpiDefinitionCommand(request));
        return CreatedAtAction(nameof(GetKpiDefinition), new { id = result.Id }, result);
    }

    /// <summary>
    /// KPI tanımını günceller
    /// </summary>
    [HttpPut("kpi-definitions/{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> UpdateKpiDefinition(int id, [FromBody] UpdateKpiDefinitionRequest request)
    {
        await _mediator.Send(new UpdateKpiDefinitionCommand(id, request));
        return NoContent();
    }

    /// <summary>
    /// KPI tanımını siler
    /// </summary>
    [HttpDelete("kpi-definitions/{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> DeleteKpiDefinition(int id)
    {
        await _mediator.Send(new DeleteKpiDefinitionCommand(id));
        return NoContent();
    }

    #endregion

    #region KPI Values

    /// <summary>
    /// KPI değerlerini listeler
    /// </summary>
    [HttpGet("kpi-values")]
    [ProducesResponseType(typeof(IReadOnlyList<KpiValueListDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetKpiValues([FromQuery] int kpiDefinitionId, [FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
    {
        var result = await _mediator.Send(new GetKpiValuesQuery(kpiDefinitionId, startDate, endDate));
        return Ok(result);
    }

    /// <summary>
    /// En son KPI değerini getirir
    /// </summary>
    [HttpGet("kpi-values/latest/{kpiDefinitionId}")]
    [ProducesResponseType(typeof(KpiValueDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetLatestKpiValue(int kpiDefinitionId)
    {
        var result = await _mediator.Send(new GetLatestKpiValueQuery(kpiDefinitionId));
        return result == null ? NotFound() : Ok(result);
    }

    /// <summary>
    /// Yeni KPI değeri kaydeder
    /// </summary>
    [HttpPost("kpi-values")]
    [ProducesResponseType(typeof(KpiValueDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateKpiValue([FromBody] CreateKpiValueRequest request)
    {
        var result = await _mediator.Send(new CreateKpiValueCommand(request));
        return CreatedAtAction(nameof(GetLatestKpiValue), new { kpiDefinitionId = result.KpiDefinitionId }, result);
    }

    /// <summary>
    /// KPI trend verilerini getirir
    /// </summary>
    [HttpGet("kpi-values/trend/{kpiDefinitionId}")]
    [ProducesResponseType(typeof(KpiTrendDataDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetKpiTrend(int kpiDefinitionId, [FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
    {
        var result = await _mediator.Send(new GetKpiTrendQuery(kpiDefinitionId, startDate, endDate));
        return result == null ? NotFound() : Ok(result);
    }

    #endregion

    #region KPI Targets

    /// <summary>
    /// Yeni KPI hedefi oluşturur
    /// </summary>
    [HttpPost("kpi-targets")]
    [ProducesResponseType(typeof(KpiTargetDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateKpiTarget([FromBody] CreateKpiTargetRequest request)
    {
        var result = await _mediator.Send(new CreateKpiTargetCommand(request));
        return Created("", result);
    }

    /// <summary>
    /// KPI hedefini onaylar
    /// </summary>
    [HttpPost("kpi-targets/{id}/approve")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> ApproveKpiTarget(int id)
    {
        await _mediator.Send(new ApproveKpiTargetCommand(id));
        return NoContent();
    }

    #endregion

    #region Dashboard Configurations

    /// <summary>
    /// Dashboard yapılandırmalarını listeler
    /// </summary>
    [HttpGet("dashboards")]
    [ProducesResponseType(typeof(IReadOnlyList<DashboardConfigurationListDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetDashboards()
    {
        var result = await _mediator.Send(new GetDashboardConfigurationsQuery());
        return Ok(result);
    }

    /// <summary>
    /// Dashboard'u widget'larıyla birlikte getirir
    /// </summary>
    [HttpGet("dashboards/{id}")]
    [ProducesResponseType(typeof(DashboardConfigurationDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetDashboard(int id)
    {
        var result = await _mediator.Send(new GetDashboardWithWidgetsQuery(id));
        return result == null ? NotFound() : Ok(result);
    }

    /// <summary>
    /// Varsayılan dashboard'u getirir
    /// </summary>
    [HttpGet("dashboards/default")]
    [ProducesResponseType(typeof(DashboardConfigurationDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetDefaultDashboard()
    {
        var result = await _mediator.Send(new GetDefaultDashboardQuery());
        return result == null ? NotFound() : Ok(result);
    }

    /// <summary>
    /// Yeni dashboard oluşturur
    /// </summary>
    [HttpPost("dashboards")]
    [ProducesResponseType(typeof(DashboardConfigurationDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateDashboard([FromBody] CreateDashboardConfigurationRequest request)
    {
        var result = await _mediator.Send(new CreateDashboardConfigurationCommand(request));
        return CreatedAtAction(nameof(GetDashboard), new { id = result.Id }, result);
    }

    /// <summary>
    /// Dashboard'u günceller
    /// </summary>
    [HttpPut("dashboards/{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> UpdateDashboard(int id, [FromBody] UpdateDashboardConfigurationRequest request)
    {
        await _mediator.Send(new UpdateDashboardConfigurationCommand(id, request));
        return NoContent();
    }

    /// <summary>
    /// Dashboard'u siler
    /// </summary>
    [HttpDelete("dashboards/{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> DeleteDashboard(int id)
    {
        await _mediator.Send(new DeleteDashboardConfigurationCommand(id));
        return NoContent();
    }

    #endregion

    #region Dashboard Widgets

    /// <summary>
    /// Dashboard'a widget ekler
    /// </summary>
    [HttpPost("dashboards/widgets")]
    [ProducesResponseType(typeof(DashboardWidgetDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateWidget([FromBody] CreateDashboardWidgetRequest request)
    {
        var result = await _mediator.Send(new CreateDashboardWidgetCommand(request));
        return Created("", result);
    }

    #endregion

    #region OEE Records

    /// <summary>
    /// OEE kayıtlarını listeler
    /// </summary>
    [HttpGet("oee")]
    [ProducesResponseType(typeof(IReadOnlyList<OeeRecordListDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetOeeRecords([FromQuery] int? workCenterId, [FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
    {
        var result = await _mediator.Send(new GetOeeRecordsQuery(workCenterId, startDate, endDate));
        return Ok(result);
    }

    /// <summary>
    /// OEE kaydını getirir
    /// </summary>
    [HttpGet("oee/{id}")]
    [ProducesResponseType(typeof(OeeRecordDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetOeeRecord(int id)
    {
        var result = await _mediator.Send(new GetOeeRecordByIdQuery(id));
        return result == null ? NotFound() : Ok(result);
    }

    /// <summary>
    /// OEE özeti getirir (Dashboard için)
    /// </summary>
    [HttpGet("oee/summary")]
    [ProducesResponseType(typeof(DashboardOeeSummaryDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetOeeSummary([FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
    {
        var result = await _mediator.Send(new GetOeeSummaryQuery(startDate, endDate));
        return Ok(result);
    }

    /// <summary>
    /// Yeni OEE kaydı oluşturur
    /// </summary>
    [HttpPost("oee")]
    [ProducesResponseType(typeof(OeeRecordDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateOeeRecord([FromBody] CreateOeeRecordRequest request)
    {
        var result = await _mediator.Send(new CreateOeeRecordCommand(request));
        return CreatedAtAction(nameof(GetOeeRecord), new { id = result.Id }, result);
    }

    /// <summary>
    /// OEE kaydını doğrular
    /// </summary>
    [HttpPost("oee/{id}/validate")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> ValidateOeeRecord(int id)
    {
        await _mediator.Send(new ValidateOeeRecordCommand(id));
        return NoContent();
    }

    #endregion

    #region Performance Summaries

    /// <summary>
    /// Üretim performans özetlerini listeler
    /// </summary>
    [HttpGet("performance-summaries")]
    [ProducesResponseType(typeof(IReadOnlyList<ProductionPerformanceSummaryListDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPerformanceSummaries([FromQuery] string periodType = "Günlük", [FromQuery] DateTime? startDate = null, [FromQuery] DateTime? endDate = null)
    {
        var result = await _mediator.Send(new GetProductionPerformanceSummariesQuery(periodType, startDate, endDate));
        return Ok(result);
    }

    #endregion

    #region Dashboard Real-Time Data

    /// <summary>
    /// Dashboard için KPI kartlarını getirir
    /// </summary>
    [HttpGet("dashboard-data/kpi-cards")]
    [ProducesResponseType(typeof(IReadOnlyList<DashboardKpiCardDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetDashboardKpiCards()
    {
        var result = await _mediator.Send(new GetDashboardKpiCardsQuery());
        return Ok(result);
    }

    #endregion
}
