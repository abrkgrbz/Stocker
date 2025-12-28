using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Stocker.API.Controllers.Base;
using Stocker.Application.Common.Interfaces;
using Stocker.Domain.Master.ValueObjects;
using Stocker.Persistence.Contexts;
using Swashbuckle.AspNetCore.Annotations;

namespace Stocker.API.Controllers;

/// <summary>
/// User account management (profile, password, activity)
/// </summary>
[Route("api/[controller]")]
[ApiController]
[Authorize]
[SwaggerTag("User Account Management - Profile, Password, Activity")]
public class AccountController : ApiController
{
    private readonly ILogger<AccountController> _logger;
    private readonly ICurrentUserService _currentUserService;
    private readonly IPasswordService _passwordService;
    private readonly IProfileImageStorageService _profileImageStorageService;
    private readonly MasterDbContext _masterContext;
    private readonly TenantDbContext _tenantContext;

    public AccountController(
        ILogger<AccountController> logger,
        ICurrentUserService currentUserService,
        IPasswordService passwordService,
        IProfileImageStorageService profileImageStorageService,
        MasterDbContext masterContext,
        TenantDbContext tenantContext)
    {
        _logger = logger;
        _currentUserService = currentUserService;
        _passwordService = passwordService;
        _profileImageStorageService = profileImageStorageService;
        _masterContext = masterContext;
        _tenantContext = tenantContext;
    }

