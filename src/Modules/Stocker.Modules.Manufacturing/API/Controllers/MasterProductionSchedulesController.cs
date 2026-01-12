using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.Manufacturing.Application.DTOs;
using Stocker.Modules.Manufacturing.Application.Features.MasterProductionSchedules.Commands;
using Stocker.Modules.Manufacturing.Application.Features.MasterProductionSchedules.Queries;

namespace Stocker.Modules.Manufacturing.API.Controllers;

[ApiController]
[Route("api/manufacturing/[controller]")]
[Authorize]
public class MasterProductionSchedulesController : ControllerBase
{
    private readonly IMediator _mediator;

    public MasterProductionSchedulesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Tüm MPS'leri listeler
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<MasterProductionScheduleListDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? status,
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate,
        [FromQuery] bool? activeOnly)
    {
        var query = new GetMasterProductionSchedulesQuery(status, startDate, endDate, activeOnly);
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// Belirli bir MPS'i getirir
    /// </summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(MasterProductionScheduleDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id)
    {
        try
        {
            var query = new GetMasterProductionScheduleQuery(id);
            var result = await _mediator.Send(query);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Yeni MPS oluşturur
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(MasterProductionScheduleDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreateMasterProductionScheduleRequest request)
    {
        try
        {
            var command = new CreateMasterProductionScheduleCommand(request);
            var result = await _mediator.Send(command);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// MPS'i günceller
    /// </summary>
    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(MasterProductionScheduleDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateMasterProductionScheduleRequest request)
    {
        try
        {
            var command = new UpdateMasterProductionScheduleCommand(id, request);
            var result = await _mediator.Send(command);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    /// <summary>
    /// MPS'i onaylar
    /// </summary>
    [HttpPost("{id:int}/approve")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Approve(int id)
    {
        try
        {
            var command = new ApproveMasterProductionScheduleCommand(id);
            await _mediator.Send(command);
            return Ok(new { message = "MPS onaylandı." });
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
    /// MPS'i aktif eder
    /// </summary>
    [HttpPost("{id:int}/activate")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Activate(int id)
    {
        try
        {
            var command = new ActivateMasterProductionScheduleCommand(id);
            await _mediator.Send(command);
            return Ok(new { message = "MPS aktif edildi." });
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
    /// MPS'i siler
    /// </summary>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var command = new DeleteMasterProductionScheduleCommand(id);
            await _mediator.Send(command);
            return NoContent();
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

    // MPS Lines

    /// <summary>
    /// MPS satırlarını listeler
    /// </summary>
    [HttpGet("lines")]
    [ProducesResponseType(typeof(IReadOnlyList<MpsLineListDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetLines(
        [FromQuery] int? scheduleId,
        [FromQuery] int? productId,
        [FromQuery] DateTime? periodStart,
        [FromQuery] DateTime? periodEnd)
    {
        var query = new GetMpsLinesQuery(scheduleId, productId, periodStart, periodEnd);
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// MPS'e satır ekler
    /// </summary>
    [HttpPost("{scheduleId:int}/lines")]
    [ProducesResponseType(typeof(MpsLineDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AddLine(int scheduleId, [FromBody] AddMpsLineRequest request)
    {
        try
        {
            var command = new AddMpsLineCommand(scheduleId, request);
            var result = await _mediator.Send(command);
            return CreatedAtAction(nameof(GetById), new { id = scheduleId }, result);
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
    /// MPS satırını günceller
    /// </summary>
    [HttpPut("{scheduleId:int}/lines/{lineId:int}")]
    [ProducesResponseType(typeof(MpsLineDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateLine(int scheduleId, int lineId, [FromBody] UpdateMpsLineRequest request)
    {
        try
        {
            var command = new UpdateMpsLineCommand(scheduleId, lineId, request);
            var result = await _mediator.Send(command);
            return Ok(result);
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
    /// Gerçekleşen değerleri kaydeder
    /// </summary>
    [HttpPost("{scheduleId:int}/lines/{lineId:int}/actuals")]
    [ProducesResponseType(typeof(MpsLineDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RecordActuals(int scheduleId, int lineId, [FromBody] RecordActualsRequest request)
    {
        try
        {
            var command = new RecordActualsCommand(scheduleId, lineId, request.ProductionQuantity, request.SalesQuantity);
            var result = await _mediator.Send(command);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    /// <summary>
    /// MPS satırını siler
    /// </summary>
    [HttpDelete("{scheduleId:int}/lines/{lineId:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteLine(int scheduleId, int lineId)
    {
        try
        {
            var command = new DeleteMpsLineCommand(scheduleId, lineId);
            await _mediator.Send(command);
            return NoContent();
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

    // ATP Query

    /// <summary>
    /// Belirli ürün ve tarih için ATP sorgular
    /// </summary>
    [HttpGet("atp")]
    [ProducesResponseType(typeof(AtpQueryResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAvailableToPromise(
        [FromQuery] int productId,
        [FromQuery] DateTime date)
    {
        var query = new GetAvailableToPromiseQuery(productId, date);
        var result = await _mediator.Send(query);
        return Ok(result);
    }
}

public record RecordActualsRequest(decimal ProductionQuantity, decimal SalesQuantity);
