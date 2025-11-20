using Stocker.Application.DTOs.Security;
using Stocker.SharedKernel.Results;
using MediatR;

namespace Stocker.Application.Features.Security.Queries.GetAuditLogAnalytics;

/// <summary>
/// Query for retrieving audit log analytics data for charts
/// </summary>
public class GetAuditLogAnalyticsQuery : IRequest<Result<AuditLogAnalyticsDto>>
{
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
}
