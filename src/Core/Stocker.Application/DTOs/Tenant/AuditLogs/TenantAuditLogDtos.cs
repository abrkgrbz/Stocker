using Stocker.Application.DTOs.Security;

namespace Stocker.Application.DTOs.Tenant.AuditLogs;

/// <summary>
/// Paginated response for tenant audit logs
/// </summary>
public class TenantAuditLogsResponse
{
    public List<SecurityAuditLogListDto> Logs { get; set; } = new();
    public int TotalCount { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
    public bool HasPreviousPage => PageNumber > 1;
    public bool HasNextPage => PageNumber < TotalPages;
}

/// <summary>
/// Statistics for tenant audit logs dashboard
/// </summary>
public class TenantAuditLogStatisticsDto
{
    public int TotalEvents { get; set; }
    public int FailedLogins { get; set; }
    public int SuccessfulOperations { get; set; }
    public int UniqueUsers { get; set; }
    public int BlockedEvents { get; set; }
    public int HighRiskEvents { get; set; }
    public int CriticalEvents { get; set; }

    // Top lists
    public List<TopEventDto> TopEvents { get; set; } = new();
    public List<TopUserDto> TopUsers { get; set; } = new();
}
