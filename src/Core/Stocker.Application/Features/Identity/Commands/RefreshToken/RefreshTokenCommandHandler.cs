using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Application.Features.Identity.Commands.Login;
using Stocker.Application.Services;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Identity.Commands.RefreshToken;

public class RefreshTokenCommandHandler : IRequestHandler<RefreshTokenCommand, Result<AuthResponse>>
{
    private readonly ILogger<RefreshTokenCommandHandler> _logger;
    private readonly IAuthenticationService _authenticationService;

    public RefreshTokenCommandHandler(
        ILogger<RefreshTokenCommandHandler> logger,
        IAuthenticationService authenticationService)
    {
        _logger = logger;
        _authenticationService = authenticationService;
    }

    public async Task<Result<AuthResponse>> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Refresh token attempt");

        if (string.IsNullOrEmpty(request.RefreshToken))
        {
            return Result.Failure<AuthResponse>(Error.Validation("Auth.InvalidToken", "Refresh token is required"));
        }

        try
        {
            var result = await _authenticationService.RefreshTokenAsync(
                request.RefreshToken,
                request.AccessToken,
                request.IpAddress,
                request.UserAgent,
                cancellationToken);

            if (result.IsSuccess)
            {
                _logger.LogInformation("Token refreshed successfully from IP: {IpAddress}", request.IpAddress);
            }
            else
            {
                _logger.LogWarning("Failed to refresh token from IP: {IpAddress}", request.IpAddress);
            }

            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during token refresh");
            return Result.Failure<AuthResponse>(Error.Failure("Auth.RefreshError", "An error occurred during token refresh"));
        }
    }
}