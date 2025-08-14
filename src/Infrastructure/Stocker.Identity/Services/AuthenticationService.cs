using Microsoft.EntityFrameworkCore;
using Stocker.Domain.Master.Entities;
using Stocker.Domain.Tenant.Entities;
using Stocker.Identity.Models;
using Stocker.Persistence.Contexts;
using Stocker.Persistence.Factories;
using System.Security.Claims;
using Stocker.Domain.Common.ValueObjects;
using Stocker.SharedKernel.Interfaces;
using Stocker.Application.Common.Interfaces;
using Microsoft.Extensions.Logging;
using Stocker.Domain.Master.Enums;
using Stocker.Domain.Master.ValueObjects;

namespace Stocker.Identity.Services;

public class AuthenticationService : IAuthenticationService
{
    private readonly MasterDbContext _masterContext;
    private readonly ITenantDbContextFactory _tenantDbContextFactory;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IPasswordService _passwordService;
    private readonly ITenantService _tenantService;
    private readonly ILogger<AuthenticationService> _logger;

    public AuthenticationService(
        MasterDbContext masterContext,
        ITenantDbContextFactory tenantDbContextFactory,
        IJwtTokenService jwtTokenService,
        IPasswordHasher passwordHasher,
        IPasswordService passwordService,
        ITenantService tenantService,
        ILogger<AuthenticationService> logger)
    {
        _masterContext = masterContext;
        _tenantDbContextFactory = tenantDbContextFactory;
        _jwtTokenService = jwtTokenService;
        _passwordHasher = passwordHasher;
        _passwordService = passwordService;
        _tenantService = tenantService;
        _logger = logger;
    }

    public async Task<AuthenticationResult> LoginAsync(LoginRequest request)
    {
        // TenantResolutionMiddleware'den çözümlenmiş tenant bilgisini al
        // Eğer request'te TenantId varsa onu kullan, yoksa middleware'den gelen bilgiyi kullan
        var tenantId = request.TenantId ?? _tenantService.GetCurrentTenantId();
        
        // Önce MasterUser'ı kontrol et (username veya email ile)
        var masterUser = await _masterContext.MasterUsers
            .Include(u => u.UserTenants)
            .Include(u => u.RefreshTokens)
            .FirstOrDefaultAsync(u => u.Username == request.Username || u.Email.Value == request.Username);
       
        if (masterUser != null)
        {
            // Debug logging
            _logger.LogInformation("Attempting to verify password for user {Username}", masterUser.Username);
           
            
            // Password kontrolü
            if (!_passwordService.VerifyPassword(masterUser.Password, request.Password))
            {
                _logger.LogWarning("Password verification failed for user {Username}", masterUser.Username);
                return new AuthenticationResult
                {
                    Success = false,
                    Errors = new List<string> { "Invalid username or password" }
                };
            }

            // Eğer MasterUser bir tenant context'inde giriş yapıyorsa ve henüz o tenant'ta TenantUser'ı yoksa, otomatik oluştur
            if (tenantId.HasValue && masterUser.UserType == UserType.TenantOwner)
            {
                await EnsureTenantUserExistsAsync(masterUser, tenantId.Value);
            }

            // Master user için token oluştur
            return await GenerateAuthenticationResultForMasterUser(masterUser, tenantId);
        }

        // TenantUser kontrolü (tenant context varsa)
        if (tenantId.HasValue)
        {
            // Tenant context'i oluştur
            await using var tenantContext = await _tenantDbContextFactory.CreateDbContextAsync(tenantId.Value);
            
            var tenantUser = await tenantContext.TenantUsers
                .FirstOrDefaultAsync(u => u.Username == request.Username && u.TenantId == tenantId.Value);

            if (tenantUser != null)
            {
                // TenantUser için MasterUser'dan password kontrolü yapılmalı
                var masterUserForTenant = await _masterContext.MasterUsers
                    .FirstOrDefaultAsync(u => u.Id == tenantUser.MasterUserId);

                if (masterUserForTenant != null && 
                    _passwordHasher.VerifyPassword(masterUserForTenant.PasswordHash, request.Password))
                {
                    return await GenerateAuthenticationResultForTenantUser(tenantUser, masterUserForTenant);
                }
            }
        }

        return new AuthenticationResult
        {
            Success = false,
            Errors = new List<string> { "Invalid username or password" }
        };
    }

