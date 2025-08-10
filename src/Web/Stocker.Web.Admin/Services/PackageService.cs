using System.Text.Json;

namespace Stocker.Web.Admin.Services;

public interface IPackageService
{
    Task<PackagesResponse?> GetPackagesAsync();
    Task<PackageDto?> GetPackageByIdAsync(Guid id);
    Task<PackageDto?> CreatePackageAsync(CreatePackageRequest request);
    Task<bool> UpdatePackageAsync(Guid id, UpdatePackageRequest request);
    Task<bool> DeletePackageAsync(Guid id);
}

public class PackageService : IPackageService
{
    private readonly IApiService _apiService;
    private readonly ILogger<PackageService> _logger;

    public PackageService(IApiService apiService, ILogger<PackageService> logger)
    {
        _apiService = apiService;
        _logger = logger;
    }

    public async Task<PackagesResponse?> GetPackagesAsync()
    {
        try
        {
            var response = await _apiService.GetAsync<ApiResponse<List<PackageDto>>>("/api/master/packages");
            if (response?.Success == true && response.Data != null)
            {
                return new PackagesResponse
                {
                    Packages = response.Data,
                    TotalCount = response.Data.Count
                };
            }
            return null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting packages");
            return null;
        }
    }

    public async Task<PackageDto?> GetPackageByIdAsync(Guid id)
    {
        try
        {
            var response = await _apiService.GetAsync<ApiResponse<PackageDto>>($"/api/master/packages/{id}");
            return response?.Success == true ? response.Data : null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting package {PackageId}", id);
            return null;
        }
    }

    public async Task<PackageDto?> CreatePackageAsync(CreatePackageRequest request)
    {
        try
        {
            var response = await _apiService.PostAsync<ApiResponse<PackageDto>>("/api/master/packages", request);
            return response?.Success == true ? response.Data : null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating package");
            return null;
        }
    }

    public async Task<bool> UpdatePackageAsync(Guid id, UpdatePackageRequest request)
    {
        try
        {
            var response = await _apiService.PutAsync<ApiResponse<bool>>($"/api/master/packages/{id}", request);
            return response?.Success == true && response.Data;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating package {PackageId}", id);
            return false;
        }
    }

    public async Task<bool> DeletePackageAsync(Guid id)
    {
        try
        {
            var response = await _apiService.DeleteAsync<ApiResponse<bool>>($"/api/master/packages/{id}");
            return response?.Success == true && response.Data;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting package {PackageId}", id);
            return false;
        }
    }
}

// DTOs
public class PackagesResponse
{
    public List<PackageDto> Packages { get; set; } = new();
    public int TotalCount { get; set; }
}

public class PackageDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal BasePrice { get; set; }
    public string BillingCycle { get; set; } = "Monthly";
    public int MaxUsers { get; set; }
    public int MaxStorage { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<PackageFeatureDto> Features { get; set; } = new();
    public List<PackageModuleDto> Modules { get; set; } = new();
}

public class PackageFeatureDto
{
    public string FeatureCode { get; set; } = string.Empty;
    public string FeatureName { get; set; } = string.Empty;
    public bool IsEnabled { get; set; }
}

public class PackageModuleDto
{
    public string ModuleCode { get; set; } = string.Empty;
    public string ModuleName { get; set; } = string.Empty;
    public bool IsIncluded { get; set; }
}

public class CreatePackageRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal BasePrice { get; set; }
    public string BillingCycle { get; set; } = "Monthly";
    public int MaxUsers { get; set; } = 10;
    public int MaxStorage { get; set; } = 100;
    public bool IsActive { get; set; } = true;
    public List<PackageFeatureDto>? Features { get; set; }
    public List<PackageModuleDto>? Modules { get; set; }
}

public class UpdatePackageRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal BasePrice { get; set; }
    public string BillingCycle { get; set; } = "Monthly";
    public int MaxUsers { get; set; }
    public int MaxStorage { get; set; }
    public bool IsActive { get; set; }
}