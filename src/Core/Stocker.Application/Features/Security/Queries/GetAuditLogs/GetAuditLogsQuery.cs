using Stocker.Application.DTOs.Security;
using Stocker.SharedKernel.Results;
using MediatR;

namespace Stocker.Application.Features.Security.Queries.GetAuditLogs;

/// <summary>
/// Query for retrieving paginated audit logs with filtering
/// </summary>
public class GetAuditLogsQuery : IRequest<Result<AuditLogsResponse>>
{
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public string? Event { get; set; }
    public string? Severity { get; set; }
    public string? Email { get; set; }
    public string? TenantCode { get; set; }
    public string? IpAddress { get; set; }
    public int? MinRiskScore { get; set; }
    public int? MaxRiskScore { get; set; }
    public bool? Blocked { get; set; }
    public string? SearchTerm { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}
