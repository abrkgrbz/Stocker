using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Application.Common.Interfaces;
using Stocker.Domain.Master.Enums;
using Stocker.Domain.Tenant.Enums;
using Stocker.Identity.Models;
using Stocker.SharedKernel.Interfaces;
using System.Security.Claims;

namespace Stocker.Identity.Services;

/// <summary>
/// Refactored authentication service focusing only on authentication logic
/// </summary>
public class RefactoredAuthenticationService : IAuthenticationService
{
    private readonly IUserManagementService _userManagementService;
    private readonly ITokenGenerationService _tokenGenerationService;
    private readonly IPasswordService _passwordService;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly ITenantService _tenantService;
    private readonly IMasterDbContext _masterContext;
    private readonly ILogger<RefactoredAuthenticationService> _logger;

    public RefactoredAuthenticationService(
        IUserManagementService userManagementService,
        ITokenGenerationService tokenGenerationService,
        IPasswordService passwordService,
        IJwtTokenService jwtTokenService,
        ITenantService tenantService,
        IMasterDbContext masterContext,
        ILogger<RefactoredAuthenticationService> logger)
    {
        _userManagementService = userManagementService;
        _tokenGenerationService = tokenGenerationService;
        _passwordService = passwordService;
        _jwtTokenService = jwtTokenService;
        _tenantService = tenantService;
        _masterContext = masterContext;
        _logger = logger;
    }

