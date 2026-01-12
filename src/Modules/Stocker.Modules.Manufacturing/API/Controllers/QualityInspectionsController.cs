using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.Manufacturing.Application.DTOs;
using Stocker.Modules.Manufacturing.Application.Features.QualityInspections.Commands;
using Stocker.Modules.Manufacturing.Application.Features.QualityInspections.Queries;

namespace Stocker.Modules.Manufacturing.API.Controllers;

[ApiController]
[Route("api/manufacturing/[controller]")]
[Authorize]
public class QualityInspectionsController : ControllerBase
{
    private readonly IMediator _mediator;

    public QualityInspectionsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Tüm kalite kontrollerini listeler
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<QualityInspectionListDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? inspectionType,
        [FromQuery] string? result,
        [FromQuery] Guid? productId,
        [FromQuery] Guid? productionOrderId,
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate)
    {
        var query = new GetQualityInspectionsQuery(
            inspectionType, result, productId, productionOrderId, startDate, endDate);
        var inspections = await _mediator.Send(query);
        return Ok(inspections);
    }

    /// <summary>
    /// Belirli bir kalite kontrolünü getirir
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(QualityInspectionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id)
    {
        try
        {
            var query = new GetQualityInspectionQuery(id);
            var inspection = await _mediator.Send(query);
            return Ok(inspection);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Yeni kalite kontrolü oluşturur
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(QualityInspectionDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreateQualityInspectionRequest request)
    {
        try
        {
            var command = new CreateQualityInspectionCommand(request);
            var result = await _mediator.Send(command);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Kalite kontrolünü başlatır
    /// </summary>
    [HttpPost("{id:guid}/start")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Start(Guid id, [FromBody] StartInspectionRequest request)
    {
        try
        {
            var command = new StartInspectionCommand(id, request);
            await _mediator.Send(command);
            return Ok(new { message = "Kalite kontrolü başlatıldı." });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Kalite kontrolü sonucunu kaydeder
    /// </summary>
    [HttpPost("{id:guid}/result")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RecordResult(Guid id, [FromBody] RecordInspectionResultRequest request)
    {
        try
        {
            var command = new RecordInspectionResultCommand(id, request);
            await _mediator.Send(command);
            return Ok(new { message = "Kalite kontrolü sonucu kaydedildi." });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Uygunsuzluk kaydı oluşturur
    /// </summary>
    [HttpPost("{id:guid}/nonconformance")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RecordNonConformance(Guid id, [FromBody] RecordNonConformanceRequest request)
    {
        try
        {
            var command = new RecordNonConformanceCommand(id, request);
            await _mediator.Send(command);
            return Ok(new { message = "Uygunsuzluk kaydedildi." });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Kalite kararı (disposition) verir
    /// </summary>
    [HttpPost("{id:guid}/disposition")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> SetDisposition(Guid id, [FromBody] SetDispositionRequest request)
    {
        try
        {
            var command = new SetDispositionCommand(id, request);
            await _mediator.Send(command);
            return Ok(new { message = "Kalite kararı kaydedildi." });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Kalite kontrolünü tamamlar
    /// </summary>
    [HttpPost("{id:guid}/complete")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Complete(Guid id)
    {
        try
        {
            var command = new CompleteInspectionCommand(id);
            await _mediator.Send(command);
            return Ok(new { message = "Kalite kontrolü tamamlandı." });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Açık kalite kontrollerini listeler
    /// </summary>
    [HttpGet("open")]
    [ProducesResponseType(typeof(IReadOnlyList<QualityInspectionListDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetOpen()
    {
        var query = new GetQualityInspectionsQuery(OpenOnly: true);
        var inspections = await _mediator.Send(query);
        return Ok(inspections);
    }

    /// <summary>
    /// Uygunsuzluk bulunan kalite kontrollerini listeler
    /// </summary>
    [HttpGet("nonconformance")]
    [ProducesResponseType(typeof(IReadOnlyList<QualityInspectionListDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetWithNonConformance()
    {
        var query = new GetQualityInspectionsQuery(WithNonConformance: true);
        var inspections = await _mediator.Send(query);
        return Ok(inspections);
    }
}
