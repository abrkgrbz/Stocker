using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Identity.Queries.Check2FALockout;

public class Check2FALockoutQueryHandler : IRequestHandler<Check2FALockoutQuery, Result<LockoutStatusResponse>>
{
    private readonly ILogger<Check2FALockoutQueryHandler> _logger;
    private readonly IMasterDbContext _masterContext;

    public Check2FALockoutQueryHandler(
        ILogger<Check2FALockoutQueryHandler> logger,
        IMasterDbContext masterContext)
    {
        _logger = logger;
        _masterContext = masterContext;
    }

    public async Task<Result<LockoutStatusResponse>> Handle(Check2FALockoutQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Checking 2FA lockout status for email: {Email}", request.Email);

        try
        {
            var user = await _masterContext.MasterUsers
                .FirstOrDefaultAsync(u => u.Email.Value == request.Email, cancellationToken);

            if (user == null)
            {
                return Result.Failure<LockoutStatusResponse>(
                    Error.NotFound("User.NotFound", "User not found"));
            }

            if (!user.TwoFactorEnabled)
            {
                return Result.Success(new LockoutStatusResponse
                {
                    IsLockedOut = false,
                    MinutesRemaining = null,
                    SecondsRemaining = null,
                    Message = null
                });
            }

            var isLockedOut = user.IsTwoFactorLockedOut();

            if (isLockedOut)
            {
                var timeRemaining = user.GetTwoFactorLockoutTimeRemaining();
                var minutes = timeRemaining?.Minutes ?? 0;
                var seconds = timeRemaining?.Seconds ?? 0;

                _logger.LogInformation("User {Email} is locked out. Time remaining: {Minutes}m {Seconds}s",
                    request.Email, minutes, seconds);

                return Result.Success(new LockoutStatusResponse
                {
                    IsLockedOut = true,
                    MinutesRemaining = minutes,
                    SecondsRemaining = seconds,
                    Message = $"Çok fazla başarısız deneme. {minutes} dakika {seconds} saniye sonra tekrar deneyin veya yedek kod kullanın."
                });
            }

            return Result.Success(new LockoutStatusResponse
            {
                IsLockedOut = false,
                MinutesRemaining = null,
                SecondsRemaining = null,
                Message = null
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking 2FA lockout status for email: {Email}", request.Email);
            return Result.Failure<LockoutStatusResponse>(
                Error.Failure("2FA.LockoutCheckError", "Failed to check lockout status"));
        }
    }
}
