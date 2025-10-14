using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Identity.Queries.Get2FAStatus;

public class Get2FAStatusQueryHandler : IRequestHandler<Get2FAStatusQuery, Result<Get2FAStatusResponse>>
{
    private readonly ILogger<Get2FAStatusQueryHandler> _logger;
    private readonly IMasterDbContext _masterContext;

    public Get2FAStatusQueryHandler(
        ILogger<Get2FAStatusQueryHandler> logger,
        IMasterDbContext masterContext)
    {
        _logger = logger;
        _masterContext = masterContext;
    }

    public async Task<Result<Get2FAStatusResponse>> Handle(Get2FAStatusQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Getting 2FA status for user: {UserId}", request.UserId);

        try
        {
            var user = await _masterContext.MasterUsers
                .FirstOrDefaultAsync(u => u.Id == request.UserId, cancellationToken);

            if (user == null)
            {
                return Result.Failure<Get2FAStatusResponse>(
                    Error.NotFound("User.NotFound", "User not found"));
            }

            // Count remaining backup codes (format: "code:used")
            var backupCodesRemaining = 0;
            if (!string.IsNullOrEmpty(user.BackupCodes))
            {
                var codes = user.BackupCodes.Split(',', StringSplitOptions.RemoveEmptyEntries);
                backupCodesRemaining = codes.Count(c => c.EndsWith(":false"));
            }

            var response = new Get2FAStatusResponse
            {
                Enabled = user.TwoFactorEnabled,
                BackupCodesRemaining = backupCodesRemaining
            };

            return Result.Success(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting 2FA status for user: {UserId}", request.UserId);
            return Result.Failure<Get2FAStatusResponse>(
                Error.Failure("2FA.StatusError", "Failed to get 2FA status"));
        }
    }
}
