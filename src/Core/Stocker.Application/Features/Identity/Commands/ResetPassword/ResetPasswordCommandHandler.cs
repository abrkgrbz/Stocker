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

    public ResetPasswordCommandHandler(
        ILogger<ResetPasswordCommandHandler> logger,
        IAuthenticationService authenticationService,
        ISecurityAuditService auditService,
        IMasterDbContext masterContext)
    {
        _logger = logger;
        _authenticationService = authenticationService;
        _auditService = auditService;
        _masterContext = masterContext;
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

            // Find user by reset token
            var user = await _masterContext.Users
                .FirstOrDefaultAsync(u => u.PasswordResetToken == request.Token, cancellationToken);

            if (user == null)
            {
                _logger.LogWarning("Invalid password reset token");
                return Result.Failure<ResetPasswordResponse>(
                    Error.NotFound("Token.Invalid", "Invalid or expired reset token"));
            }

            // Use existing ResetPasswordAsync method
            var resetResult = await _authenticationService.ResetPasswordAsync(
                user.Email,
                request.Token,
                request.NewPassword,
                cancellationToken);

            if (resetResult.IsSuccess)
            {
                _logger.LogInformation("Password reset successful for user: {UserId}", user.Id);

                // Log successful password reset
                await _auditService.LogAuthEventAsync(new SecurityAuditEvent
                {
                    Event = "password_reset_success",
                    Email = user.Email,
                    UserId = user.Id,
                    IpAddress = request.IpAddress,
                    UserAgent = request.UserAgent,
                    RiskScore = 25,
                    GdprCategory = "authentication"
                }, cancellationToken);

                return Result.Success(new ResetPasswordResponse
                {
                    Success = true,
                    Message = "Password has been reset successfully"
                });
            }

            _logger.LogWarning("Password reset failed for user: {UserId}", user.Id);

            // Log failed password reset
            await _auditService.LogAuthEventAsync(new SecurityAuditEvent
            {
                Event = "password_reset_failed",
                Email = user.Email,
                UserId = user.Id,
                IpAddress = request.IpAddress,
                UserAgent = request.UserAgent,
                RiskScore = 40,
                GdprCategory = "authentication"
            }, cancellationToken);

            return Result.Failure<ResetPasswordResponse>(
                Error.Failure("Password.ResetFailed", resetResult.Error.Description));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error resetting password");
            return Result.Failure<ResetPasswordResponse>(
                Error.Failure("Password.ResetError", "An error occurred while resetting password"));
        }
    }
}
