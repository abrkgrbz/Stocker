using Stocker.Application.DTOs.Security;
using Stocker.SharedKernel.Results;
using MediatR;

namespace Stocker.Application.Features.Security.Queries.GetComplianceStatus;

/// <summary>
/// Query for retrieving compliance status
/// </summary>
public class GetComplianceStatusQuery : IRequest<Result<ComplianceStatusDto>>
{
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
}
