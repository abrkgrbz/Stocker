using Stocker.Application.DTOs.Security;
using Stocker.Application.DTOs.Tenant.AuditLogs;
using Stocker.Application.Extensions;
using Stocker.SharedKernel.Repositories;
using Stocker.SharedKernel.Results;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Stocker.Application.Features.Tenant.AuditLogs.Queries;

/// <summary>
/// Handler for retrieving audit log statistics for a specific tenant
/// </summary>
public class GetTenantAuditLogStatisticsQueryHandler : IRequestHandler<GetTenantAuditLogStatisticsQuery, Result<TenantAuditLogStatisticsDto>>
{
    private readonly IMasterUnitOfWork _unitOfWork;

    public GetTenantAuditLogStatisticsQueryHandler(IMasterUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<TenantAuditLogStatisticsDto>> Handle(GetTenantAuditLogStatisticsQuery request, CancellationToken cancellationToken)
    {
        // First, get the TenantCode from TenantId
        var tenant = await _unitOfWork.Tenants()
            .AsQueryable()
            .Where(t => t.Id == request.TenantId)
            .Select(t => new { t.Code })
            .FirstOrDefaultAsync(cancellationToken);

        if (tenant == null)
        {
            return Result<TenantAuditLogStatisticsDto>.Failure(
                new Error("Tenant.NotFound", "Tenant bulunamadı", ErrorType.NotFound));
        }

        var tenantCode = tenant.Code;

        // Query audit logs filtered by tenant code
        var query = _unitOfWork.SecurityAuditLogs()
            .AsQueryable()
            .Where(x => x.TenantCode == tenantCode);

        // Apply date filters
        if (request.FromDate.HasValue)
            query = query.Where(x => x.Timestamp >= request.FromDate.Value);

        if (request.ToDate.HasValue)
            query = query.Where(x => x.Timestamp <= request.ToDate.Value);

        // Calculate statistics
        var totalEvents = await query.CountAsync(cancellationToken);

        var failedLogins = await query
            .Where(x => x.Event == "LoginFailed" || x.Event == "Login Failed")
            .CountAsync(cancellationToken);

        var successfulOperations = await query
            .Where(x => x.Event == "LoginSucceeded" || x.Event == "Login Succeeded" ||
                       (!x.Event.Contains("Failed") && !x.Blocked))
            .CountAsync(cancellationToken);

        var uniqueUsers = await query
            .Where(x => x.Email != null)
            .Select(x => x.Email)
            .Distinct()
            .CountAsync(cancellationToken);

        var blockedEvents = await query
            .Where(x => x.Blocked)
            .CountAsync(cancellationToken);

        var highRiskEvents = await query
            .Where(x => x.RiskScore >= 60 && x.RiskScore < 80)
            .CountAsync(cancellationToken);

        var criticalEvents = await query
            .Where(x => x.RiskScore >= 80)
            .CountAsync(cancellationToken);

        // Get top events
        var topEvents = await query
            .GroupBy(x => x.Event)
            .Select(g => new TopEventDto
            {
                Event = g.Key,
                Count = g.Count()
            })
            .OrderByDescending(x => x.Count)
            .Take(5)
            .ToListAsync(cancellationToken);

        // Get top users
        var topUsers = await query
            .Where(x => x.Email != null)
            .GroupBy(x => x.Email)
            .Select(g => new TopUserDto
            {
                Email = g.Key!,
                EventCount = g.Count(),
                FailedAttempts = g.Count(x => x.Event == "LoginFailed" || x.Event == "Login Failed")
            })
            .OrderByDescending(x => x.EventCount)
            .Take(5)
            .ToListAsync(cancellationToken);

        var statistics = new TenantAuditLogStatisticsDto
        {
            TotalEvents = totalEvents,
            FailedLogins = failedLogins,
            SuccessfulOperations = successfulOperations,
            UniqueUsers = uniqueUsers,
            BlockedEvents = blockedEvents,
            HighRiskEvents = highRiskEvents,
            CriticalEvents = criticalEvents,
            TopEvents = topEvents,
            TopUsers = topUsers
        };

        return Result<TenantAuditLogStatisticsDto>.Success(statistics);
    }
}
