using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.Services;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Identity.Commands.ResetPassword;

public class ResetPasswordCommandHandler : IRequestHandler<ResetPasswordCommand, Result<ResetPasswordResponse>>
{
    private readonly ILogger<ResetPasswordCommandHandler> _logger;
    private readonly IAuthenticationService _authenticationService;
    private readonly ISecurityAuditService _auditService;
    private readonly IMasterDbContext _masterContext;
    private readonly ITenantDbContextFactory _tenantDbContextFactory;

    public ResetPasswordCommandHandler(
        ILogger<ResetPasswordCommandHandler> logger,
        IAuthenticationService authenticationService,
        ISecurityAuditService auditService,
        IMasterDbContext masterContext,
        ITenantDbContextFactory tenantDbContextFactory)
    {
        _logger = logger;
        _authenticationService = authenticationService;
        _auditService = auditService;
        _masterContext = masterContext;
        _tenantDbContextFactory = tenantDbContextFactory;
    }

    public async Task<Result<ResetPasswordResponse>> Handle(ResetPasswordCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Password reset attempt with token");

        try
        {
            // Validate password strength
            if (request.NewPassword.Length < 8)
            {
                return Result.Failure<ResetPasswordResponse>(
                    Error.Validation("Password.TooShort", "Password must be at least 8 characters"));
            }

            // Normalize token to URL-safe Base64 format (as stored in database)
            // Database stores tokens with: + -> -, / -> _, trailing = removed
            var normalizedToken = request.Token
                .Replace("+", "-")
                .Replace("/", "_")
                .TrimEnd('=');

            _logger.LogInformation("Searching for token. Original: {Token}, Normalized: {NormalizedToken}",
                request.Token, normalizedToken);

            // First, try to find user by reset token in MasterUsers
            var masterUser = await _masterContext.MasterUsers
                .FirstOrDefaultAsync(u => u.PasswordResetToken == request.Token || u.PasswordResetToken == normalizedToken, cancellationToken);

            if (masterUser != null)
            {
                // Validate token expiry with timezone correction
                // Npgsql legacy mode timestamp handling issue:
                // - Token saved with DateTime.UtcNow.AddHours(1), e.g., 07:32 UTC
                // - Npgsql legacy mode treats DateTime as local time (Turkey +3)
                // - Writes to DB: 07:32 - 3h = 04:32 UTC
                // - Reads back: 04:32 UTC + local offset (container is UTC, so 0) = 04:32 with Kind=Local
                // Fix: Add Turkey timezone offset (3 hours) to correct the stored value
                var turkeyOffset = TimeSpan.FromHours(3);
                var expiryValue = masterUser.PasswordResetTokenExpiry.HasValue
                    ? masterUser.PasswordResetTokenExpiry.Value.Add(turkeyOffset)
                    : (DateTime?)null;

                if (!expiryValue.HasValue || expiryValue.Value <= DateTime.UtcNow)
                {
                    _logger.LogWarning("Password reset token expired for MasterUser: {UserId}. Expiry: {Expiry}, Now: {Now}",
                        masterUser.Id, expiryValue?.ToString("O"), DateTime.UtcNow.ToString("O"));
                    return Result.Failure<ResetPasswordResponse>(
                        Error.Validation("Token.Expired", "Şifre sıfırlama bağlantısının süresi dolmuş"));
                }

                // Reset password using AuthenticationService
                var resetResult = await _authenticationService.ResetPasswordAsync(
                    masterUser.Email.Value,
                    request.Token,
                    request.NewPassword,
                    cancellationToken);

                if (resetResult.IsSuccess)
                {
                    _logger.LogInformation("Password reset successful for MasterUser: {UserId}", masterUser.Id);

                    await _auditService.LogAuthEventAsync(new SecurityAuditEvent
                    {
                        Event = "password_reset_success",
                        Email = masterUser.Email.Value,
                        UserId = masterUser.Id,
                        IpAddress = request.IpAddress,
                        UserAgent = request.UserAgent,
                        RiskScore = 25,
                        GdprCategory = "authentication"
                    }, cancellationToken);

                    return Result.Success(new ResetPasswordResponse
                    {
                        Success = true,
                        Message = "Şifreniz başarıyla sıfırlandı"
                    });
                }

                _logger.LogWarning("Password reset failed for MasterUser: {UserId}", masterUser.Id);
                return Result.Failure<ResetPasswordResponse>(
                    Error.Failure("Password.ResetFailed", resetResult.Error.Description));
            }

            // If not found in MasterUsers, search in all tenant databases
            var tenants = await _masterContext.Tenants
                .Where(t => t.IsActive)
                .Select(t => t.Id)
                .ToListAsync(cancellationToken);

            foreach (var tenantId in tenants)
            {
                try
                {
                    await using var tenantContext = await _tenantDbContextFactory.CreateDbContextAsync(tenantId);

                    var tenantUser = await tenantContext.TenantUsers
                        .FirstOrDefaultAsync(u => u.PasswordResetToken == request.Token || u.PasswordResetToken == normalizedToken, cancellationToken);

                    if (tenantUser != null)
                    {
                        // Validate token expiry with timezone correction (same as MasterUser)
                        var turkeyOffset = TimeSpan.FromHours(3);
                        var expiryValue = tenantUser.PasswordResetTokenExpiry.HasValue
                            ? tenantUser.PasswordResetTokenExpiry.Value.Add(turkeyOffset)
                            : (DateTime?)null;

                        if (!expiryValue.HasValue || expiryValue.Value <= DateTime.UtcNow)
                        {
                            _logger.LogWarning("Password reset token expired for TenantUser: {UserId} in Tenant: {TenantId}. Expiry: {Expiry}, Now: {Now}",
                                tenantUser.Id, tenantId, expiryValue?.ToString("O"), DateTime.UtcNow.ToString("O"));
                            return Result.Failure<ResetPasswordResponse>(
                                Error.Validation("Token.Expired", "Şifre sıfırlama bağlantısının süresi dolmuş"));
                        }

                        // Reset password using AuthenticationService
                        var resetResult = await _authenticationService.ResetPasswordAsync(
                            tenantUser.Email.Value,
                            request.Token,
                            request.NewPassword,
                            cancellationToken);

                        if (resetResult.IsSuccess)
                        {
                            _logger.LogInformation("Password reset successful for TenantUser: {UserId} in Tenant: {TenantId}", tenantUser.Id, tenantId);

                            await _auditService.LogAuthEventAsync(new SecurityAuditEvent
                            {
                                Event = "password_reset_success",
                                Email = tenantUser.Email.Value,
                                UserId = tenantUser.Id,
                                IpAddress = request.IpAddress,
                                UserAgent = request.UserAgent,
                                RiskScore = 25,
                                GdprCategory = "authentication"
                            }, cancellationToken);

                            return Result.Success(new ResetPasswordResponse
                            {
                                Success = true,
                                Message = "Şifreniz başarıyla sıfırlandı"
                            });
                        }

                        _logger.LogWarning("Password reset failed for TenantUser: {UserId} in Tenant: {TenantId}", tenantUser.Id, tenantId);
                        return Result.Failure<ResetPasswordResponse>(
                            Error.Failure("Password.ResetFailed", resetResult.Error.Description));
                    }
                }
                catch (Exception tenantEx)
                {
                    _logger.LogWarning(tenantEx, "Error searching for token in tenant {TenantId}", tenantId);
                    // Continue to next tenant
                }
            }

            // Token not found anywhere
            _logger.LogWarning("Invalid password reset token - not found in any database");
            return Result.Failure<ResetPasswordResponse>(
                Error.NotFound("Token.Invalid", "Geçersiz veya süresi dolmuş şifre sıfırlama bağlantısı"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error resetting password");
            return Result.Failure<ResetPasswordResponse>(
                Error.Failure("Password.ResetError", "Şifre sıfırlanırken bir hata oluştu"));
        }
    }
}
