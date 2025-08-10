using Stocker.Web.Admin.Models;

namespace Stocker.Web.Admin.Services;

public interface ITenantService
{
    Task<List<TenantDto>> GetAllTenantsAsync();
    Task<TenantDto?> GetTenantByIdAsync(Guid id);
    Task<TenantDto?> CreateTenantAsync(CreateTenantRequest request);
    Task<TenantDto?> UpdateTenantAsync(UpdateTenantRequest request);
    Task<bool> DeleteTenantAsync(Guid id);
    Task<bool> ActivateTenantAsync(Guid id);
    Task<bool> DeactivateTenantAsync(Guid id);
    Task<TenantListResponse?> GetTenantsAsync();
}

public class TenantService : ITenantService
{
    private readonly IApiService _apiService;
    private readonly ILogger<TenantService> _logger;

    public TenantService(IApiService apiService, ILogger<TenantService> logger)
    {
        _apiService = apiService;
        _logger = logger;
    }

    public async Task<List<TenantDto>> GetAllTenantsAsync()
    {
        try
        {
            var response = await _apiService.GetAsync<ApiResponse<List<TenantDto>>>("api/master/Tenants");
            return response?.Data ?? new List<TenantDto>();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting tenants");
            return new List<TenantDto>();
        }
    }

    public async Task<TenantDto?> GetTenantByIdAsync(Guid id)
    {
        try
        {
            var response = await _apiService.GetAsync<ApiResponse<TenantDto>>($"api/master/Tenants/{id}");
            return response?.Data;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting tenant {TenantId}", id);
            return null;
        }
    }

    public async Task<TenantDto?> CreateTenantAsync(CreateTenantRequest request)
    {
        try
        {
            var response = await _apiService.PostAsync<CreateTenantRequest, ApiResponse<TenantDto>>("api/master/Tenants", request);
            return response?.Data;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating tenant");
            return null;
        }
    }

    public async Task<TenantDto?> UpdateTenantAsync(UpdateTenantRequest request)
    {
        try
        {
            var response = await _apiService.PutAsync<UpdateTenantRequest, ApiResponse<TenantDto>>($"api/master/Tenants/{request.Id}", request);
            return response?.Data;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating tenant {TenantId}", request.Id);
            return null;
        }
    }

    public async Task<bool> DeleteTenantAsync(Guid id)
    {
        try
        {
            return await _apiService.DeleteAsync($"api//master/Tenants/{id}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting tenant {TenantId}", id);
            return false;
        }
    }

    public async Task<bool> ActivateTenantAsync(Guid id)
    {
        try
        {
            var result = await _apiService.PostAsync<object, object>($"api/master/Tenants/{id}/activate", new { });
            return result != null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error activating tenant {TenantId}", id);
            return false;
        }
    }

    public async Task<bool> DeactivateTenantAsync(Guid id)
    {
        try
        {
            var result = await _apiService.PostAsync<object, object>($"api/master/Tenants/{id}/deactivate", new { });
            return result != null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deactivating tenant {TenantId}", id);
            return false;
        }
    }

    public async Task<TenantListResponse?> GetTenantsAsync()
    {
        try
        {
            var response = await _apiService.GetAsync<ApiResponse<List<TenantListDto>>>("api/master/Tenants");
            if (response?.Success == true && response.Data != null)
            {
                return new TenantListResponse
                {
                    Tenants = response.Data
                };
            }
            return null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting tenants");
            return null;
        }
    }
}

// Additional DTOs
public class TenantListResponse
{
    public List<TenantListDto> Tenants { get; set; } = new();
}

public class TenantListDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string ContactName { get; set; } = string.Empty;
    public string ContactEmail { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}