using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.DTOs.Tenant.Security;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Tenant.SecuritySettings.Queries;

/// <summary>
/// Handler for GetSecuritySettingsQuery
/// </summary>
public class GetSecuritySettingsQueryHandler : IRequestHandler<GetSecuritySettingsQuery, Result<SecuritySettingsDto>>
{
    private readonly ITenantDbContext _context;

    public GetSecuritySettingsQueryHandler(ITenantDbContext context)
    {
        _context = context;
    }

    public async Task<Result<SecuritySettingsDto>> Handle(GetSecuritySettingsQuery request, CancellationToken cancellationToken)
    {
        var settings = await _context.TenantSecuritySettings
            .Where(s => s.Id == request.TenantId)
            .FirstOrDefaultAsync(cancellationToken);

        if (settings == null)
        {
            // Return default settings if not found
            settings = await CreateDefaultSettings(request.TenantId, cancellationToken);
        }

        var dto = new SecuritySettingsDto
        {
            Id = settings.Id,
            TenantId = request.TenantId,
            PasswordPolicy = new PasswordPolicyDto
            {
                MinPasswordLength = settings.MinPasswordLength,
                RequireUppercase = settings.RequireUppercase,
                RequireLowercase = settings.RequireLowercase,
                RequireNumbers = settings.RequireNumbers,
                RequireSpecialChars = settings.RequireSpecialCharacters,
                PasswordExpiryDays = settings.PasswordExpiryDays,
                PreventPasswordReuse = settings.PasswordHistoryCount
            },
            TwoFactorSettings = new TwoFactorSettingsDto
            {
                Require2FA = settings.TwoFactorRequired,
                Allow2FA = settings.TwoFactorOptional,
                TrustedDevices = settings.RequireDeviceApproval,
                TrustedDeviceDays = settings.DeviceTrustDurationDays
            },
            SessionSettings = new SessionSettingsDto
            {
                SessionTimeoutMinutes = settings.SessionTimeoutMinutes,
                MaxConcurrentSessions = settings.SingleSessionPerUser ? 1 : 5,
                RequireReauthForCriticalOps = true // Default to true for security
            },
            ApiSecurity = new ApiSecuritySettingsDto
            {
                AllowApiAccess = true, // Default to true
                RequireApiKey = settings.RequireApiKey,
                ApiKeyExpiryDays = settings.ApiKeyExpiryDays,
                RateLimitEnabled = settings.EnableApiRateLimiting,
                RateLimitRequestsPerHour = settings.ApiRateLimitPerHour
            },
            LastModifiedAt = settings.LastModifiedAt,
            LastModifiedBy = settings.LastModifiedBy
        };

        return Result<SecuritySettingsDto>.Success(dto);
    }

    private async Task<Domain.Tenant.Entities.TenantSecuritySettings> CreateDefaultSettings(
        Guid tenantId,
        CancellationToken cancellationToken)
    {
        var settings = Domain.Tenant.Entities.TenantSecuritySettings.CreateDefault("System");

        // Use reflection to set the Id to the TenantId
        var idProperty = settings.GetType().BaseType?.GetProperty("Id");
        idProperty?.SetValue(settings, tenantId);

        _context.TenantSecuritySettings.Add(settings);
        await _context.SaveChangesAsync(cancellationToken);
        return settings;
    }
}