    public async Task<AuthenticationResult> LoginAsync(LoginRequest request)
    {
        _logger.LogInformation("Login attempt started for username: {Username}, Email: {Email}, TenantId: {TenantId}", 
            request.Username, request.Username, request.TenantId);
        
        try
        {
            // Get tenant context from middleware or request 
            var tenantId = request.TenantId ?? _tenantService.GetCurrentTenantId();
            _logger.LogDebug("Tenant context resolved: {TenantId}", tenantId);
            
            // Try to find master user
            _logger.LogDebug("Searching for master user: {Username}", request.Username);
            var masterUser = await _userManagementService.FindMasterUserAsync(request.Username);
            
            if (masterUser != null)
            { 
                
                // Verify password
                if (!_passwordService.VerifyPassword(masterUser.Password, request.Password))
                {
          
                    return new AuthenticationResult
                    {
                        Success = false,
                        Errors = new List<string> { "GeÃ§ersiz kullanÄ±cÄ± adÄ± veya ÅŸifre" }
                    };
                }

                // Check if user is active
                if (!masterUser.IsActive)
                {
                    _logger.LogWarning("Inactive user {Username} attempted to login", request.Username);
                    return new AuthenticationResult
                    {
                        Success = false,
                        Errors = new List<string> { "KullanÄ±cÄ± hesabÄ± aktif deÄŸil" }
                    };
                }

                // Handle tenant context for tenant owners
                if (tenantId.HasValue && masterUser.UserType == UserType.FirmaYoneticisi)
                {
                    await _userManagementService.EnsureTenantUserExistsAsync(masterUser, tenantId.Value);
                }

                // Update last login
                await _userManagementService.UpdateLastLoginAsync(masterUser);

                // Generate token
                var result = await _tokenGenerationService.GenerateForMasterUserAsync(masterUser, tenantId);
                
                _logger.LogInformation("Master user {Username} logged in successfully", request.Username);
                return result;
            }

            // Try tenant user login if tenant context exists
            if (tenantId.HasValue)
            {
                _logger.LogDebug("Searching for tenant user in tenant {TenantId}: {Username}", tenantId.Value, request.Username);
                var tenantUser = await _userManagementService.FindTenantUserAsync(tenantId.Value, request.Username);
                
                if (tenantUser != null)
                {
                    // Get master user for password verification
                    var masterUserForTenant = await _masterContext.MasterUsers
                        .FirstOrDefaultAsync(u => u.Id == tenantUser.MasterUserId);

                    if (masterUserForTenant == null)
                    {
                        _logger.LogError("Master user not found for tenant user {Username}", request.Username);
                        return new AuthenticationResult
                        {
                            Success = false,
                            Errors = new List<string> { "GeÃ§ersiz kullanÄ±cÄ± adÄ± veya ÅŸifre" }
                        };
                    }

                    // Verify password
                    if (!_passwordService.VerifyPassword(masterUserForTenant.Password, request.Password))
                    {
                        _logger.LogWarning("Invalid password attempt for tenant user {Username}", request.Username);
                        return new AuthenticationResult
                        {
                            Success = false,
                            Errors = new List<string> { "GeÃ§ersiz kullanÄ±cÄ± adÄ± veya ÅŸifre" }
                        };
                    }

                    // Check if user is active
                    if (tenantUser.Status != TenantUserStatus.Active)
                    {
                        _logger.LogWarning("Inactive tenant user {Username} attempted to login", request.Username);
                        return new AuthenticationResult
                        {
                            Success = false,
                            Errors = new List<string> { "KullanÄ±cÄ± hesabÄ± aktif deÄŸil" }
                        };
                    }

                    // Update last login
                    await _userManagementService.UpdateLastLoginAsync(tenantUser);

                    // Generate token
                    var result = await _tokenGenerationService.GenerateForTenantUserAsync(tenantUser, masterUserForTenant);
                    
                    _logger.LogInformation("Tenant user {Username} logged in successfully", request.Username);
                    return result;
                }
            }

            _logger.LogWarning("User not found in both Master and Tenant databases. Username: {Username}, TenantId: {TenantId}", 
                request.Username, tenantId);
            return new AuthenticationResult
            {
                Success = false,
                Errors = new List<string> { "GeÃ§ersiz kullanÄ±cÄ± adÄ± veya ÅŸifre" }
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during login for username {Username}", request.Username);
            return new AuthenticationResult
            {
                Success = false,
                Errors = new List<string> { "GiriÅŸ sÄ±rasÄ±nda bir hata oluÅŸtu" }
            };
        }
    }

    public async Task<AuthenticationResult> RefreshTokenAsync(RefreshTokenRequest request)
    {
        try
        {
            // Validate the expired token
            var principal = _jwtTokenService.ValidateToken(request.AccessToken);
            if (principal == null)
            {
                return new AuthenticationResult
                {
                    Success = false,
                    Errors = new List<string> { "GeÃ§ersiz eriÅŸim token'Ä±" }
                };
            }

            // Extract user ID
            var userIdClaim = principal.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
            {
                return new AuthenticationResult
                {
                    Success = false,
                    Errors = new List<string> { "GeÃ§ersiz token bilgileri" }
                };
            }

            // Find master user
            var masterUser = await _masterContext.MasterUsers
                .Include(u => u.UserTenants)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (masterUser == null)
            {
                return new AuthenticationResult
                {
                    Success = false,
                    Errors = new List<string> { "KullanÄ±cÄ± bulunamadÄ±" }
                };
            }

            // Validate refresh token
            if (masterUser.RefreshToken != request.RefreshToken || 
                masterUser.RefreshTokenExpiryTime <= DateTime.UtcNow)
            {
                return new AuthenticationResult
                {
                    Success = false,
                    Errors = new List<string> { "GeÃ§ersiz veya sÃ¼resi dolmuÅŸ yenileme token'Ä±" }
                };
            }

            // Extract tenant context from claims
            var tenantIdClaim = principal.FindFirst("TenantId");
            Guid? tenantId = null;
            if (tenantIdClaim != null && Guid.TryParse(tenantIdClaim.Value, out var tid))
            {
                tenantId = tid;
            }

            // Generate new tokens
            return await _tokenGenerationService.GenerateForMasterUserAsync(masterUser, tenantId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during token refresh");
            return new AuthenticationResult
            {
                Success = false,
                Errors = new List<string> { "Token yenileme sÄ±rasÄ±nda bir hata oluÅŸtu" }
            };
        }
    }

    public async Task<AuthenticationResult> RegisterMasterUserAsync(RegisterRequest request)
    {
        try
        {
            var masterUser = await _userManagementService.CreateMasterUserAsync(
                username: request.Username,
                email: request.Email,
                password: request.Password,
                firstName: request.FirstName,
                lastName: request.LastName,
                phoneNumber: request.PhoneNumber,
                userType: UserType.FirmaYoneticisi);

            return await _tokenGenerationService.GenerateForMasterUserAsync(masterUser);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Registration failed: {Message}", ex.Message);
            return new AuthenticationResult
            {
                Success = false,
                Errors = new List<string> { ex.Message }
            };
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning("Registration validation failed: {Message}", ex.Message);
            return new AuthenticationResult
            {
                Success = false,
                Errors = new List<string> { ex.Message }
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during registration");
            return new AuthenticationResult
            {
                Success = false,
                Errors = new List<string> { "KayÄ±t sÄ±rasÄ±nda bir hata oluÅŸtu" }
            };
        }
    }

    public async Task<AuthenticationResult> RegisterTenantUserAsync(RegisterRequest request, Guid tenantId)
    {
        try
        {
            // First create master user
            var masterUser = await _userManagementService.CreateMasterUserAsync(
                username: request.Username,
                email: request.Email,
                password: request.Password,
                firstName: request.FirstName,
                lastName: request.LastName,
                phoneNumber: request.PhoneNumber,
                userType: UserType.FirmaYoneticisi);

            // Then ensure tenant user exists
            await _userManagementService.EnsureTenantUserExistsAsync(masterUser, tenantId);

            // Get the created tenant user
            var tenantUser = await _userManagementService.FindTenantUserAsync(tenantId, request.Username);
            if (tenantUser == null)
            {
                throw new InvalidOperationException("KiracÄ± kullanÄ±cÄ±sÄ± oluÅŸturulamadÄ±");
            }

            return await _tokenGenerationService.GenerateForTenantUserAsync(tenantUser, masterUser);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Tenant registration failed: {Message}", ex.Message);
            return new AuthenticationResult
            {
                Success = false,
                Errors = new List<string> { ex.Message }
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during tenant registration");
            return new AuthenticationResult
            {
                Success = false,
                Errors = new List<string> { "KayÄ±t sÄ±rasÄ±nda bir hata oluÅŸtu" }
            };
        }
    }

    public async Task<bool> ChangePasswordAsync(Guid userId, ChangePasswordRequest request)
    {
        try
        {
            var masterUser = await _masterContext.MasterUsers.FindAsync(userId);
            if (masterUser == null)
            {
                return false;
            }

            // Verify current password
            if (!_passwordService.VerifyPassword(masterUser.Password, request.CurrentPassword))
            {
                return false;
            }

            // Create new hashed password
            var newHashedPassword = _passwordService.CreateHashedPassword(request.NewPassword);
            
            // Update password - UpdatePassword expects a string hash
            var combinedHash = _passwordService.GetCombinedHash(newHashedPassword);
            masterUser.UpdatePassword(combinedHash);
            
            await _masterContext.SaveChangesAsync();
            _logger.LogInformation("Password changed for user {UserId}", userId);
            
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error changing password for user {UserId}", userId);
            return false;
        }
    }

    public async Task<bool> RevokeRefreshTokenAsync(Guid userId)
    {
        try
        {
            var masterUser = await _masterContext.MasterUsers.FindAsync(userId);
            if (masterUser == null)
            {
                return false;
            }

            masterUser.RevokeRefreshToken();
            await _masterContext.SaveChangesAsync();
            
            _logger.LogInformation("Refresh token revoked for user {UserId}", userId);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error revoking refresh token for user {UserId}", userId);
            return false;
        }
    }
}
