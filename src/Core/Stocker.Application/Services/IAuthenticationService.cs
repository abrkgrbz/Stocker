using Stocker.Application.Features.Identity.Commands.Login;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Services;

public interface IAuthenticationService
{
    Task<Result<AuthResponse>> AuthenticateAsync(string email, string password, CancellationToken cancellationToken = default);
    Task<Result<AuthResponse>> AuthenticateMasterUserAsync(string email, string password, CancellationToken cancellationToken = default);
    Task<Result<AuthResponse>> RefreshTokenAsync(string refreshToken, string? ipAddress = null, string? userAgent = null, CancellationToken cancellationToken = default);
    Task<Result> RevokeRefreshTokenAsync(string userId, CancellationToken cancellationToken = default);
    Task<Result> ChangePasswordAsync(string userId, string currentPassword, string newPassword, CancellationToken cancellationToken = default);
    Task<Result<string>> GeneratePasswordResetTokenAsync(string email, string? tenantCode = null, CancellationToken cancellationToken = default);
    Task<Result> ResetPasswordAsync(string email, string token, string newPassword, CancellationToken cancellationToken = default);
    Task<Result<AuthResponse>> GenerateAuthResponseForMasterUserAsync(Guid userId, CancellationToken cancellationToken = default);

    Task<Result<bool>> ValidateTokenAsync(string token, CancellationToken cancellationToken = default);
}