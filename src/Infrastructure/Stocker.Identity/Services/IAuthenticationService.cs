using Stocker.Identity.Models;

namespace Stocker.Identity.Services;

public interface IAuthenticationService
{
    Task<AuthenticationResult> LoginAsync(LoginRequest request);
    Task<AuthenticationResult> RefreshTokenAsync(RefreshTokenRequest request);
    Task<AuthenticationResult> RegisterMasterUserAsync(RegisterRequest request);
    Task<AuthenticationResult> RegisterTenantUserAsync(RegisterRequest request, Guid tenantId);
    Task<bool> ChangePasswordAsync(Guid userId, ChangePasswordRequest request);
    Task<bool> RevokeRefreshTokenAsync(Guid userId);
}