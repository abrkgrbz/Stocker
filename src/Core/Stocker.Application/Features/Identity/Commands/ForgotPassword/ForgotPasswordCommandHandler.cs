using MediatR;
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

    public ForgotPasswordCommandHandler(
        ILogger<ForgotPasswordCommandHandler> logger,
        IAuthenticationService authenticationService,
        ISecurityAuditService auditService)
    {
        _logger = logger;
        _authenticationService = authenticationService;
        _auditService = auditService;
    }

    public async Task<Result<ForgotPasswordResponse>> Handle(ForgotPasswordCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Password reset requested for email: {Email}", request.Email);

        try
        {
            // Generate password reset token (existing method)
            var tokenResult = await _authenticationService.GeneratePasswordResetTokenAsync(
                request.Email,
                cancellationToken);

            // Always return success message (security: don't reveal if email exists)
            var response = new ForgotPasswordResponse
            {
                EmailSent = true,
                Message = "If the email exists, a password reset link has been sent."
            };

            if (tokenResult.IsSuccess)
            {
                _logger.LogInformation("Password reset token generated for: {Email}", request.Email);

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

                // TODO: Send email with reset link
                // await _emailService.SendPasswordResetEmailAsync(request.Email, tokenResult.Value);
            }
            else
            {
                _logger.LogWarning("Password reset failed for: {Email}, error: {Error}",
                    request.Email, tokenResult.Error.Description);

                // Log failed attempt
                await _auditService.LogAuthEventAsync(new SecurityAuditEvent
                {
                    Event = "password_reset_failed",
                    Email = request.Email,
                    IpAddress = request.IpAddress,
                    UserAgent = request.UserAgent,
                    RiskScore = 30,
                    GdprCategory = "authentication"
                }, cancellationToken);
            }

            // Always return success (security best practice)
            return Result.Success(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing password reset for: {Email}", request.Email);

            // Still return success to prevent email enumeration
            return Result.Success(new ForgotPasswordResponse
            {
                EmailSent = true,
                Message = "If the email exists, a password reset link has been sent."
            });
        }
    }
}
