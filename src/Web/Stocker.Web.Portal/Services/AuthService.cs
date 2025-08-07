using Blazored.LocalStorage;
using Microsoft.AspNetCore.Components.Authorization;
using Stocker.Web.Portal.Models;
using System.Security.Claims;
using System.Text.Json;
using System.Net.Http.Headers;

namespace Stocker.Web.Portal.Services;

public interface IAuthService
{
    Task<AuthenticationResponse> LoginAsync(LoginModel loginModel);
    Task<AuthenticationResponse> RegisterAsync(RegisterModel registerModel);
    Task LogoutAsync();
    Task<UserInfo?> GetCurrentUserAsync();
    Task<bool> RefreshTokenAsync();
    Task<string?> GetTokenAsync();
}

public class AuthService : IAuthService
{
    private readonly IApiService _apiService;
    private readonly ILocalStorageService _localStorage;
    private readonly AuthenticationStateProvider _authStateProvider;
    private readonly HttpClient _httpClient;

    public AuthService(
        IApiService apiService, 
        ILocalStorageService localStorage,
        AuthenticationStateProvider authStateProvider,
        HttpClient httpClient)
    {
        _apiService = apiService;
        _localStorage = localStorage;
        _authStateProvider = authStateProvider;
        _httpClient = httpClient;
    }

    public async Task<AuthenticationResponse> LoginAsync(LoginModel loginModel)
    {
        var response = await _apiService.PostAsync<ApiResponse<AuthenticationResponse>>("api/auth/login", loginModel);
        
        if (response?.Success == true && response.Data != null)
        {
            // Token'ları local storage'a kaydet
            await _localStorage.SetItemAsync("authToken", response.Data.AccessToken);
            await _localStorage.SetItemAsync("refreshToken", response.Data.RefreshToken);
            await _localStorage.SetItemAsync("tokenExpiry", response.Data.AccessTokenExpiration);
            await _localStorage.SetItemAsync("userInfo", response.Data.User);

            // API Service'e token'ı set et
            _apiService.SetAuthToken(response.Data.AccessToken!);

            // Authentication state'i güncelle
            ((CustomAuthStateProvider)_authStateProvider).NotifyUserAuthentication(response.Data.AccessToken!);

            return response.Data;
        }

        return new AuthenticationResponse
        {
            Success = false,
            Errors = response?.Errors ?? new List<string> { "Login failed" }
        };
    }

    public async Task<AuthenticationResponse> RegisterAsync(RegisterModel registerModel)
    {
        var response = await _apiService.PostAsync<ApiResponse<AuthenticationResponse>>("api/auth/register", registerModel);
        
        if (response?.Success == true && response.Data != null)
        {
            // Kayıt başarılıysa otomatik login yap
            await _localStorage.SetItemAsync("authToken", response.Data.AccessToken);
            await _localStorage.SetItemAsync("refreshToken", response.Data.RefreshToken);
            await _localStorage.SetItemAsync("tokenExpiry", response.Data.AccessTokenExpiration);
            await _localStorage.SetItemAsync("userInfo", response.Data.User);

            _apiService.SetAuthToken(response.Data.AccessToken!);
            ((CustomAuthStateProvider)_authStateProvider).NotifyUserAuthentication(response.Data.AccessToken!);

            return response.Data;
        }

        return new AuthenticationResponse
        {
            Success = false,
            Errors = response?.Errors ?? new List<string> { "Registration failed" }
        };
    }

    public async Task LogoutAsync()
    {
        // API'ye logout isteği gönder
        await _apiService.PostAsync<object>("api/auth/logout", new { });

        // Local storage'ı temizle
        await _localStorage.RemoveItemAsync("authToken");
        await _localStorage.RemoveItemAsync("refreshToken");
        await _localStorage.RemoveItemAsync("tokenExpiry");
        await _localStorage.RemoveItemAsync("userInfo");

        // API Service'ten token'ı kaldır
        _apiService.ClearAuthToken();

        // Authentication state'i güncelle
        ((CustomAuthStateProvider)_authStateProvider).NotifyUserLogout();
    }

    public async Task<UserInfo?> GetCurrentUserAsync()
    {
        return await _localStorage.GetItemAsync<UserInfo>("userInfo");
    }

    public async Task<string?> GetTokenAsync()
    {
        return await _localStorage.GetItemAsync<string>("authToken");
    }

    public async Task<bool> RefreshTokenAsync()
    {
        var accessToken = await _localStorage.GetItemAsync<string>("authToken");
        var refreshToken = await _localStorage.GetItemAsync<string>("refreshToken");

        if (string.IsNullOrEmpty(accessToken) || string.IsNullOrEmpty(refreshToken))
            return false;

        var refreshRequest = new
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken
        };

        var response = await _apiService.PostAsync<ApiResponse<AuthenticationResponse>>("api/auth/refresh-token", refreshRequest);
        
        if (response?.Success == true && response.Data != null)
        {
            // Yeni token'ları kaydet
            await _localStorage.SetItemAsync("authToken", response.Data.AccessToken);
            await _localStorage.SetItemAsync("refreshToken", response.Data.RefreshToken);
            await _localStorage.SetItemAsync("tokenExpiry", response.Data.AccessTokenExpiration);

            _apiService.SetAuthToken(response.Data.AccessToken!);
            ((CustomAuthStateProvider)_authStateProvider).NotifyUserAuthentication(response.Data.AccessToken!);

            return true;
        }

        return false;
    }
}