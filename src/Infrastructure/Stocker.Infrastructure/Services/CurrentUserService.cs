using Microsoft.AspNetCore.Http;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.MultiTenancy;
using System.Security.Claims;

namespace Stocker.Infrastructure.Services;

public class CurrentUserService : SharedKernel.Interfaces.ICurrentUserService, Application.Common.Interfaces.ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly ITenantService _tenantService;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor, ITenantService tenantService)
    {
        _httpContextAccessor = httpContextAccessor;
        _tenantService = tenantService;
    }

    // For SharedKernel.Interfaces.ICurrentUserService
    public Guid? UserId
    {
        get
        {
            var userIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value
                           ?? _httpContextAccessor.HttpContext?.User?.FindFirst("sub")?.Value
                           ?? _httpContextAccessor.HttpContext?.User?.FindFirst("UserId")?.Value;

            return Guid.TryParse(userIdClaim, out var userId) ? userId : null;
        }
    }
    
    // For Application.Common.Interfaces.ICurrentUserService  
    string? Application.Common.Interfaces.ICurrentUserService.UserId => UserId?.ToString();
    
    string? Application.Common.Interfaces.ICurrentUserService.TenantId => TenantId?.ToString();

    public string? UserName => 
        _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.Name)?.Value
        ?? _httpContextAccessor.HttpContext?.User?.FindFirst("UserName")?.Value;

    public string? Email => 
        _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.Email)?.Value
        ?? _httpContextAccessor.HttpContext?.User?.FindFirst("Email")?.Value;

    public Guid? TenantId
    {
        get
        {
            // First try to get from TenantService (set by TenantResolutionMiddleware)
            var tenantId = _tenantService.GetCurrentTenant();
            if (tenantId.HasValue)
                return tenantId;

            // Fallback to claims (for backward compatibility)
            var tenantIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirst("TenantId")?.Value
                             ?? _httpContextAccessor.HttpContext?.User?.FindFirst("tenant_id")?.Value;

            return Guid.TryParse(tenantIdClaim, out var tid) ? tid : null;
        }
    }

    public bool IsAuthenticated => 
        _httpContextAccessor.HttpContext?.User?.Identity?.IsAuthenticated ?? false;

    public bool IsSuperAdmin => 
        _httpContextAccessor.HttpContext?.User?.FindFirst("IsSuperAdmin")?.Value?.ToLower() == "true"
        || _httpContextAccessor.HttpContext?.User?.IsInRole("SystemAdmin") == true;

    public string? Role => 
        _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.Role)?.Value
        ?? _httpContextAccessor.HttpContext?.User?.FindFirst("role")?.Value;

    public IEnumerable<string> Permissions
    {
        get
        {
            var permissions = _httpContextAccessor.HttpContext?.User?.FindAll("permission")
                .Select(c => c.Value)
                .ToList();

            return permissions ?? Enumerable.Empty<string>();
        }
    }
    
    // For Application.Common.Interfaces.ICurrentUserService
    public bool IsMasterAdmin => IsSuperAdmin;
    
    public string[]? Roles => _httpContextAccessor.HttpContext?.User?.FindAll(ClaimTypes.Role)
        .Select(c => c.Value)
        .ToArray();
    
    public Dictionary<string, string>? Claims => _httpContextAccessor.HttpContext?.User?.Claims
        .ToDictionary(c => c.Type, c => c.Value);
}