using Stocker.Application.DTOs.Security;
using Stocker.SharedKernel.Results;
using MediatR;

namespace Stocker.Application.Features.Security.Queries.GetSecurityEvents;

/// <summary>
/// Query for retrieving security events
/// </summary>
public class GetSecurityEventsQuery : IRequest<Result<List<SecurityEventDto>>>
{
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public string? Severity { get; set; }
    public string? Type { get; set; }
}
