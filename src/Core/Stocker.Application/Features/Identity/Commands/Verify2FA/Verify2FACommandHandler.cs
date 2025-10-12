using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using OtpNet;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.Features.Identity.Commands.Login;
using Stocker.Application.Services;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Identity.Commands.Verify2FA;

public class Verify2FACommandHandler : IRequestHandler<Verify2FACommand, Result<AuthResponse>>
{
    private readonly ILogger<Verify2FACommandHandler> _logger;
    private readonly IMasterDbContext _masterContext;
    private readonly IAuthenticationService _authenticationService;
    private readonly ISecurityAuditService _auditService;

    public Verify2FACommandHandler(
        ILogger<Verify2FACommandHandler> logger,
        IMasterDbContext masterContext,
        IAuthenticationService authenticationService,
        ISecurityAuditService auditService)
    {
        _logger = logger;
        _masterContext = masterContext;
        _authenticationService = authenticationService;
        _auditService = auditService;
    }

    public async Task<Result<AuthResponse>> Handle(Verify2FACommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Verifying 2FA for email: {Email}", request.Email);

        try
        {
            var user = await _masterContext.MasterUsers
                .FirstOrDefaultAsync(u => u.Email.Value == request.Email, cancellationToken);

            if (user == null || !user.TwoFactorEnabled)
            {
                return Result.Failure<AuthResponse>(
                    Error.NotFound("2FA.NotEnabled", "2FA is not enabled for this user"));
            }

            bool isValid = false;

            if (request.IsBackupCode)
            {
                // Verify backup code
                isValid = await VerifyBackupCode(user, request.Code, cancellationToken);
            }
            else
            {
                // Verify TOTP code
                var secretBytes = Base32Encoding.ToBytes(user.TwoFactorSecret!);
                var totp = new Totp(secretBytes);
                isValid = totp.VerifyTotp(request.Code, out long timeStepMatched, new VerificationWindow(1, 1));
            }

            if (!isValid)
            {
                _logger.LogWarning("Invalid 2FA code for email: {Email}", request.Email);

                await _auditService.LogAuthEventAsync(new SecurityAuditEvent
                {
                    Event = "2fa_verification_failed",
                    Email = request.Email,
                    UserId = user.Id,
                    IpAddress = request.IpAddress,
                    UserAgent = request.UserAgent,
                    RiskScore = 50,
                    GdprCategory = "authentication"
                }, cancellationToken);

                return Result.Failure<AuthResponse>(
                    Error.Validation("2FA.InvalidCode", "Invalid 2FA code"));
            }

            // Generate JWT tokens after successful 2FA
            var authResult = await _authenticationService.AuthenticateAsync(request.Email, string.Empty, cancellationToken);

            if (authResult.IsSuccess)
            {
                // Note: Tenant information is managed separately in Tenant database
                // For audit logging, we can fetch it if needed or leave null
                await _auditService.LogAuthEventAsync(new SecurityAuditEvent
                {
                    Event = "2fa_verification_success",
                    Email = request.Email,
                    UserId = user.Id,
                    TenantCode = null, // Tenant relationship managed separately
                    IpAddress = request.IpAddress,
                    UserAgent = request.UserAgent,
                    RiskScore = 10,
                    GdprCategory = "authentication"
                }, cancellationToken);
            }

            return authResult;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error verifying 2FA for email: {Email}", request.Email);
            return Result.Failure<AuthResponse>(
                Error.Failure("2FA.VerificationError", "Failed to verify 2FA code"));
        }
    }

    private async Task<bool> VerifyBackupCode(Domain.Master.Entities.MasterUser user, string code, CancellationToken cancellationToken)
    {
        var isValid = user.UseBackupCode(code);

        if (isValid)
        {
            await _masterContext.SaveChangesAsync(cancellationToken);
        }

        return isValid;
    }
}
