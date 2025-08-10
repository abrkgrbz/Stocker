using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Components.Server.ProtectedBrowserStorage;

namespace Stocker.Web.Admin.Services;

public interface IApiService
{
    Task<T?> GetAsync<T>(string endpoint);
    Task<TResponse?> PostAsync<TRequest, TResponse>(string endpoint, TRequest data);
    Task<T?> PostAsync<T>(string endpoint, object data);
    Task<TResponse?> PutAsync<TRequest, TResponse>(string endpoint, TRequest data);
    Task<T?> PutAsync<T>(string endpoint, object data);
    Task<bool> DeleteAsync(string endpoint);
    Task<T?> DeleteAsync<T>(string endpoint);
    void SetAuthToken(string token);
    Task InitializeAsync();
}

public class ApiService : IApiService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly ILogger<ApiService> _logger;
    private readonly ProtectedLocalStorage _localStorage;
    private readonly JsonSerializerOptions _jsonOptions;

    public ApiService(HttpClient httpClient, IConfiguration configuration, ILogger<ApiService> logger, ProtectedLocalStorage localStorage)
    {
        _httpClient = httpClient;
        _configuration = configuration;
        _logger = logger;
        _localStorage = localStorage;
        
        var apiBaseUrl = _configuration["ApiSettings:BaseUrl"] ?? "http://localhost:7021";
        _httpClient.BaseAddress = new Uri(apiBaseUrl);
        _httpClient.DefaultRequestHeaders.Accept.Clear();
        _httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        
        _jsonOptions = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };
    }

    public void SetAuthToken(string token)
    {
        _httpClient.DefaultRequestHeaders.Authorization = 
            new AuthenticationHeaderValue("Bearer", token);
    }

    public async Task<T?> GetAsync<T>(string endpoint)
    {
        try
        {
            await EnsureAuthTokenAsync();
            var response = await _httpClient.GetAsync(endpoint);
            
            if (response.IsSuccessStatusCode)
            {
                var json = await response.Content.ReadAsStringAsync();
                return JsonSerializer.Deserialize<T>(json, _jsonOptions);
            }
            
            _logger.LogWarning("API GET request failed: {StatusCode} - {Endpoint}", 
                response.StatusCode, endpoint);
            return default;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calling GET {Endpoint}", endpoint);
            throw;
        }
    }

    public async Task<TResponse?> PostAsync<TRequest, TResponse>(string endpoint, TRequest data)
    {
        try
        {
            // Login endpoint'i hariç diğer tüm endpoint'ler için token gerekli
            if (!endpoint.Contains("/auth/login"))
            {
                await EnsureAuthTokenAsync();
            }
            
            var json = JsonSerializer.Serialize(data, _jsonOptions);
            var content = new StringContent(json, Encoding.UTF8, "application/json");
            
            var response = await _httpClient.PostAsync(endpoint, content);
            
            if (response.IsSuccessStatusCode)
            {
                var responseJson = await response.Content.ReadAsStringAsync();
                return JsonSerializer.Deserialize<TResponse>(responseJson, _jsonOptions);
            }
            
            _logger.LogWarning("API POST request failed: {StatusCode} - {Endpoint}", 
                response.StatusCode, endpoint);
            return default;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calling POST {Endpoint}", endpoint);
            throw;
        }
    }

    public async Task<T?> PostAsync<T>(string endpoint, object data)
    {
        try
        {
            await EnsureAuthTokenAsync();
            var json = JsonSerializer.Serialize(data, _jsonOptions);
            var content = new StringContent(json, Encoding.UTF8, "application/json");
            
            var response = await _httpClient.PostAsync(endpoint, content);
            
            if (response.IsSuccessStatusCode)
            {
                var responseJson = await response.Content.ReadAsStringAsync();
                return JsonSerializer.Deserialize<T>(responseJson, _jsonOptions);
            }
            
            _logger.LogWarning("API POST request failed: {StatusCode} - {Endpoint}", 
                response.StatusCode, endpoint);
            return default;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calling POST {Endpoint}", endpoint);
            throw;
        }
    }

    public async Task<TResponse?> PutAsync<TRequest, TResponse>(string endpoint, TRequest data)
    {
        try
        {
            await EnsureAuthTokenAsync();
            var json = JsonSerializer.Serialize(data, _jsonOptions);
            var content = new StringContent(json, Encoding.UTF8, "application/json");
            
            var response = await _httpClient.PutAsync(endpoint, content);
            
            if (response.IsSuccessStatusCode)
            {
                var responseJson = await response.Content.ReadAsStringAsync();
                return JsonSerializer.Deserialize<TResponse>(responseJson, _jsonOptions);
            }
            
            _logger.LogWarning("API PUT request failed: {StatusCode} - {Endpoint}", 
                response.StatusCode, endpoint);
            return default;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calling PUT {Endpoint}", endpoint);
            throw;
        }
    }

    public async Task<T?> PutAsync<T>(string endpoint, object data)
    {
        try
        {
            await EnsureAuthTokenAsync();
            var json = JsonSerializer.Serialize(data, _jsonOptions);
            var content = new StringContent(json, Encoding.UTF8, "application/json");
            
            var response = await _httpClient.PutAsync(endpoint, content);
            
            if (response.IsSuccessStatusCode)
            {
                var responseJson = await response.Content.ReadAsStringAsync();
                return JsonSerializer.Deserialize<T>(responseJson, _jsonOptions);
            }
            
            _logger.LogWarning("API PUT request failed: {StatusCode} - {Endpoint}", 
                response.StatusCode, endpoint);
            return default;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calling PUT {Endpoint}", endpoint);
            throw;
        }
    }

    public async Task<bool> DeleteAsync(string endpoint)
    {
        try
        {
            await EnsureAuthTokenAsync();
            var response = await _httpClient.DeleteAsync(endpoint);
            return response.IsSuccessStatusCode;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calling DELETE {Endpoint}", endpoint);
            return false;
        }
    }

    public async Task<T?> DeleteAsync<T>(string endpoint)
    {
        try
        {
            await EnsureAuthTokenAsync();
            var response = await _httpClient.DeleteAsync(endpoint);
            
            if (response.IsSuccessStatusCode)
            {
                var responseJson = await response.Content.ReadAsStringAsync();
                if (!string.IsNullOrWhiteSpace(responseJson))
                {
                    return JsonSerializer.Deserialize<T>(responseJson, _jsonOptions);
                }
                return default;
            }
            
            _logger.LogWarning("API DELETE request failed: {StatusCode} - {Endpoint}", 
                response.StatusCode, endpoint);
            return default;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calling DELETE {Endpoint}", endpoint);
            return default;
        }
    }

    public async Task InitializeAsync()
    {
        try
        {
            var tokenResult = await _localStorage.GetAsync<string>("accessToken");
            if (tokenResult.Success && !string.IsNullOrEmpty(tokenResult.Value))
            {
                SetAuthToken(tokenResult.Value);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error initializing API service");
        }
    }

    private async Task EnsureAuthTokenAsync()
    {
        if (_httpClient.DefaultRequestHeaders.Authorization == null)
        {
            try
            {
                var tokenResult = await _localStorage.GetAsync<string>("accessToken");
                if (tokenResult.Success && !string.IsNullOrEmpty(tokenResult.Value))
                {
                    SetAuthToken(tokenResult.Value);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error ensuring auth token");
            }
        }
    }
}