using Stocker.Application.DTOs.Security;
using Stocker.Application.Extensions;
using Stocker.SharedKernel.Repositories;
using Stocker.SharedKernel.Results;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Stocker.Application.Features.Security.Queries.GetSecurityEvents;

/// <summary>
/// Handler for retrieving security events
/// </summary>
public class GetSecurityEventsQueryHandler : IRequestHandler<GetSecurityEventsQuery, Result<List<SecurityEventDto>>>
{
    private readonly IMasterUnitOfWork _unitOfWork;

    public GetSecurityEventsQueryHandler(IMasterUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<List<SecurityEventDto>>> Handle(GetSecurityEventsQuery request, CancellationToken cancellationToken)
    {
        var query = _unitOfWork.SecurityAuditLogsReadOnly().AsQueryable();

        // Apply filters
        if (request.FromDate.HasValue)
            query = query.Where(x => x.Timestamp >= request.FromDate.Value);

        if (request.ToDate.HasValue)
            query = query.Where(x => x.Timestamp <= request.ToDate.Value);

        // Filter for security-related events
        var securityEvents = new[]
        {
            "LOGIN_FAILED",
            "UNAUTHORIZED_ACCESS",
            "SUSPICIOUS_ACTIVITY",
            "BRUTE_FORCE_ATTEMPT",
            "INVALID_TOKEN",
            "ACCOUNT_LOCKED",
            "PASSWORD_RESET"
        };

        query = query.Where(x => securityEvents.Contains(x.Event));

        var events = await query
            .OrderByDescending(x => x.Timestamp)
            .Select(x => new SecurityEventDto
            {
                Id = x.Id,
                Timestamp = x.Timestamp,
                Type = x.Event,
                Severity = x.RiskScore >= 80 ? "Critical" :
                          x.RiskScore >= 60 ? "High" :
                          x.RiskScore >= 40 ? "Medium" : "Low",
                Source = x.IpAddress ?? "Unknown",
                Target = x.Email ?? "Unknown",
                Status = x.Blocked ? "Blocked" : "Allowed",
                Description = x.Event,
                RiskScore = x.RiskScore
            })
            .ToListAsync(cancellationToken);

        // Apply additional filters
        if (!string.IsNullOrWhiteSpace(request.Severity))
            events = events.Where(x => x.Severity.Equals(request.Severity, StringComparison.OrdinalIgnoreCase)).ToList();

        if (!string.IsNullOrWhiteSpace(request.Type))
            events = events.Where(x => x.Type.Contains(request.Type, StringComparison.OrdinalIgnoreCase)).ToList();

        return Result<List<SecurityEventDto>>.Success(events);
    }
}
