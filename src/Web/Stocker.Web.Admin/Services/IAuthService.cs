using Stocker.Web.Admin.Models;

namespace Stocker.Web.Admin.Services;

public interface IAuthService
{
    Task<LoginResult> LoginAsync(LoginModel model);
    Task LogoutAsync();
    Task<bool> IsAuthenticatedAsync();
    Task<UserInfo?> GetCurrentUserAsync();
    string? GetAccessToken();
    Task<string?> GetAccessTokenAsync();
}