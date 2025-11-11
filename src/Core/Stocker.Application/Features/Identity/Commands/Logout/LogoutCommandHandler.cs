using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.SharedKernel.Results;
using Stocker.Application.Common.Interfaces;

namespace Stocker.Application.Features.Identity.Commands.Logout;

public class LogoutCommandHandler : IRequestHandler<LogoutCommand, Result>
{
    private readonly ILogger<LogoutCommandHandler> _logger;
    private readonly IMasterDbContext _masterContext;

    public LogoutCommandHandler(
        ILogger<LogoutCommandHandler> logger,
        IMasterDbContext masterContext)
    {
        _logger = logger;
        _masterContext = masterContext;
    }

    public async Task<Result> Handle(LogoutCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Processing logout for user {UserId}", request.UserId);

        if (!Guid.TryParse(request.UserId, out var userId))
        {
            _logger.LogWarning("Invalid user ID format: {UserId}", request.UserId);
            return Result.Failure(Error.Validation("Logout.InvalidUserId", "Invalid user ID format"));
        }

        // Find and revoke refresh tokens
        var masterUser = await _masterContext.MasterUsers.FindAsync(new object[] { userId }, cancellationToken);

        if (masterUser == null)
        {
            _logger.LogWarning("User {UserId} not found during logout", userId);
            // Return success anyway - user might have been deleted
            return Result.Success();
        }

        // Revoke all refresh tokens for this user
        masterUser.RevokeRefreshToken();
        await _masterContext.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("User {UserId} logged out successfully - refresh tokens revoked", userId);

        // Note: Access tokens are JWT and stateless, they will expire naturally
        // For additional security, consider implementing token blacklisting

        return Result.Success();
    }
}