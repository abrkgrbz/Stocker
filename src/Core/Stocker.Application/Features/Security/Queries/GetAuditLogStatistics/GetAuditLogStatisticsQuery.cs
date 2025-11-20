using Stocker.Application.DTOs.Security;
using Stocker.SharedKernel.Results;
using MediatR;

namespace Stocker.Application.Features.Security.Queries.GetAuditLogStatistics;

/// <summary>
/// Query for retrieving audit log statistics
/// </summary>
public class GetAuditLogStatisticsQuery : IRequest<Result<AuditLogStatisticsDto>>
{
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
}
