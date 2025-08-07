using Microsoft.AspNetCore.Http;
using Stocker.SharedKernel.Interfaces;
using System.Security.Claims;

namespace Stocker.Infrastructure.Services;

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

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
            var tenantIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirst("TenantId")?.Value
                             ?? _httpContextAccessor.HttpContext?.User?.FindFirst("tenant_id")?.Value;

            return Guid.TryParse(tenantIdClaim, out var tenantId) ? tenantId : null;
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
}