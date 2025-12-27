using Stocker.Application.DTOs.Tenant.AuditLogs;
using Stocker.SharedKernel.Results;
using MediatR;

namespace Stocker.Application.Features.Tenant.AuditLogs.Queries;

/// <summary>
/// Query for retrieving paginated audit logs for a specific tenant
/// </summary>
public class GetTenantAuditLogsQuery : IRequest<Result<TenantAuditLogsResponse>>
{
    public Guid TenantId { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public string? Event { get; set; }
    public string? Severity { get; set; }
    public string? Email { get; set; }
    public string? IpAddress { get; set; }
    public int? MinRiskScore { get; set; }
    public int? MaxRiskScore { get; set; }
    public bool? Blocked { get; set; }
    public string? SearchTerm { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}
