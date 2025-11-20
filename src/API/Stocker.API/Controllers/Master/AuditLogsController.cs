using MediatR;
using Microsoft.AspNetCore.Mvc;
using Stocker.Application.DTOs.Master;
using Stocker.Application.DTOs.Security;
using Stocker.Application.Features.Security.Queries.GetAuditLogs;
using Stocker.Application.Features.Security.Queries.GetAuditLogById;
using Stocker.Application.Features.Security.Queries.GetAuditLogStatistics;
using Stocker.Application.Features.Security.Queries.GetSecurityEvents;
using Stocker.Application.Features.Security.Queries.GetAuditLogAnalytics;
using Stocker.Application.Features.Security.Queries.GetComplianceStatus;
using Swashbuckle.AspNetCore.Annotations;

namespace Stocker.API.Controllers.Master;

/// <summary>
/// Audit logs and security monitoring endpoints for Master admin panel
/// </summary>
[SwaggerTag("Master Admin Panel - Audit Logs and Compliance")]
public class AuditLogsController : MasterControllerBase
{
    public AuditLogsController(IMediator mediator, ILogger<AuditLogsController> logger)
        : base(mediator, logger)
    {
    }

    /// <summary>
    /// Get paginated audit logs with filtering
    /// </summary>
    /// <remarks>
    /// Returns a paginated list of audit logs with support for various filters including:
    /// - Date range filtering (fromDate, toDate)
    /// - Event type filtering
    /// - User email search
    /// - Tenant code filtering
    /// - IP address filtering
    /// - Risk score range
    /// - Blocked status
    /// - General search term
    /// </remarks>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<AuditLogsResponse>), 200)]
    public async Task<IActionResult> GetAuditLogs(
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        [FromQuery] string? @event = null,
        [FromQuery] string? severity = null,
        [FromQuery] string? email = null,
        [FromQuery] string? tenantCode = null,
        [FromQuery] string? ipAddress = null,
        [FromQuery] int? minRiskScore = null,
        [FromQuery] int? maxRiskScore = null,
        [FromQuery] bool? blocked = null,
        [FromQuery] string? searchTerm = null,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20)
    {
        var query = new GetAuditLogsQuery
        {
            FromDate = fromDate,
            ToDate = toDate,
            Event = @event,
            Severity = severity,
            Email = email,
            TenantCode = tenantCode,
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
    /// Get audit log by ID
    /// </summary>
    /// <remarks>
    /// Returns detailed information about a specific audit log entry including:
    /// - Full event details
    /// - User information
    /// - Risk assessment
    /// - Metadata
    /// </remarks>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<SecurityAuditLogDto>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 404)]
    public async Task<IActionResult> GetAuditLogById(Guid id)
    {
        var query = new GetAuditLogByIdQuery(id);
        var result = await _mediator.Send(query);
        return HandleResult(result);
    }

    /// <summary>
    /// Get audit log statistics for dashboard
    /// </summary>
    /// <remarks>
    /// Returns comprehensive statistics including:
    /// - Total events count
    /// - Failed logins count
    /// - Successful operations
    /// - Unique users
    /// - Top events and users
    /// - Blocked and high-risk events
    /// </remarks>
    [HttpGet("statistics")]
    [ProducesResponseType(typeof(ApiResponse<AuditLogStatisticsDto>), 200)]
    public async Task<IActionResult> GetStatistics(
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null)
    {
        var query = new GetAuditLogStatisticsQuery
        {
            FromDate = fromDate,
            ToDate = toDate
        };

        var result = await _mediator.Send(query);
        return HandleResult(result);
    }

    /// <summary>
    /// Get security events for security monitoring tab
    /// </summary>
    /// <remarks>
    /// Returns security-specific events including:
    /// - Login failures
    /// - Unauthorized access attempts
    /// - Suspicious activities
    /// - Brute force attempts
    /// - Account lockouts
    /// </remarks>
    [HttpGet("security-events")]
    [ProducesResponseType(typeof(ApiResponse<List<SecurityEventDto>>), 200)]
    public async Task<IActionResult> GetSecurityEvents(
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        [FromQuery] string? severity = null,
        [FromQuery] string? type = null)
    {
        var query = new GetSecurityEventsQuery
        {
            FromDate = fromDate,
            ToDate = toDate,
            Severity = severity,
            Type = type
        };

        var result = await _mediator.Send(query);
        return HandleResult(result);
    }

    /// <summary>
    /// Get audit log analytics data for charts and visualizations
    /// </summary>
    /// <remarks>
    /// Returns analytics data including:
    /// - Hourly activity distribution (24 hours)
    /// - Category distribution for pie chart
    /// - Severity level distribution
    /// - Weekly heatmap (7 days x 24 hours)
    /// </remarks>
    [HttpGet("analytics")]
    [ProducesResponseType(typeof(ApiResponse<AuditLogAnalyticsDto>), 200)]
    public async Task<IActionResult> GetAnalytics(
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null)
    {
        var query = new GetAuditLogAnalyticsQuery
        {
            FromDate = fromDate,
            ToDate = toDate
        };

        var result = await _mediator.Send(query);
        return HandleResult(result);
    }

    /// <summary>
    /// Get compliance status for GDPR, ISO 27001, and PCI DSS
    /// </summary>
    /// <remarks>
    /// Returns compliance information including:
    /// - GDPR compliance status and data processing activities
    /// - ISO 27001 security controls and risk assessments
    /// - PCI DSS compliance and vulnerability scans
    /// - Overall compliance score
    /// </remarks>
    [HttpGet("compliance")]
    [ProducesResponseType(typeof(ApiResponse<ComplianceStatusDto>), 200)]
    public async Task<IActionResult> GetCompliance(
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null)
    {
        var query = new GetComplianceStatusQuery
        {
            FromDate = fromDate,
            ToDate = toDate
        };

        var result = await _mediator.Send(query);
        return HandleResult(result);
    }

    /// <summary>
    /// Export audit logs to CSV format
    /// </summary>
    /// <remarks>
    /// Exports filtered audit logs to CSV file for external analysis or archiving.
    /// Supports the same filtering parameters as GetAuditLogs endpoint.
    /// </remarks>
    [HttpGet("export/csv")]
    [ProducesResponseType(typeof(FileContentResult), 200)]
    public async Task<IActionResult> ExportToCsv(
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        [FromQuery] string? @event = null,
        [FromQuery] string? email = null,
        [FromQuery] string? tenantCode = null)
    {
        var query = new GetAuditLogsQuery
        {
            FromDate = fromDate,
            ToDate = toDate,
            Event = @event,
            Email = email,
            TenantCode = tenantCode,
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

    /// <summary>
    /// Export audit logs to Excel format
    /// </summary>
    /// <remarks>
    /// Exports filtered audit logs to Excel file for external analysis or archiving.
    /// Supports the same filtering parameters as GetAuditLogs endpoint.
    /// </remarks>
    [HttpGet("export/excel")]
    [ProducesResponseType(typeof(FileContentResult), 200)]
    public async Task<IActionResult> ExportToExcel(
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        [FromQuery] string? @event = null,
        [FromQuery] string? email = null,
        [FromQuery] string? tenantCode = null)
    {
        var query = new GetAuditLogsQuery
        {
            FromDate = fromDate,
            ToDate = toDate,
            Event = @event,
            Email = email,
            TenantCode = tenantCode,
            PageNumber = 1,
            PageSize = 10000 // Large page size for export
        };

        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
            return HandleResult(result);

        // For now, return as CSV. In production, use a library like EPPlus or ClosedXML
        var csv = GenerateCsv(result.Value!.Logs);
        var bytes = System.Text.Encoding.UTF8.GetBytes(csv);

        return File(bytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            $"audit-logs-{DateTime.UtcNow:yyyyMMdd-HHmmss}.xlsx");
    }

    private static string GenerateCsv(List<SecurityAuditLogListDto> logs)
    {
        var csv = new System.Text.StringBuilder();

        // Header
        csv.AppendLine("Timestamp,Event,Email,Tenant Code,IP Address,Risk Score,Risk Level,Blocked");

        // Data rows
        foreach (var log in logs)
        {
            csv.AppendLine($"{log.Timestamp:yyyy-MM-dd HH:mm:ss}," +
                          $"\"{log.Event}\"," +
                          $"\"{log.Email}\"," +
                          $"\"{log.TenantCode}\"," +
                          $"\"{log.IpAddress}\"," +
                          $"{log.RiskScore}," +
                          $"\"{log.RiskLevel}\"," +
                          $"{log.Blocked}");
        }

        return csv.ToString();
    }
}
