using Stocker.Application.DTOs.Security;
using Stocker.Application.Extensions;
using Stocker.SharedKernel.Repositories;
using Stocker.SharedKernel.Results;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Stocker.Application.Features.Tenant.AuditLogs.Queries;

/// <summary>
/// Handler for retrieving a specific audit log by ID for a tenant
/// </summary>
public class GetTenantAuditLogByIdQueryHandler : IRequestHandler<GetTenantAuditLogByIdQuery, Result<SecurityAuditLogDto>>
{
    private readonly IMasterUnitOfWork _unitOfWork;

    public GetTenantAuditLogByIdQueryHandler(IMasterUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<SecurityAuditLogDto>> Handle(GetTenantAuditLogByIdQuery request, CancellationToken cancellationToken)
    {
        // First, get the TenantCode and TenantName from TenantId
        var tenant = await _unitOfWork.Tenants()
            .AsQueryable()
            .Where(t => t.Id == request.TenantId)
            .Select(t => new { t.Code, t.Name })
            .FirstOrDefaultAsync(cancellationToken);

        if (tenant == null)
        {
            return Result<SecurityAuditLogDto>.Failure(
                new Error("Tenant.NotFound", "Tenant bulunamadı", ErrorType.NotFound));
        }

        // Get the audit log, ensuring it belongs to this tenant
        var log = await _unitOfWork.SecurityAuditLogs()
            .AsQueryable()
            .Where(x => x.Id == request.LogId && x.TenantCode == tenant.Code)
            .Select(x => new SecurityAuditLogDto
            {
                Id = x.Id,
                Timestamp = x.Timestamp,
                Event = x.Event,
                UserId = x.UserId,
                Email = x.Email,
                TenantCode = x.TenantCode,
                IpAddress = x.IpAddress,
                UserAgent = x.UserAgent,
                RiskScore = x.RiskScore,
                RiskLevel = x.RiskScore >= 80 ? "Critical" :
                           x.RiskScore >= 60 ? "High" :
                           x.RiskScore >= 40 ? "Medium" : "Low",
                Blocked = x.Blocked,
                Metadata = x.Metadata,
                TimeAgo = CalculateTimeAgo(x.Timestamp)
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (log == null)
        {
            return Result<SecurityAuditLogDto>.Failure(
                new Error("AuditLog.NotFound", "Denetim günlüğü bulunamadı", ErrorType.NotFound));
        }

        return Result<SecurityAuditLogDto>.Success(log);
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
