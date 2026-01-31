using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.API.Controllers.Base;
using Stocker.API.Authorization;
using Stocker.Application.DTOs.Tenant.Security;
using Stocker.Application.Features.Tenant.SecuritySettings.Commands;
using Stocker.Application.Features.Tenant.SecuritySettings.Queries;

namespace Stocker.API.Controllers.Tenant;

/// <summary>
/// Controller for managing tenant security settings
/// Password policies, 2FA, session management, and API security
/// </summary>
[Route("api/tenant/[controller]")]
[ApiController]
[Authorize]
[HasPermission("Settings.Security", "View")] // Default permission for controller
public class SecuritySettingsController : ApiController
{
    /// <summary>
    /// Get all security settings for the current tenant
    /// </summary>
    /// <returns>Security settings DTO with all categories</returns>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<SecuritySettingsDto>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 401)]
    [ProducesResponseType(typeof(ApiResponse<object>), 500)]
    public async Task<IActionResult> GetSecuritySettings()
    {
        var tenantId = GetTenantId();
        if (tenantId == null)
        {
            return BadRequestResponse<object>("Tenant bulunamadı");
        }

        var query = new GetSecuritySettingsQuery
        {
            TenantId = tenantId.Value
        };

        var result = await Mediator.Send(query);

        return HandleResult(result);
    }

    /// <summary>
    /// Update password policy settings
    /// Requires FirmaYöneticisi role
    /// </summary>
    /// <param name="request">Password policy settings</param>
    /// <returns>Success result</returns>
    [HttpPut("password-policy")]
    [HasPermission("Settings.Security", "Edit")]
    [ProducesResponseType(typeof(ApiResponse<bool>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 400)]
    [ProducesResponseType(typeof(ApiResponse<object>), 401)]
    [ProducesResponseType(typeof(ApiResponse<object>), 403)]
    [ProducesResponseType(typeof(ApiResponse<object>), 500)]
    public async Task<IActionResult> UpdatePasswordPolicy([FromBody] UpdatePasswordPolicyRequest request)
    {
        var tenantId = GetTenantId();
        if (tenantId == null)
        {
            return BadRequestResponse<object>("Tenant bulunamadı");
        }

        var command = new UpdatePasswordPolicyCommand
        {
            TenantId = tenantId.Value,
            MinPasswordLength = request.MinPasswordLength,
            RequireUppercase = request.RequireUppercase,
            RequireLowercase = request.RequireLowercase,
            RequireNumbers = request.RequireNumbers,
            RequireSpecialChars = request.RequireSpecialChars,
            PasswordExpiryDays = request.PasswordExpiryDays,
            PreventPasswordReuse = request.PreventPasswordReuse,
            ModifiedBy = GetUserEmail() ?? "System"
        };

        var result = await Mediator.Send(command);

        if (result.IsSuccess)
        {
            return OkResponse(result.Value, "Şifre politikası başarıyla güncellendi");
        }

        return HandleFailure(result);
    }

    /// <summary>
    /// Update two-factor authentication settings
    /// Requires FirmaYöneticisi role
    /// </summary>
    /// <param name="request">2FA settings</param>
    /// <returns>Success result</returns>
    [HttpPut("two-factor")]
    [HasPermission("Settings.Security", "Edit")]
    [ProducesResponseType(typeof(ApiResponse<bool>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 400)]
    [ProducesResponseType(typeof(ApiResponse<object>), 401)]
    [ProducesResponseType(typeof(ApiResponse<object>), 403)]
    [ProducesResponseType(typeof(ApiResponse<object>), 500)]
    public async Task<IActionResult> UpdateTwoFactorSettings([FromBody] UpdateTwoFactorSettingsRequest request)
    {
        var tenantId = GetTenantId();
        if (tenantId == null)
        {
            return BadRequestResponse<object>("Tenant bulunamadı");
        }

        var command = new UpdateTwoFactorSettingsCommand
        {
            TenantId = tenantId.Value,
            Require2FA = request.Require2FA,
            Allow2FA = request.Allow2FA,
            TrustedDevices = request.TrustedDevices,
            TrustedDeviceDays = request.TrustedDeviceDays,
            ModifiedBy = GetUserEmail() ?? "System"
        };

        var result = await Mediator.Send(command);

        if (result.IsSuccess)
        {
            return OkResponse(result.Value, "2FA ayarları başarıyla güncellendi");
        }

        return HandleFailure(result);
    }

    /// <summary>
    /// Update session management settings
    /// Requires FirmaYöneticisi role
    /// </summary>
    /// <param name="request">Session settings</param>
    /// <returns>Success result</returns>
    [HttpPut("session")]
    [HasPermission("Settings.Security", "Edit")]
    [ProducesResponseType(typeof(ApiResponse<bool>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 400)]
    [ProducesResponseType(typeof(ApiResponse<object>), 401)]
    [ProducesResponseType(typeof(ApiResponse<object>), 403)]
    [ProducesResponseType(typeof(ApiResponse<object>), 500)]
    public async Task<IActionResult> UpdateSessionSettings([FromBody] UpdateSessionSettingsRequest request)
    {
        var tenantId = GetTenantId();
        if (tenantId == null)
        {
            return BadRequestResponse<object>("Tenant bulunamadı");
        }

        var command = new UpdateSessionSettingsCommand
        {
            TenantId = tenantId.Value,
            SessionTimeoutMinutes = request.SessionTimeoutMinutes,
            MaxConcurrentSessions = request.MaxConcurrentSessions,
            RequireReauthForCriticalOps = request.RequireReauthForCriticalOps,
            ModifiedBy = GetUserEmail() ?? "System"
        };

        var result = await Mediator.Send(command);

        if (result.IsSuccess)
        {
            return OkResponse(result.Value, "Oturum ayarları başarıyla güncellendi");
        }

        return HandleFailure(result);
    }

    /// <summary>
    /// Update API security settings
    /// Requires FirmaYöneticisi role
    /// </summary>
    /// <param name="request">API security settings</param>
    /// <returns>Success result</returns>
    [HttpPut("api-security")]
    [HasPermission("Settings.Security", "Edit")]
    [ProducesResponseType(typeof(ApiResponse<bool>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 400)]
    [ProducesResponseType(typeof(ApiResponse<object>), 401)]
    [ProducesResponseType(typeof(ApiResponse<object>), 403)]
    [ProducesResponseType(typeof(ApiResponse<object>), 500)]
    public async Task<IActionResult> UpdateApiSecurity([FromBody] UpdateApiSecurityRequest request)
    {
        var tenantId = GetTenantId();
        if (tenantId == null)
        {
            return BadRequestResponse<object>("Tenant bulunamadı");
        }

        var command = new UpdateApiSecurityCommand
        {
            TenantId = tenantId.Value,
            AllowApiAccess = request.AllowApiAccess,
            RequireApiKey = request.RequireApiKey,
            ApiKeyExpiryDays = request.ApiKeyExpiryDays,
            RateLimitEnabled = request.RateLimitEnabled,
            RateLimitRequestsPerHour = request.RateLimitRequestsPerHour,
            ModifiedBy = GetUserEmail() ?? "System"
        };

        var result = await Mediator.Send(command);

        if (result.IsSuccess)
        {
            return OkResponse(result.Value, "API güvenlik ayarları başarıyla güncellendi");
        }

        return HandleFailure(result);
    }
}
