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

            // First, try to find user by reset token in MasterUsers
            var masterUser = await _masterContext.MasterUsers
                .FirstOrDefaultAsync(u => u.PasswordResetToken == request.Token, cancellationToken);

            if (masterUser != null)
            {
                // Validate token expiry
                if (!masterUser.PasswordResetTokenExpiry.HasValue || masterUser.PasswordResetTokenExpiry.Value <= DateTime.UtcNow)
                {
                    _logger.LogWarning("Password reset token expired for MasterUser: {UserId}", masterUser.Id);
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
                        .FirstOrDefaultAsync(u => u.PasswordResetToken == request.Token, cancellationToken);

                    if (tenantUser != null)
                    {
                        // Validate token expiry
                        if (!tenantUser.PasswordResetTokenExpiry.HasValue || tenantUser.PasswordResetTokenExpiry.Value <= DateTime.UtcNow)
                        {
                            _logger.LogWarning("Password reset token expired for TenantUser: {UserId} in Tenant: {TenantId}", tenantUser.Id, tenantId);
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
