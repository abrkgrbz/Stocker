using AutoMapper;
using Stocker.Application.DTOs.Security;
using Stocker.Domain.Master.Entities;

namespace Stocker.Application.Mappings;

/// <summary>
/// AutoMapper profile for SecurityAuditLog entity mappings
/// </summary>
public class SecurityAuditLogProfile : Profile
{
    public SecurityAuditLogProfile()
    {
        // SecurityAuditLog -> SecurityAuditLogDto (detailed)
        CreateMap<SecurityAuditLog, SecurityAuditLogDto>()
            .ForMember(dest => dest.RiskLevel, opt => opt.MapFrom(src =>
                src.RiskScore >= 80 ? "Critical" :
                src.RiskScore >= 60 ? "High" :
                src.RiskScore >= 40 ? "Medium" : "Low"))
            .ForMember(dest => dest.TimeAgo, opt => opt.MapFrom(src => CalculateTimeAgo(src.Timestamp)));

        // SecurityAuditLog -> SecurityAuditLogListDto (summary)
        CreateMap<SecurityAuditLog, SecurityAuditLogListDto>()
            .ForMember(dest => dest.RiskLevel, opt => opt.MapFrom(src =>
                src.RiskScore >= 80 ? "Critical" :
                src.RiskScore >= 60 ? "High" :
                src.RiskScore >= 40 ? "Medium" : "Low"))
            .ForMember(dest => dest.TimeAgo, opt => opt.MapFrom(src => CalculateTimeAgo(src.Timestamp)));
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
