using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Domain.Master.Entities;
using Stocker.Application.Common.Interfaces;
using Stocker.Domain.Master.Enums;
using Stocker.Domain.Tenant.Entities;
using Stocker.Identity.Models;
using System.Security.Claims;

namespace Stocker.Identity.Services;

/// <summary>
/// Service responsible for generating authentication tokens and results
/// </summary>
public class TokenGenerationService : ITokenGenerationService
{
    private readonly IJwtTokenService _jwtTokenService;
    private readonly IMasterDbContext _masterContext;
    private readonly ITenantDbContextFactory _tenantDbContextFactory;
    private readonly ILogger<TokenGenerationService> _logger;

    public TokenGenerationService(
        IJwtTokenService jwtTokenService,
        IMasterDbContext masterContext,
        ITenantDbContextFactory tenantDbContextFactory,
        ILogger<TokenGenerationService> logger)
    {
        _jwtTokenService = jwtTokenService;
        _masterContext = masterContext;
        _tenantDbContextFactory = tenantDbContextFactory;
        _logger = logger;
    }

    public async Task<AuthenticationResult> GenerateForMasterUserAsync(MasterUser user, Guid? tenantId = null)
    {
        var claims = await BuildMasterUserClaimsAsync(user, tenantId);
        
        var accessToken = _jwtTokenService.GenerateAccessToken(claims);
        var refreshToken = _jwtTokenService.GenerateRefreshToken();

        // Save refresh token
        user.SetRefreshToken(refreshToken, _jwtTokenService.GetRefreshTokenExpiration());
        await _masterContext.SaveChangesAsync();

        var tenantInfo = await GetTenantInfoAsync(tenantId);

        return new AuthenticationResult
        {
            Success = true,
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            AccessTokenExpiration = _jwtTokenService.GetAccessTokenExpiration(),
            RefreshTokenExpiration = _jwtTokenService.GetRefreshTokenExpiration(),
            User = new UserInfo
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email.Value,
                FullName = user.GetFullName(),
                TenantId = tenantId,
                TenantName = tenantInfo.Name,
                TenantCode = tenantInfo.Code,
                IsMasterUser = true,
                Roles = GetRolesForUserType(user.UserType)
            }
        };
    }

    public async Task<AuthenticationResult> GenerateForTenantUserAsync(TenantUser tenantUser, MasterUser? masterUser)
    {
        var (claims, roleNames, permissions) = await BuildTenantUserClaimsAsync(tenantUser, masterUser);

        var accessToken = _jwtTokenService.GenerateAccessToken(claims);
        var refreshToken = _jwtTokenService.GenerateRefreshToken();

        // Save refresh token on master user (only if exists)
        // Invited users (MasterUserId = Guid.Empty) don't have a master user record
        if (masterUser != null)
        {
            masterUser.SetRefreshToken(refreshToken, _jwtTokenService.GetRefreshTokenExpiration());
            await _masterContext.SaveChangesAsync();
        }
        // For invited users without MasterUser, refresh token is not persisted
        // They will need to re-login when access token expires

        var tenantInfo = await GetTenantInfoAsync(tenantUser.TenantId);

        // Use tenantUser.Id for invited users (no MasterUser), masterUser.Id otherwise
        var userId = masterUser?.Id ?? tenantUser.Id;

        return new AuthenticationResult
        {
            Success = true,
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            AccessTokenExpiration = _jwtTokenService.GetAccessTokenExpiration(),
            RefreshTokenExpiration = _jwtTokenService.GetRefreshTokenExpiration(),
            User = new UserInfo
            {
                Id = userId,
                Username = tenantUser.Username,
                Email = tenantUser.Email.Value,
                FullName = tenantUser.GetFullName(),
                TenantId = tenantUser.TenantId,
                TenantName = tenantInfo.Name,
                TenantCode = tenantInfo.Code,
                IsMasterUser = false,
                Roles = roleNames,
                Permissions = permissions
            }
        };
    }

    private async Task<List<Claim>> BuildMasterUserClaimsAsync(MasterUser user, Guid? tenantId)
    {
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(ClaimTypes.Email, user.Email.Value),
            new Claim("IsMasterUser", "true")
        };

        // Add role claims based on UserType
        // Include both Turkish and English role names for compatibility
        switch (user.UserType)
        {
            case Domain.Master.Enums.UserType.SistemYoneticisi:
                claims.Add(new Claim(ClaimTypes.Role, "SistemYoneticisi"));
                claims.Add(new Claim(ClaimTypes.Role, "SuperAdmin")); // English alias for CMS
                claims.Add(new Claim("IsSuperAdmin", "true"));
                break;
            case Domain.Master.Enums.UserType.FirmaYoneticisi:
                claims.Add(new Claim(ClaimTypes.Role, "FirmaYoneticisi"));
                claims.Add(new Claim(ClaimTypes.Role, "Admin")); // English alias for CMS
                break;
            case Domain.Master.Enums.UserType.Destek:
                claims.Add(new Claim(ClaimTypes.Role, "Destek"));
                claims.Add(new Claim(ClaimTypes.Role, "Support")); // English alias
                break;
            case Domain.Master.Enums.UserType.Personel:
                claims.Add(new Claim(ClaimTypes.Role, "Personel"));
                claims.Add(new Claim(ClaimTypes.Role, "Staff")); // English alias
                break;
            case Domain.Master.Enums.UserType.Misafir:
                claims.Add(new Claim(ClaimTypes.Role, "Misafir"));
                claims.Add(new Claim(ClaimTypes.Role, "Guest")); // English alias
                break;
        }

        // Add tenant context if provided
        // UserTenants moved to Tenant domain - tenant validation should be done through Tenant context
        if (tenantId.HasValue)
        {
            claims.Add(new Claim("TenantId", tenantId.Value.ToString()));
            
            var tenant = await _masterContext.Tenants.FindAsync(tenantId.Value);
            if (tenant != null)
            {
                claims.Add(new Claim("TenantName", tenant.Name));
            }
        }

        return claims;
    }

    private async Task<(List<Claim> Claims, List<string> RoleNames, List<string> Permissions)> BuildTenantUserClaimsAsync(TenantUser tenantUser, MasterUser? masterUser)
    {
        // For invited users without MasterUser, use tenantUser.Id as the identifier
        var userId = masterUser?.Id ?? tenantUser.Id;

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
            new Claim(ClaimTypes.Name, tenantUser.Username),
            new Claim(ClaimTypes.Email, tenantUser.Email.Value),
            new Claim("TenantId", tenantUser.TenantId.ToString()),
            new Claim("TenantUserId", tenantUser.Id.ToString()),
            new Claim("IsMasterUser", "false"),
            new Claim("IsInvitedUser", (masterUser == null).ToString().ToLower())
        };

        // Add tenant name
        var tenant = await _masterContext.Tenants.FindAsync(tenantUser.TenantId);
        if (tenant != null)
        {
            claims.Add(new Claim("TenantName", tenant.Name));
        }

        // Collect role IDs from navigation property
        var userRoleIds = tenantUser.UserRoles.Select(ur => ur.RoleId).ToList();
        var roleNames = new List<string>();
        var allPermissions = new List<string>();

        // Add role claims - use role names instead of IDs
        try
        {
            await using var tenantContext = await _tenantDbContextFactory.CreateDbContextAsync(tenantUser.TenantId);

            // Get role names for the user's roles
            roleNames = await tenantContext.Roles
                .Where(r => userRoleIds.Contains(r.Id))
                .Select(r => r.Name)
                .ToListAsync();

            foreach (var roleName in roleNames)
            {
                claims.Add(new Claim(ClaimTypes.Role, roleName));
            }

            // If no roles found, add default "User" role
            if (!roleNames.Any())
            {
                claims.Add(new Claim(ClaimTypes.Role, "User"));
                roleNames.Add("User");
            }

            // Get user permissions (both direct user permissions AND role-based permissions)
            // Direct user permissions
            var userPermissions = await tenantContext.UserPermissions
                .Where(up => up.UserId == tenantUser.Id)
                .Select(up => $"{up.Resource}:{up.PermissionType}")
                .ToListAsync();

            // Role-based permissions (from assigned roles)
            var rolePermissions = await tenantContext.RolePermissions
                .Where(rp => userRoleIds.Contains(rp.RoleId))
                .Select(rp => $"{rp.Resource}:{rp.PermissionType}")
                .ToListAsync();

            // Combine and deduplicate permissions
            allPermissions = userPermissions
                .Union(rolePermissions)
                .Distinct()
                .ToList();

            // Add permission claims
            foreach (var permission in allPermissions)
            {
                claims.Add(new Claim("Permission", permission));
            }

            _logger.LogDebug(
                "Built claims for TenantUser {UserId}: {RoleCount} roles, {PermissionCount} permissions",
                tenantUser.Id,
                roleNames.Count,
                allPermissions.Count);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Could not load roles/permissions for TenantUser {UserId}", tenantUser.Id);

            // Fallback: Add role IDs if we can't get names
            foreach (var userRole in tenantUser.UserRoles)
            {
                claims.Add(new Claim(ClaimTypes.Role, userRole.RoleId.ToString()));
                roleNames.Add(userRole.RoleId.ToString());
            }
        }

        return (claims, roleNames, allPermissions);
    }

    private List<string> GetRolesForUserType(Domain.Master.Enums.UserType userType)
    {
        // Include both Turkish and English role names for compatibility
        return userType switch
        {
            Domain.Master.Enums.UserType.SistemYoneticisi => new List<string> { "SistemYoneticisi", "SuperAdmin" },
            Domain.Master.Enums.UserType.FirmaYoneticisi => new List<string> { "FirmaYoneticisi", "Admin" },
            Domain.Master.Enums.UserType.Destek => new List<string> { "Destek", "Support" },
            Domain.Master.Enums.UserType.Personel => new List<string> { "Personel", "Staff" },
            Domain.Master.Enums.UserType.Misafir => new List<string> { "Misafir", "Guest" },
            _ => new List<string>()
        };
    }

    private async Task<(string? Name, string? Code)> GetTenantInfoAsync(Guid? tenantId)
    {
        if (!tenantId.HasValue) return (null, null);

        var tenant = await _masterContext.Tenants.FindAsync(tenantId.Value);
        return (tenant?.Name, tenant?.Code);
    }

}

public interface ITokenGenerationService
{
    Task<AuthenticationResult> GenerateForMasterUserAsync(MasterUser user, Guid? tenantId = null);
    /// <summary>
    /// Generates authentication tokens for a tenant user.
    /// </summary>
    /// <param name="tenantUser">The tenant user to generate tokens for</param>
    /// <param name="masterUser">The associated master user. Can be null for invited users without MasterUser association.</param>
    Task<AuthenticationResult> GenerateForTenantUserAsync(TenantUser tenantUser, MasterUser? masterUser);
}
