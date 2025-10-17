using Microsoft.EntityFrameworkCore;
using Stocker.Domain.Master.Entities;
using Stocker.Domain.Tenant.Entities;
using Stocker.Identity.Models;
using System.Security.Claims;
using Stocker.Domain.Common.ValueObjects;
using Stocker.SharedKernel.Interfaces;
using Stocker.Application.Common.Interfaces;
using Microsoft.Extensions.Logging;
using Stocker.Domain.Master.Enums;
using Stocker.Domain.Master.ValueObjects;
using Stocker.Application.Features.Identity.Commands.Login;
using Stocker.SharedKernel.Results;
using AppUserInfo = Stocker.Application.Features.Identity.Commands.Login.UserInfo;
using IdentityUserInfo = Stocker.Identity.Models.UserInfo;

namespace Stocker.Identity.Services;

public class AuthenticationService : IAuthenticationService
{
    private readonly IMasterDbContext _masterContext;
    private readonly ITenantDbContextFactory _tenantDbContextFactory;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IPasswordService _passwordService;
    private readonly ITenantService _tenantService;
    private readonly ILogger<AuthenticationService> _logger;

    public AuthenticationService(
        IMasterDbContext masterContext,
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
        // TenantResolutionMiddleware'den Ã§Ã¶zÃ¼mlenmiÅŸ tenant bilgisini al
        // EÄŸer request'te TenantId varsa onu kullan, yoksa middleware'den gelen bilgiyi kullan
        var tenantId = request.TenantId ?? _tenantService.GetCurrentTenantId();
        
        // Ã–nce MasterUser'Ä± kontrol et (username veya email ile)
        var masterUser = await _masterContext.MasterUsers
            // UserTenants moved to Tenant domain
            .Include(u => u.RefreshTokens)
            .Where(u => u.Username == request.Username || EF.Property<string>(u, "Email") == request.Username)
            .FirstOrDefaultAsync();
       
        if (masterUser != null)
        {
            // Debug logging
            _logger.LogInformation("Attempting to verify password for user {Username}", masterUser.Username);
            _logger.LogDebug("User details - Id: {UserId}, Email: {Email}, UserType: {UserType}", 
                masterUser.Id, masterUser.Email.Value, masterUser.UserType);
            _logger.LogDebug("Password object exists: {HasPassword}, Hash exists: {HasHash}, Salt exists: {HasSalt}", 
                masterUser.Password != null,
                masterUser.Password?.Hash != null,
                masterUser.Password?.Salt != null);
            
            if (masterUser.Password != null)
            {
                _logger.LogDebug("Password hash length: {HashLength}, Salt length: {SaltLength}", 
                    masterUser.Password.Hash?.Length ?? 0,
                    masterUser.Password.Salt?.Length ?? 0);
            }
            
            // Password kontrolÃ¼
            if (!_passwordService.VerifyPassword(masterUser.Password, request.Password))
            {
                _logger.LogWarning("Password verification failed for user {Username}. User has password: {HasPassword}, Password hash length: {HashLength}", 
                    masterUser.Username, 
                    masterUser.Password != null,
                    masterUser.Password?.Hash?.Length ?? 0);
                
                // Additional debug info
                _logger.LogDebug("Failed password verification details - Hash first 10 chars: {HashPrefix}, Salt first 10 chars: {SaltPrefix}",
                    masterUser.Password?.Hash?.Substring(0, Math.Min(10, masterUser.Password?.Hash?.Length ?? 0)) ?? "N/A",
                    masterUser.Password?.Salt?.Substring(0, Math.Min(10, masterUser.Password?.Salt?.Length ?? 0)) ?? "N/A");
                
                return new AuthenticationResult
                {
                    Success = false,
                    Errors = new List<string> { "Invalid username or password" }
                };
            }

            // EÄŸer MasterUser bir tenant context'inde giriÅŸ yapÄ±yorsa ve henÃ¼z o tenant'ta TenantUser'Ä± yoksa, otomatik oluÅŸtur
            if (tenantId.HasValue && masterUser.UserType == Domain.Master.Enums.UserType.FirmaYoneticisi)
            {
                await EnsureTenantUserExistsAsync(masterUser, tenantId.Value);
            }

            // Master user iÃ§in token oluÅŸtur
            return await GenerateAuthenticationResultForMasterUser(masterUser, tenantId);
        }

        // TenantUser kontrolÃ¼ (tenant context varsa)
        if (tenantId.HasValue)
        {
            // Tenant context'i oluÅŸtur
            // TODO: Fix tenant context creation after architecture refactoring
            // await using var tenantContext = await _tenantDbContextFactory.CreateDbContextAsync(tenantId.Value);
            object? tenantContext = null;
            
            // var tenantUser = await tenantContext.TenantUsers
            //     .FirstOrDefaultAsync(u => u.Username == request.Username && u.TenantId == tenantId.Value);
            Domain.Tenant.Entities.TenantUser? tenantUser = null;

            if (tenantUser != null)
            {
                // TenantUser iÃ§in MasterUser'dan password kontrolÃ¼ yapÄ±lmalÄ±
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
            // Tenant context'i oluÅŸtur
            // TODO: Fix tenant context creation after architecture refactoring
            // await using var tenantContext = await _tenantDbContextFactory.CreateDbContextAsync(tenantId);
            return; // Temporarily return until tenant context is fixed
            
            // Bu kullanÄ±cÄ±nÄ±n bu tenant'ta zaten var olup olmadÄ±ÄŸÄ±nÄ± kontrol et
            // var existingTenantUser = await tenantContext.TenantUsers
            //     .FirstOrDefaultAsync(u => u.MasterUserId == masterUser.Id && u.TenantId == tenantId);
            Domain.Tenant.Entities.TenantUser? existingTenantUser = null;

            if (existingTenantUser != null)
            {
                return; // Zaten var, bir ÅŸey yapma
            }

            // Tenant'Ä± kontrol et
            var tenant = await _masterContext.Tenants.FindAsync(tenantId);
            if (tenant == null)
            {
                return; // Tenant bulunamadÄ±
            }

            // TenantUser oluÅŸtur
            var tenantUser = TenantUser.Create(
                tenantId: tenantId,
                masterUserId: masterUser.Id,
                username: masterUser.Username,
                email: masterUser.Email,
                firstName: masterUser.FirstName,
                lastName: masterUser.LastName,
                phone: masterUser.PhoneNumber
            );

            // EÄŸer kullanÄ±cÄ± adÄ± "tenantadmin" ise, Administrator rolÃ¼nÃ¼ ata
            if (masterUser.Username.Equals("tenantadmin", StringComparison.OrdinalIgnoreCase))
            {
                // var adminRole = await tenantContext.Roles
                //     .FirstOrDefaultAsync(r => r.Name == "Administrator" && r.TenantId == tenantId);
                Domain.Tenant.Entities.Role? adminRole = null;

                if (adminRole != null)
                {
                    tenantUser.AssignRole(adminRole.Id);
                }
            }

            // tenantContext.TenantUsers.Add(tenantUser);
            // await tenantContext.SaveChangesAsync();

            // UserTenants moved to Tenant domain - skip tenant relationship
            // This should be managed through Tenant context

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

        // Refresh token'Ä± kontrol et (bu kÄ±sÄ±m iÃ§in RefreshToken tablosu eklenebilir)
        var masterUser = await _masterContext.MasterUsers
            // UserTenants moved to Tenant domain
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
        // Username kontrolÃ¼
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

        // Yeni MasterUser oluÅŸtur
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
         
        // Use the overload that accepts plainPassword instead of passwordHash
        var masterUser = MasterUser.Create(
            username: request.Username,
            email: emailResult.Value,
            plainPassword: request.Password,
            firstName: request.FirstName,
            lastName: request.LastName,
            userType: Domain.Master.Enums.UserType.FirmaYoneticisi, // Default to FirmaSahibi for registration
            phoneNumber: phoneNumber
        );

        _masterContext.MasterUsers.Add(masterUser);
        await _masterContext.SaveChangesAsync();

        return await GenerateAuthenticationResultForMasterUser(masterUser, null);
    }

    public async Task<AuthenticationResult> RegisterTenantUserAsync(RegisterRequest request, Guid tenantId)
    {
        // Ã–nce MasterUser oluÅŸtur
        var masterUserResult = await RegisterMasterUserAsync(request);
        if (!masterUserResult.Success || masterUserResult.User == null)
        {
            return masterUserResult;
        }

        // Tenant'Ä± kontrol et
        var tenant = await _masterContext.Tenants.FindAsync(tenantId);
        if (tenant == null)
        {
            return new AuthenticationResult
            {
                Success = false,
                Errors = new List<string> { "Tenant not found" }
            };
        }

        // TenantUser oluÅŸtur
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

        // Tenant context'i oluÅŸtur ve kullan
        // TODO: Fix tenant context creation after architecture refactoring
        // await using var tenantContext = await _tenantDbContextFactory.CreateDbContextAsync(tenantId);
        // tenantContext.TenantUsers.Add(tenantUser);
        // await tenantContext.SaveChangesAsync();

        // UserTenant iliÅŸkisini ekle
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

        // Mevcut ÅŸifreyi kontrol et
        if (!_passwordHasher.VerifyPassword(masterUser.PasswordHash, request.CurrentPassword))
        {
            return false;
        }

        // Yeni ÅŸifreyi hashle ve kaydet
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

    public async Task<Result<AuthResponse>> GenerateAuthResponseForMasterUserAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        try
        {
            var user = await _masterContext.MasterUsers.FindAsync(new object[] { userId }, cancellationToken);

            if (user == null)
            {
                return Result.Failure<AuthResponse>(
                    Error.NotFound("User.NotFound", "User not found"));
            }

            var authResult = await GenerateAuthenticationResultForMasterUser(user, null);

            var authResponse = new AuthResponse
            {
                AccessToken = authResult.AccessToken,
                RefreshToken = authResult.RefreshToken,
                ExpiresAt = authResult.AccessTokenExpiration ?? DateTime.UtcNow.AddMinutes(60),
                TokenType = "Bearer",
                User = new AppUserInfo
                {
                    Id = authResult.User.Id,
                    Username = authResult.User.Username,
                    Email = authResult.User.Email,
                    FullName = authResult.User.FullName,
                    TenantId = authResult.User.TenantId,
                    TenantName = authResult.User.TenantName,
                    TenantCode = authResult.User.TenantCode,
                    Roles = authResult.User.Roles
                },
                Requires2FA = false,
                TempToken = null
            };

            return Result.Success(authResponse);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating auth response for master user: {UserId}", userId);
            return Result.Failure<AuthResponse>(
                Error.Failure("Auth.GenerationError", "Failed to generate authentication response"));
        }
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
        if (user.UserType == Domain.Master.Enums.UserType.SistemYoneticisi)
        {
            claims.Add(new Claim(ClaimTypes.Role, "SistemYoneticisi"));
            claims.Add(new Claim("IsSuperAdmin", "true"));
            _logger.LogInformation("Adding SistemYoneticisi role to token for user {Username}", user.Username);
        }
        else if (user.UserType == Domain.Master.Enums.UserType.FirmaYoneticisi)
        {
            claims.Add(new Claim(ClaimTypes.Role, "FirmaYoneticisi"));
            _logger.LogInformation("Adding FirmaYoneticisi role to token for user {Username}", user.Username);
        }
        
        _logger.LogInformation("User {Username} has UserType: {UserType}", user.Username, user.UserType);

        // EÄŸer specific bir tenant iÃ§in login yapÄ±lÄ±yorsa
        // UserTenants moved to Tenant domain - skip this check for now
        if (tenantId.HasValue)
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

        // Refresh token'Ä± kaydet
        user.SetRefreshToken(refreshToken, _jwtTokenService.GetRefreshTokenExpiration());
        await _masterContext.SaveChangesAsync();

        return new AuthenticationResult
        {
            Success = true,
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            AccessTokenExpiration = _jwtTokenService.GetAccessTokenExpiration(),
            RefreshTokenExpiration = _jwtTokenService.GetRefreshTokenExpiration(),
            User = new IdentityUserInfo
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email.Value,
                FullName = user.GetFullName(),
                TenantId = tenantId,
                TenantName = tenantId.HasValue ?
                    (await _masterContext.Tenants.FindAsync(tenantId.Value))?.Name : null,
                TenantCode = tenantId.HasValue ?
                    (await _masterContext.Tenants.FindAsync(tenantId.Value))?.Code : null,
                IsMasterUser = true,
                Roles = user.UserType == Domain.Master.Enums.UserType.SistemYoneticisi ? new List<string> { "SistemYoneticisi" } :
                        user.UserType == Domain.Master.Enums.UserType.FirmaYoneticisi ? new List<string> { "FirmaYoneticisi" } :
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

        // Refresh token'Ä± MasterUser'da kaydet
        masterUser.SetRefreshToken(refreshToken, _jwtTokenService.GetRefreshTokenExpiration());
        await _masterContext.SaveChangesAsync();

        // Last login'i gÃ¼ncelle
        tenantUser.RecordLogin();
        // Tenant context'i oluÅŸtur ve deÄŸiÅŸiklikleri kaydet
        // TODO: Fix tenant context creation after architecture refactoring
        // await using var tenantContext = await _tenantDbContextFactory.CreateDbContextAsync(tenantUser.TenantId);
        // tenantContext.TenantUsers.Update(tenantUser);
        // await tenantContext.SaveChangesAsync();

        return new AuthenticationResult
        {
            Success = true,
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            AccessTokenExpiration = _jwtTokenService.GetAccessTokenExpiration(),
            RefreshTokenExpiration = _jwtTokenService.GetRefreshTokenExpiration(),
            User = new IdentityUserInfo
            {
                Id = masterUser.Id,
                Username = tenantUser.Username,
                Email = tenantUser.Email.Value,
                FullName = tenantUser.GetFullName(),
                TenantId = tenantUser.TenantId,
                TenantName = tenant?.Name,
                TenantCode = tenant?.Code,
                IsMasterUser = false,
                Roles = tenantUser.UserRoles.Select(r => r.RoleId.ToString()).ToList()
            }
        };
    }
}
