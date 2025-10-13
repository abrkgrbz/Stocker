using Microsoft.Extensions.Logging;
using Stocker.Application.Features.Identity.Commands.Login;
using Stocker.Application.Services;
using Stocker.Identity.Models;
using Stocker.SharedKernel.Results;
using Stocker.Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Stocker.Infrastructure.Services;

public class AuthenticationServiceAdapter : Application.Services.IAuthenticationService
{
    private readonly Identity.Services.IAuthenticationService _authenticationService;
    private readonly IMasterDbContext _masterContext;
    private readonly IPasswordService _passwordService;
    private readonly ILogger<AuthenticationServiceAdapter> _logger;

    public AuthenticationServiceAdapter(
        Identity.Services.IAuthenticationService authenticationService,
        IMasterDbContext masterContext,
        IPasswordService passwordService,
        ILogger<AuthenticationServiceAdapter> logger)
    {
        _authenticationService = authenticationService;
        _masterContext = masterContext;
        _passwordService = passwordService;
        _logger = logger;
    }

    public async Task<Result<AuthResponse>> AuthenticateAsync(string email, string password, CancellationToken cancellationToken = default)
    {
        try
        {
            var loginRequest = new LoginRequest
            {
                Username = email, // Using email as username for now
                Password = password
            };

            var result = await _authenticationService.LoginAsync(loginRequest);

            if (result.Success && result.User != null)
            {
                var response = new AuthResponse
                {
                    AccessToken = result.AccessToken ?? string.Empty,
                    RefreshToken = result.RefreshToken ?? string.Empty,
                    ExpiresAt = result.AccessTokenExpiration ?? DateTime.UtcNow.AddHours(1),
                    TokenType = "Bearer",
                    User = new Application.Features.Identity.Commands.Login.UserInfo
                    {
                        Id = result.User.Id,
                        Email = result.User.Email,
                        Username = result.User.Username,
                        FullName = result.User.FullName,
                        Roles = result.User.Roles ?? new List<string>(),
                        TenantId = result.User.TenantId,
                        TenantName = result.User.TenantName
                    }
                };

                return Result.Success(response);
            }

            return Result.Failure<AuthResponse>(
                Error.Unauthorized("Auth.InvalidCredentials", string.Join(", ", result.Errors)));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during authentication");
            return Result.Failure<AuthResponse>(
                Error.Failure("Auth.Error", "An error occurred during authentication"));
        }
    }

