using Stocker.Application.DTOs.Security;
using Stocker.Application.Extensions;
using Stocker.SharedKernel.Repositories;
using Stocker.SharedKernel.Results;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Stocker.Application.Features.Security.Queries.GetAuditLogs;

/// <summary>
/// Handler for retrieving paginated audit logs with filtering
/// </summary>
public class GetAuditLogsQueryHandler : IRequestHandler<GetAuditLogsQuery, Result<AuditLogsResponse>>
{
    private readonly IMasterUnitOfWork _unitOfWork;

    public GetAuditLogsQueryHandler(IMasterUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<AuditLogsResponse>> Handle(GetAuditLogsQuery request, CancellationToken cancellationToken)
    {
        var query = _unitOfWork.SecurityAuditLogs().AsQueryable();

        // Apply filters
        if (request.FromDate.HasValue)
            query = query.Where(x => x.Timestamp >= request.FromDate.Value);

        if (request.ToDate.HasValue)
            query = query.Where(x => x.Timestamp <= request.ToDate.Value);

        if (!string.IsNullOrWhiteSpace(request.Event))
            query = query.Where(x => x.Event == request.Event);

        if (!string.IsNullOrWhiteSpace(request.Email))
            query = query.Where(x => x.Email != null && x.Email.Contains(request.Email));

        if (!string.IsNullOrWhiteSpace(request.TenantCode))
            query = query.Where(x => x.TenantCode != null && x.TenantCode.Contains(request.TenantCode));

        if (!string.IsNullOrWhiteSpace(request.IpAddress))
            query = query.Where(x => x.IpAddress != null && x.IpAddress.Contains(request.IpAddress));

        if (request.MinRiskScore.HasValue)
            query = query.Where(x => x.RiskScore >= request.MinRiskScore.Value);

        if (request.MaxRiskScore.HasValue)
            query = query.Where(x => x.RiskScore <= request.MaxRiskScore.Value);

        if (request.Blocked.HasValue)
            query = query.Where(x => x.Blocked == request.Blocked.Value);

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            query = query.Where(x =>
                (x.Email != null && x.Email.Contains(request.SearchTerm)) ||
                (x.Event != null && x.Event.Contains(request.SearchTerm)) ||
                (x.IpAddress != null && x.IpAddress.Contains(request.SearchTerm)));
        }

        // Get total count
        var totalCount = await query.CountAsync(cancellationToken);

        // Apply pagination
        var logs = await query
            .OrderByDescending(x => x.Timestamp)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(x => new SecurityAuditLogListDto
            {
                Id = x.Id,
                Timestamp = x.Timestamp,
                Event = x.Event,
                Email = x.Email,
                TenantCode = x.TenantCode,
                IpAddress = x.IpAddress,
                RiskScore = x.RiskScore,
                RiskLevel = x.RiskScore >= 80 ? "Critical" :
                           x.RiskScore >= 60 ? "High" :
                           x.RiskScore >= 40 ? "Medium" : "Low",
                Blocked = x.Blocked,
                TimeAgo = CalculateTimeAgo(x.Timestamp)
            })
            .ToListAsync(cancellationToken);

        var response = new AuditLogsResponse
        {
            Logs = logs,
            TotalCount = totalCount,
            PageNumber = request.PageNumber,
            PageSize = request.PageSize
        };

        return Result<AuditLogsResponse>.Success(response);
    }

    private static string CalculateTimeAgo(DateTime timestamp)
    {
        var timeSpan = DateTime.UtcNow - timestamp;

        if (timeSpan.TotalMinutes < 1)
            return "Az önce";
        if (timeSpan.TotalMinutes < 60)
            return $"{(int)timeSpan.TotalMinutes} dakika önce";
        if (timeSpan.TotalHours < 24)
            return $"{(int)timeSpan.TotalHours} saat önce";
        if (timeSpan.TotalDays < 7)
            return $"{(int)timeSpan.TotalDays} gün önce";
        if (timeSpan.TotalDays < 30)
            return $"{(int)(timeSpan.TotalDays / 7)} hafta önce";
        if (timeSpan.TotalDays < 365)
            return $"{(int)(timeSpan.TotalDays / 30)} ay önce";

        return $"{(int)(timeSpan.TotalDays / 365)} yıl önce";
    }
}
