using Microsoft.AspNetCore.Components.Server.ProtectedBrowserStorage;
using System.Text;
using System.Text.Json;
using Stocker.Web.Admin.Models;

namespace Stocker.Web.Admin.Services;

public class AuthService : IAuthService
{
    private readonly IApiService _apiService;
    private readonly ProtectedLocalStorage _localStorage;
    private readonly ILogger<AuthService> _logger;

    private const string AccessTokenKey = "accessToken";
    private const string RefreshTokenKey = "refreshToken";
    private const string UserInfoKey = "userInfo";
    
    private string? _cachedAccessToken;

    public AuthService(
        IApiService apiService,
        ProtectedLocalStorage localStorage,
        ILogger<AuthService> logger)
    {
        _apiService = apiService;
        _localStorage = localStorage;
        _logger = logger;
    }

    public async Task<LoginResult> LoginAsync(LoginModel model)
    {
        try
        {
            var response = await _apiService.PostAsync<LoginModel, ApiResponse<AuthResponse>>("/api/master/auth/login", model);

            if (response?.Success == true && response.Data != null)
            {
                // Store tokens and user info
                await _localStorage.SetAsync(AccessTokenKey, response.Data.AccessToken);
                await _localStorage.SetAsync(RefreshTokenKey, response.Data.RefreshToken);
                await _localStorage.SetAsync(UserInfoKey, response.Data.User);

                // Cache the access token
                _cachedAccessToken = response.Data.AccessToken;

                // Set token for future API calls
                _apiService.SetAuthToken(response.Data.AccessToken);

                return new LoginResult
                {
                    Success = true,
                    AccessToken = response.Data.AccessToken,
                    RefreshToken = response.Data.RefreshToken,
                    AccessTokenExpiration = response.Data.AccessTokenExpiration,
                    User = response.Data.User,
                    Message = response.Message
                };
            }

            return new LoginResult
            {
                Success = false,
                Errors = new List<string> { "Giriş başarısız" },
                Message = "Giriş başarısız"
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Login error");
            return new LoginResult
            {
                Success = false,
                Errors = new List<string> { "Bir hata oluştu. Lütfen tekrar deneyin." }
            };
        }
    }

    public async Task LogoutAsync()
    {
        try
        {
            // Call logout endpoint
            await _apiService.PostAsync<object, object>("/api/master/auth/logout", new { });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Logout error");
        }
        finally
        {
            // Clear local storage
            await _localStorage.DeleteAsync(AccessTokenKey);
            await _localStorage.DeleteAsync(RefreshTokenKey);
            await _localStorage.DeleteAsync(UserInfoKey);
            
            // Clear cached token
            _cachedAccessToken = null;
            
            // Clear token from API service
            _apiService.SetAuthToken(string.Empty);
        }
    }

    public async Task<bool> IsAuthenticatedAsync()
    {
        try
        {
            var result = await _localStorage.GetAsync<string>(AccessTokenKey);
            if (result.Success && !string.IsNullOrEmpty(result.Value))
            {
                // Cache the token
                _cachedAccessToken = result.Value;
                // Set it in API service
                _apiService.SetAuthToken(result.Value);
                return true;
            }
            return false;
        }
        catch
        {
            return false;
        }
    }

    public async Task<UserInfo?> GetCurrentUserAsync()
    {
        try
        {
            var result = await _localStorage.GetAsync<UserInfo>(UserInfoKey);
            return result.Success ? result.Value : null;
        }
        catch
        {
            return null;
        }
    }

    

    public string? GetAccessToken()
    {
        // Return cached token if available
        if (!string.IsNullOrEmpty(_cachedAccessToken))
        {
            return _cachedAccessToken;
        }

        // Try to get from local storage synchronously
        // This is not ideal but necessary for the sync method
        // In production, consider making this async throughout
        Task.Run(async () =>
        {
            try
            {
                var result = await _localStorage.GetAsync<string>(AccessTokenKey);
                if (result.Success && !string.IsNullOrEmpty(result.Value))
                {
                    _cachedAccessToken = result.Value;
                    _apiService.SetAuthToken(result.Value);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting access token from storage");
            }
        }).Wait();

        return _cachedAccessToken;
    }
    
    public async Task<string?> GetAccessTokenAsync()
    {
        // Return cached token if available
        if (!string.IsNullOrEmpty(_cachedAccessToken))
        {
            return _cachedAccessToken;
        }

        try
        {
            var result = await _localStorage.GetAsync<string>(AccessTokenKey);
            if (result.Success && !string.IsNullOrEmpty(result.Value))
            {
                _cachedAccessToken = result.Value;
                _apiService.SetAuthToken(result.Value);
                return _cachedAccessToken;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting access token from storage");
        }

        return null;
    }

}

// API Response Models
public class ApiResponse<T>
{
    public bool Success { get; set; }
    public T? Data { get; set; }
    public string? Message { get; set; }
}

public class ApiErrorResponse
{
    public bool Success { get; set; }
    public List<string> Errors { get; set; } = new();
    public string? Message { get; set; }
}

public class AuthResponse
{
    public string AccessToken { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public DateTime AccessTokenExpiration { get; set; }
    public DateTime RefreshTokenExpiration { get; set; }
    public UserInfo User { get; set; } = new();
}