    private async Task EnsureTenantUserExistsAsync(MasterUser masterUser, Guid tenantId)
    {
        try
        {
            // Tenant context'i oluştur
            await using var tenantContext = await _tenantDbContextFactory.CreateDbContextAsync(tenantId);
            
            // Bu kullanıcının bu tenant'ta zaten var olup olmadığını kontrol et
            var existingTenantUser = await tenantContext.TenantUsers
                .FirstOrDefaultAsync(u => u.MasterUserId == masterUser.Id && u.TenantId == tenantId);

            if (existingTenantUser != null)
            {
                return; // Zaten var, bir şey yapma
            }

            // Tenant'ı kontrol et
            var tenant = await _masterContext.Tenants.FindAsync(tenantId);
            if (tenant == null)
            {
                return; // Tenant bulunamadı
            }

            // TenantUser oluştur
            var tenantUser = TenantUser.Create(
                tenantId: tenantId,
                masterUserId: masterUser.Id,
                username: masterUser.Username,
                email: masterUser.Email,
                firstName: masterUser.FirstName,
                lastName: masterUser.LastName,
                phone: masterUser.PhoneNumber
            );

            // Eğer kullanıcı adı "tenantadmin" ise, Administrator rolünü ata
            if (masterUser.Username.Equals("tenantadmin", StringComparison.OrdinalIgnoreCase))
            {
                var adminRole = await tenantContext.Roles
                    .FirstOrDefaultAsync(r => r.Name == "Administrator" && r.TenantId == tenantId);

                if (adminRole != null)
                {
                    tenantUser.AssignRole(adminRole.Id);
                }
            }

            tenantContext.TenantUsers.Add(tenantUser);
            await tenantContext.SaveChangesAsync();

            // MasterUser'a tenant ilişkisini ekle
            if (!masterUser.UserTenants.Any(ut => ut.TenantId == tenantId))
            {
                masterUser.AddTenant(tenantId, true);
                await _masterContext.SaveChangesAsync();
            }

            _logger.LogInformation("Successfully created TenantUser for MasterUser {Username} in tenant {TenantId} with {RoleCount} roles", 
                masterUser.Username, tenantId, tenantUser.UserRoles.Count);
        }
        catch (Exception ex)
        {
            // Log the error but don't fail the login
            // This is a best-effort operation
            _logger.LogError(ex, "Failed to ensure TenantUser exists for MasterUser {UserId} in tenant {TenantId}", masterUser.Id, tenantId);
        }
    }

    public async Task<AuthenticationResult> RefreshTokenAsync(RefreshTokenRequest request)
    {
        var principal = _jwtTokenService.ValidateToken(request.AccessToken);
        if (principal == null)
        {
            return new AuthenticationResult
            {
                Success = false,
                Errors = new List<string> { "Invalid access token" }
            };
        }

        var userIdClaim = principal.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
        {
            return new AuthenticationResult
            {
                Success = false,
                Errors = new List<string> { "Invalid token claims" }
            };
        }

        // Refresh token'ı kontrol et (bu kısım için RefreshToken tablosu eklenebilir)
        var masterUser = await _masterContext.MasterUsers
            .Include(u => u.UserTenants)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (masterUser == null || masterUser.RefreshToken != request.RefreshToken || 
            masterUser.RefreshTokenExpiryTime <= DateTime.UtcNow)
        {
            return new AuthenticationResult
            {
                Success = false,
                Errors = new List<string> { "Invalid or expired refresh token" }
            };
        }

        // TenantId'yi claim'den al
        var tenantIdClaim = principal.FindFirst("TenantId");
        Guid? tenantId = null;
        if (tenantIdClaim != null && Guid.TryParse(tenantIdClaim.Value, out var tid))
        {
            tenantId = tid;
        }

        return await GenerateAuthenticationResultForMasterUser(masterUser, tenantId);
    }

