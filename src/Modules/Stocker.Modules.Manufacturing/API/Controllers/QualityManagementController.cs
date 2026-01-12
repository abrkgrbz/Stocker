using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.Manufacturing.Application.DTOs;
using Stocker.Modules.Manufacturing.Application.Features.NonConformanceReports.Commands;
using Stocker.Modules.Manufacturing.Application.Features.NonConformanceReports.Queries;
using Stocker.Modules.Manufacturing.Application.Features.CorrectivePreventiveActions.Commands;
using Stocker.Modules.Manufacturing.Application.Features.CorrectivePreventiveActions.Queries;
using Stocker.Modules.Manufacturing.Domain.Enums;

namespace Stocker.Modules.Manufacturing.Api.Controllers;

/// <summary>
/// Kalite Yonetimi - NCR (Uygunsuzluk Raporu) ve CAPA (Duzeltici/Onleyici Faaliyet) islemleri
/// </summary>
[ApiController]
[Route("api/manufacturing/quality")]
[Authorize]
public class QualityManagementController : ControllerBase
{
    private readonly IMediator _mediator;

    public QualityManagementController(IMediator mediator)
    {
        _mediator = mediator;
    }

    #region NCR - Non-Conformance Reports

    /// <summary>
    /// Tum uygunsuzluk raporlarini listeler
    /// </summary>
    [HttpGet("ncr")]
    [ProducesResponseType(typeof(IReadOnlyList<NonConformanceReportListDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllNcrs()
    {
        var result = await _mediator.Send(new GetAllNcrsQuery());
        return Ok(result);
    }

    /// <summary>
    /// Belirli bir NCR'i getirir
    /// </summary>
    [HttpGet("ncr/{id}")]
    [ProducesResponseType(typeof(NonConformanceReportDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetNcrById(int id)
    {
        var result = await _mediator.Send(new GetNcrByIdQuery(id));
        return result == null ? NotFound() : Ok(result);
    }

    /// <summary>
    /// Acik NCR'lari listeler
    /// </summary>
    [HttpGet("ncr/open")]
    [ProducesResponseType(typeof(IReadOnlyList<NonConformanceReportListDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetOpenNcrs()
    {
        var result = await _mediator.Send(new GetOpenNcrsQuery());
        return Ok(result);
    }

    /// <summary>
    /// Duruma gore NCR'lari listeler
    /// </summary>
    [HttpGet("ncr/by-status/{status}")]
    [ProducesResponseType(typeof(IReadOnlyList<NonConformanceReportListDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetNcrsByStatus(NcrStatus status)
    {
        var result = await _mediator.Send(new GetNcrsByStatusQuery(status));
        return Ok(result);
    }

    /// <summary>
    /// Kaynaga gore NCR'lari listeler
    /// </summary>
    [HttpGet("ncr/by-source/{source}")]
    [ProducesResponseType(typeof(IReadOnlyList<NonConformanceReportListDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetNcrsBySource(NcrSource source)
    {
        var result = await _mediator.Send(new GetNcrsBySourceQuery(source));
        return Ok(result);
    }

    /// <summary>
    /// Siddet derecesine gore NCR'lari listeler
    /// </summary>
    [HttpGet("ncr/by-severity/{severity}")]
    [ProducesResponseType(typeof(IReadOnlyList<NonConformanceReportListDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetNcrsBySeverity(NcrSeverity severity)
    {
        var result = await _mediator.Send(new GetNcrsBySeverityQuery(severity));
        return Ok(result);
    }

    /// <summary>
    /// Urune gore NCR'lari listeler
    /// </summary>
    [HttpGet("ncr/by-product/{productId}")]
    [ProducesResponseType(typeof(IReadOnlyList<NonConformanceReportListDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetNcrsByProduct(int productId)
    {
        var result = await _mediator.Send(new GetNcrsByProductQuery(productId));
        return Ok(result);
    }

    /// <summary>
    /// Uretim emrine gore NCR'lari listeler
    /// </summary>
    [HttpGet("ncr/by-production-order/{productionOrderId}")]
    [ProducesResponseType(typeof(IReadOnlyList<NonConformanceReportListDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetNcrsByProductionOrder(int productionOrderId)
    {
        var result = await _mediator.Send(new GetNcrsByProductionOrderQuery(productionOrderId));
        return Ok(result);
    }

    /// <summary>
    /// Musteriye gore NCR'lari listeler
    /// </summary>
    [HttpGet("ncr/by-customer/{customerId}")]
    [ProducesResponseType(typeof(IReadOnlyList<NonConformanceReportListDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetNcrsByCustomer(int customerId)
    {
        var result = await _mediator.Send(new GetNcrsByCustomerQuery(customerId));
        return Ok(result);
    }

    /// <summary>
    /// Tedarikciye gore NCR'lari listeler
    /// </summary>
    [HttpGet("ncr/by-supplier/{supplierId}")]
    [ProducesResponseType(typeof(IReadOnlyList<NonConformanceReportListDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetNcrsBySupplier(int supplierId)
    {
        var result = await _mediator.Send(new GetNcrsBySupplierQuery(supplierId));
        return Ok(result);
    }

    /// <summary>
    /// Tarih araligina gore NCR'lari listeler
    /// </summary>
    [HttpGet("ncr/by-date-range")]
    [ProducesResponseType(typeof(IReadOnlyList<NonConformanceReportListDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetNcrsByDateRange([FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
    {
        var result = await _mediator.Send(new GetNcrsByDateRangeQuery(startDate, endDate));
        return Ok(result);
    }

    /// <summary>
    /// NCR istatistiklerini getirir
    /// </summary>
    [HttpGet("ncr/statistics")]
    [ProducesResponseType(typeof(NcrStatisticsDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetNcrStatistics([FromQuery] DateTime? startDate = null, [FromQuery] DateTime? endDate = null)
    {
        var result = await _mediator.Send(new GetNcrStatisticsQuery(startDate, endDate));
        return Ok(result);
    }

    /// <summary>
    /// Yeni NCR olusturur
    /// </summary>
    [HttpPost("ncr")]
    [ProducesResponseType(typeof(NonConformanceReportListDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateNcr([FromBody] CreateNcrRequest request)
    {
        var result = await _mediator.Send(new CreateNcrCommand(request));
        return CreatedAtAction(nameof(GetNcrById), new { id = result.Id }, result);
    }

    /// <summary>
    /// NCR'i gunceller
    /// </summary>
    [HttpPut("ncr/{id}")]
    [ProducesResponseType(typeof(NonConformanceReportListDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateNcr(int id, [FromBody] UpdateNcrRequest request)
    {
        var result = await _mediator.Send(new UpdateNcrCommand(id, request));
        return Ok(result);
    }

    /// <summary>
    /// NCR sorusturmasini baslatir
    /// </summary>
    [HttpPost("ncr/{id}/start-investigation")]
    [ProducesResponseType(typeof(NonConformanceReportListDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> StartNcrInvestigation(int id, [FromBody] StartNcrInvestigationRequest request)
    {
        var result = await _mediator.Send(new StartNcrInvestigationCommand(id, request));
        return Ok(result);
    }

    /// <summary>
    /// NCR sorusturmasini tamamlar
    /// </summary>
    [HttpPost("ncr/{id}/complete-investigation")]
    [ProducesResponseType(typeof(NonConformanceReportListDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> CompleteNcrInvestigation(int id)
    {
        var result = await _mediator.Send(new CompleteNcrInvestigationCommand(id));
        return Ok(result);
    }

    /// <summary>
    /// NCR kok nedenini belirler
    /// </summary>
    [HttpPost("ncr/{id}/set-root-cause")]
    [ProducesResponseType(typeof(NonConformanceReportListDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> SetNcrRootCause(int id, [FromBody] SetNcrRootCauseRequest request)
    {
        var result = await _mediator.Send(new SetNcrRootCauseCommand(id, request));
        return Ok(result);
    }

    /// <summary>
    /// NCR tasarrufunu belirler
    /// </summary>
    [HttpPost("ncr/{id}/set-disposition")]
    [ProducesResponseType(typeof(NonConformanceReportListDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> SetNcrDisposition(int id, [FromBody] SetNcrDispositionRequest request)
    {
        var result = await _mediator.Send(new SetNcrDispositionCommand(id, request));
        return Ok(result);
    }

    /// <summary>
    /// NCR'a onleme aksiyonu ekler
    /// </summary>
    [HttpPost("ncr/{id}/containment-actions")]
    [ProducesResponseType(typeof(NcrContainmentActionDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> AddContainmentAction(int id, [FromBody] AddNcrContainmentActionRequest request)
    {
        var result = await _mediator.Send(new AddNcrContainmentActionCommand(id, request));
        return Created($"api/manufacturing/quality/ncr/{id}/containment-actions", result);
    }

    /// <summary>
    /// Onleme aksiyonunu tamamlar
    /// </summary>
    [HttpPost("ncr/{ncrId}/containment-actions/{actionId}/complete")]
    [ProducesResponseType(typeof(NcrContainmentActionDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> CompleteContainmentAction(int ncrId, int actionId, [FromBody] CompleteNcrContainmentActionRequest request)
    {
        request = request with { ContainmentActionId = actionId };
        var result = await _mediator.Send(new CompleteNcrContainmentActionCommand(ncrId, request));
        return Ok(result);
    }

    /// <summary>
    /// NCR'i kapatir
    /// </summary>
    [HttpPost("ncr/{id}/close")]
    [ProducesResponseType(typeof(NonConformanceReportListDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> CloseNcr(int id, [FromBody] CloseNcrRequest request)
    {
        var result = await _mediator.Send(new CloseNcrCommand(id, request));
        return Ok(result);
    }

    /// <summary>
    /// NCR'i iptal eder
    /// </summary>
    [HttpPost("ncr/{id}/cancel")]
    [ProducesResponseType(typeof(NonConformanceReportListDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> CancelNcr(int id, [FromQuery] string reason)
    {
        var result = await _mediator.Send(new CancelNcrCommand(id, reason));
        return Ok(result);
    }

    #endregion

    #region CAPA - Corrective and Preventive Actions

    /// <summary>
    /// Tum CAPA'lari listeler
    /// </summary>
    [HttpGet("capa")]
    [ProducesResponseType(typeof(IReadOnlyList<CorrectivePreventiveActionListDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllCapas()
    {
        var result = await _mediator.Send(new GetAllCapasQuery());
        return Ok(result);
    }

    /// <summary>
    /// Belirli bir CAPA'yi getirir
    /// </summary>
    [HttpGet("capa/{id}")]
    [ProducesResponseType(typeof(CorrectivePreventiveActionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetCapaById(int id)
    {
        var result = await _mediator.Send(new GetCapaByIdQuery(id));
        return result == null ? NotFound() : Ok(result);
    }

    /// <summary>
    /// Acik CAPA'lari listeler
    /// </summary>
    [HttpGet("capa/open")]
    [ProducesResponseType(typeof(IReadOnlyList<CorrectivePreventiveActionListDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetOpenCapas()
    {
        var result = await _mediator.Send(new GetOpenCapasQuery());
        return Ok(result);
    }

    /// <summary>
    /// Gecikmis CAPA'lari listeler
    /// </summary>
    [HttpGet("capa/overdue")]
    [ProducesResponseType(typeof(IReadOnlyList<CorrectivePreventiveActionListDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetOverdueCapas()
    {
        var result = await _mediator.Send(new GetOverdueCapasQuery());
        return Ok(result);
    }

    /// <summary>
    /// Duruma gore CAPA'lari listeler
    /// </summary>
    [HttpGet("capa/by-status/{status}")]
    [ProducesResponseType(typeof(IReadOnlyList<CorrectivePreventiveActionListDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCapasByStatus(CapaStatus status)
    {
        var result = await _mediator.Send(new GetCapasByStatusQuery(status));
        return Ok(result);
    }

    /// <summary>
    /// Tipe gore CAPA'lari listeler (Duzeltici/Onleyici)
    /// </summary>
    [HttpGet("capa/by-type/{type}")]
    [ProducesResponseType(typeof(IReadOnlyList<CorrectivePreventiveActionListDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCapasByType(CapaType type)
    {
        var result = await _mediator.Send(new GetCapasByTypeQuery(type));
        return Ok(result);
    }

    /// <summary>
    /// NCR'a bagli CAPA'lari listeler
    /// </summary>
    [HttpGet("capa/by-ncr/{ncrId}")]
    [ProducesResponseType(typeof(IReadOnlyList<CorrectivePreventiveActionListDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCapasByNcr(int ncrId)
    {
        var result = await _mediator.Send(new GetCapasByNcrQuery(ncrId));
        return Ok(result);
    }

    /// <summary>
    /// Sorumlu kullaniciya gore CAPA'lari listeler
    /// </summary>
    [HttpGet("capa/by-responsible-user/{userId}")]
    [ProducesResponseType(typeof(IReadOnlyList<CorrectivePreventiveActionListDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCapasByResponsibleUser(int userId)
    {
        var result = await _mediator.Send(new GetCapasByResponsibleUserQuery(userId));
        return Ok(result);
    }

    /// <summary>
    /// Tarih araligina gore CAPA'lari listeler
    /// </summary>
    [HttpGet("capa/by-due-date-range")]
    [ProducesResponseType(typeof(IReadOnlyList<CorrectivePreventiveActionListDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCapasByDueDateRange([FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
    {
        var result = await _mediator.Send(new GetCapasByDueDateRangeQuery(startDate, endDate));
        return Ok(result);
    }

    /// <summary>
    /// CAPA istatistiklerini getirir
    /// </summary>
    [HttpGet("capa/statistics")]
    [ProducesResponseType(typeof(CapaStatisticsDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCapaStatistics([FromQuery] DateTime? startDate = null, [FromQuery] DateTime? endDate = null)
    {
        var result = await _mediator.Send(new GetCapaStatisticsQuery(startDate, endDate));
        return Ok(result);
    }

    /// <summary>
    /// Yeni CAPA olusturur
    /// </summary>
    [HttpPost("capa")]
    [ProducesResponseType(typeof(CorrectivePreventiveActionListDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateCapa([FromBody] CreateCapaRequest request)
    {
        var result = await _mediator.Send(new CreateCapaCommand(request));
        return CreatedAtAction(nameof(GetCapaById), new { id = result.Id }, result);
    }

    /// <summary>
    /// CAPA'yi gunceller
    /// </summary>
    [HttpPut("capa/{id}")]
    [ProducesResponseType(typeof(CorrectivePreventiveActionListDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> UpdateCapa(int id, [FromBody] UpdateCapaRequest request)
    {
        var result = await _mediator.Send(new UpdateCapaCommand(id, request));
        return Ok(result);
    }

    /// <summary>
    /// CAPA'yi acar
    /// </summary>
    [HttpPost("capa/{id}/open")]
    [ProducesResponseType(typeof(CorrectivePreventiveActionListDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> OpenCapa(int id)
    {
        var result = await _mediator.Send(new OpenCapaCommand(id));
        return Ok(result);
    }

    /// <summary>
    /// CAPA planlamasini baslatir
    /// </summary>
    [HttpPost("capa/{id}/start-planning")]
    [ProducesResponseType(typeof(CorrectivePreventiveActionListDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> StartCapaPlanning(int id)
    {
        var result = await _mediator.Send(new StartCapaPlanningCommand(id));
        return Ok(result);
    }

    /// <summary>
    /// CAPA uygulamasini baslatir
    /// </summary>
    [HttpPost("capa/{id}/start-implementation")]
    [ProducesResponseType(typeof(CorrectivePreventiveActionListDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> StartCapaImplementation(int id)
    {
        var result = await _mediator.Send(new StartCapaImplementationCommand(id));
        return Ok(result);
    }

    /// <summary>
    /// CAPA ilerleme durumunu gunceller
    /// </summary>
    [HttpPost("capa/{id}/update-progress")]
    [ProducesResponseType(typeof(CorrectivePreventiveActionListDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> UpdateCapaProgress(int id, [FromBody] UpdateCapaProgressRequest request)
    {
        var result = await _mediator.Send(new UpdateCapaProgressCommand(id, request));
        return Ok(result);
    }

    /// <summary>
    /// CAPA uygulamasini tamamlar
    /// </summary>
    [HttpPost("capa/{id}/complete-implementation")]
    [ProducesResponseType(typeof(CorrectivePreventiveActionListDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> CompleteCapaImplementation(int id)
    {
        var result = await _mediator.Send(new CompleteCapaImplementationCommand(id));
        return Ok(result);
    }

    /// <summary>
    /// CAPA'yi dogrular
    /// </summary>
    [HttpPost("capa/{id}/verify")]
    [ProducesResponseType(typeof(CorrectivePreventiveActionListDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> VerifyCapa(int id, [FromBody] VerifyCapaRequest request)
    {
        var result = await _mediator.Send(new VerifyCapaCommand(id, request));
        return Ok(result);
    }

    /// <summary>
    /// CAPA etkinligini degerlendirir
    /// </summary>
    [HttpPost("capa/{id}/evaluate-effectiveness")]
    [ProducesResponseType(typeof(CorrectivePreventiveActionListDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> EvaluateCapaEffectiveness(int id, [FromBody] EvaluateCapaEffectivenessRequest request)
    {
        var result = await _mediator.Send(new EvaluateCapaEffectivenessCommand(id, request));
        return Ok(result);
    }

    /// <summary>
    /// CAPA'yi kapatir
    /// </summary>
    [HttpPost("capa/{id}/close")]
    [ProducesResponseType(typeof(CorrectivePreventiveActionListDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> CloseCapa(int id, [FromBody] CloseCapaRequest request)
    {
        var result = await _mediator.Send(new CloseCapaCommand(id, request));
        return Ok(result);
    }

    /// <summary>
    /// CAPA'yi iptal eder
    /// </summary>
    [HttpPost("capa/{id}/cancel")]
    [ProducesResponseType(typeof(CorrectivePreventiveActionListDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> CancelCapa(int id, [FromQuery] string reason)
    {
        var result = await _mediator.Send(new CancelCapaCommand(id, reason));
        return Ok(result);
    }

    /// <summary>
    /// CAPA'ya gorev ekler
    /// </summary>
    [HttpPost("capa/{id}/tasks")]
    [ProducesResponseType(typeof(CapaTaskDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> AddCapaTask(int id, [FromBody] AddCapaTaskRequest request)
    {
        var result = await _mediator.Send(new AddCapaTaskCommand(id, request));
        return Created($"api/manufacturing/quality/capa/{id}/tasks", result);
    }

    /// <summary>
    /// CAPA gorevini tamamlar
    /// </summary>
    [HttpPost("capa/{capaId}/tasks/{taskId}/complete")]
    [ProducesResponseType(typeof(CapaTaskDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> CompleteCapaTask(int capaId, int taskId, [FromBody] CompleteCapaTaskRequest request)
    {
        request = request with { TaskId = taskId };
        var result = await _mediator.Send(new CompleteCapaTaskCommand(capaId, request));
        return Ok(result);
    }

    #endregion
}
