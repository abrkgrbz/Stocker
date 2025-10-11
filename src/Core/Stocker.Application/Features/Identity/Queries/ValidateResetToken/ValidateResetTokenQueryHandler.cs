using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Application.Services;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Identity.Queries.ValidateResetToken;

public class ValidateResetTokenQueryHandler : IRequestHandler<ValidateResetTokenQuery, Result<ValidateResetTokenResponse>>
{
    private readonly ILogger<ValidateResetTokenQueryHandler> _logger;
    private readonly IAuthenticationService _authenticationService;

    public ValidateResetTokenQueryHandler(
        ILogger<ValidateResetTokenQueryHandler> logger,
        IAuthenticationService authenticationService)
    {
        _logger = logger;
        _authenticationService = authenticationService;
    }

    public async Task<Result<ValidateResetTokenResponse>> Handle(ValidateResetTokenQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Validating password reset token");

        try
        {
            // Validate token using existing method
            var isValid = await _authenticationService.ValidateTokenAsync(request.Token, cancellationToken);

            if (isValid.IsSuccess && isValid.Value)
            {
                // Token is valid - return expiry time (1 hour from generation)
                return Result.Success(new ValidateResetTokenResponse
                {
                    Valid = true,
                    ExpiresAt = DateTime.UtcNow.AddHours(1) // Tokens typically expire in 1 hour
                });
            }

            _logger.LogWarning("Invalid or expired password reset token");
            return Result.Success(new ValidateResetTokenResponse
            {
                Valid = false,
                ExpiresAt = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating password reset token");
            return Result.Failure<ValidateResetTokenResponse>(
                Error.Failure("Token.ValidationError", "Error validating reset token"));
        }
    }
}