    /// <summary>
    /// Get current user's profile
    /// </summary>
    [HttpGet("profile")]
    [ProducesResponseType(typeof(ApiResponse<ProfileDto>), 200)]
    public async Task<IActionResult> GetProfile()
    {
        try
        {
            var userId = _currentUserService.UserId;
            var isMasterAdmin = _currentUserService.IsMasterAdmin;

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Kullanici kimligi bulunamadi"
                });
            }

            if (isMasterAdmin)
            {
                var masterUser = await _masterContext.MasterUsers
                    .AsNoTracking()
                    .FirstOrDefaultAsync(u => u.Id == Guid.Parse(userId));

                if (masterUser == null)
                {
                    return NotFound(new ApiResponse<object>
                    {
                        Success = false,
                        Message = "Kullanici bulunamadi"
                    });
                }

                var profile = new ProfileDto
                {
                    Id = masterUser.Id,
                    Username = masterUser.Username,
                    Email = masterUser.Email.Value,
                    FirstName = masterUser.FirstName,
                    LastName = masterUser.LastName,
                    Phone = masterUser.PhoneNumber?.Value,
                    Role = "SystemAdmin",
                    ProfileImage = masterUser.ProfilePictureUrl,
                    CreatedDate = masterUser.CreatedAt,
                    LastLoginDate = masterUser.LastLoginAt,
                    TwoFactorEnabled = masterUser.TwoFactorEnabled,
                    EmailConfirmed = masterUser.IsEmailVerified,
                    Preferences = new ProfilePreferences
                    {
                        Language = masterUser.PreferredLanguage ?? "tr",
                        Theme = "light",
                        Notifications = true
                    }
                };

                return Ok(new ApiResponse<ProfileDto>
                {
                    Success = true,
                    Data = profile,
                    Message = "Profil bilgileri basariyla yuklendi"
                });
            }
            else
            {
                var tenantUser = await _tenantContext.TenantUsers
                    .AsNoTracking()
                    .Include(u => u.UserRoles)
                    .FirstOrDefaultAsync(u => u.Id == Guid.Parse(userId));

                if (tenantUser == null)
                {
                    return NotFound(new ApiResponse<object>
                    {
                        Success = false,
                        Message = "Kullanici bulunamadi"
                    });
                }

                // Get role name separately since UserRole doesn't have navigation property
                string? roleName = null;
                var userRoleId = tenantUser.UserRoles.FirstOrDefault()?.RoleId;
                if (userRoleId.HasValue)
                {
                    var role = await _tenantContext.Roles.AsNoTracking()
                        .FirstOrDefaultAsync(r => r.Id == userRoleId.Value);
                    roleName = role?.Name;
                }

                var profile = new ProfileDto
                {
                    Id = tenantUser.Id,
                    Username = tenantUser.Username,
                    Email = tenantUser.Email.Value,
                    FirstName = tenantUser.FirstName,
                    LastName = tenantUser.LastName,
                    Phone = tenantUser.Phone?.Value,
                    Role = roleName,
                    DepartmentId = tenantUser.DepartmentId,
                    BranchId = tenantUser.BranchId,
                    ProfileImage = tenantUser.ProfilePictureUrl,
                    CreatedDate = tenantUser.CreatedAt,
                    LastLoginDate = tenantUser.LastLoginAt,
                    TwoFactorEnabled = false,
                    EmailConfirmed = true,
                    Preferences = new ProfilePreferences
                    {
                        Language = "tr",
                        Theme = "light",
                        Notifications = true
                    }
                };

                return Ok(new ApiResponse<ProfileDto>
                {
                    Success = true,
                    Data = profile,
                    Message = "Profil bilgileri basariyla yuklendi"
                });
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user profile");
            return StatusCode(500, new ApiResponse<object>
            {
                Success = false,
                Message = "Profil bilgileri alinirken bir hata olustu"
            });
        }
    }

    /// <summary>
    /// Update current user's profile
    /// </summary>
    [HttpPut("profile")]
    [ProducesResponseType(typeof(ApiResponse<bool>), 200)]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        try
        {
            var userId = _currentUserService.UserId;
            var isMasterAdmin = _currentUserService.IsMasterAdmin;

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new ApiResponse<bool>
                {
                    Success = false,
                    Message = "Kullanici kimligi bulunamadi"
                });
            }

            if (isMasterAdmin)
            {
                var masterUser = await _masterContext.MasterUsers
                    .FirstOrDefaultAsync(u => u.Id == Guid.Parse(userId));

                if (masterUser == null)
                {
                    return NotFound(new ApiResponse<bool>
                    {
                        Success = false,
                        Message = "Kullanici bulunamadi"
                    });
                }

                // Update profile using domain method
                masterUser.UpdateProfile(
                    request.FirstName ?? masterUser.FirstName,
                    request.LastName ?? masterUser.LastName,
                    masterUser.PhoneNumber);

                await _masterContext.SaveChangesAsync();
            }
            else
            {
                var tenantUser = await _tenantContext.TenantUsers
                    .FirstOrDefaultAsync(u => u.Id == Guid.Parse(userId));

                if (tenantUser == null)
                {
                    return NotFound(new ApiResponse<bool>
                    {
                        Success = false,
                        Message = "Kullanici bulunamadi"
                    });
                }

                // Update using domain methods if available, or direct update
                tenantUser.UpdateProfile(request.FirstName ?? tenantUser.FirstName, request.LastName ?? tenantUser.LastName);

                await _tenantContext.SaveChangesAsync();
            }

            _logger.LogInformation("Profile updated for user: {UserId}", userId);

            return Ok(new ApiResponse<bool>
            {
                Success = true,
                Data = true,
                Message = "Profil basariyla guncellendi"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating profile");
            return StatusCode(500, new ApiResponse<bool>
            {
                Success = false,
                Message = "Profil guncellenirken bir hata olustu"
            });
        }
    }

    /// <summary>
    /// Change current user's password
    /// </summary>
    [HttpPost("change-password")]
    [ProducesResponseType(typeof(ApiResponse<bool>), 200)]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        try
        {
            var userId = _currentUserService.UserId;
            var isMasterAdmin = _currentUserService.IsMasterAdmin;

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new ApiResponse<bool>
                {
                    Success = false,
                    Message = "Kullanici kimligi bulunamadi"
                });
            }

            // Validate passwords match
            if (request.NewPassword != request.ConfirmPassword)
            {
                return BadRequest(new ApiResponse<bool>
                {
                    Success = false,
                    Message = "Yeni sifreler eslesmiyorr"
                });
            }

            // Validate password strength
            var passwordValidation = _passwordService.ValidatePassword(request.NewPassword);
            if (!passwordValidation.IsSuccess)
            {
                return BadRequest(new ApiResponse<bool>
                {
                    Success = false,
                    Message = passwordValidation.Error?.Description ?? "Sifre gereksinimlerini karsilamiyor"
                });
            }

            if (isMasterAdmin)
            {
                var masterUser = await _masterContext.MasterUsers
                    .FirstOrDefaultAsync(u => u.Id == Guid.Parse(userId));

                if (masterUser == null)
                {
                    return NotFound(new ApiResponse<bool>
                    {
                        Success = false,
                        Message = "Kullanici bulunamadi"
                    });
                }

                // Verify current password and change (domain method does both)
                try
                {
                    masterUser.ChangePassword(request.CurrentPassword, request.NewPassword);
                }
                catch (InvalidOperationException)
                {
                    return BadRequest(new ApiResponse<bool>
                    {
                        Success = false,
                        Message = "Mevcut sifre hatali"
                    });
                }

                await _masterContext.SaveChangesAsync();
            }
            else
            {
                var tenantUser = await _tenantContext.TenantUsers
                    .FirstOrDefaultAsync(u => u.Id == Guid.Parse(userId));

                if (tenantUser == null)
                {
                    return NotFound(new ApiResponse<bool>
                    {
                        Success = false,
                        Message = "Kullanici bulunamadi"
                    });
                }

                // Verify current password - TenantUser uses string PasswordHash
                var currentHashedPassword = HashedPassword.CreateFromHash(tenantUser.PasswordHash);
                if (!_passwordService.VerifyPassword(currentHashedPassword, request.CurrentPassword))
                {
                    return BadRequest(new ApiResponse<bool>
                    {
                        Success = false,
                        Message = "Mevcut sifre hatali"
                    });
                }

                // Hash and update new password using TenantUser.UpdatePassword
                var newHashedPassword = _passwordService.HashPassword(request.NewPassword);
                tenantUser.UpdatePassword(_passwordService.GetCombinedHash(newHashedPassword));

                await _tenantContext.SaveChangesAsync();
            }

            _logger.LogInformation("Password changed for user: {UserId}", userId);

            return Ok(new ApiResponse<bool>
            {
                Success = true,
                Data = true,
                Message = "Sifre basariyla degistirildi"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error changing password");
            return StatusCode(500, new ApiResponse<bool>
            {
                Success = false,
                Message = "Sifre degistirilirken bir hata olustu"
            });
        }
    }

    /// <summary>
    /// Get user's activity log
    /// </summary>
    [HttpGet("activity-log")]
    [ProducesResponseType(typeof(ApiResponse<ActivityLogResponse>), 200)]
    public async Task<IActionResult> GetActivityLog([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        try
        {
            var userId = _currentUserService.UserId;
            var isMasterAdmin = _currentUserService.IsMasterAdmin;
            var tenantId = _currentUserService.TenantId;

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Kullanici kimligi bulunamadi"
                });
            }

            List<ActivityLogItem> activities = new();
            int totalItems = 0;

            if (isMasterAdmin)
            {
                var loginHistory = await _masterContext.UserLoginHistories
                    .AsNoTracking()
                    .Where(h => h.UserId == Guid.Parse(userId))
                    .OrderByDescending(h => h.LoginAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(h => new ActivityLogItem
                    {
                        Id = h.Id,
                        Action = "Login",
                        Description = h.IsSuccessful ? "Basarili giris" : "Basarisiz giris denemesi",
                        IpAddress = h.IpAddress,
                        Device = h.UserAgent,
                        Timestamp = h.LoginAt,
                        Status = h.IsSuccessful ? "Success" : "Failed"
                    })
                    .ToListAsync();

                activities.AddRange(loginHistory);

                totalItems = await _masterContext.UserLoginHistories
                    .Where(h => h.UserId == Guid.Parse(userId))
                    .CountAsync();
            }
            else if (!string.IsNullOrEmpty(tenantId))
            {
                // For tenant users, get from AuditLogs
                var auditLogs = await _tenantContext.AuditLogs
                    .AsNoTracking()
                    .Where(a => a.UserId == userId)
                    .OrderByDescending(a => a.Timestamp)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(a => new ActivityLogItem
                    {
                        Id = a.Id,
                        Action = a.Action,
                        Description = $"{a.Action} - {a.EntityName}",
                        IpAddress = a.IpAddress,
                        Device = a.UserAgent,
                        Timestamp = a.Timestamp,
                        Status = "Success"
                    })
                    .ToListAsync();

                activities.AddRange(auditLogs);

                totalItems = await _tenantContext.AuditLogs
                    .Where(a => a.UserId == userId)
                    .CountAsync();
            }

            var response = new ActivityLogResponse
            {
                Items = activities,
                TotalItems = totalItems,
                Page = page,
                PageSize = pageSize,
                TotalPages = (int)Math.Ceiling(totalItems / (double)pageSize)
            };

            return Ok(new ApiResponse<ActivityLogResponse>
            {
                Success = true,
                Data = response,
                Message = "Aktivite gecmisi basariyla yuklendi"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting activity log");
            return StatusCode(500, new ApiResponse<object>
            {
                Success = false,
                Message = "Aktivite gecmisi alinirken bir hata olustu"
            });
        }
    }

    /// <summary>
    /// Upload profile image
    /// </summary>
    [HttpPost("profile-image")]
    [ProducesResponseType(typeof(ApiResponse<ProfileImageResponse>), 200)]
    public async Task<IActionResult> UploadProfileImage(IFormFile file)
    {
        try
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Dosya secilmedi"
                });
            }

            // Validate file type
            var allowedTypes = new[] { "image/jpeg", "image/jpg", "image/png", "image/gif" };
            if (!allowedTypes.Contains(file.ContentType.ToLower()))
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Sadece resim dosyalari yuklenebilir (JPG, PNG, GIF)"
                });
            }

            // Validate file size (max 5MB)
            if (file.Length > 5 * 1024 * 1024)
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Dosya boyutu 5MB'dan buyuk olamaz"
                });
            }

            var userId = _currentUserService.UserId;
            var isMasterAdmin = _currentUserService.IsMasterAdmin;
            var tenantId = _currentUserService.TenantId;

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Kullanici kimligi bulunamadi"
                });
            }

            var userGuid = Guid.Parse(userId);
            Guid? tenantGuid = !string.IsNullOrEmpty(tenantId) ? Guid.Parse(tenantId) : null;

            // Upload to MinIO (tenant bucket or master bucket)
            using var stream = file.OpenReadStream();
            var uploadResult = await _profileImageStorageService.UploadProfileImageAsync(
                isMasterAdmin ? null : tenantGuid,
                userGuid,
                stream,
                file.ContentType,
                file.FileName);

            if (uploadResult.IsFailure)
            {
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = uploadResult.Error?.Description ?? "Profil resmi yuklenirken bir hata olustu"
                });
            }

            var imageUrl = uploadResult.Value;

            // Update user profile image path in database
            if (isMasterAdmin)
            {
                var masterUser = await _masterContext.MasterUsers
                    .FirstOrDefaultAsync(u => u.Id == userGuid);
                if (masterUser != null)
                {
                    masterUser.UpdateProfilePicture(imageUrl);
                    await _masterContext.SaveChangesAsync();
                }
            }
            else
            {
                var tenantUser = await _tenantContext.TenantUsers
                    .FirstOrDefaultAsync(u => u.Id == userGuid);
                if (tenantUser != null)
                {
                    tenantUser.UpdateProfilePicture(imageUrl);
                    await _tenantContext.SaveChangesAsync();
                }
            }

            _logger.LogInformation(
                "Profile image uploaded to MinIO. UserId: {UserId}, TenantId: {TenantId}, IsMasterAdmin: {IsMasterAdmin}",
                userId, tenantId, isMasterAdmin);

            return Ok(new ApiResponse<ProfileImageResponse>
            {
                Success = true,
                Data = new ProfileImageResponse { ImageUrl = imageUrl },
                Message = "Profil resmi basariyla yuklendi"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading profile image");
            return StatusCode(500, new ApiResponse<object>
            {
                Success = false,
                Message = "Profil resmi yuklenirken bir hata olustu"
            });
        }
    }

    /// <summary>
    /// Update user preferences
    /// </summary>
    [HttpPut("preferences")]
    [ProducesResponseType(typeof(ApiResponse<bool>), 200)]
    public async Task<IActionResult> UpdatePreferences([FromBody] UpdatePreferencesRequest request)
    {
        try
        {
            var userId = _currentUserService.UserId;
            var isMasterAdmin = _currentUserService.IsMasterAdmin;

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new ApiResponse<bool>
                {
                    Success = false,
                    Message = "Kullanici kimligi bulunamadi"
                });
            }

            if (isMasterAdmin)
            {
                var masterUser = await _masterContext.MasterUsers
                    .FirstOrDefaultAsync(u => u.Id == Guid.Parse(userId));

                if (masterUser != null && !string.IsNullOrEmpty(request.Language))
                {
                    // UpdateProfile has preferredLanguage as optional parameter
                    masterUser.UpdateProfile(
                        masterUser.FirstName,
                        masterUser.LastName,
                        masterUser.PhoneNumber,
                        masterUser.Timezone,
                        request.Language);
                    await _masterContext.SaveChangesAsync();
                }
            }

            _logger.LogInformation("Preferences updated for user: {UserId}", userId);

            return Ok(new ApiResponse<bool>
            {
                Success = true,
                Data = true,
                Message = "Tercihler basariyla guncellendi"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating preferences");
            return StatusCode(500, new ApiResponse<bool>
            {
                Success = false,
                Message = "Tercihler guncellenirken bir hata olustu"
            });
        }
    }
}

