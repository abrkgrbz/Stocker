using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.Manufacturing.Application.DTOs;
using Stocker.Modules.Manufacturing.Application.Features.CostAccounting.Commands;
using Stocker.Modules.Manufacturing.Application.Features.CostAccounting.Queries;

namespace Stocker.Modules.Manufacturing.API.Controllers;

[ApiController]
[Route("api/manufacturing/cost-accounting")]
[Authorize]
public class CostAccountingController : ControllerBase
{
    private readonly IMediator _mediator;

    public CostAccountingController(IMediator mediator)
    {
        _mediator = mediator;
    }

    #region Production Cost Records

    /// <summary>
    /// Üretim maliyet kayıtlarını listeler
    /// </summary>
    [HttpGet("records")]
    [ProducesResponseType(typeof(IReadOnlyList<ProductionCostRecordListDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCostRecords(
        [FromQuery] int? year,
        [FromQuery] int? month,
        [FromQuery] string? accountingMethod,
        [FromQuery] int? productionOrderId,
        [FromQuery] int? productId,
        [FromQuery] string? costCenterId,
        [FromQuery] bool? isFinalized)
    {
        var query = new GetProductionCostRecordsQuery(year, month, accountingMethod, productionOrderId, productId, costCenterId, isFinalized);
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// Belirli bir maliyet kaydını getirir
    /// </summary>
    [HttpGet("records/{id:int}")]
    [ProducesResponseType(typeof(ProductionCostRecordDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetCostRecordById(int id)
    {
        var query = new GetProductionCostRecordByIdQuery(id);
        var result = await _mediator.Send(query);

        if (result == null)
            return NotFound(new { message = $"ID '{id}' olan maliyet kaydı bulunamadı." });

        return Ok(result);
    }

    /// <summary>
    /// Yeni maliyet kaydı oluşturur
    /// </summary>
    [HttpPost("records")]
    [ProducesResponseType(typeof(ProductionCostRecordDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateCostRecord([FromBody] CreateProductionCostRecordRequest request)
    {
        try
        {
            var command = new CreateProductionCostRecordCommand(request);
            var result = await _mediator.Send(command);
            return CreatedAtAction(nameof(GetCostRecordById), new { id = result.Id }, result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Direkt maliyetleri günceller
    /// </summary>
    [HttpPut("records/{id:int}/direct-costs")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> SetDirectCosts(int id, [FromBody] SetProductionDirectCostsRequest request)
    {
        try
        {
            var command = new SetDirectCostsCommand(id, request);
            await _mediator.Send(command);
            return Ok(new { message = "Direkt maliyetler güncellendi." });
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
    /// Genel üretim giderlerini günceller
    /// </summary>
    [HttpPut("records/{id:int}/overhead-costs")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> SetOverheadCosts(int id, [FromBody] SetOverheadCostsRequest request)
    {
        try
        {
            var command = new SetOverheadCostsCommand(id, request);
            await _mediator.Send(command);
            return Ok(new { message = "Genel üretim giderleri güncellendi." });
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
    /// Sapmaları günceller
    /// </summary>
    [HttpPut("records/{id:int}/variances")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> SetVariances(int id, [FromBody] SetVariancesRequest request)
    {
        try
        {
            var command = new SetVariancesCommand(id, request);
            await _mediator.Send(command);
            return Ok(new { message = "Sapmalar güncellendi." });
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
    /// Maliyet kaydını kesinleştirir
    /// </summary>
    [HttpPost("records/{id:int}/finalize")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> FinalizeCostRecord(int id)
    {
        try
        {
            var command = new FinalizeCostRecordCommand(id);
            await _mediator.Send(command);
            return Ok(new { message = "Maliyet kaydı kesinleştirildi." });
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
    /// Maliyet dağıtımı ekler
    /// </summary>
    [HttpPost("records/{recordId:int}/allocations")]
    [ProducesResponseType(typeof(ProductionCostAllocationDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AddCostAllocation(int recordId, [FromBody] AddCostAllocationRequest request)
    {
        try
        {
            var command = new AddCostAllocationCommand(recordId, request);
            var result = await _mediator.Send(command);
            return CreatedAtAction(nameof(GetCostRecordById), new { id = recordId }, result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Yevmiye kaydı ekler
    /// </summary>
    [HttpPost("records/{recordId:int}/journal-entries")]
    [ProducesResponseType(typeof(CostJournalEntryDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AddJournalEntry(int recordId, [FromBody] AddJournalEntryRequest request)
    {
        try
        {
            var command = new AddJournalEntryCommand(recordId, request);
            var result = await _mediator.Send(command);
            return CreatedAtAction(nameof(GetCostRecordById), new { id = recordId }, result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Yevmiye kaydını muhasebeleştirir
    /// </summary>
    [HttpPost("records/{recordId:int}/journal-entries/{entryId:int}/post")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> PostJournalEntry(int recordId, int entryId)
    {
        try
        {
            var command = new PostJournalEntryCommand(recordId, entryId);
            await _mediator.Send(command);
            return Ok(new { message = "Yevmiye kaydı muhasebeleştirildi." });
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
    /// Maliyet kaydını siler
    /// </summary>
    [HttpDelete("records/{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteCostRecord(int id)
    {
        try
        {
            var command = new DeleteCostRecordCommand(id);
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

    /// <summary>
    /// Maliyet özetini getirir
    /// </summary>
    [HttpGet("summary")]
    [ProducesResponseType(typeof(CostSummaryDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCostSummary([FromQuery] int year, [FromQuery] int? month)
    {
        var query = new GetCostSummaryQuery(year, month);
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    #endregion

    #region Cost Centers

    /// <summary>
    /// Maliyet merkezlerini listeler
    /// </summary>
    [HttpGet("cost-centers")]
    [ProducesResponseType(typeof(IReadOnlyList<CostCenterListDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCostCenters([FromQuery] string? type, [FromQuery] bool? activeOnly)
    {
        var query = new GetCostCentersQuery(type, activeOnly);
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// Belirli bir maliyet merkezini getirir
    /// </summary>
    [HttpGet("cost-centers/{id:int}")]
    [ProducesResponseType(typeof(CostCenterDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetCostCenterById(int id)
    {
        var query = new GetCostCenterByIdQuery(id);
        var result = await _mediator.Send(query);

        if (result == null)
            return NotFound(new { message = $"ID '{id}' olan maliyet merkezi bulunamadı." });

        return Ok(result);
    }

    /// <summary>
    /// Yeni maliyet merkezi oluşturur
    /// </summary>
    [HttpPost("cost-centers")]
    [ProducesResponseType(typeof(CostCenterDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateCostCenter([FromBody] CreateCostCenterRequest request)
    {
        try
        {
            var command = new CreateCostCenterCommand(request);
            var result = await _mediator.Send(command);
            return CreatedAtAction(nameof(GetCostCenterById), new { id = result.Id }, result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Maliyet merkezini günceller
    /// </summary>
    [HttpPut("cost-centers/{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateCostCenter(int id, [FromBody] UpdateCostCenterRequest request)
    {
        try
        {
            var command = new UpdateCostCenterCommand(id, request);
            await _mediator.Send(command);
            return Ok(new { message = "Maliyet merkezi güncellendi." });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Maliyet merkezini aktifleştirir
    /// </summary>
    [HttpPost("cost-centers/{id:int}/activate")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ActivateCostCenter(int id)
    {
        try
        {
            var command = new ActivateCostCenterCommand(id);
            await _mediator.Send(command);
            return Ok(new { message = "Maliyet merkezi aktifleştirildi." });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Maliyet merkezini pasifleştirir
    /// </summary>
    [HttpPost("cost-centers/{id:int}/deactivate")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeactivateCostCenter(int id)
    {
        try
        {
            var command = new DeactivateCostCenterCommand(id);
            await _mediator.Send(command);
            return Ok(new { message = "Maliyet merkezi pasifleştirildi." });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Maliyet merkezini siler
    /// </summary>
    [HttpDelete("cost-centers/{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteCostCenter(int id)
    {
        try
        {
            var command = new DeleteCostCenterCommand(id);
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

    #endregion

    #region Standard Cost Cards

    /// <summary>
    /// Standart maliyet kartlarını listeler
    /// </summary>
    [HttpGet("standard-costs")]
    [ProducesResponseType(typeof(IReadOnlyList<StandardCostCardListDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetStandardCostCards(
        [FromQuery] int? productId,
        [FromQuery] int? year,
        [FromQuery] bool? currentOnly)
    {
        var query = new GetStandardCostCardsQuery(productId, year, currentOnly);
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// Belirli bir standart maliyet kartını getirir
    /// </summary>
    [HttpGet("standard-costs/{id:int}")]
    [ProducesResponseType(typeof(StandardCostCardDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetStandardCostCardById(int id)
    {
        var query = new GetStandardCostCardByIdQuery(id);
        var result = await _mediator.Send(query);

        if (result == null)
            return NotFound(new { message = $"ID '{id}' olan standart maliyet kartı bulunamadı." });

        return Ok(result);
    }

    /// <summary>
    /// Ürünün güncel standart maliyet kartını getirir
    /// </summary>
    [HttpGet("standard-costs/product/{productId:int}/current")]
    [ProducesResponseType(typeof(StandardCostCardDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetCurrentStandardCostByProduct(int productId)
    {
        var query = new GetCurrentStandardCostByProductQuery(productId);
        var result = await _mediator.Send(query);

        if (result == null)
            return NotFound(new { message = $"Ürün ID '{productId}' için aktif standart maliyet kartı bulunamadı." });

        return Ok(result);
    }

    /// <summary>
    /// Yeni standart maliyet kartı oluşturur
    /// </summary>
    [HttpPost("standard-costs")]
    [ProducesResponseType(typeof(StandardCostCardDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateStandardCostCard([FromBody] CreateStandardCostCardRequest request)
    {
        try
        {
            var command = new CreateStandardCostCardCommand(request);
            var result = await _mediator.Send(command);
            return CreatedAtAction(nameof(GetStandardCostCardById), new { id = result.Id }, result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Standart maliyet kartını onaylar
    /// </summary>
    [HttpPost("standard-costs/{id:int}/approve")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ApproveStandardCostCard(int id)
    {
        try
        {
            var command = new ApproveStandardCostCardCommand(id);
            await _mediator.Send(command);
            return Ok(new { message = "Standart maliyet kartı onaylandı." });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Standart maliyet kartını aktif olarak ayarlar
    /// </summary>
    [HttpPost("standard-costs/{id:int}/set-current")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> SetAsCurrentCostCard(int id)
    {
        try
        {
            var command = new SetAsCurrentCostCardCommand(id);
            await _mediator.Send(command);
            return Ok(new { message = "Standart maliyet kartı aktif olarak ayarlandı." });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Standart maliyet kartını siler
    /// </summary>
    [HttpDelete("standard-costs/{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteStandardCostCard(int id)
    {
        try
        {
            var command = new DeleteStandardCostCardCommand(id);
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

    #endregion
}
