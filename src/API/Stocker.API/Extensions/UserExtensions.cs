using System.Security.Claims;

namespace Stocker.API.Extensions;

public static class UserExtensions
{
    public static Guid? GetTenantId(this ClaimsPrincipal user)
    {
        var tenantIdClaim = user.FindFirst("TenantId")?.Value;
        if (Guid.TryParse(tenantIdClaim, out var tenantId))
        {
            return tenantId;
        }
        return null;
    }
    
    public static Guid? GetUserId(this ClaimsPrincipal user)
    {
        var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (Guid.TryParse(userIdClaim, out var userId))
        {
            return userId;
        }
        return null;
    }
    
    public static string? GetEmail(this ClaimsPrincipal user)
    {
        return user.FindFirst(ClaimTypes.Email)?.Value;
    }
    
    public static string? GetRole(this ClaimsPrincipal user)
    {
        return user.FindFirst(ClaimTypes.Role)?.Value;
    }
}