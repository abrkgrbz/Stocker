using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.Services;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Identity.Commands.ForgotPassword;

public class ForgotPasswordCommandHandler : IRequestHandler<ForgotPasswordCommand, Result<ForgotPasswordResponse>>
{
    private readonly ILogger<ForgotPasswordCommandHandler> _logger;
    private readonly IAuthenticationService _authenticationService;
    private readonly ISecurityAuditService _auditService;
    private readonly IEmailService _emailService;
    private readonly IMasterDbContext _masterContext;
    private readonly ITenantDbContextFactory _tenantDbContextFactory;

    public ForgotPasswordCommandHandler(
        ILogger<ForgotPasswordCommandHandler> logger,
        IAuthenticationService authenticationService,
        ISecurityAuditService auditService,
        IEmailService emailService,
        IMasterDbContext masterContext,
        ITenantDbContextFactory tenantDbContextFactory)
    {
        _logger = logger;
        _authenticationService = authenticationService;
        _auditService = auditService;
        _emailService = emailService;
        _masterContext = masterContext;
        _tenantDbContextFactory = tenantDbContextFactory;
    }

    public async Task<Result<ForgotPasswordResponse>> Handle(ForgotPasswordCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Password reset requested for email: {Email}, TenantCode: {TenantCode}",
            request.Email, request.TenantCode ?? "none");

        try
        {
            // Generate password reset token with tenant code for direct lookup
            var tokenResult = await _authenticationService.GeneratePasswordResetTokenAsync(
                request.Email,
                request.TenantCode,
                cancellationToken);

            // Always return success message (security: don't reveal if email exists)
            var response = new ForgotPasswordResponse
            {
                EmailSent = true,
                Message = "E-posta adresiniz sistemde kayıtlıysa, şifre sıfırlama bağlantısı gönderildi."
            };

            if (tokenResult.IsSuccess)
            {
                _logger.LogInformation("Password reset token generated for: {Email}", request.Email);

                // Get user name for email template
                string userName = await GetUserNameAsync(request.Email, request.TenantCode, cancellationToken);

                // Send password reset email
                try
                {
                    await _emailService.SendPasswordResetAsync(
                        request.Email,
                        tokenResult.Value,
                        userName,
                        cancellationToken);

                    _logger.LogInformation("Password reset email sent to: {Email}", request.Email);
                }
                catch (Exception emailEx)
                {
                    _logger.LogError(emailEx, "Failed to send password reset email to: {Email}", request.Email);
                    // Don't fail the request if email fails - token is still valid
                }

                // Log password reset request
                await _auditService.LogAuthEventAsync(new SecurityAuditEvent
                {
                    Event = "password_reset_requested",
                    Email = request.Email,
                    IpAddress = request.IpAddress,
                    UserAgent = request.UserAgent,
                    RiskScore = 20,
                    GdprCategory = "authentication"
                }, cancellationToken);
            }
            else
            {
                _logger.LogWarning("Password reset failed for: {Email}, error: {Error}",
                    request.Email, tokenResult.Error.Description);

                // Log failed attempt (user not found)
                await _auditService.LogAuthEventAsync(new SecurityAuditEvent
                {
                    Event = "password_reset_user_not_found",
                    Email = request.Email,
                    IpAddress = request.IpAddress,
                    UserAgent = request.UserAgent,
                    RiskScore = 30,
                    GdprCategory = "authentication"
                }, cancellationToken);
            }

            // Always return success (security best practice - prevent email enumeration)
            return Result.Success(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing password reset for: {Email}", request.Email);

            // Still return success to prevent email enumeration
            return Result.Success(new ForgotPasswordResponse
            {
                EmailSent = true,
                Message = "E-posta adresiniz sistemde kayıtlıysa, şifre sıfırlama bağlantısı gönderildi."
            });
        }
    }

    private async Task<string> GetUserNameAsync(string email, string? tenantCode, CancellationToken cancellationToken)
    {
        string userName = "Kullanıcı";

        // If no tenant code provided, check MasterUsers first (tenant admins)
        if (string.IsNullOrWhiteSpace(tenantCode))
        {
            var masterUser = await _masterContext.MasterUsers
                .Where(u => EF.Functions.Like(u.Email.Value, email))
                .Select(u => new { u.FirstName, u.LastName })
                .FirstOrDefaultAsync(cancellationToken);

            if (masterUser != null)
            {
                return $"{masterUser.FirstName} {masterUser.LastName}";
            }
        }
        else
        {
            // Tenant code provided - look up directly in the specific tenant database
            var tenant = await _masterContext.Tenants
                .Where(t => t.IsActive && EF.Functions.Like(t.Code, tenantCode))
                .Select(t => t.Id)
                .FirstOrDefaultAsync(cancellationToken);

            if (tenant != Guid.Empty)
            {
                try
                {
                    await using var tenantContext = await _tenantDbContextFactory.CreateDbContextAsync(tenant);
                    var tenantUser = await tenantContext.TenantUsers
                        .Where(u => EF.Functions.Like(u.Email.Value, email))
                        .Select(u => new { u.FirstName, u.LastName })
                        .FirstOrDefaultAsync(cancellationToken);

                    if (tenantUser != null)
                    {
                        return $"{tenantUser.FirstName} {tenantUser.LastName}";
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to get user name from tenant {TenantCode}", tenantCode);
                }
            }
        }

        return userName;
    }
}