    public async Task<AuthenticationResult> RegisterMasterUserAsync(RegisterRequest request)
    {
        // Username kontrolü
        var existingUser = await _masterContext.MasterUsers
            .AnyAsync(u => u.Username == request.Username || u.Email.Value == request.Email);

        if (existingUser)
        {
            return new AuthenticationResult
            {
                Success = false,
                Errors = new List<string> { "Username or email already exists" }
            };
        }

        // Yeni MasterUser oluştur
        var emailResult = Email.Create(request.Email);
        if (!emailResult.IsSuccess)
        {
            return new AuthenticationResult
            {
                Success = false,
                Errors = new List<string> { emailResult.Error.Description }
            };
        }

        PhoneNumber? phoneNumber = null;
        if (!string.IsNullOrWhiteSpace(request.PhoneNumber))
        {
            var phoneResult = PhoneNumber.Create(request.PhoneNumber);
            if (!phoneResult.IsSuccess)
            {
                return new AuthenticationResult
                {
                    Success = false,
                    Errors = new List<string> { phoneResult.Error.Description }
                };
            }
            phoneNumber = phoneResult.Value;
        }
         
        var hashedPassword = _passwordHasher.HashPassword(request.Password);
        var masterUser = MasterUser.Create(
            username: request.Username,
            email: emailResult.Value,
            passwordHash: hashedPassword,
            firstName: request.FirstName,
            lastName: request.LastName,
            phoneNumber: phoneNumber
        );

        _masterContext.MasterUsers.Add(masterUser);
        await _masterContext.SaveChangesAsync();

        return await GenerateAuthenticationResultForMasterUser(masterUser, null);
    }

    public async Task<AuthenticationResult> RegisterTenantUserAsync(RegisterRequest request, Guid tenantId)
    {
        // Önce MasterUser oluştur
        var masterUserResult = await RegisterMasterUserAsync(request);
        if (!masterUserResult.Success || masterUserResult.User == null)
        {
            return masterUserResult;
        }

        // Tenant'ı kontrol et
        var tenant = await _masterContext.Tenants.FindAsync(tenantId);
        if (tenant == null)
        {
            return new AuthenticationResult
            {
                Success = false,
                Errors = new List<string> { "Tenant not found" }
            };
        }

        // TenantUser oluştur
        var tenantEmailResult = Email.Create(request.Email);
        if (!tenantEmailResult.IsSuccess)
        {
            return new AuthenticationResult
            {
                Success = false,
                Errors = new List<string> { tenantEmailResult.Error.Description }
            };
        }

        PhoneNumber? tenantPhoneNumber = null;
        if (!string.IsNullOrWhiteSpace(request.PhoneNumber))
        {
            var phoneResult = PhoneNumber.Create(request.PhoneNumber);
            if (!phoneResult.IsSuccess)
            {
                return new AuthenticationResult
                {
                    Success = false,
                    Errors = new List<string> { phoneResult.Error.Description }
                };
            }
            tenantPhoneNumber = phoneResult.Value;
        }

        var tenantUser = TenantUser.Create(
            tenantId: tenantId,
            masterUserId: masterUserResult.User.Id,
            username: request.Username,
            email: tenantEmailResult.Value,
            firstName: request.FirstName,
            lastName: request.LastName,
            phone: tenantPhoneNumber
        );

        // Tenant context'i oluştur ve kullan
        await using var tenantContext = await _tenantDbContextFactory.CreateDbContextAsync(tenantId);
        tenantContext.TenantUsers.Add(tenantUser);
        await tenantContext.SaveChangesAsync();

        // UserTenant ilişkisini ekle
        var masterUser = await _masterContext.MasterUsers.FindAsync(masterUserResult.User.Id);
        if (masterUser != null)
        {
            masterUser.AddTenant(tenantId, true);
            await _masterContext.SaveChangesAsync();
        }

        return await GenerateAuthenticationResultForTenantUser(tenantUser, masterUser!);
    }

    public async Task<bool> ChangePasswordAsync(Guid userId, ChangePasswordRequest request)
    {
        var masterUser = await _masterContext.MasterUsers.FindAsync(userId);
        if (masterUser == null)
        {
            return false;
        }

        // Mevcut şifreyi kontrol et
        if (!_passwordHasher.VerifyPassword(masterUser.PasswordHash, request.CurrentPassword))
        {
            return false;
        }

        // Yeni şifreyi hashle ve kaydet
        var newHashedPassword = _passwordHasher.HashPassword(request.NewPassword);
        masterUser.UpdatePassword(newHashedPassword);
        
        await _masterContext.SaveChangesAsync();
        return true;
    }

