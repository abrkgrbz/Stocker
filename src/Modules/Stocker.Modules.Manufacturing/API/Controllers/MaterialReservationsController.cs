using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.Manufacturing.Application.DTOs;
using Stocker.Modules.Manufacturing.Application.Features.MaterialReservations.Commands;
using Stocker.Modules.Manufacturing.Application.Features.MaterialReservations.Queries;
using Stocker.Modules.Manufacturing.Domain.Enums;

namespace Stocker.Modules.Manufacturing.Api.Controllers;

/// <summary>
/// Malzeme Rezervasyonu islemleri
/// </summary>
[ApiController]
[Route("api/manufacturing/[controller]")]
[Authorize]
public class MaterialReservationsController : ControllerBase
{
    private readonly IMediator _mediator;

    public MaterialReservationsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    #region Query Endpoints

    /// <summary>
    /// Tum malzeme rezervasyonlarini listeler
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<MaterialReservationListDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllReservations()
    {
        var result = await _mediator.Send(new GetAllMaterialReservationsQuery());
        return Ok(result);
    }

    /// <summary>
    /// Belirli bir rezervasyonu getirir
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(MaterialReservationDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetReservationById(int id)
    {
        var result = await _mediator.Send(new GetMaterialReservationByIdQuery(id));
        return result == null ? NotFound() : Ok(result);
    }

    /// <summary>
    /// Aktif rezervasyonlari listeler
    /// </summary>
    [HttpGet("active")]
    [ProducesResponseType(typeof(IReadOnlyList<MaterialReservationListDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetActiveReservations()
    {
        var result = await _mediator.Send(new GetActiveMaterialReservationsQuery());
        return Ok(result);
    }

    /// <summary>
    /// Duruma gore rezervasyonlari listeler
    /// </summary>
    [HttpGet("by-status/{status}")]
    [ProducesResponseType(typeof(IReadOnlyList<MaterialReservationListDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetReservationsByStatus(MaterialReservationStatus status)
    {
        var result = await _mediator.Send(new GetMaterialReservationsByStatusQuery(status));
        return Ok(result);
    }

    /// <summary>
    /// Urune gore rezervasyonlari listeler
    /// </summary>
    [HttpGet("by-product/{productId}")]
    [ProducesResponseType(typeof(IReadOnlyList<MaterialReservationListDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetReservationsByProduct(int productId)
    {
        var result = await _mediator.Send(new GetMaterialReservationsByProductQuery(productId));
        return Ok(result);
    }

    /// <summary>
    /// Uretim emrine gore rezervasyonlari listeler
    /// </summary>
    [HttpGet("by-production-order/{productionOrderId}")]
    [ProducesResponseType(typeof(IReadOnlyList<MaterialReservationListDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetReservationsByProductionOrder(int productionOrderId)
    {
        var result = await _mediator.Send(new GetMaterialReservationsByProductionOrderQuery(productionOrderId));
        return Ok(result);
    }

    /// <summary>
    /// Depoya gore rezervasyonlari listeler
    /// </summary>
    [HttpGet("by-warehouse/{warehouseId}")]
    [ProducesResponseType(typeof(IReadOnlyList<MaterialReservationListDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetReservationsByWarehouse(int warehouseId)
    {
        var result = await _mediator.Send(new GetMaterialReservationsByWarehouseQuery(warehouseId));
        return Ok(result);
    }

    /// <summary>
    /// Acil rezervasyonlari listeler
    /// </summary>
    [HttpGet("urgent")]
    [ProducesResponseType(typeof(IReadOnlyList<MaterialReservationListDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetUrgentReservations()
    {
        var result = await _mediator.Send(new GetUrgentMaterialReservationsQuery());
        return Ok(result);
    }

    /// <summary>
    /// Onay bekleyen rezervasyonlari listeler
    /// </summary>
    [HttpGet("pending-approval")]
    [ProducesResponseType(typeof(IReadOnlyList<MaterialReservationListDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPendingApprovalReservations()
    {
        var result = await _mediator.Send(new GetPendingApprovalMaterialReservationsQuery());
        return Ok(result);
    }

    /// <summary>
    /// Tarih araligina gore rezervasyonlari listeler
    /// </summary>
    [HttpGet("by-required-date-range")]
    [ProducesResponseType(typeof(IReadOnlyList<MaterialReservationListDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetReservationsByRequiredDateRange([FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
    {
        var result = await _mediator.Send(new GetMaterialReservationsByRequiredDateRangeQuery(startDate, endDate));
        return Ok(result);
    }

    /// <summary>
    /// Lot numarasina gore rezervasyonlari listeler
    /// </summary>
    [HttpGet("by-lot/{lotNumber}")]
    [ProducesResponseType(typeof(IReadOnlyList<MaterialReservationListDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetReservationsByLot(string lotNumber)
    {
        var result = await _mediator.Send(new GetMaterialReservationsByLotQuery(lotNumber));
        return Ok(result);
    }

    /// <summary>
    /// Rezervasyon ozet bilgilerini getirir
    /// </summary>
    [HttpGet("summary")]
    [ProducesResponseType(typeof(MaterialReservationSummaryDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetReservationSummary()
    {
        var result = await _mediator.Send(new GetMaterialReservationSummaryQuery());
        return Ok(result);
    }

    /// <summary>
    /// Urun bazli rezervasyon ozet bilgilerini getirir
    /// </summary>
    [HttpGet("summary/by-product/{productId}")]
    [ProducesResponseType(typeof(ProductReservationSummaryDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetProductReservationSummary(int productId)
    {
        var result = await _mediator.Send(new GetProductReservationSummaryQuery(productId));
        return Ok(result);
    }

    #endregion

    #region Command Endpoints

    /// <summary>
    /// Yeni malzeme rezervasyonu olusturur
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(MaterialReservationListDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateReservation([FromBody] CreateMaterialReservationRequest request)
    {
        var result = await _mediator.Send(new CreateMaterialReservationCommand(request));
        return CreatedAtAction(nameof(GetReservationById), new { id = result.Id }, result);
    }

    /// <summary>
    /// Rezervasyonu gunceller
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(MaterialReservationListDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateReservation(int id, [FromBody] UpdateMaterialReservationRequest request)
    {
        var result = await _mediator.Send(new UpdateMaterialReservationCommand(id, request));
        return Ok(result);
    }

    /// <summary>
    /// Rezervasyonu onaylar
    /// </summary>
    [HttpPost("{id}/approve")]
    [ProducesResponseType(typeof(MaterialReservationListDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> ApproveReservation(int id, [FromBody] ApproveMaterialReservationRequest request)
    {
        var result = await _mediator.Send(new ApproveMaterialReservationCommand(id, request));
        return Ok(result);
    }

    /// <summary>
    /// Malzeme tahsisi yapar
    /// </summary>
    [HttpPost("{id}/allocate")]
    [ProducesResponseType(typeof(MaterialReservationAllocationDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> AllocateMaterial(int id, [FromBody] AllocateMaterialRequest request)
    {
        var result = await _mediator.Send(new AllocateMaterialCommand(id, request));
        return Created($"api/manufacturing/materialreservations/{id}/allocations", result);
    }

    /// <summary>
    /// Malzeme cikarma islemi yapar
    /// </summary>
    [HttpPost("{id}/issue")]
    [ProducesResponseType(typeof(MaterialReservationIssueDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> IssueMaterial(int id, [FromBody] IssueMaterialRequest request)
    {
        var result = await _mediator.Send(new IssueMaterialCommand(id, request));
        return Created($"api/manufacturing/materialreservations/{id}/issues", result);
    }

    /// <summary>
    /// Malzeme iade islemi yapar
    /// </summary>
    [HttpPost("{id}/return")]
    [ProducesResponseType(typeof(MaterialReservationIssueDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> ReturnMaterial(int id, [FromBody] ReturnMaterialRequest request)
    {
        var result = await _mediator.Send(new ReturnMaterialCommand(id, request));
        return Ok(result);
    }

    /// <summary>
    /// Tahsisi iptal eder
    /// </summary>
    [HttpPost("{reservationId}/allocations/{allocationId}/cancel")]
    [ProducesResponseType(typeof(MaterialReservationListDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> CancelAllocation(int reservationId, int allocationId, [FromQuery] string reason)
    {
        var request = new CancelAllocationRequest(allocationId, reason);
        var result = await _mediator.Send(new CancelAllocationCommand(reservationId, request));
        return Ok(result);
    }

    /// <summary>
    /// Rezervasyonu tamamlar
    /// </summary>
    [HttpPost("{id}/complete")]
    [ProducesResponseType(typeof(MaterialReservationListDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> CompleteReservation(int id)
    {
        var result = await _mediator.Send(new CompleteMaterialReservationCommand(id));
        return Ok(result);
    }

    /// <summary>
    /// Rezervasyonu iptal eder
    /// </summary>
    [HttpPost("{id}/cancel")]
    [ProducesResponseType(typeof(MaterialReservationListDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> CancelReservation(int id, [FromQuery] string reason)
    {
        var request = new CancelMaterialReservationRequest(reason);
        var result = await _mediator.Send(new CancelMaterialReservationCommand(id, request));
        return Ok(result);
    }

    #endregion
}
