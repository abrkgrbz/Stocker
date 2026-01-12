using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.Manufacturing.Application.DTOs;
using Stocker.Modules.Manufacturing.Application.Features.Maintenance.Commands;
using Stocker.Modules.Manufacturing.Application.Features.Maintenance.Queries;
using Stocker.Modules.Manufacturing.Domain.Enums;

namespace Stocker.Modules.Manufacturing.Api.Controllers;

[ApiController]
[Route("api/manufacturing/[controller]")]
[Authorize]
public class MaintenanceController : ControllerBase
{
    private readonly IMediator _mediator;

    public MaintenanceController(IMediator mediator)
    {
        _mediator = mediator;
    }

    #region Maintenance Plans

    /// <summary>
    /// Tüm bakım planlarını listeler
    /// </summary>
    [HttpGet("plans")]
    [ProducesResponseType(typeof(IReadOnlyList<MaintenancePlanListDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMaintenancePlans()
    {
        var result = await _mediator.Send(new GetMaintenancePlansQuery());
        return Ok(result);
    }

    /// <summary>
    /// Aktif bakım planlarını listeler
    /// </summary>
    [HttpGet("plans/active")]
    [ProducesResponseType(typeof(IReadOnlyList<MaintenancePlanListDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetActivePlans()
    {
        var result = await _mediator.Send(new GetActivePlansQuery());
        return Ok(result);
    }

    /// <summary>
    /// Belirli bir tarihe kadar yapılması gereken bakım planlarını listeler
    /// </summary>
    [HttpGet("plans/due")]
    [ProducesResponseType(typeof(IReadOnlyList<MaintenancePlanListDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetDuePlans([FromQuery] DateTime? asOfDate = null)
    {
        var date = asOfDate ?? DateTime.UtcNow.Date;
        var result = await _mediator.Send(new GetDuePlansQuery(date));
        return Ok(result);
    }

    /// <summary>
    /// Gecikmiş bakım planlarını listeler
    /// </summary>
    [HttpGet("plans/overdue")]
    [ProducesResponseType(typeof(IReadOnlyList<MaintenancePlanListDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetOverduePlans([FromQuery] DateTime? asOfDate = null)
    {
        var date = asOfDate ?? DateTime.UtcNow.Date;
        var result = await _mediator.Send(new GetOverduePlansQuery(date));
        return Ok(result);
    }

    /// <summary>
    /// Yaklaşan bakım planlarını listeler
    /// </summary>
    [HttpGet("plans/upcoming")]
    [ProducesResponseType(typeof(IReadOnlyList<MaintenancePlanListDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetUpcomingPlans([FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
    {
        var result = await _mediator.Send(new GetUpcomingPlansQuery(startDate, endDate));
        return Ok(result);
    }

    /// <summary>
    /// Belirli bir bakım planını getirir
    /// </summary>
    [HttpGet("plans/{id}")]
    [ProducesResponseType(typeof(MaintenancePlanDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetMaintenancePlan(int id)
    {
        var result = await _mediator.Send(new GetMaintenancePlanByIdQuery(id));
        return result == null ? NotFound() : Ok(result);
    }

    /// <summary>
    /// Yeni bakım planı oluşturur
    /// </summary>
    [HttpPost("plans")]
    [ProducesResponseType(typeof(MaintenancePlanDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateMaintenancePlan([FromBody] CreateMaintenancePlanRequest request)
    {
        var result = await _mediator.Send(new CreateMaintenancePlanCommand(request));
        return CreatedAtAction(nameof(GetMaintenancePlan), new { id = result.Id }, result);
    }

    /// <summary>
    /// Bakım planını günceller
    /// </summary>
    [HttpPut("plans/{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> UpdateMaintenancePlan(int id, [FromBody] UpdateMaintenancePlanRequest request)
    {
        await _mediator.Send(new UpdateMaintenancePlanCommand(id, request));
        return NoContent();
    }

    /// <summary>
    /// Bakım planını aktifleştirir
    /// </summary>
    [HttpPost("plans/{id}/activate")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> ActivateMaintenancePlan(int id)
    {
        await _mediator.Send(new ActivateMaintenancePlanCommand(id));
        return NoContent();
    }

    /// <summary>
    /// Bakım planını askıya alır
    /// </summary>
    [HttpPost("plans/{id}/suspend")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> SuspendMaintenancePlan(int id)
    {
        await _mediator.Send(new SuspendMaintenancePlanCommand(id));
        return NoContent();
    }

    /// <summary>
    /// Bakım planını onaylar
    /// </summary>
    [HttpPost("plans/{id}/approve")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> ApproveMaintenancePlan(int id, [FromQuery] string approvedBy)
    {
        await _mediator.Send(new ApproveMaintenancePlanCommand(id, approvedBy));
        return NoContent();
    }

    /// <summary>
    /// Bakım planını siler
    /// </summary>
    [HttpDelete("plans/{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> DeleteMaintenancePlan(int id)
    {
        await _mediator.Send(new DeleteMaintenancePlanCommand(id));
        return NoContent();
    }

    #endregion

    #region Maintenance Tasks

    /// <summary>
    /// Bakım planına görev ekler
    /// </summary>
    [HttpPost("tasks")]
    [ProducesResponseType(typeof(MaintenanceTaskDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateMaintenanceTask([FromBody] CreateMaintenanceTaskRequest request)
    {
        var result = await _mediator.Send(new CreateMaintenanceTaskCommand(request));
        return Created("", result);
    }

    /// <summary>
    /// Bakım görevini günceller
    /// </summary>
    [HttpPut("tasks/{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> UpdateMaintenanceTask(int id, [FromBody] UpdateMaintenanceTaskRequest request)
    {
        await _mediator.Send(new UpdateMaintenanceTaskCommand(id, request));
        return NoContent();
    }

    /// <summary>
    /// Bakım görevini siler
    /// </summary>
    [HttpDelete("tasks/{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> DeleteMaintenanceTask(int id)
    {
        await _mediator.Send(new DeleteMaintenanceTaskCommand(id));
        return NoContent();
    }

    #endregion

    #region Maintenance Records

    /// <summary>
    /// Bakım kayıtlarını listeler
    /// </summary>
    [HttpGet("records")]
    [ProducesResponseType(typeof(IReadOnlyList<MaintenanceRecordListDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMaintenanceRecords(
        [FromQuery] MaintenanceRecordStatus? status = null,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        var result = await _mediator.Send(new GetMaintenanceRecordsQuery(status, startDate, endDate));
        return Ok(result);
    }

    /// <summary>
    /// Bekleyen bakım kayıtlarını listeler
    /// </summary>
    [HttpGet("records/pending")]
    [ProducesResponseType(typeof(IReadOnlyList<MaintenanceRecordListDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPendingRecords()
    {
        var result = await _mediator.Send(new GetPendingRecordsQuery());
        return Ok(result);
    }

    /// <summary>
    /// Belirli bir bakım kaydını getirir
    /// </summary>
    [HttpGet("records/{id}")]
    [ProducesResponseType(typeof(MaintenanceRecordDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetMaintenanceRecord(int id)
    {
        var result = await _mediator.Send(new GetMaintenanceRecordByIdQuery(id));
        return result == null ? NotFound() : Ok(result);
    }

    /// <summary>
    /// Yeni bakım kaydı oluşturur
    /// </summary>
    [HttpPost("records")]
    [ProducesResponseType(typeof(MaintenanceRecordDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateMaintenanceRecord([FromBody] CreateMaintenanceRecordRequest request)
    {
        var result = await _mediator.Send(new CreateMaintenanceRecordCommand(request));
        return CreatedAtAction(nameof(GetMaintenanceRecord), new { id = result.Id }, result);
    }

    /// <summary>
    /// Bakım kaydını günceller
    /// </summary>
    [HttpPut("records/{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> UpdateMaintenanceRecord(int id, [FromBody] UpdateMaintenanceRecordRequest request)
    {
        await _mediator.Send(new UpdateMaintenanceRecordCommand(id, request));
        return NoContent();
    }

    /// <summary>
    /// Bakım kaydını başlatır
    /// </summary>
    [HttpPost("records/{id}/start")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> StartMaintenanceRecord(int id, [FromBody] StartMaintenanceRecordRequest request)
    {
        await _mediator.Send(new StartMaintenanceRecordCommand(id, request));
        return NoContent();
    }

    /// <summary>
    /// Bakım kaydını tamamlar
    /// </summary>
    [HttpPost("records/{id}/complete")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> CompleteMaintenanceRecord(int id, [FromBody] CompleteMaintenanceRecordRequest request)
    {
        await _mediator.Send(new CompleteMaintenanceRecordCommand(id, request));
        return NoContent();
    }

    /// <summary>
    /// Bakım kaydını onaylar
    /// </summary>
    [HttpPost("records/{id}/approve")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> ApproveMaintenanceRecord(int id, [FromQuery] string approvedBy)
    {
        await _mediator.Send(new ApproveMaintenanceRecordCommand(id, approvedBy));
        return NoContent();
    }

    /// <summary>
    /// Bakım kaydını iptal eder
    /// </summary>
    [HttpPost("records/{id}/cancel")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> CancelMaintenanceRecord(int id)
    {
        await _mediator.Send(new CancelMaintenanceRecordCommand(id));
        return NoContent();
    }

    /// <summary>
    /// Bakım kaydına yedek parça ekler
    /// </summary>
    [HttpPost("records/spare-parts")]
    [ProducesResponseType(typeof(MaintenanceRecordSparePartDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> AddRecordSparePart([FromBody] AddMaintenanceRecordSparePartRequest request)
    {
        var result = await _mediator.Send(new AddMaintenanceRecordSparePartCommand(request));
        return Created("", result);
    }

    #endregion

    #region Spare Parts

    /// <summary>
    /// Tüm yedek parçaları listeler
    /// </summary>
    [HttpGet("spare-parts")]
    [ProducesResponseType(typeof(IReadOnlyList<SparePartListDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSpareParts()
    {
        var result = await _mediator.Send(new GetSparePartsQuery());
        return Ok(result);
    }

    /// <summary>
    /// Yedek parça arar
    /// </summary>
    [HttpGet("spare-parts/search")]
    [ProducesResponseType(typeof(IReadOnlyList<SparePartListDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> SearchSpareParts([FromQuery] string searchTerm)
    {
        var result = await _mediator.Send(new SearchSparePartsQuery(searchTerm));
        return Ok(result);
    }

    /// <summary>
    /// Belirli bir yedek parçayı getirir
    /// </summary>
    [HttpGet("spare-parts/{id}")]
    [ProducesResponseType(typeof(SparePartDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetSparePart(int id)
    {
        var result = await _mediator.Send(new GetSparePartByIdQuery(id));
        return result == null ? NotFound() : Ok(result);
    }

    /// <summary>
    /// Yeni yedek parça oluşturur
    /// </summary>
    [HttpPost("spare-parts")]
    [ProducesResponseType(typeof(SparePartDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateSparePart([FromBody] CreateSparePartRequest request)
    {
        var result = await _mediator.Send(new CreateSparePartCommand(request));
        return CreatedAtAction(nameof(GetSparePart), new { id = result.Id }, result);
    }

    /// <summary>
    /// Yedek parçayı günceller
    /// </summary>
    [HttpPut("spare-parts/{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> UpdateSparePart(int id, [FromBody] UpdateSparePartRequest request)
    {
        await _mediator.Send(new UpdateSparePartCommand(id, request));
        return NoContent();
    }

    /// <summary>
    /// Yedek parçayı aktifleştirir
    /// </summary>
    [HttpPost("spare-parts/{id}/activate")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> ActivateSparePart(int id)
    {
        await _mediator.Send(new ActivateSparePartCommand(id));
        return NoContent();
    }

    /// <summary>
    /// Yedek parçayı pasifleştirir
    /// </summary>
    [HttpPost("spare-parts/{id}/deactivate")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> DeactivateSparePart(int id)
    {
        await _mediator.Send(new DeactivateSparePartCommand(id));
        return NoContent();
    }

    /// <summary>
    /// Yedek parçayı siler
    /// </summary>
    [HttpDelete("spare-parts/{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> DeleteSparePart(int id)
    {
        await _mediator.Send(new DeleteSparePartCommand(id));
        return NoContent();
    }

    #endregion

    #region Machine Counters

    /// <summary>
    /// Makinenin sayaçlarını listeler
    /// </summary>
    [HttpGet("counters/machine/{machineId}")]
    [ProducesResponseType(typeof(IReadOnlyList<MachineCounterListDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMachineCounters(int machineId)
    {
        var result = await _mediator.Send(new GetMachineCountersQuery(machineId));
        return Ok(result);
    }

    /// <summary>
    /// Kritik seviyedeki sayaçları listeler
    /// </summary>
    [HttpGet("counters/critical")]
    [ProducesResponseType(typeof(IReadOnlyList<MachineCounterListDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCriticalCounters()
    {
        var result = await _mediator.Send(new GetCriticalCountersQuery());
        return Ok(result);
    }

    /// <summary>
    /// Yeni makine sayacı oluşturur
    /// </summary>
    [HttpPost("counters")]
    [ProducesResponseType(typeof(MachineCounterDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateMachineCounter([FromBody] CreateMachineCounterRequest request)
    {
        var result = await _mediator.Send(new CreateMachineCounterCommand(request));
        return Created("", result);
    }

    /// <summary>
    /// Sayaç değerini günceller
    /// </summary>
    [HttpPut("counters/{id}/value")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> UpdateCounterValue(int id, [FromBody] UpdateMachineCounterValueRequest request)
    {
        await _mediator.Send(new UpdateMachineCounterValueCommand(id, request));
        return NoContent();
    }

    /// <summary>
    /// Sayacı sıfırlar
    /// </summary>
    [HttpPost("counters/{id}/reset")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> ResetCounter(int id, [FromBody] ResetMachineCounterRequest request)
    {
        await _mediator.Send(new ResetMachineCounterCommand(id, request));
        return NoContent();
    }

    #endregion

    #region Dashboard

    /// <summary>
    /// Bakım dashboard verilerini getirir
    /// </summary>
    [HttpGet("dashboard")]
    [ProducesResponseType(typeof(MaintenanceDashboardDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetDashboard()
    {
        var result = await _mediator.Send(new GetMaintenanceDashboardQuery());
        return Ok(result);
    }

    /// <summary>
    /// Bakım özet raporunu getirir
    /// </summary>
    [HttpGet("summary")]
    [ProducesResponseType(typeof(MaintenanceSummaryDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSummary([FromQuery] DateTime periodStart, [FromQuery] DateTime periodEnd)
    {
        var result = await _mediator.Send(new GetMaintenanceSummaryQuery(periodStart, periodEnd));
        return Ok(result);
    }

    #endregion
}
