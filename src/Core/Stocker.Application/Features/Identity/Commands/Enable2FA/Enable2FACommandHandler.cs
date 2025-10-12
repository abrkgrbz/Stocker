using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using OtpNet;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Identity.Commands.Enable2FA;

public class Enable2FACommandHandler : IRequestHandler<Enable2FACommand, Result<Enable2FAResponse>>
{
    private readonly ILogger<Enable2FACommandHandler> _logger;
    private readonly IMasterDbContext _masterContext;

    public Enable2FACommandHandler(
        ILogger<Enable2FACommandHandler> logger,
        IMasterDbContext masterContext)
    {
        _logger = logger;
        _masterContext = masterContext;
    }

    public async Task<Result<Enable2FAResponse>> Handle(Enable2FACommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Enabling 2FA for user: {UserId}", request.UserId);

        try
        {
            var user = await _masterContext.MasterUsers
                .FirstOrDefaultAsync(u => u.Id == request.UserId, cancellationToken);

            if (user == null)
            {
                return Result.Failure<Enable2FAResponse>(
                    Error.NotFound("User.NotFound", "User not found"));
            }

            if (string.IsNullOrEmpty(user.TwoFactorSecret))
            {
                return Result.Failure<Enable2FAResponse>(
                    Error.Validation("2FA.NotSetup", "2FA has not been set up. Please run setup first."));
            }

            // Verify the TOTP code
            var secretBytes = Base32Encoding.ToBytes(user.TwoFactorSecret);
            var totp = new Totp(secretBytes);
            var isValid = totp.VerifyTotp(request.VerificationCode, out long timeStepMatched, new VerificationWindow(1, 1));

            if (!isValid)
            {
                _logger.LogWarning("Invalid 2FA code for user: {UserId}", request.UserId);
                return Result.Failure<Enable2FAResponse>(
                    Error.Validation("2FA.InvalidCode", "Invalid verification code"));
            }

            // Enable 2FA
            user.EnableTwoFactor(user.TwoFactorSecret);
            await _masterContext.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("2FA enabled successfully for user: {UserId}", request.UserId);

            return Result.Success(new Enable2FAResponse
            {
                Enabled = true,
                Message = "Two-factor authentication has been enabled successfully"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error enabling 2FA for user: {UserId}", request.UserId);
            return Result.Failure<Enable2FAResponse>(
                Error.Failure("2FA.EnableError", "Failed to enable 2FA"));
        }
    }
}
