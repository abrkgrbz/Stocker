namespace Stocker.Web.Admin.Services;

public interface ISubscriptionService
{
    Task<SubscriptionsResponse?> GetSubscriptionsAsync(Guid? tenantId = null, string? status = null, bool? autoRenew = null);
    Task<SubscriptionDto?> GetSubscriptionByIdAsync(Guid id);
    Task<SubscriptionDto?> CreateSubscriptionAsync(CreateSubscriptionRequest request);
    Task<bool> UpdateSubscriptionAsync(Guid id, UpdateSubscriptionRequest request);
    Task<bool> CancelSubscriptionAsync(Guid id, string reason);
}

public class SubscriptionService : ISubscriptionService
{
    private readonly IApiService _apiService;
    private readonly ILogger<SubscriptionService> _logger;

    public SubscriptionService(IApiService apiService, ILogger<SubscriptionService> logger)
    {
        _apiService = apiService;
        _logger = logger;
    }

    public async Task<SubscriptionsResponse?> GetSubscriptionsAsync(Guid? tenantId = null, string? status = null, bool? autoRenew = null)
    {
        try
        {
            var queryParams = new List<string>();
            if (tenantId.HasValue)
                queryParams.Add($"tenantId={tenantId}");
            if (!string.IsNullOrEmpty(status))
                queryParams.Add($"status={status}");
            if (autoRenew.HasValue)
                queryParams.Add($"autoRenew={autoRenew}");

            var query = queryParams.Any() ? "?" + string.Join("&", queryParams) : "";
            
            var response = await _apiService.GetAsync<ApiResponse<List<SubscriptionDto>>>($"/api/master/subscriptions{query}");
            if (response?.Success == true && response.Data != null)
            {
                return new SubscriptionsResponse
                {
                    Subscriptions = response.Data,
                    TotalCount = response.Data.Count
                };
            }
            return null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting subscriptions");
            return null;
        }
    }

    public async Task<SubscriptionDto?> GetSubscriptionByIdAsync(Guid id)
    {
        try
        {
            var response = await _apiService.GetAsync<ApiResponse<SubscriptionDto>>($"/api/master/subscriptions/{id}");
            return response?.Success == true ? response.Data : null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting subscription {SubscriptionId}", id);
            return null;
        }
    }

    public async Task<SubscriptionDto?> CreateSubscriptionAsync(CreateSubscriptionRequest request)
    {
        try
        {
            var response = await _apiService.PostAsync<ApiResponse<SubscriptionDto>>("/api/master/subscriptions", request);
            return response?.Success == true ? response.Data : null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating subscription");
            return null;
        }
    }

    public async Task<bool> UpdateSubscriptionAsync(Guid id, UpdateSubscriptionRequest request)
    {
        try
        {
            var response = await _apiService.PutAsync<ApiResponse<bool>>($"/api/master/subscriptions/{id}", request);
            return response?.Success == true && response.Data;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating subscription {SubscriptionId}", id);
            return false;
        }
    }

    public async Task<bool> CancelSubscriptionAsync(Guid id, string reason)
    {
        try
        {
            var request = new { reason };
            var response = await _apiService.PostAsync<ApiResponse<bool>>($"/api/master/subscriptions/{id}/cancel", request);
            return response?.Success == true && response.Data;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error cancelling subscription {SubscriptionId}", id);
            return false;
        }
    }
}

// DTOs
public class SubscriptionsResponse
{
    public List<SubscriptionDto> Subscriptions { get; set; } = new();
    public int TotalCount { get; set; }
}

public class SubscriptionDto
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid PackageId { get; set; }
    public string SubscriptionNumber { get; set; } = string.Empty;
    public string TenantName { get; set; } = string.Empty;
    public string PackageName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string BillingCycle { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string Currency { get; set; } = "TRY";
    public DateTime StartDate { get; set; }
    public DateTime CurrentPeriodStart { get; set; }
    public DateTime CurrentPeriodEnd { get; set; }
    public DateTime? TrialEndDate { get; set; }
    public DateTime? CancelledAt { get; set; }
    public string? CancellationReason { get; set; }
    public bool AutoRenew { get; set; }
    public int UserCount { get; set; }
    public List<SubscriptionModuleDto> Modules { get; set; } = new();
}

public class SubscriptionModuleDto
{
    public Guid Id { get; set; }
    public string ModuleCode { get; set; } = string.Empty;
    public string ModuleName { get; set; } = string.Empty;
    public int? MaxEntities { get; set; }
    public bool IsActive { get; set; }
}

public class CreateSubscriptionRequest
{
    public Guid TenantId { get; set; }
    public Guid PackageId { get; set; }
    public int BillingCycle { get; set; } = 0; // 0 = Monthly
    public decimal? CustomPrice { get; set; }
    public string Currency { get; set; } = "TRY";
    public DateTime? StartDate { get; set; }
    public int? TrialDays { get; set; }
    public bool AutoRenew { get; set; } = true;
    public int UserCount { get; set; } = 1;
}

public class UpdateSubscriptionRequest
{
    public int? BillingCycle { get; set; }
    public decimal? Price { get; set; }
    public string? Currency { get; set; }
    public bool? AutoRenew { get; set; }
    public int? UserCount { get; set; }
}