using Microsoft.EntityFrameworkCore;
using Stocker.Domain.Master.Entities;
using Stocker.Domain.Master.Enums;
using Stocker.Domain.Tenant.Entities;
using Stocker.Identity.Models;
using Stocker.Persistence.Contexts;
using System.Security.Claims;

namespace Stocker.Identity.Services;

/// <summary>
/// Service responsible for generating authentication tokens and results
/// </summary>
public class TokenGenerationService : ITokenGenerationService
{
    private readonly IJwtTokenService _jwtTokenService;
    private readonly MasterDbContext _masterContext;

    public TokenGenerationService(
        IJwtTokenService jwtTokenService,
        MasterDbContext masterContext)
    {
        _jwtTokenService = jwtTokenService;
        _masterContext = masterContext;
    }

    public async Task<AuthenticationResult> GenerateForMasterUserAsync(MasterUser user, Guid? tenantId = null)
    {
        var claims = await BuildMasterUserClaimsAsync(user, tenantId);
        
        var accessToken = _jwtTokenService.GenerateAccessToken(claims);
        var refreshToken = _jwtTokenService.GenerateRefreshToken();

        // Save refresh token
        user.SetRefreshToken(refreshToken, _jwtTokenService.GetRefreshTokenExpiration());
        await _masterContext.SaveChangesAsync();

        var tenantName = await GetTenantNameAsync(tenantId);

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
                TenantName = tenantName,
                IsMasterUser = true,
                Roles = GetRolesForUserType(user.UserType)
            }
        };
    }

    public async Task<AuthenticationResult> GenerateForTenantUserAsync(TenantUser tenantUser, MasterUser masterUser)
    {
        var claims = await BuildTenantUserClaimsAsync(tenantUser, masterUser);
        
        var accessToken = _jwtTokenService.GenerateAccessToken(claims);
        var refreshToken = _jwtTokenService.GenerateRefreshToken();

        // Save refresh token on master user
        masterUser.SetRefreshToken(refreshToken, _jwtTokenService.GetRefreshTokenExpiration());
        await _masterContext.SaveChangesAsync();

        var tenantName = await GetTenantNameAsync(tenantUser.TenantId);

        return new AuthenticationResult
        {
            Success = true,
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            AccessTokenExpiration = _jwtTokenService.GetAccessTokenExpiration(),
            RefreshTokenExpiration = _jwtTokenService.GetRefreshTokenExpiration(),
            User = new UserInfo
            {
                Id = masterUser.Id,
                Username = tenantUser.Username,
                Email = tenantUser.Email.Value,
                FullName = tenantUser.GetFullName(),
                TenantId = tenantUser.TenantId,
                TenantName = tenantName,
                IsMasterUser = false,
                Roles = tenantUser.UserRoles.Select(r => r.RoleId.ToString()).ToList()
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
        switch (user.UserType)
        {
            case UserType.SistemYoneticisi:
                claims.Add(new Claim(ClaimTypes.Role, "SistemYoneticisi"));
                claims.Add(new Claim("IsSuperAdmin", "true"));
                break;
            case UserType.FirmaYoneticisi:
                claims.Add(new Claim(ClaimTypes.Role, "FirmaYoneticisi"));
                break;
            case UserType.Destek:
                claims.Add(new Claim(ClaimTypes.Role, "Destek"));
                break;
            case UserType.Personel:
                claims.Add(new Claim(ClaimTypes.Role, "Personel"));
                break;
            case UserType.Misafir:
                claims.Add(new Claim(ClaimTypes.Role, "Misafir"));
                break;
        }

        // Add tenant context if provided
        if (tenantId.HasValue && user.UserTenants.Any(ut => ut.TenantId == tenantId.Value))
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

    private async Task<List<Claim>> BuildTenantUserClaimsAsync(TenantUser tenantUser, MasterUser masterUser)
    {
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, masterUser.Id.ToString()),
            new Claim(ClaimTypes.Name, tenantUser.Username),
            new Claim(ClaimTypes.Email, tenantUser.Email.Value),
            new Claim("TenantId", tenantUser.TenantId.ToString()),
            new Claim("TenantUserId", tenantUser.Id.ToString()),
            new Claim("IsMasterUser", "false")
        };

        // Add tenant name
        var tenant = await _masterContext.Tenants.FindAsync(tenantUser.TenantId);
        if (tenant != null)
        {
            claims.Add(new Claim("TenantName", tenant.Name));
        }

        // Add role claims
        foreach (var userRole in tenantUser.UserRoles)
        {
            claims.Add(new Claim(ClaimTypes.Role, userRole.RoleId.ToString()));
        }

        return claims;
    }

    private List<string> GetRolesForUserType(UserType userType)
    {
        return userType switch
        {
            UserType.SistemYoneticisi => new List<string> { "SistemYoneticisi" },
            UserType.FirmaYoneticisi => new List<string> { "FirmaYoneticisi" },
            UserType.Destek => new List<string> { "Destek" },
            UserType.Personel => new List<string> { "Personel" },
            UserType.Misafir => new List<string> { "Misafir" },
            _ => new List<string>()
        };
    }

    private async Task<string?> GetTenantNameAsync(Guid? tenantId)
    {
        if (!tenantId.HasValue) return null;
        
        var tenant = await _masterContext.Tenants.FindAsync(tenantId.Value);
        return tenant?.Name;
    }

}

public interface ITokenGenerationService
{
    Task<AuthenticationResult> GenerateForMasterUserAsync(MasterUser user, Guid? tenantId = null);
    Task<AuthenticationResult> GenerateForTenantUserAsync(TenantUser tenantUser, MasterUser masterUser);
}