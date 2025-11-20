using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Application.Features.Security.Queries.GetAuditLogAnalytics;
using Stocker.Application.Features.Security.Queries.GetAuditLogById;
using Stocker.Application.Features.Security.Queries.GetAuditLogs;
using Stocker.Application.Features.Security.Queries.GetAuditLogStatistics;

namespace Stocker.API.Controllers;

[ApiController]
[Route("api/master/auditlogs")]
[Authorize]
public class AuditLogsController : ControllerBase
{
    private readonly IMediator _mediator;

    public AuditLogsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Get paginated audit logs with filtering
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAuditLogs([FromQuery] GetAuditLogsQuery query)
    {
        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
            return BadRequest(result);

        return Ok(result.Data);
    }

    /// <summary>
    /// Get audit log by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetAuditLogById(Guid id)
    {
        var result = await _mediator.Send(new GetAuditLogByIdQuery { Id = id });

        if (!result.IsSuccess)
            return NotFound(result);

        return Ok(result.Data);
    }

    /// <summary>
    /// Get audit log statistics
    /// </summary>
    [HttpGet("statistics")]
    public async Task<IActionResult> GetStatistics([FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate)
    {
        var result = await _mediator.Send(new GetAuditLogStatisticsQuery
        {
            FromDate = fromDate,
            ToDate = toDate
        });

        if (!result.IsSuccess)
            return BadRequest(result);

        return Ok(result.Data);
    }

    /// <summary>
    /// Get audit log analytics for charts
    /// </summary>
    [HttpGet("analytics")]
    public async Task<IActionResult> GetAnalytics([FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate)
    {
        var result = await _mediator.Send(new GetAuditLogAnalyticsQuery
        {
            FromDate = fromDate,
            ToDate = toDate
        });

        if (!result.IsSuccess)
            return BadRequest(result);

        return Ok(result.Data);
    }

    /// <summary>
    /// Export audit logs to CSV
    /// </summary>
    [HttpGet("export/csv")]
    public async Task<IActionResult> ExportCsv([FromQuery] GetAuditLogsQuery query)
    {
        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
            return BadRequest(result);

        // TODO: Implement CSV export logic
        return File(Array.Empty<byte>(), "text/csv", "audit-logs.csv");
    }

    /// <summary>
    /// Export audit logs to Excel
    /// </summary>
    [HttpGet("export/excel")]
    public async Task<IActionResult> ExportExcel([FromQuery] GetAuditLogsQuery query)
    {
        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
            return BadRequest(result);

        // TODO: Implement Excel export logic
        return File(Array.Empty<byte>(), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "audit-logs.xlsx");
    }
}
