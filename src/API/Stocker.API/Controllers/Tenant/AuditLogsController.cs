using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.API.Controllers.Base;
using Stocker.Application.DTOs.Security;
using Stocker.Application.DTOs.Tenant.AuditLogs;
using Stocker.Application.Features.Tenant.AuditLogs.Queries;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.API.Controllers.Tenant;

/// <summary>
/// Controller for tenant-specific audit logs and security monitoring
/// Filters audit logs by the current tenant's TenantId
/// </summary>
[Route("api/tenant/[controller]")]
[ApiController]
[Authorize]
public class AuditLogsController : ApiController
{
    private readonly IMediator _mediator;
    private readonly ICurrentUserService _currentUserService;

    public AuditLogsController(IMediator mediator, ICurrentUserService currentUserService)
    {
        _mediator = mediator;
        _currentUserService = currentUserService;
    }

    /// <summary>
    /// Get paginated audit logs for the current tenant
    /// </summary>
    /// <remarks>
    /// Returns a paginated list of audit logs filtered by the current tenant.
    /// Supports date range, event type, user, and risk level filtering.
    /// </remarks>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<TenantAuditLogsResponse>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 401)]
    public async Task<IActionResult> GetAuditLogs(
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        [FromQuery] string? @event = null,
        [FromQuery] string? severity = null,
        [FromQuery] string? email = null,
        [FromQuery] string? ipAddress = null,
        [FromQuery] int? minRiskScore = null,
        [FromQuery] int? maxRiskScore = null,
        [FromQuery] bool? blocked = null,
        [FromQuery] string? searchTerm = null,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20)
    {
        var tenantId = _currentUserService.TenantId;
        if (tenantId == null || tenantId == Guid.Empty)
        {
            return BadRequestResponse<object>("Tenant bulunamadı");
        }

        var query = new GetTenantAuditLogsQuery
        {
            TenantId = tenantId.Value,
            FromDate = fromDate,
            ToDate = toDate,
            Event = @event,
            Severity = severity,
            Email = email,
            IpAddress = ipAddress,
            MinRiskScore = minRiskScore,
            MaxRiskScore = maxRiskScore,
            Blocked = blocked,
            SearchTerm = searchTerm,
            PageNumber = pageNumber,
            PageSize = pageSize
        };

        var result = await _mediator.Send(query);
        return HandleResult(result);
    }

    /// <summary>
    /// Get audit log statistics for the current tenant dashboard
    /// </summary>
    /// <remarks>
    /// Returns statistics including total events, failed logins,
    /// blocked events, and top users for the current tenant.
    /// </remarks>
    [HttpGet("statistics")]
    [ProducesResponseType(typeof(ApiResponse<TenantAuditLogStatisticsDto>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 401)]
    public async Task<IActionResult> GetStatistics(
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null)
    {
        var tenantId = _currentUserService.TenantId;
        if (tenantId == null || tenantId == Guid.Empty)
        {
            return BadRequestResponse<object>("Tenant bulunamadı");
        }

        var query = new GetTenantAuditLogStatisticsQuery
        {
            TenantId = tenantId.Value,
            FromDate = fromDate,
            ToDate = toDate
        };

        var result = await _mediator.Send(query);
        return HandleResult(result);
    }

    /// <summary>
    /// Get a specific audit log entry by ID
    /// </summary>
    /// <remarks>
    /// Returns detailed information about a specific audit log entry.
    /// Only returns logs belonging to the current tenant.
    /// </remarks>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<SecurityAuditLogDto>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 404)]
    public async Task<IActionResult> GetAuditLogById(Guid id)
    {
        var tenantId = _currentUserService.TenantId;
        if (tenantId == null || tenantId == Guid.Empty)
        {
            return BadRequestResponse<object>("Tenant bulunamadı");
        }

        var query = new GetTenantAuditLogByIdQuery
        {
            TenantId = tenantId.Value,
            LogId = id
        };

        var result = await _mediator.Send(query);
        return HandleResult(result);
    }

    /// <summary>
    /// Export tenant audit logs to CSV
    /// </summary>
    [HttpGet("export/csv")]
    [ProducesResponseType(typeof(FileContentResult), 200)]
    public async Task<IActionResult> ExportToCsv(
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        [FromQuery] string? @event = null,
        [FromQuery] string? email = null)
    {
        var tenantId = _currentUserService.TenantId;
        if (tenantId == null || tenantId == Guid.Empty)
        {
            return BadRequestResponse<object>("Tenant bulunamadı");
        }

        var query = new GetTenantAuditLogsQuery
        {
            TenantId = tenantId.Value,
            FromDate = fromDate,
            ToDate = toDate,
            Event = @event,
            Email = email,
            PageNumber = 1,
            PageSize = 10000 // Large page size for export
        };

        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
            return HandleResult(result);

        var csv = GenerateCsv(result.Value!.Logs);
        var bytes = System.Text.Encoding.UTF8.GetBytes(csv);

        return File(bytes, "text/csv", $"audit-logs-{DateTime.UtcNow:yyyyMMdd-HHmmss}.csv");
    }

    private static string GenerateCsv(List<SecurityAuditLogListDto> logs)
    {
        var csv = new System.Text.StringBuilder();

        // Header
        csv.AppendLine("Zaman,Olay,E-posta,IP Adresi,Risk Skoru,Risk Seviyesi,Engellendi");

        // Data rows
        foreach (var log in logs)
        {
            csv.AppendLine($"{log.Timestamp:yyyy-MM-dd HH:mm:ss}," +
                          $"\"{log.Event}\"," +
                          $"\"{log.Email}\"," +
                          $"\"{log.IpAddress}\"," +
                          $"{log.RiskScore}," +
                          $"\"{log.RiskLevel}\"," +
                          $"{(log.Blocked ? "Evet" : "Hayır")}");
        }

        return csv.ToString();
    }
}