#region DTOs

public class ProfileDto
{
    public Guid Id { get; set; }
    public string? Username { get; set; }
    public string? Email { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Phone { get; set; }
    public string? Role { get; set; }
    public Guid? DepartmentId { get; set; }
    public string? Department { get; set; }
    public Guid? BranchId { get; set; }
    public string? Branch { get; set; }
    public string? ProfileImage { get; set; }
    public DateTime? CreatedDate { get; set; }
    public DateTime? LastLoginDate { get; set; }
    public bool TwoFactorEnabled { get; set; }
    public bool EmailConfirmed { get; set; }
    public bool PhoneConfirmed { get; set; }
    public ProfilePreferences? Preferences { get; set; }
}

public class ProfilePreferences
{
    public string Language { get; set; } = "tr";
    public string Theme { get; set; } = "light";
    public bool Notifications { get; set; } = true;
}

public class UpdateProfileRequest
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Phone { get; set; }
    public string? Department { get; set; }
    public string? Branch { get; set; }
}

public class ChangePasswordRequest
{
    public string CurrentPassword { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
    public string ConfirmPassword { get; set; } = string.Empty;
}

public class ActivityLogResponse
{
    public List<ActivityLogItem> Items { get; set; } = new();
    public int TotalItems { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
}

public class ActivityLogItem
{
    public Guid Id { get; set; }
    public string? Action { get; set; }
    public string? Description { get; set; }
    public string? IpAddress { get; set; }
    public string? Device { get; set; }
    public DateTime? Timestamp { get; set; }
    public string? Status { get; set; }
}

public class ProfileImageResponse
{
    public string? ImageUrl { get; set; }
}

public class UpdatePreferencesRequest
{
    public string? Language { get; set; }
    public string? Theme { get; set; }
    public bool? Notifications { get; set; }
}

#endregion
