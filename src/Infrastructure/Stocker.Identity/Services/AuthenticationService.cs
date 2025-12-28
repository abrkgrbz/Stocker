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
/// Authentication service for handling user login, registration, and token management.
/// Supports both Master users (system/tenant administrators) and Tenant users.
/// </summary>
public class AuthenticationService : IAuthenticationService
{
    private readonly IUserManagementService _userManagementService;
    private readonly ITokenGenerationService _tokenGenerationService;
    private readonly IPasswordService _passwordService;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly ITenantService _tenantService;
    private readonly IMasterDbContext _masterContext;
    private readonly ITenantDbContextFactory _tenantDbContextFactory;
    private readonly ILogger<AuthenticationService> _logger;

    public AuthenticationService(
        IUserManagementService userManagementService,
        ITokenGenerationService tokenGenerationService,
        IPasswordService passwordService,
        IJwtTokenService jwtTokenService,
        ITenantService tenantService,
        IMasterDbContext masterContext,
        ITenantDbContextFactory tenantDbContextFactory,
        ILogger<AuthenticationService> logger)
    {
        _userManagementService = userManagementService;
        _tokenGenerationService = tokenGenerationService;
        _passwordService = passwordService;
        _jwtTokenService = jwtTokenService;
        _tenantService = tenantService;
        _masterContext = masterContext;
        _tenantDbContextFactory = tenantDbContextFactory;
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
                        Errors = new List<string> { "Geçersiz kullanıcı adı veya şifre" }
                    };
                }

                // Check if user is active
                if (!masterUser.IsActive)
                {
                    _logger.LogWarning("Inactive user {Username} attempted to login", request.Username);
                    return new AuthenticationResult
                    {
                        Success = false,
                        Errors = new List<string> { "Kullanıcı hesabı aktif değil" }
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
                            Errors = new List<string> { "Geçersiz kullanıcı adı veya şifre" }
                        };
                    }

                    // Verify password
                    if (!_passwordService.VerifyPassword(masterUserForTenant.Password, request.Password))
                    {
                        _logger.LogWarning("Invalid password attempt for tenant user {Username}", request.Username);
                        return new AuthenticationResult
                        {
                            Success = false,
                            Errors = new List<string> { "Geçersiz kullanıcı adı veya şifre" }
                        };
                    }

                    // Check if user is active
                    if (tenantUser.Status != TenantUserStatus.Active)
                    {
                        _logger.LogWarning("Inactive tenant user {Username} attempted to login", request.Username);
                        return new AuthenticationResult
                        {
                            Success = false,
                            Errors = new List<string> { "Kullanıcı hesabı aktif değil" }
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
                Errors = new List<string> { "Geçersiz kullanıcı adı veya şifre" }
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during login for username {Username}", request.Username);
            return new AuthenticationResult
            {
                Success = false,
                Errors = new List<string> { "Giriş sırasında bir hata oluştu" }
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
                    Errors = new List<string> { "Geçersiz erişim token'ı" }
                };
            }

            // Extract user ID
            var userIdClaim = principal.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
            {
                return new AuthenticationResult
                {
                    Success = false,
                    Errors = new List<string> { "Geçersiz token bilgileri" }
                };
            }

            // Find master user
            var masterUser = await _masterContext.MasterUsers
                // UserTenants moved to Tenant domain
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (masterUser == null)
            {
                return new AuthenticationResult
                {
                    Success = false,
                    Errors = new List<string> { "Kullanıcı bulunamadı" }
                };
            }

            // Validate refresh token
            if (masterUser.RefreshToken != request.RefreshToken || 
                masterUser.RefreshTokenExpiryTime <= DateTime.UtcNow)
            {
                return new AuthenticationResult
                {
                    Success = false,
                    Errors = new List<string> { "Geçersiz veya süresi dolmuş yenileme token'ı" }
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
                Errors = new List<string> { "Token yenileme sırasında bir hata oluştu" }
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
                userType: Domain.Master.Enums.UserType.FirmaYoneticisi);

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
                Errors = new List<string> { "Kayıt sırasında bir hata oluştu" }
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
                userType: Domain.Master.Enums.UserType.FirmaYoneticisi);

            // Then ensure tenant user exists
            await _userManagementService.EnsureTenantUserExistsAsync(masterUser, tenantId);

            // Get the created tenant user
            var tenantUser = await _userManagementService.FindTenantUserAsync(tenantId, request.Username);
            if (tenantUser == null)
            {
                throw new InvalidOperationException("Kiracı kullanıcısı oluşturulamadı");
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
                Errors = new List<string> { "Kayıt sırasında bir hata oluştu" }
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

    public async Task<Stocker.SharedKernel.Results.Result<Stocker.Application.Features.Identity.Commands.Login.AuthResponse>> GenerateAuthResponseForMasterUserAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        try
        {
            var masterUser = await _masterContext.MasterUsers.FindAsync(new object[] { userId }, cancellationToken);

            if (masterUser == null)
            {
                return Stocker.SharedKernel.Results.Result.Failure<Stocker.Application.Features.Identity.Commands.Login.AuthResponse>(
                    Stocker.SharedKernel.Results.Error.NotFound("User.NotFound", "User not found"));
            }

            // Generate authentication result using token generation service
            var authResult = await _tokenGenerationService.GenerateForMasterUserAsync(masterUser, null);

            var authResponse = new Stocker.Application.Features.Identity.Commands.Login.AuthResponse
            {
                AccessToken = authResult.AccessToken ?? string.Empty,
                RefreshToken = authResult.RefreshToken ?? string.Empty,
                ExpiresAt = authResult.AccessTokenExpiration ?? DateTime.UtcNow.AddMinutes(60),
                TokenType = "Bearer",
                User = new Stocker.Application.Features.Identity.Commands.Login.UserInfo
                {
                    Id = authResult.User.Id,
                    Username = authResult.User.Username,
                    Email = authResult.User.Email,
                    FullName = authResult.User.FullName,
                    TenantId = authResult.User.TenantId,
                    TenantName = authResult.User.TenantName,
                    Roles = authResult.User.Roles ?? new List<string>()
                },
                Requires2FA = false,
                TempToken = null
            };

            return Stocker.SharedKernel.Results.Result.Success(authResponse);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating auth response for master user: {UserId}", userId);
            return Stocker.SharedKernel.Results.Result.Failure<Stocker.Application.Features.Identity.Commands.Login.AuthResponse>(
                Stocker.SharedKernel.Results.Error.Failure("Auth.GenerationError", "Failed to generate authentication response"));
        }
    }

    public async Task<Stocker.SharedKernel.Results.Result<Stocker.Application.Features.Identity.Commands.Login.AuthResponse>> AuthenticateAsync(string email, string password, CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("AuthenticateAsync called for email: {Email}", email);

            // Get tenant context from middleware
            var tenantId = _tenantService.GetCurrentTenantId();
            _logger.LogDebug("Tenant context from middleware: {TenantId}", tenantId);

            // Use existing LoginAsync method
            var loginRequest = new LoginRequest
            {
                Username = email,
                Password = password,
                TenantId = tenantId
            };

            var authResult = await LoginAsync(loginRequest);

            // Convert AuthenticationResult to Result<AuthResponse>
            if (!authResult.Success)
            {
                return Stocker.SharedKernel.Results.Result.Failure<Stocker.Application.Features.Identity.Commands.Login.AuthResponse>(
                    Stocker.SharedKernel.Results.Error.Validation("Auth.Failed", authResult.Errors?.FirstOrDefault() ?? "Authentication failed"));
            }

            var authResponse = new Stocker.Application.Features.Identity.Commands.Login.AuthResponse
            {
                AccessToken = authResult.AccessToken ?? string.Empty,
                RefreshToken = authResult.RefreshToken ?? string.Empty,
                ExpiresAt = authResult.AccessTokenExpiration ?? DateTime.UtcNow.AddMinutes(60),
                TokenType = "Bearer",
                User = new Stocker.Application.Features.Identity.Commands.Login.UserInfo
                {
                    Id = authResult.User.Id,
                    Username = authResult.User.Username,
                    Email = authResult.User.Email,
                    FullName = authResult.User.FullName,
                    TenantId = authResult.User.TenantId,
                    TenantName = authResult.User.TenantName,
                    Roles = authResult.User.Roles ?? new List<string>()
                },
                Requires2FA = false,
                TempToken = null
            };

            return Stocker.SharedKernel.Results.Result.Success(authResponse);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in AuthenticateAsync for email: {Email}", email);
            return Stocker.SharedKernel.Results.Result.Failure<Stocker.Application.Features.Identity.Commands.Login.AuthResponse>(
                Stocker.SharedKernel.Results.Error.Failure("Auth.Error", "An error occurred during authentication"));
        }
    }

    public async Task<Stocker.SharedKernel.Results.Result<Stocker.Application.Features.Identity.Commands.Login.AuthResponse>> AuthenticateMasterUserAsync(string email, string password, CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("AuthenticateMasterUserAsync called for email: {Email}", email);

            // For master user authentication with tenant context selection (mobile app flow)
            // The tenant context should be available from middleware via X-Tenant-Code header
            var tenantId = _tenantService.GetCurrentTenantId();
            _logger.LogInformation("Master user authentication - Tenant context: {TenantId}", tenantId);

            // Use existing LoginAsync method which handles master users
            var loginRequest = new LoginRequest
            {
                Username = email,
                Password = password,
                TenantId = tenantId  // Pass tenant context for token generation
            };

            var authResult = await LoginAsync(loginRequest);

            // Convert AuthenticationResult to Result<AuthResponse>
            if (!authResult.Success)
            {
                return Stocker.SharedKernel.Results.Result.Failure<Stocker.Application.Features.Identity.Commands.Login.AuthResponse>(
                    Stocker.SharedKernel.Results.Error.Validation("Auth.Failed", authResult.Errors?.FirstOrDefault() ?? "Authentication failed"));
            }

            var authResponse = new Stocker.Application.Features.Identity.Commands.Login.AuthResponse
            {
                AccessToken = authResult.AccessToken ?? string.Empty,
                RefreshToken = authResult.RefreshToken ?? string.Empty,
                ExpiresAt = authResult.AccessTokenExpiration ?? DateTime.UtcNow.AddMinutes(60),
                TokenType = "Bearer",
                User = new Stocker.Application.Features.Identity.Commands.Login.UserInfo
                {
                    Id = authResult.User.Id,
                    Username = authResult.User.Username,
                    Email = authResult.User.Email,
                    FullName = authResult.User.FullName,
                    TenantId = authResult.User.TenantId,
                    TenantName = authResult.User.TenantName,
                    Roles = authResult.User.Roles ?? new List<string>()
                },
                Requires2FA = false,
                TempToken = null
            };

            return Stocker.SharedKernel.Results.Result.Success(authResponse);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in AuthenticateMasterUserAsync for email: {Email}", email);
            return Stocker.SharedKernel.Results.Result.Failure<Stocker.Application.Features.Identity.Commands.Login.AuthResponse>(
                Stocker.SharedKernel.Results.Error.Failure("Auth.Error", "An error occurred during master user authentication"));
        }
    }

    public async Task<Stocker.SharedKernel.Results.Result<Stocker.Application.Features.Identity.Commands.Login.AuthResponse>> RefreshTokenAsync(string refreshToken, string? ipAddress = null, string? userAgent = null, CancellationToken cancellationToken = default)
    {
        try
        {
            // Find user by refresh token
            var masterUser = await _masterContext.MasterUsers
                .FirstOrDefaultAsync(u => u.RefreshToken == refreshToken, cancellationToken);

            if (masterUser == null)
            {
                return Stocker.SharedKernel.Results.Result.Failure<Stocker.Application.Features.Identity.Commands.Login.AuthResponse>(
                    Stocker.SharedKernel.Results.Error.Validation("Auth.InvalidToken", "Geçersiz yenileme token'ı"));
            }

            // Validate refresh token expiry
            if (masterUser.RefreshTokenExpiryTime <= DateTime.UtcNow)
            {
                return Stocker.SharedKernel.Results.Result.Failure<Stocker.Application.Features.Identity.Commands.Login.AuthResponse>(
                    Stocker.SharedKernel.Results.Error.Validation("Auth.TokenExpired", "Yenileme token'ı süresi dolmuş"));
            }

            // Generate new tokens
            var authResult = await _tokenGenerationService.GenerateForMasterUserAsync(masterUser, null);

            var authResponse = new Stocker.Application.Features.Identity.Commands.Login.AuthResponse
            {
                AccessToken = authResult.AccessToken ?? string.Empty,
                RefreshToken = authResult.RefreshToken ?? string.Empty,
                ExpiresAt = authResult.AccessTokenExpiration ?? DateTime.UtcNow.AddMinutes(60),
                TokenType = "Bearer",
                User = new Stocker.Application.Features.Identity.Commands.Login.UserInfo
                {
                    Id = authResult.User.Id,
                    Username = authResult.User.Username,
                    Email = authResult.User.Email,
                    FullName = authResult.User.FullName,
                    TenantId = authResult.User.TenantId,
                    TenantName = authResult.User.TenantName,
                    Roles = authResult.User.Roles ?? new List<string>()
                },
                Requires2FA = false,
                TempToken = null
            };

            _logger.LogInformation("Token refreshed for user {UserId} from IP {IpAddress}", masterUser.Id, ipAddress ?? "unknown");
            return Stocker.SharedKernel.Results.Result.Success(authResponse);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error refreshing token");
            return Stocker.SharedKernel.Results.Result.Failure<Stocker.Application.Features.Identity.Commands.Login.AuthResponse>(
                Stocker.SharedKernel.Results.Error.Failure("Auth.RefreshError", "Token yenileme sırasında bir hata oluştu"));
        }
    }

    public async Task<Stocker.SharedKernel.Results.Result> RevokeRefreshTokenAsync(string userId, CancellationToken cancellationToken = default)
    {
        try
        {
            if (!Guid.TryParse(userId, out var userGuid))
            {
                return Stocker.SharedKernel.Results.Result.Failure(
                    Stocker.SharedKernel.Results.Error.Validation("User.InvalidId", "Geçersiz kullanıcı ID'si"));
            }

            var masterUser = await _masterContext.MasterUsers.FindAsync(new object[] { userGuid }, cancellationToken);
            if (masterUser == null)
            {
                return Stocker.SharedKernel.Results.Result.Failure(
                    Stocker.SharedKernel.Results.Error.NotFound("User.NotFound", "Kullanıcı bulunamadı"));
            }

            masterUser.RevokeRefreshToken();
            await _masterContext.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Refresh token revoked for user {UserId}", userId);
            return Stocker.SharedKernel.Results.Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error revoking refresh token for user {UserId}", userId);
            return Stocker.SharedKernel.Results.Result.Failure(
                Stocker.SharedKernel.Results.Error.Failure("Auth.RevokeError", "Token iptal edilirken bir hata oluştu"));
        }
    }

    public async Task<Stocker.SharedKernel.Results.Result> ChangePasswordAsync(string userId, string currentPassword, string newPassword, CancellationToken cancellationToken = default)
    {
        try
        {
            if (!Guid.TryParse(userId, out var userGuid))
            {
                return Stocker.SharedKernel.Results.Result.Failure(
                    Stocker.SharedKernel.Results.Error.Validation("User.InvalidId", "Geçersiz kullanıcı ID'si"));
            }

            var masterUser = await _masterContext.MasterUsers.FindAsync(new object[] { userGuid }, cancellationToken);
            if (masterUser == null)
            {
                return Stocker.SharedKernel.Results.Result.Failure(
                    Stocker.SharedKernel.Results.Error.NotFound("User.NotFound", "Kullanıcı bulunamadı"));
            }

            // Verify current password
            if (!_passwordService.VerifyPassword(masterUser.Password, currentPassword))
            {
                return Stocker.SharedKernel.Results.Result.Failure(
                    Stocker.SharedKernel.Results.Error.Validation("Auth.InvalidPassword", "Mevcut şifre yanlış"));
            }

            // Validate and create new password
            var validationResult = _passwordService.ValidatePassword(newPassword, masterUser.Username, masterUser.Email.Value);
            if (validationResult.IsFailure)
            {
                return Stocker.SharedKernel.Results.Result.Failure(validationResult.Errors.First());
            }

            // Create new hashed password
            var newHashedPassword = _passwordService.CreateHashedPassword(newPassword, masterUser.Username, masterUser.Email.Value);
            var combinedHash = _passwordService.GetCombinedHash(newHashedPassword);
            masterUser.UpdatePassword(combinedHash);

            await _masterContext.SaveChangesAsync(cancellationToken);
            _logger.LogInformation("Password changed for user {UserId}", userId);

            return Stocker.SharedKernel.Results.Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error changing password for user {UserId}", userId);
            return Stocker.SharedKernel.Results.Result.Failure(
                Stocker.SharedKernel.Results.Error.Failure("Auth.ChangePasswordError", "Şifre değiştirilirken bir hata oluştu"));
        }
    }

    public async Task<Stocker.SharedKernel.Results.Result<string>> GeneratePasswordResetTokenAsync(string email, string? tenantCode = null, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("DEBUG GeneratePasswordResetTokenAsync ENTRY: Email={Email}, TenantCode={TenantCode}", email, tenantCode ?? "null");

        try
        {
            // If tenant code is provided, search directly in that tenant's database (optimized path)
            if (!string.IsNullOrWhiteSpace(tenantCode))
            {
                _logger.LogInformation("Password reset with tenant code: {TenantCode} for email: {Email}", tenantCode, email);

                // Find tenant by code
                var tenant = await _masterContext.Tenants
                    .Where(t => t.IsActive && EF.Functions.Like(t.Code, tenantCode))
                    .FirstOrDefaultAsync(cancellationToken);

                if (tenant != null)
                {
                    try
                    {
                        await using var tenantContext = await _tenantDbContextFactory.CreateDbContextAsync(tenant.Id);

                        var tenantUser = await tenantContext.TenantUsers
                            .FirstOrDefaultAsync(u => EF.Functions.Like(u.Email.Value, email), cancellationToken);

                        if (tenantUser != null)
                        {
                            // Generate reset token for TenantUser
                            tenantUser.GeneratePasswordResetToken();
                            await tenantContext.SaveChangesAsync(cancellationToken);

                            _logger.LogInformation("Password reset token generated for TenantUser: {Email} in Tenant: {TenantCode}", email, tenantCode);
                            return Stocker.SharedKernel.Results.Result.Success(tenantUser.PasswordResetToken!);
                        }
                    }
                    catch (Exception tenantEx)
                    {
                        _logger.LogWarning(tenantEx, "Error searching for user in tenant {TenantCode}", tenantCode);
                    }
                }
                else
                {
                    _logger.LogWarning("Tenant not found with code: {TenantCode}", tenantCode);
                }

                // User not found in specified tenant
                _logger.LogWarning("Password reset requested for non-existent email in tenant {TenantCode}: {Email}", tenantCode, email);
                return Stocker.SharedKernel.Results.Result.Failure<string>(
                    Stocker.SharedKernel.Results.Error.NotFound("User", $"User with email {email} not found in workspace {tenantCode}"));
            }

            // No tenant code provided - this is for MasterUsers (Tenant Admins / Firma Yöneticileri)
            _logger.LogInformation("Password reset for MasterUser (no tenant code): {Email}", email);

            var masterUser = await _userManagementService.FindMasterUserAsync(email);
            if (masterUser != null)
            {
                // Generate reset token for MasterUser
                masterUser.GeneratePasswordResetToken();

                // Log token details for debugging
                _logger.LogInformation("DEBUG TOKEN GENERATION: Email={Email}, Token='{Token}', TokenLength={Length}, Expiry={Expiry}",
                    email, masterUser.PasswordResetToken, masterUser.PasswordResetToken?.Length ?? 0, masterUser.PasswordResetTokenExpiry);

                await _masterContext.SaveChangesAsync(cancellationToken);

                // Verify token was saved by re-querying
                var savedUser = await _masterContext.MasterUsers
                    .Where(u => u.Id == masterUser.Id)
                    .Select(u => new { u.PasswordResetToken, u.PasswordResetTokenExpiry })
                    .FirstOrDefaultAsync(cancellationToken);

                _logger.LogInformation("DEBUG TOKEN SAVED: Email={Email}, SavedToken='{Token}', SavedExpiry={Expiry}",
                    email, savedUser?.PasswordResetToken, savedUser?.PasswordResetTokenExpiry);

                _logger.LogInformation("Password reset token generated for MasterUser: {Email}", email);
                return Stocker.SharedKernel.Results.Result.Success(masterUser.PasswordResetToken!);
            }

            // User not found
            _logger.LogWarning("Password reset requested for non-existent MasterUser email: {Email}", email);
            return Stocker.SharedKernel.Results.Result.Failure<string>(
                Stocker.SharedKernel.Results.Error.NotFound("User", $"User with email {email} not found"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating password reset token for: {Email}", email);
            return Stocker.SharedKernel.Results.Result.Failure<string>(
                Stocker.SharedKernel.Results.Error.Failure("PasswordReset.Failed", ex.Message));
        }
    }

    public async Task<Stocker.SharedKernel.Results.Result> ResetPasswordAsync(string email, string token, string newPassword, CancellationToken cancellationToken = default)
    {
        try
        {
            // Normalize token to URL-safe Base64 format (as stored in database)
            // Database stores tokens with: + -> -, / -> _, trailing = removed
            var normalizedToken = token
                .Replace("+", "-")
                .Replace("/", "_")
                .TrimEnd('=');

            // First try to find in master users
            var masterUser = await _userManagementService.FindMasterUserAsync(email);
            if (masterUser != null && (masterUser.PasswordResetToken == token || masterUser.PasswordResetToken == normalizedToken))
            {
                // Check if token is expired
                if (masterUser.PasswordResetTokenExpiry <= DateTime.UtcNow)
                {
                    return Stocker.SharedKernel.Results.Result.Failure(
                        Stocker.SharedKernel.Results.Error.Validation("Token.Expired", "Şifre sıfırlama token'ı süresi dolmuş"));
                }

                // Validate new password
                var validationResult = _passwordService.ValidatePassword(newPassword, masterUser.Username, masterUser.Email.Value);
                if (validationResult.IsFailure)
                {
                    return Stocker.SharedKernel.Results.Result.Failure(validationResult.Errors.First());
                }

                // Create new hashed password
                var newHashedPassword = _passwordService.CreateHashedPassword(newPassword, masterUser.Username, masterUser.Email.Value);
                var combinedHash = _passwordService.GetCombinedHash(newHashedPassword);
                masterUser.UpdatePassword(combinedHash);
                masterUser.ClearPasswordResetToken();

                await _masterContext.SaveChangesAsync(cancellationToken);
                _logger.LogInformation("Password reset completed for MasterUser: {Email}", email);

                return Stocker.SharedKernel.Results.Result.Success();
            }

            // If not found in master users, search in tenant users
            var tenants = await _masterContext.Tenants
                .Where(t => t.IsActive)
                .ToListAsync(cancellationToken);

            foreach (var tenant in tenants)
            {
                try
                {
                    await using var tenantContext = await _tenantDbContextFactory.CreateDbContextAsync(tenant.Id);

                    var tenantUser = await tenantContext.TenantUsers
                        .FirstOrDefaultAsync(u => EF.Functions.Like(u.Email.Value, email) && (u.PasswordResetToken == token || u.PasswordResetToken == normalizedToken), cancellationToken);

                    if (tenantUser != null)
                    {
                        // Check if token is expired
                        if (tenantUser.PasswordResetTokenExpiry <= DateTime.UtcNow)
                        {
                            return Stocker.SharedKernel.Results.Result.Failure(
                                Stocker.SharedKernel.Results.Error.Validation("Token.Expired", "Şifre sıfırlama token'ı süresi dolmuş"));
                        }

                        // Get associated master user
                        var associatedMasterUser = await _masterContext.MasterUsers.FindAsync(new object[] { tenantUser.MasterUserId }, cancellationToken);
                        if (associatedMasterUser == null)
                        {
                            return Stocker.SharedKernel.Results.Result.Failure(
                                Stocker.SharedKernel.Results.Error.NotFound("User.NotFound", "İlişkili kullanıcı bulunamadı"));
                        }

                        // Validate new password
                        var validationResult = _passwordService.ValidatePassword(newPassword, tenantUser.Username, tenantUser.Email.Value);
                        if (validationResult.IsFailure)
                        {
                            return Stocker.SharedKernel.Results.Result.Failure(validationResult.Errors.First());
                        }

                        // Update password in master user (password is stored there)
                        var newHashedPassword = _passwordService.CreateHashedPassword(newPassword, tenantUser.Username, tenantUser.Email.Value);
                        var combinedHash = _passwordService.GetCombinedHash(newHashedPassword);
                        associatedMasterUser.UpdatePassword(combinedHash);

                        // Clear reset token in tenant user
                        tenantUser.ClearPasswordResetToken();

                        await tenantContext.SaveChangesAsync(cancellationToken);
                        await _masterContext.SaveChangesAsync(cancellationToken);

                        _logger.LogInformation("Password reset completed for TenantUser: {Email} in Tenant: {TenantId}", email, tenant.Id);
                        return Stocker.SharedKernel.Results.Result.Success();
                    }
                }
                catch (Exception tenantEx)
                {
                    _logger.LogWarning(tenantEx, "Error searching for user in tenant {TenantId}", tenant.Id);
                }
            }

            return Stocker.SharedKernel.Results.Result.Failure(
                Stocker.SharedKernel.Results.Error.Validation("Token.Invalid", "Geçersiz şifre sıfırlama token'ı"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error resetting password for: {Email}", email);
            return Stocker.SharedKernel.Results.Result.Failure(
                Stocker.SharedKernel.Results.Error.Failure("PasswordReset.Failed", "Şifre sıfırlama sırasında bir hata oluştu"));
        }
    }

    public async Task<Stocker.SharedKernel.Results.Result<bool>> ValidateTokenAsync(string token, CancellationToken cancellationToken = default)
    {
        try
        {
            var principal = _jwtTokenService.ValidateToken(token);
            if (principal == null)
            {
                return Stocker.SharedKernel.Results.Result.Success(false);
            }

            // Extract user ID and validate user still exists and is active
            var userIdClaim = principal.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
            {
                return Stocker.SharedKernel.Results.Result.Success(false);
            }

            var masterUser = await _masterContext.MasterUsers
                .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);

            if (masterUser == null || !masterUser.IsActive)
            {
                return Stocker.SharedKernel.Results.Result.Success(false);
            }

            return Stocker.SharedKernel.Results.Result.Success(true);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating token");
            return Stocker.SharedKernel.Results.Result.Failure<bool>(
                Stocker.SharedKernel.Results.Error.Failure("Token.ValidationError", "Token doğrulama sırasında bir hata oluştu"));
        }
    }
}
