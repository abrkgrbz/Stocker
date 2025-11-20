using Stocker.Application.DTOs.Security;
using Stocker.Application.Extensions;
using Stocker.SharedKernel.Repositories;
using Stocker.SharedKernel.Results;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Stocker.Application.Features.Security.Queries.GetAuditLogById;

/// <summary>
/// Handler for retrieving a single audit log by ID
/// </summary>
public class GetAuditLogByIdQueryHandler : IRequestHandler<GetAuditLogByIdQuery, Result<SecurityAuditLogDto>>
{
    private readonly IMasterUnitOfWork _unitOfWork;

    public GetAuditLogByIdQueryHandler(IMasterUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<SecurityAuditLogDto>> Handle(GetAuditLogByIdQuery request, CancellationToken cancellationToken)
    {
        var auditLog = await _unitOfWork.SecurityAuditLogs()
            .AsQueryable()
            .Where(x => x.Id == request.Id)
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

        if (auditLog == null)
            return Result<SecurityAuditLogDto>.Failure(Error.NotFound("AuditLog.NotFound", "Denetim günlüğü bulunamadı"));

        return Result<SecurityAuditLogDto>.Success(auditLog);
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
