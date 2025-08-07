using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Blazored.LocalStorage;

namespace Stocker.Web.Portal.Services;

public interface IApiService
{
    Task<T?> GetAsync<T>(string endpoint);
    Task<T?> PostAsync<T>(string endpoint, object data);
    Task<T?> PutAsync<T>(string endpoint, object data);
    Task<bool> DeleteAsync(string endpoint);
    void SetAuthToken(string token);
    void ClearAuthToken();
}

public class ApiService : IApiService
{
    private readonly HttpClient _httpClient;
    private readonly ILocalStorageService _localStorage;
    private readonly IConfiguration _configuration;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly ILogger<ApiService> _logger;
    private readonly JsonSerializerOptions _jsonOptions;

    public ApiService(
        HttpClient httpClient, 
        ILocalStorageService localStorage, 
        IConfiguration configuration, 
        IHttpContextAccessor httpContextAccessor,
        ILogger<ApiService> logger)
    {
        _httpClient = httpClient;
        _localStorage = localStorage;
        _configuration = configuration;
        _httpContextAccessor = httpContextAccessor;
        _logger = logger;
        
        _jsonOptions = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };

        _httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        
        // Set tenant header from subdomain
        SetTenantHeader();
    }
    
    private void SetTenantHeader()
    {
        try
        {
            var host = _httpContextAccessor.HttpContext?.Request.Host.Host;
            if (!string.IsNullOrEmpty(host))
            {
                var subdomain = ExtractSubdomain(host);
                if (!string.IsNullOrEmpty(subdomain))
                {
                    _httpClient.DefaultRequestHeaders.Remove("X-Tenant-Code");
                    _httpClient.DefaultRequestHeaders.Add("X-Tenant-Code", subdomain);
                    _logger.LogDebug("Tenant header set: {TenantCode}", subdomain);
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Could not set tenant header");
        }
    }
    
    private string? ExtractSubdomain(string host)
    {
        // Skip if localhost or IP
        if (host.StartsWith("localhost", StringComparison.OrdinalIgnoreCase) || 
            host.StartsWith("127.0.0.1") ||
            host.StartsWith("[::1]"))
        {
            return null;
        }

        var parts = host.Split('.');
        if (parts.Length >= 3)
        {
            var subdomain = parts[0];
            
            // Skip reserved subdomains
            if (subdomain == "www" || subdomain == "api" || subdomain == "admin")
                return null;

            _logger.LogDebug("Extracted subdomain: {Subdomain} from host: {Host}", subdomain, host);
            return subdomain.ToLower();
        }

        return null;
    }

    public void SetAuthToken(string token)
    {
        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
    }

    public void ClearAuthToken()
    {
        _httpClient.DefaultRequestHeaders.Authorization = null;
    }

    public async Task<T?> GetAsync<T>(string endpoint)
    {
        try
        {
            SetTenantHeader(); // Refresh tenant header on each request
            
            var response = await _httpClient.GetAsync(endpoint);
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                return JsonSerializer.Deserialize<T>(content, _jsonOptions);
            }
            
            _logger.LogWarning("GET request failed: {StatusCode} - {Endpoint}", response.StatusCode, endpoint);
            return default;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during GET request to {Endpoint}", endpoint);
            return default;
        }
    }

    public async Task<T?> PostAsync<T>(string endpoint, object data)
    {
        try
        {
            SetTenantHeader(); // Refresh tenant header on each request
            
            var json = JsonSerializer.Serialize(data, _jsonOptions);
            var content = new StringContent(json, Encoding.UTF8, "application/json");
            
            var response = await _httpClient.PostAsync(endpoint, content);
            if (response.IsSuccessStatusCode)
            {
                var responseContent = await response.Content.ReadAsStringAsync();
                return JsonSerializer.Deserialize<T>(responseContent, _jsonOptions);
            }
            
            _logger.LogWarning("POST request failed: {StatusCode} - {Endpoint}", response.StatusCode, endpoint);
            return default;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during POST request to {Endpoint}", endpoint);
            return default;
        }
    }

    public async Task<T?> PutAsync<T>(string endpoint, object data)
    {
        try
        {
            SetTenantHeader(); // Refresh tenant header on each request
            
            var json = JsonSerializer.Serialize(data, _jsonOptions);
            var content = new StringContent(json, Encoding.UTF8, "application/json");
            
            var response = await _httpClient.PutAsync(endpoint, content);
            if (response.IsSuccessStatusCode)
            {
                var responseContent = await response.Content.ReadAsStringAsync();
                return JsonSerializer.Deserialize<T>(responseContent, _jsonOptions);
            }
            
            _logger.LogWarning("PUT request failed: {StatusCode} - {Endpoint}", response.StatusCode, endpoint);
            return default;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during PUT request to {Endpoint}", endpoint);
            return default;
        }
    }

    public async Task<bool> DeleteAsync(string endpoint)
    {
        try
        {
            SetTenantHeader(); // Refresh tenant header on each request
            
            var response = await _httpClient.DeleteAsync(endpoint);
            if (response.IsSuccessStatusCode)
            {
                return true;
            }
            
            _logger.LogWarning("DELETE request failed: {StatusCode} - {Endpoint}", response.StatusCode, endpoint);
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during DELETE request to {Endpoint}", endpoint);
            return false;
        }
    }
}