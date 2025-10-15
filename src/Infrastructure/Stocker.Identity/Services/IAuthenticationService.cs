using Stocker.Identity.Models;
using Stocker.Application.Features.Identity.Commands.Login;
using Stocker.SharedKernel.Results;

namespace Stocker.Identity.Services;

public interface IAuthenticationService
{
    Task<AuthenticationResult> LoginAsync(LoginRequest request);
    Task<AuthenticationResult> RefreshTokenAsync(RefreshTokenRequest request);
    Task<AuthenticationResult> RegisterMasterUserAsync(RegisterRequest request);
    Task<AuthenticationResult> RegisterTenantUserAsync(RegisterRequest request, Guid tenantId);
    Task<bool> ChangePasswordAsync(Guid userId, ChangePasswordRequest request);
    Task<bool> RevokeRefreshTokenAsync(Guid userId);
    Task<Result<AuthResponse>> GenerateAuthResponseForMasterUserAsync(Guid userId, CancellationToken cancellationToken = default);
}