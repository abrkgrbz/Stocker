using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using OtpNet;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Identity.Commands.Disable2FA;

public class Disable2FACommandHandler : IRequestHandler<Disable2FACommand, Result>
{
    private readonly ILogger<Disable2FACommandHandler> _logger;
    private readonly IMasterDbContext _masterContext;

    public Disable2FACommandHandler(
        ILogger<Disable2FACommandHandler> logger,
        IMasterDbContext masterContext)
    {
        _logger = logger;
        _masterContext = masterContext;
    }

    public async Task<Result> Handle(Disable2FACommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Disabling 2FA for user: {UserId}", request.UserId);

        try
        {
            var user = await _masterContext.Users
                .FirstOrDefaultAsync(u => u.Id == request.UserId, cancellationToken);

            if (user == null)
            {
                return Result.Failure(Error.NotFound("User.NotFound", "User not found"));
            }

            if (!user.TwoFactorEnabled)
            {
                return Result.Failure(Error.Validation("2FA.NotEnabled", "2FA is not currently enabled"));
            }

            // Verify current 2FA code for security
            var secretBytes = Base32Encoding.ToBytes(user.TwoFactorSecret!);
            var totp = new Totp(secretBytes);
            var isValid = totp.VerifyTotp(request.VerificationCode, out long timeStepMatched, new VerificationWindow(1, 1));

            if (!isValid)
            {
                _logger.LogWarning("Invalid 2FA code when attempting to disable for user: {UserId}", request.UserId);
                return Result.Failure(Error.Validation("2FA.InvalidCode", "Invalid verification code"));
            }

            // Disable 2FA and clear secrets
            user.TwoFactorEnabled = false;
            user.TwoFactorSecret = null;
            user.BackupCodes = null;

            await _masterContext.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("2FA disabled successfully for user: {UserId}", request.UserId);

            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error disabling 2FA for user: {UserId}", request.UserId);
            return Result.Failure(Error.Failure("2FA.DisableError", "Failed to disable 2FA"));
        }
    }
}
