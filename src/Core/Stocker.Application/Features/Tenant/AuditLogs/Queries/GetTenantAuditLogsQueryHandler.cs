using Stocker.Application.DTOs.Security;
using Stocker.Application.DTOs.Tenant.AuditLogs;
using Stocker.Application.Extensions;
using Stocker.SharedKernel.Repositories;
using Stocker.SharedKernel.Results;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Stocker.Application.Features.Tenant.AuditLogs.Queries;

/// <summary>
/// Handler for retrieving paginated audit logs for a specific tenant
/// Uses Master database but filters by TenantCode derived from TenantId
/// </summary>
public class GetTenantAuditLogsQueryHandler : IRequestHandler<GetTenantAuditLogsQuery, Result<TenantAuditLogsResponse>>
{
    private readonly IMasterUnitOfWork _unitOfWork;

    public GetTenantAuditLogsQueryHandler(IMasterUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<TenantAuditLogsResponse>> Handle(GetTenantAuditLogsQuery request, CancellationToken cancellationToken)
    {
        // First, get the TenantCode from TenantId
        var tenant = await _unitOfWork.Tenants()
            .AsQueryable()
            .Where(t => t.Id == request.TenantId)
            .Select(t => new { t.Code })
            .FirstOrDefaultAsync(cancellationToken);

        if (tenant == null)
        {
            return Result<TenantAuditLogsResponse>.Failure(
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

        // Apply event filter
        if (!string.IsNullOrWhiteSpace(request.Event))
            query = query.Where(x => x.Event == request.Event);

        // Apply email filter
        if (!string.IsNullOrWhiteSpace(request.Email))
            query = query.Where(x => x.Email != null && x.Email.Contains(request.Email));

        // Apply IP filter
        if (!string.IsNullOrWhiteSpace(request.IpAddress))
            query = query.Where(x => x.IpAddress != null && x.IpAddress.Contains(request.IpAddress));

        // Apply risk score filters
        if (request.MinRiskScore.HasValue)
            query = query.Where(x => x.RiskScore >= request.MinRiskScore.Value);

        if (request.MaxRiskScore.HasValue)
            query = query.Where(x => x.RiskScore <= request.MaxRiskScore.Value);

        // Apply blocked filter
        if (request.Blocked.HasValue)
            query = query.Where(x => x.Blocked == request.Blocked.Value);

        // Apply search term
        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            query = query.Where(x =>
                (x.Email != null && x.Email.Contains(request.SearchTerm)) ||
                (x.Event != null && x.Event.Contains(request.SearchTerm)) ||
                (x.IpAddress != null && x.IpAddress.Contains(request.SearchTerm)));
        }

        // Get total count
        var totalCount = await query.CountAsync(cancellationToken);

        // Apply pagination and project to DTO
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

        var response = new TenantAuditLogsResponse
        {
            Logs = logs,
            TotalCount = totalCount,
            PageNumber = request.PageNumber,
            PageSize = request.PageSize
        };

        return Result<TenantAuditLogsResponse>.Success(response);
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
