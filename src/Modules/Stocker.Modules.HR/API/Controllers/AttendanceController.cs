using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Application.Features.Attendance.Commands;
using Stocker.Modules.HR.Application.Features.Attendance.Queries;
using Stocker.Modules.HR.Domain.Enums;
using Stocker.SharedKernel.Authorization;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.API.Controllers;

[ApiController]
[Authorize]
[Route("api/hr/attendance")]
[RequireModule("HR")]
[ApiExplorerSettings(GroupName = "hr")]
public class AttendanceController : ControllerBase
{
    private readonly IMediator _mediator;

    public AttendanceController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Get attendance records with filtering
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<AttendanceDto>), 200)]
    [ProducesResponseType(400)]
    public async Task<ActionResult<List<AttendanceDto>>> GetAttendance(
        [FromQuery] int? employeeId = null,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        [FromQuery] AttendanceStatus? status = null,
        [FromQuery] int? departmentId = null,
        [FromQuery] bool? lateOnly = null,
        [FromQuery] bool? overtimeOnly = null)
    {
        var query = new GetAttendanceQuery
        {
            EmployeeId = employeeId,
            StartDate = startDate,
            EndDate = endDate,
            Status = status,
            DepartmentId = departmentId,
            IncludeLateOnly = lateOnly ?? false,
            IncludeOvertimeOnly = overtimeOnly ?? false
        };

        var result = await _mediator.Send(query);
        if (result.IsFailure) return BadRequest(result.Error);
        return Ok(result.Value);
    }

    /// <summary>
    /// Get daily attendance summary
    /// </summary>
    [HttpGet("daily")]
    [ProducesResponseType(typeof(DailyAttendanceSummaryDto), 200)]
    [ProducesResponseType(400)]
    public async Task<ActionResult<DailyAttendanceSummaryDto>> GetDailyAttendance(
        [FromQuery] DateTime? date = null,
        [FromQuery] int? departmentId = null)
    {
        var query = new GetDailyAttendanceQuery
        {
            Date = date ?? DateTime.UtcNow.Date,
            DepartmentId = departmentId
        };

        var result = await _mediator.Send(query);
        if (result.IsFailure) return BadRequest(result.Error);
        return Ok(result.Value);
    }

    /// <summary>
    /// Get attendance report for a period
    /// </summary>
    [HttpGet("report")]
    [ProducesResponseType(typeof(AttendanceReportDto), 200)]
    [ProducesResponseType(400)]
    public async Task<ActionResult<AttendanceReportDto>> GetAttendanceReport(
        [FromQuery] int? employeeId = null,
        [FromQuery] int? departmentId = null,
        [FromQuery] int? year = null,
        [FromQuery] int? month = null)
    {
        var query = new GetAttendanceReportQuery
        {
            EmployeeId = employeeId,
            DepartmentId = departmentId,
            Year = year ?? DateTime.UtcNow.Year,
            Month = month ?? DateTime.UtcNow.Month
        };

        var result = await _mediator.Send(query);
        if (result.IsFailure) return BadRequest(result.Error);
        return Ok(result.Value);
    }

    /// <summary>
    /// Record employee check-in
    /// </summary>
    [HttpPost("check-in")]
    [ProducesResponseType(typeof(AttendanceDto), 201)]
    [ProducesResponseType(400)]
    public async Task<ActionResult<AttendanceDto>> CheckIn(CheckInDto dto)
    {
        var command = new RecordCheckInCommand
        {
            EmployeeId = dto.EmployeeId,
            Latitude = dto.Latitude,
            Longitude = dto.Longitude,
            IpAddress = dto.IpAddress,
            DeviceInfo = dto.DeviceInfo
        };

        var result = await _mediator.Send(command);
        if (result.IsFailure) return BadRequest(result.Error);
        return Ok(result.Value);
    }

    /// <summary>
    /// Record employee check-out
    /// </summary>
    [HttpPost("check-out")]
    [ProducesResponseType(typeof(AttendanceDto), 200)]
    [ProducesResponseType(400)]
    public async Task<ActionResult<AttendanceDto>> CheckOut(CheckOutDto dto)
    {
        var command = new RecordCheckOutCommand
        {
            EmployeeId = dto.EmployeeId,
            Latitude = dto.Latitude,
            Longitude = dto.Longitude,
            IpAddress = dto.IpAddress,
            DeviceInfo = dto.DeviceInfo
        };

        var result = await _mediator.Send(command);
        if (result.IsFailure) return BadRequest(result.Error);
        return Ok(result.Value);
    }

    /// <summary>
    /// Update/correct attendance record
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(AttendanceDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<AttendanceDto>> UpdateAttendance(int id, UpdateAttendanceDto dto)
    {
        var command = new UpdateAttendanceCommand
        {
            AttendanceId = id,
            CheckInTime = dto.CheckInTime?.TimeOfDay,
            CheckOutTime = dto.CheckOutTime?.TimeOfDay,
            Status = dto.Status,
            Notes = dto.Notes,
            CorrectionReason = "Manual correction via API"
        };

        var result = await _mediator.Send(command);
        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound) return NotFound(result.Error);
            return BadRequest(result.Error);
        }
        return Ok(result.Value);
    }
}
