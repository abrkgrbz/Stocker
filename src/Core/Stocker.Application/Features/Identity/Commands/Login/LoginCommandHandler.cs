using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Application.Services;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Identity.Commands.Login;

public class LoginCommandHandler : IRequestHandler<LoginCommand, Result<AuthResponse>>
{
    private readonly ILogger<LoginCommandHandler> _logger;
    private readonly IAuthenticationService _authenticationService;

    public LoginCommandHandler(
        ILogger<LoginCommandHandler> logger,
        IAuthenticationService authenticationService)
    {
        _logger = logger;
        _authenticationService = authenticationService;
    }

    public async Task<Result<AuthResponse>> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Login attempt for email: {Email}", request.Email);

        try
        {
            // Check if this is a master admin login attempt
            if (IsMasterAdminEmail(request.Email))
            {
                var masterResult = await _authenticationService.AuthenticateMasterUserAsync(
                    request.Email, 
                    request.Password, 
                    cancellationToken);
                
                if (masterResult.IsSuccess)
                {
                    _logger.LogInformation("Master admin {Email} logged in successfully", request.Email);
                }
                
                return masterResult;
            }

            // Regular tenant user login
            var result = await _authenticationService.AuthenticateAsync(
                request.Email, 
                request.Password, 
                cancellationToken);
            
            if (result.IsSuccess)
            {
                _logger.LogInformation("User {Email} logged in successfully", request.Email);
            }
            else
            {
                _logger.LogWarning("Failed login attempt for email: {Email}", request.Email);
            }
            
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during login for email: {Email}", request.Email);
            return Result.Failure<AuthResponse>(Error.Failure("Auth.LoginError", "An error occurred during login"));
        }
    }

    private bool IsMasterAdminEmail(string email)
    {
        // You can implement more sophisticated logic here
        // For now, checking if email domain is for system admins
        return email.EndsWith("@stocker.com", StringComparison.OrdinalIgnoreCase) ||
               email.EndsWith("@admin.stocker.com", StringComparison.OrdinalIgnoreCase) ||
               email.EndsWith("@stoocker.app", StringComparison.OrdinalIgnoreCase);
    }
}