    public async Task<Result<AuthResponse>> AuthenticateMasterUserAsync(string email, string password, CancellationToken cancellationToken = default)
    {
        try
        {
            // Check if user exists and verify password BEFORE calling LoginAsync
            var masterUser = await _masterContext.MasterUsers
                .FirstOrDefaultAsync(u => u.Email.Value == email, cancellationToken);

            if (masterUser == null)
            {
                return Result.Failure<AuthResponse>(
                    Error.Unauthorized("Auth.InvalidCredentials", "Invalid credentials"));
            }

            // Verify password BEFORE checking 2FA
            if (!_passwordService.VerifyPassword(masterUser.Password, password))
            {
                _logger.LogWarning("Invalid password for master user {Email}", email);
                return Result.Failure<AuthResponse>(
                    Error.Unauthorized("Auth.InvalidCredentials", "Invalid credentials"));
            }

            // Check if 2FA is enabled BEFORE generating full tokens
            if (masterUser.TwoFactorEnabled)
            {
                _logger.LogInformation("2FA required for master user {Email}", email);

                // Generate a temporary token (simple JWT with short expiry)
                var tempToken = Convert.ToBase64String(Guid.NewGuid().ToByteArray()) + ":" + email;

                var response = new AuthResponse
                {
                    AccessToken = string.Empty,
                    RefreshToken = string.Empty,
                    ExpiresAt = DateTime.UtcNow,
                    TokenType = "Bearer",
                    Requires2FA = true,
                    TempToken = tempToken,
                    User = new Application.Features.Identity.Commands.Login.UserInfo
                    {
                        Id = masterUser.Id,
                        Email = masterUser.Email.Value,
                        Username = masterUser.Username,
                        FullName = masterUser.GetFullName(),
                        Roles = new List<string> { masterUser.UserType.ToString() },
                        TenantId = null,
                        TenantName = null
                    }
                };

                return Result.Success(response);
            }

            // For master users without 2FA, proceed with normal login
            var loginRequest = new LoginRequest
            {
                Username = email,
                Password = password,
                TenantId = null // No tenant for master admin
            };

            var result = await _authenticationService.LoginAsync(loginRequest);

            if (result.Success && result.User != null && result.User.IsMasterUser)
            {
                var response = new AuthResponse
                {
                    AccessToken = result.AccessToken ?? string.Empty,
                    RefreshToken = result.RefreshToken ?? string.Empty,
                    ExpiresAt = result.AccessTokenExpiration ?? DateTime.UtcNow.AddHours(1),
                    TokenType = "Bearer",
                    User = new Application.Features.Identity.Commands.Login.UserInfo
                    {
                        Id = result.User.Id,
                        Email = result.User.Email,
                        Username = result.User.Username,
                        FullName = result.User.FullName,
                        Roles = result.User.Roles ?? new List<string> { "SystemAdmin" },
                        TenantId = null,
                        TenantName = null
                    }
                };

                return Result.Success(response);
            }

            if (!result.Success)
            {
                return Result.Failure<AuthResponse>(
                    Error.Unauthorized("Auth.InvalidCredentials", string.Join(", ", result.Errors)));
            }

            return Result.Failure<AuthResponse>(
                Error.Unauthorized("Auth.NotMasterUser", "User is not a master admin"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during master user authentication");
            return Result.Failure<AuthResponse>(
                Error.Failure("Auth.Error", "An error occurred during authentication"));
        }
    }

    public async Task<Result<AuthResponse>> RefreshTokenAsync(string refreshToken, CancellationToken cancellationToken = default)
    {
        try
        {
            var refreshRequest = new RefreshTokenRequest
            {
                RefreshToken = refreshToken,
                AccessToken = string.Empty // Will be validated in the service
            };

            var result = await _authenticationService.RefreshTokenAsync(refreshRequest);

            if (result.Success && result.User != null)
            {
                var response = new AuthResponse
                {
                    AccessToken = result.AccessToken ?? string.Empty,
                    RefreshToken = result.RefreshToken ?? string.Empty,
                    ExpiresAt = result.AccessTokenExpiration ?? DateTime.UtcNow.AddHours(1),
                    TokenType = "Bearer",
                    User = new Application.Features.Identity.Commands.Login.UserInfo
                    {
                        Id = result.User.Id,
                        Email = result.User.Email,
                        Username = result.User.Username,
                        FullName = result.User.FullName,
                        Roles = result.User.Roles ?? new List<string>(),
                        TenantId = result.User.TenantId,
                        TenantName = result.User.TenantName
                    }
                };

                return Result.Success(response);
            }

            return Result.Failure<AuthResponse>(
                Error.Unauthorized("Auth.InvalidToken", string.Join(", ", result.Errors)));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during token refresh");
            return Result.Failure<AuthResponse>(
                Error.Failure("Auth.RefreshError", "An error occurred during token refresh"));
        }
    }

    public async Task<Result> RevokeRefreshTokenAsync(string userId, CancellationToken cancellationToken = default)
    {
        try
        {
            if (!Guid.TryParse(userId, out var userGuid))
            {
                return Result.Failure(Error.Validation("Auth.InvalidUserId", "Invalid user ID format"));
            }

            var success = await _authenticationService.RevokeRefreshTokenAsync(userGuid);
            
            return success 
                ? Result.Success() 
                : Result.Failure(Error.NotFound("Auth.UserNotFound", "User not found"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error revoking refresh token for user {UserId}", userId);
            return Result.Failure(Error.Failure("Auth.RevokeError", "An error occurred while revoking the refresh token"));
        }
    }

    public async Task<Result> ChangePasswordAsync(string userId, string currentPassword, string newPassword, CancellationToken cancellationToken = default)
    {
        try
        {
            if (!Guid.TryParse(userId, out var userGuid))
            {
                return Result.Failure(Error.Validation("Auth.InvalidUserId", "Invalid user ID format"));
            }

            var changePasswordRequest = new ChangePasswordRequest
            {
                CurrentPassword = currentPassword,
                NewPassword = newPassword
            };

            var success = await _authenticationService.ChangePasswordAsync(userGuid, changePasswordRequest);
            
            return success 
                ? Result.Success() 
                : Result.Failure(Error.Validation("Auth.InvalidCurrentPassword", "Current password is incorrect"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error changing password for user {UserId}", userId);
            return Result.Failure(Error.Failure("Auth.ChangePasswordError", "An error occurred while changing the password"));
        }
    }

    public async Task<Result<string>> GeneratePasswordResetTokenAsync(string email, CancellationToken cancellationToken = default)
    {
        try
        {
            // This functionality needs to be implemented in the Identity service
            // For now, returning a placeholder
            _logger.LogWarning("Password reset token generation not yet implemented");
            
            // Generate a simple token for now
            var token = Convert.ToBase64String(Guid.NewGuid().ToByteArray());
            return Result.Success(token);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating password reset token for email {Email}", email);
            return Result.Failure<string>(Error.Failure("Auth.ResetTokenError", "An error occurred while generating the reset token"));
        }
    }

    public Task<Result> ResetPasswordAsync(string email, string token, string newPassword, CancellationToken cancellationToken = default)
    {
        try
        {
            // This functionality needs to be implemented in the Identity service
            _logger.LogWarning("Password reset not yet implemented");
            
            return Task.FromResult(Result.Failure(Error.Failure("Auth.ResetNotImplemented", "Password reset functionality is not yet implemented")));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error resetting password for email {Email}", email);
            return Task.FromResult(Result.Failure(Error.Failure("Auth.ResetError", "An error occurred while resetting the password")));
        }
    }

    public Task<Result<bool>> ValidateTokenAsync(string token, CancellationToken cancellationToken = default)
    {
        try
        {
            // This functionality needs to be implemented in the Identity service
            // For now, returning a simple validation
            var isValid = !string.IsNullOrWhiteSpace(token) && token.Length > 20;
            return Task.FromResult(Result.Success(isValid));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating token");
            return Task.FromResult(Result.Failure<bool>(Error.Failure("Auth.ValidationError", "An error occurred while validating the token")));
        }
    }
}