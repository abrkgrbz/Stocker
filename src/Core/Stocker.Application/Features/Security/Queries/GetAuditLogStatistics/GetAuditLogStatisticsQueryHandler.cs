using Stocker.Application.DTOs.Security;
using Stocker.Application.Extensions;
using Stocker.SharedKernel.Repositories;
using Stocker.SharedKernel.Results;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Stocker.Application.Features.Security.Queries.GetAuditLogStatistics;

/// <summary>
/// Handler for retrieving audit log statistics
/// </summary>
public class GetAuditLogStatisticsQueryHandler : IRequestHandler<GetAuditLogStatisticsQuery, Result<AuditLogStatisticsDto>>
{
    private readonly IMasterUnitOfWork _unitOfWork;

    public GetAuditLogStatisticsQueryHandler(IMasterUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<AuditLogStatisticsDto>> Handle(GetAuditLogStatisticsQuery request, CancellationToken cancellationToken)
    {
        var query = _unitOfWork.SecurityAuditLogs().AsQueryable();

        // Apply date filters if provided
        if (request.FromDate.HasValue)
            query = query.Where(x => x.Timestamp >= request.FromDate.Value);

        if (request.ToDate.HasValue)
            query = query.Where(x => x.Timestamp <= request.ToDate.Value);

        var logs = await query.ToListAsync(cancellationToken);

        // Calculate statistics
        var totalEvents = logs.Count;
        var failedLogins = logs.Count(x => x.Event == "LOGIN_FAILED");
        var successfulOperations = logs.Count(x => !x.Blocked && x.Event != "LOGIN_FAILED");
        var totalOperations = logs.Count;
        var uniqueUsers = logs.Where(x => x.Email != null).Select(x => x.Email).Distinct().Count();
        var blockedEvents = logs.Count(x => x.Blocked);
        var highRiskEvents = logs.Count(x => x.RiskScore >= 60);
        var criticalEvents = logs.Count(x => x.RiskScore >= 80);

        // Top events
        var topEvents = logs
            .GroupBy(x => x.Event)
            .Select(g => new TopEventDto
            {
                Event = g.Key,
                Count = g.Count()
            })
            .OrderByDescending(x => x.Count)
            .Take(5)
            .ToList();

        // Top users
        var topUsers = logs
            .Where(x => x.Email != null)
            .GroupBy(x => x.Email)
            .Select(g => new TopUserDto
            {
                Email = g.Key!,
                EventCount = g.Count(),
                FailedAttempts = g.Count(x => x.Event == "LOGIN_FAILED" || x.Blocked)
            })
            .OrderByDescending(x => x.EventCount)
            .Take(5)
            .ToList();

        var statistics = new AuditLogStatisticsDto
        {
            TotalEvents = totalEvents,
            FailedLogins = failedLogins,
            SuccessfulOperations = successfulOperations,
            TotalOperations = totalOperations,
            UniqueUsers = uniqueUsers,
            TopOperationsCount = topEvents.Count,
            TopUsersCount = topUsers.Count,
            BlockedEvents = blockedEvents,
            HighRiskEvents = highRiskEvents,
            CriticalEvents = criticalEvents,
            TopEvents = topEvents,
            TopUsers = topUsers
        };

        return Result<AuditLogStatisticsDto>.Success(statistics);
    }
}