    public async Task<bool> RevokeRefreshTokenAsync(Guid userId)
    {
        var masterUser = await _masterContext.MasterUsers.FindAsync(userId);
        if (masterUser == null)
        {
            return false;
        }

        masterUser.RevokeRefreshToken();
        await _masterContext.SaveChangesAsync();
        return true;
    }

    private async Task<AuthenticationResult> GenerateAuthenticationResultForMasterUser(MasterUser user, Guid? tenantId)
    {
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(ClaimTypes.Email, user.Email.Value),
            new Claim("IsMasterUser", "true")
        };

        // Add role claim based on UserType
        if (user.UserType == UserType.SystemAdmin)
        {
            claims.Add(new Claim(ClaimTypes.Role, "SystemAdmin"));
            claims.Add(new Claim("IsSuperAdmin", "true"));
            _logger.LogInformation("Adding SystemAdmin role to token for user {Username}", user.Username);
        }
        else if (user.UserType == UserType.TenantAdmin)
        {
            claims.Add(new Claim(ClaimTypes.Role, "TenantAdmin"));
            _logger.LogInformation("Adding TenantAdmin role to token for user {Username}", user.Username);
        }
        
        _logger.LogInformation("User {Username} has UserType: {UserType}", user.Username, user.UserType);

        // Eğer specific bir tenant için login yapılıyorsa
        if (tenantId.HasValue && user.UserTenants.Any(ut => ut.TenantId == tenantId.Value))
        {
            claims.Add(new Claim("TenantId", tenantId.Value.ToString()));
            
            var tenant = await _masterContext.Tenants.FindAsync(tenantId.Value);
            if (tenant != null)
            {
                claims.Add(new Claim("TenantName", tenant.Name));
            }
        }

        var accessToken = _jwtTokenService.GenerateAccessToken(claims);
        var refreshToken = _jwtTokenService.GenerateRefreshToken();

        // Refresh token'ı kaydet
        user.SetRefreshToken(refreshToken, _jwtTokenService.GetRefreshTokenExpiration());
        await _masterContext.SaveChangesAsync();

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
                TenantName = tenantId.HasValue ? 
                    (await _masterContext.Tenants.FindAsync(tenantId.Value))?.Name : null,
                IsMasterUser = true,
                Roles = user.UserType == UserType.SystemAdmin ? new List<string> { "SystemAdmin" } : 
                        user.UserType == UserType.TenantAdmin ? new List<string> { "TenantAdmin" } : 
                        new List<string>()
            }
        };
    }

    private async Task<AuthenticationResult> GenerateAuthenticationResultForTenantUser(TenantUser tenantUser, MasterUser masterUser)
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

        // Tenant bilgisini ekle
        var tenant = await _masterContext.Tenants.FindAsync(tenantUser.TenantId);
        if (tenant != null)
        {
            claims.Add(new Claim("TenantName", tenant.Name));
        }

        // Rolleri ekle
        foreach (var userRole in tenantUser.UserRoles)
        {
            claims.Add(new Claim(ClaimTypes.Role, userRole.RoleId.ToString()));
        }

        var accessToken = _jwtTokenService.GenerateAccessToken(claims);
        var refreshToken = _jwtTokenService.GenerateRefreshToken();

        // Refresh token'ı MasterUser'da kaydet
        masterUser.SetRefreshToken(refreshToken, _jwtTokenService.GetRefreshTokenExpiration());
        await _masterContext.SaveChangesAsync();

        // Last login'i güncelle
        tenantUser.RecordLogin();
        // Tenant context'i oluştur ve değişiklikleri kaydet
        await using var tenantContext = await _tenantDbContextFactory.CreateDbContextAsync(tenantUser.TenantId);
        tenantContext.TenantUsers.Update(tenantUser);
        await tenantContext.SaveChangesAsync();

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
                TenantName = tenant?.Name,
                IsMasterUser = false,
                Roles = tenantUser.UserRoles.Select(r => r.RoleId.ToString()).ToList()
            }
        };
    }
}