using Stocker.Application.DTOs.Tenant.AuditLogs;
using Stocker.SharedKernel.Results;
using MediatR;

namespace Stocker.Application.Features.Tenant.AuditLogs.Queries;

/// <summary>
/// Query to get audit log statistics for a specific tenant
/// </summary>
public class GetTenantAuditLogStatisticsQuery : IRequest<Result<TenantAuditLogStatisticsDto>>
{
    public Guid TenantId { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
}
