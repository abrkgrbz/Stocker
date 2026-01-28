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
    private readonly ITenantDeletionService _tenantDeletionService;
    private readonly MasterDbContext _masterContext;
    private readonly TenantDbContext _tenantContext;

    public AccountController(
        ILogger<AccountController> logger,
        ICurrentUserService currentUserService,
        IPasswordService passwordService,
        IProfileImageStorageService profileImageStorageService,
        ITenantDeletionService tenantDeletionService,
        MasterDbContext masterContext,
        TenantDbContext tenantContext)
    {
        _logger = logger;
        _currentUserService = currentUserService;
        _passwordService = passwordService;
        _profileImageStorageService = profileImageStorageService;
        _tenantDeletionService = tenantDeletionService;
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
            var tenantId = _currentUserService.TenantId;

            _logger.LogInformation("GetProfile called - UserId: {UserId}, IsMasterAdmin: {IsMasterAdmin}, TenantId: {TenantId}",
                userId, isMasterAdmin, tenantId);

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
                // Debug: Check what database we're connected to
                var dbName = _tenantContext.Database.GetDbConnection().Database;
                _logger.LogInformation("Searching for user {UserId} in tenant database: {DbName}", userId, dbName);

                var userGuid = Guid.Parse(userId);

                // Try to find by TenantUser.Id first (for users created directly)
                // Then try by MasterUserId (for users created via tenant registration)
                // This is needed because JWT token contains MasterUser.Id but TenantUser has its own Id
                var tenantUser = await _tenantContext.TenantUsers
                    .AsNoTracking()
                    .Include(u => u.UserRoles)
                    .FirstOrDefaultAsync(u => u.Id == userGuid || u.MasterUserId == userGuid);

                if (tenantUser == null)
                {
                    _logger.LogWarning("User {UserId} not found by Id or MasterUserId in tenant database {DbName}", userId, dbName);
                    return NotFound(new ApiResponse<object>
                    {
                        Success = false,
                        Message = "Kullanici bulunamadi"
                    });
                }

                _logger.LogInformation("Found TenantUser - Id: {TenantUserId}, MasterUserId: {MasterUserId}",
                    tenantUser.Id, tenantUser.MasterUserId);

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
                // UserLoginHistory has been consolidated into SecurityAuditLogs
                var loginHistory = await _masterContext.SecurityAuditLogs
                    .AsNoTracking()
                    .Where(h => h.UserId == Guid.Parse(userId) &&
                           (h.Event == "login_success" || h.Event == "login_failed"))
                    .OrderByDescending(h => h.Timestamp)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(h => new ActivityLogItem
                    {
                        Id = h.Id,
                        Action = "Login",
                        Description = h.Event == "login_success" ? "Basarili giris" : "Basarisiz giris denemesi",
                        IpAddress = h.IpAddress,
                        Device = h.UserAgent,
                        Timestamp = h.Timestamp,
                        Status = h.Event == "login_success" ? "Success" : "Failed"
                    })
                    .ToListAsync();

                activities.AddRange(loginHistory);

                totalItems = await _masterContext.SecurityAuditLogs
                    .Where(h => h.UserId == Guid.Parse(userId) &&
                           (h.Event == "login_success" || h.Event == "login_failed"))
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
    /// Get deletion preview - shows what will be deleted (for tenant owners: entire tenant)
    /// </summary>
    [HttpGet("delete/preview")]
    [ProducesResponseType(typeof(ApiResponse<DeleteAccountPreviewDto>), 200)]
    public async Task<IActionResult> GetDeletePreview()
    {
        try
        {
            var userId = _currentUserService.UserId;
            var tenantId = _currentUserService.TenantId;
            var isMasterAdmin = _currentUserService.IsMasterAdmin;

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Kullanici kimligi bulunamadi"
                });
            }

            var preview = new DeleteAccountPreviewDto();

            if (isMasterAdmin)
            {
                var masterUser = await _masterContext.MasterUsers
                    .AsNoTracking()
                    .FirstOrDefaultAsync(u => u.Id == Guid.Parse(userId));

                if (masterUser != null)
                {
                    preview.Username = masterUser.Username;
                    preview.Email = masterUser.Email.Value;
                    preview.IsOwner = false;
                    preview.WillDeleteTenant = false;
                    preview.Warnings = new List<string>
                    {
                        "Hesabiniz kalici olarak deaktive edilecek",
                        "Tum oturumlariniz sonlandirilacak"
                    };
                }
            }
            else if (!string.IsNullOrEmpty(tenantId))
            {
                var tenantGuid = Guid.Parse(tenantId);
                var userGuid = Guid.Parse(userId);

                var tenantUser = await _tenantContext.TenantUsers
                    .AsNoTracking()
                    .FirstOrDefaultAsync(u => u.Id == userGuid);

                if (tenantUser != null)
                {
                    preview.Username = tenantUser.Username;
                    preview.Email = tenantUser.Email.Value;

                    // Check if user is tenant owner
                    var isOwner = await _tenantDeletionService.IsUserTenantOwnerAsync(userGuid, tenantGuid);
                    preview.IsOwner = isOwner;

                    if (isOwner)
                    {
                        // Get deletion summary for tenant
                        var summary = await _tenantDeletionService.GetDeletionSummaryAsync(tenantGuid);
                        preview.WillDeleteTenant = true;
                        preview.TenantName = summary.TenantName;
                        preview.DatabaseName = summary.DatabaseName;
                        preview.UserCount = summary.UserCount;
                        preview.DataSizeMB = summary.EstimatedDataSizeMB;
                        preview.Warnings = summary.Warnings;
                        preview.Warnings.Insert(0, "DIKKAT: Firma sahibi olarak hesabinizi sildiginizde TUM FIRMA VERILERI SILINECEKTIR!");
                    }
                    else
                    {
                        preview.WillDeleteTenant = false;
                        preview.Warnings = new List<string>
                        {
                            "Hesabiniz kalici olarak deaktive edilecek",
                            "Tum oturumlariniz sonlandirilacak"
                        };
                    }
                }
            }

            return Ok(new ApiResponse<DeleteAccountPreviewDto>
            {
                Success = true,
                Data = preview,
                Message = "Silme onizlemesi yuklendi"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting delete preview");
            return StatusCode(500, new ApiResponse<object>
            {
                Success = false,
                Message = "Onizleme alinirken bir hata olustu"
            });
        }
    }

    /// <summary>
    /// Delete current user's account (GitHub-style confirmation required)
    /// For tenant owners: this will delete the ENTIRE tenant and database!
    /// </summary>
    [HttpDelete("delete")]
    [ProducesResponseType(typeof(ApiResponse<DeleteAccountResultDto>), 200)]
    public async Task<IActionResult> DeleteAccount([FromBody] DeleteAccountRequest request)
    {
        try
        {
            var userId = _currentUserService.UserId;
            var tenantId = _currentUserService.TenantId;
            var isMasterAdmin = _currentUserService.IsMasterAdmin;

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new ApiResponse<DeleteAccountResultDto>
                {
                    Success = false,
                    Message = "Kullanici kimligi bulunamadi"
                });
            }

            var result = new DeleteAccountResultDto();

            // GitHub-style confirmation: user must type their username/email
            if (isMasterAdmin)
            {
                var masterUser = await _masterContext.MasterUsers
                    .FirstOrDefaultAsync(u => u.Id == Guid.Parse(userId));

                if (masterUser == null)
                {
                    return NotFound(new ApiResponse<DeleteAccountResultDto>
                    {
                        Success = false,
                        Message = "Kullanici bulunamadi"
                    });
                }

                // Verify confirmation text matches username or email
                var expectedConfirmation = masterUser.Username ?? masterUser.Email.Value;
                if (!string.Equals(request.ConfirmationText, expectedConfirmation, StringComparison.OrdinalIgnoreCase))
                {
                    return BadRequest(new ApiResponse<DeleteAccountResultDto>
                    {
                        Success = false,
                        Message = "Onay metni eslesmiyor. Lutfen kullanici adinizi veya e-posta adresinizi dogru yazdığinizdan emin olun."
                    });
                }

                // Verify password
                if (!masterUser.Password.Verify(request.Password))
                {
                    return BadRequest(new ApiResponse<DeleteAccountResultDto>
                    {
                        Success = false,
                        Message = "Sifre hatali"
                    });
                }

                // Soft delete - deactivate the user
                masterUser.Delete();
                await _masterContext.SaveChangesAsync();

                result.UserDeleted = true;
                result.TenantDeleted = false;

                _logger.LogWarning("Master user account deleted: {UserId}, {Email}", userId, masterUser.Email.Value);
            }
            else
            {
                var tenantUser = await _tenantContext.TenantUsers
                    .FirstOrDefaultAsync(u => u.Id == Guid.Parse(userId));

                if (tenantUser == null)
                {
                    return NotFound(new ApiResponse<DeleteAccountResultDto>
                    {
                        Success = false,
                        Message = "Kullanici bulunamadi"
                    });
                }

                // Verify confirmation text matches username or email
                var expectedConfirmation = tenantUser.Username ?? tenantUser.Email.Value;
                if (!string.Equals(request.ConfirmationText, expectedConfirmation, StringComparison.OrdinalIgnoreCase))
                {
                    return BadRequest(new ApiResponse<DeleteAccountResultDto>
                    {
                        Success = false,
                        Message = "Onay metni eslesmiyor. Lutfen kullanici adinizi veya e-posta adresinizi dogru yazdığinizdan emin olun."
                    });
                }

                // Verify password
                var hashedPassword = HashedPassword.CreateFromHash(tenantUser.PasswordHash);
                if (!_passwordService.VerifyPassword(hashedPassword, request.Password))
                {
                    return BadRequest(new ApiResponse<DeleteAccountResultDto>
                    {
                        Success = false,
                        Message = "Sifre hatali"
                    });
                }

                // Check if user is tenant owner - if so, delete entire tenant
                var userGuid = Guid.Parse(userId);
                var tenantGuid = !string.IsNullOrEmpty(tenantId) ? Guid.Parse(tenantId) : Guid.Empty;

                if (tenantGuid != Guid.Empty)
                {
                    var isOwner = await _tenantDeletionService.IsUserTenantOwnerAsync(userGuid, tenantGuid);

                    if (isOwner && request.ConfirmTenantDeletion)
                    {
                        // Delete entire tenant
                        var deletionResult = await _tenantDeletionService.DeleteTenantAsync(tenantGuid, userGuid);

                        if (!deletionResult.Success)
                        {
                            return BadRequest(new ApiResponse<DeleteAccountResultDto>
                            {
                                Success = false,
                                Message = deletionResult.ErrorMessage ?? "Firma silinemedi"
                            });
                        }

                        result.UserDeleted = true;
                        result.TenantDeleted = true;
                        result.DatabaseDeleted = deletionResult.DatabaseDropped;

                        _logger.LogWarning(
                            "TENANT DELETED by owner: TenantId={TenantId}, UserId={UserId}, Email={Email}",
                            tenantId, userId, tenantUser.Email.Value);
                    }
                    else if (isOwner && !request.ConfirmTenantDeletion)
                    {
                        // Owner must confirm tenant deletion
                        return BadRequest(new ApiResponse<DeleteAccountResultDto>
                        {
                            Success = false,
                            Message = "Firma sahibi olarak hesabinizi silmek icin 'confirmTenantDeletion' alanini true olarak gondermelisiniz. Bu islem tum firma verilerini silecektir!"
                        });
                    }
                    else
                    {
                        // Regular user - just delete their account
                        tenantUser.Delete();
                        await _tenantContext.SaveChangesAsync();

                        result.UserDeleted = true;
                        result.TenantDeleted = false;

                        _logger.LogWarning("Tenant user account deleted: {UserId}, {Email}", userId, tenantUser.Email.Value);
                    }
                }
                else
                {
                    // No tenant context - just delete user
                    tenantUser.Delete();
                    await _tenantContext.SaveChangesAsync();

                    result.UserDeleted = true;
                    result.TenantDeleted = false;

                    _logger.LogWarning("Tenant user account deleted: {UserId}, {Email}", userId, tenantUser.Email.Value);
                }
            }

            return Ok(new ApiResponse<DeleteAccountResultDto>
            {
                Success = true,
                Data = result,
                Message = result.TenantDeleted
                    ? "Hesabiniz ve firmaniz basariyla silindi"
                    : "Hesabiniz basariyla silindi"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting account");
            return StatusCode(500, new ApiResponse<DeleteAccountResultDto>
            {
                Success = false,
                Message = "Hesap silinirken bir hata olustu"
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

    #region Security Endpoints

    /// <summary>
    /// Get security overview for current user
    /// </summary>
    [HttpGet("security/overview")]
    [ProducesResponseType(typeof(ApiResponse<SecurityOverviewDto>), 200)]
    public async Task<IActionResult> GetSecurityOverview()
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

            var overview = new SecurityOverviewDto();

            if (isMasterAdmin)
            {
                var masterUser = await _masterContext.MasterUsers
                    .AsNoTracking()
                    .FirstOrDefaultAsync(u => u.Id == Guid.Parse(userId));

                if (masterUser != null)
                {
                    overview.TwoFactorEnabled = masterUser.TwoFactorEnabled;
                    overview.LastLoginDate = masterUser.LastLoginAt;
                    overview.PasswordLastChanged = masterUser.PasswordChangedAt;
                }

                // Get active sessions count from SecurityAuditLogs (UserLoginHistory consolidated)
                var recentLogins = await _masterContext.SecurityAuditLogs
                    .Where(h => h.UserId == Guid.Parse(userId) && h.Event == "login_success")
                    .OrderByDescending(h => h.Timestamp)
                    .Take(30)
                    .ToListAsync();

                // Simple session count estimate based on recent unique IPs
                overview.ActiveSessions = recentLogins
                    .Where(l => l.Timestamp > DateTime.UtcNow.AddDays(-7))
                    .Select(l => l.IpAddress)
                    .Distinct()
                    .Count();
            }
            else if (!string.IsNullOrEmpty(tenantId))
            {
                var tenantUser = await _tenantContext.TenantUsers
                    .AsNoTracking()
                    .FirstOrDefaultAsync(u => u.Id == Guid.Parse(userId));

                if (tenantUser != null)
                {
                    // TenantUser doesn't have 2FA fields yet, default to false
                    overview.TwoFactorEnabled = false;
                    overview.LastLoginDate = tenantUser.LastLoginAt;
                    overview.PasswordLastChanged = null; // TenantUser doesn't track password changes
                }

                // For tenant users, estimate from audit logs
                var recentActivity = await _tenantContext.AuditLogs
                    .Where(a => a.UserId == userId)
                    .OrderByDescending(a => a.Timestamp)
                    .Take(30)
                    .ToListAsync();

                overview.ActiveSessions = recentActivity
                    .Where(a => a.Timestamp > DateTime.UtcNow.AddDays(-7))
                    .Select(a => a.IpAddress)
                    .Distinct()
                    .Count();
            }

            // Calculate security score
            int score = 50; // Base score
            if (overview.TwoFactorEnabled) score += 30;
            if (overview.PasswordLastChanged.HasValue && overview.PasswordLastChanged.Value > DateTime.UtcNow.AddDays(-90)) score += 20;
            overview.SecurityScore = Math.Min(score, 100);

            return Ok(new ApiResponse<SecurityOverviewDto>
            {
                Success = true,
                Data = overview,
                Message = "Guvenlik bilgileri basariyla yuklendi"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting security overview");
            return StatusCode(500, new ApiResponse<object>
            {
                Success = false,
                Message = "Guvenlik bilgileri alinirken bir hata olustu"
            });
        }
    }

    /// <summary>
    /// Get active sessions for current user
    /// </summary>
    [HttpGet("security/sessions")]
    [ProducesResponseType(typeof(ApiResponse<List<ActiveSessionDto>>), 200)]
    public async Task<IActionResult> GetActiveSessions()
    {
        try
        {
            var userId = _currentUserService.UserId;
            var isMasterAdmin = _currentUserService.IsMasterAdmin;
            var userEmail = _currentUserService.Email;

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Kullanici kimligi bulunamadi"
                });
            }

            var sessions = new List<ActiveSessionDto>();
            var currentIp = HttpContext.Connection.RemoteIpAddress?.ToString();
            // Normalize current IP for comparison
            if (!string.IsNullOrEmpty(currentIp) && System.Net.IPAddress.TryParse(currentIp, out var parsedIp))
            {
                currentIp = parsedIp.IsIPv4MappedToIPv6 ? parsedIp.MapToIPv4().ToString() : parsedIp.ToString();
            }

            if (isMasterAdmin)
            {
                // UserLoginHistory has been consolidated into SecurityAuditLogs
                var loginHistory = await _masterContext.SecurityAuditLogs
                    .AsNoTracking()
                    .Where(h => h.UserId == Guid.Parse(userId) && h.Event == "login_success")
                    .OrderByDescending(h => h.Timestamp)
                    .Take(10)
                    .ToListAsync();

                sessions = loginHistory
                    .GroupBy(h => h.IpAddress)
                    .Select(g => g.First())
                    .Select(h => new ActiveSessionDto
                    {
                        Id = h.Id.ToString(),
                        Device = ParseUserAgent(h.UserAgent),
                        Browser = ParseBrowser(h.UserAgent),
                        Location = "Bilinmiyor",
                        IpAddress = h.IpAddress,
                        LastActive = h.Timestamp,
                        IsCurrent = h.IpAddress == currentIp,
                        CreatedAt = h.Timestamp
                    })
                    .ToList();
            }
            else
            {
                // For tenant users, get from SecurityAuditLogs (login events are logged there)
                var securityLogs = await _masterContext.SecurityAuditLogs
                    .AsNoTracking()
                    .Where(a => a.Email == userEmail && a.Event == "login_success")
                    .OrderByDescending(a => a.Timestamp)
                    .Take(20)
                    .ToListAsync();

                sessions = securityLogs
                    .GroupBy(a => a.IpAddress)
                    .Select(g => g.First())
                    .Take(10)
                    .Select(a => new ActiveSessionDto
                    {
                        Id = a.Id.ToString(),
                        Device = ParseUserAgent(a.UserAgent),
                        Browser = ParseBrowser(a.UserAgent),
                        Location = "Bilinmiyor",
                        IpAddress = a.IpAddress ?? "Bilinmiyor",
                        LastActive = a.Timestamp,
                        IsCurrent = a.IpAddress == currentIp,
                        CreatedAt = a.Timestamp
                    })
                    .ToList();
            }

            return Ok(new ApiResponse<List<ActiveSessionDto>>
            {
                Success = true,
                Data = sessions,
                Message = "Aktif oturumlar basariyla yuklendi"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting active sessions");
            return StatusCode(500, new ApiResponse<object>
            {
                Success = false,
                Message = "Aktif oturumlar alinirken bir hata olustu"
            });
        }
    }

    /// <summary>
    /// Get security events for current user
    /// </summary>
    [HttpGet("security/events")]
    [ProducesResponseType(typeof(ApiResponse<SecurityEventsResponse>), 200)]
    public async Task<IActionResult> GetSecurityEvents([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        try
        {
            var userId = _currentUserService.UserId;
            var isMasterAdmin = _currentUserService.IsMasterAdmin;
            var userEmail = _currentUserService.Email;

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Kullanici kimligi bulunamadi"
                });
            }

            var events = new List<SecurityEventDto>();
            int totalItems = 0;

            if (isMasterAdmin)
            {
                // UserLoginHistory has been consolidated into SecurityAuditLogs
                var query = _masterContext.SecurityAuditLogs
                    .AsNoTracking()
                    .Where(h => h.UserId == Guid.Parse(userId) &&
                           (h.Event == "login_success" || h.Event == "login_failed"));

                totalItems = await query.CountAsync();

                var loginHistory = await query
                    .OrderByDescending(h => h.Timestamp)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                events = loginHistory.Select(h => new SecurityEventDto
                {
                    Id = h.Id.ToString(),
                    Action = h.Event == "login_success" ? "Basarili giris" : "Basarisiz giris denemesi",
                    Description = h.Event == "login_success" ? "Hesaba basariyla giris yapildi" : "Giris basarisiz",
                    IpAddress = h.IpAddress,
                    Device = ParseUserAgent(h.UserAgent),
                    Timestamp = h.Timestamp,
                    Success = h.Event == "login_success"
                }).ToList();
            }
            else
            {
                // For tenant users, get from SecurityAuditLogs (login events are logged there)
                var query = _masterContext.SecurityAuditLogs
                    .AsNoTracking()
                    .Where(a => a.Email == userEmail);

                totalItems = await query.CountAsync();

                var securityLogs = await query
                    .OrderByDescending(a => a.Timestamp)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                events = securityLogs.Select(a => new SecurityEventDto
                {
                    Id = a.Id.ToString(),
                    Action = MapEventToAction(a.Event),
                    Description = MapEventToDescription(a.Event, a.Metadata),
                    IpAddress = a.IpAddress ?? "Bilinmiyor",
                    Device = ParseUserAgent(a.UserAgent),
                    Timestamp = a.Timestamp,
                    Success = !a.Event.Contains("failed", StringComparison.OrdinalIgnoreCase)
                }).ToList();
            }

            var response = new SecurityEventsResponse
            {
                Items = events,
                TotalItems = totalItems,
                Page = page,
                PageSize = pageSize,
                TotalPages = (int)Math.Ceiling(totalItems / (double)pageSize)
            };

            return Ok(new ApiResponse<SecurityEventsResponse>
            {
                Success = true,
                Data = response,
                Message = "Guvenlik etkinlikleri basariyla yuklendi"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting security events");
            return StatusCode(500, new ApiResponse<object>
            {
                Success = false,
                Message = "Guvenlik etkinlikleri alinirken bir hata olustu"
            });
        }
    }

    private static string MapEventToAction(string eventType)
    {
        return eventType switch
        {
            "login_success" => "Basarili giris",
            "login_failed" => "Basarisiz giris denemesi",
            "login_error" => "Giris hatasi",
            "master_admin_login_success" => "Basarili admin girisi",
            "master_admin_login_failed" => "Basarisiz admin giris denemesi",
            "password_changed" => "Sifre degistirildi",
            "2fa_enabled" => "2FA etkinlestirildi",
            "2fa_disabled" => "2FA devre disi birakildi",
            _ => eventType
        };
    }

    private static string MapEventToDescription(string eventType, string? metadata)
    {
        var baseDescription = eventType switch
        {
            "login_success" => "Hesaba basariyla giris yapildi",
            "login_failed" => "Giris basarisiz",
            "login_error" => "Giris sirasinda hata olustu",
            "master_admin_login_success" => "Admin hesabina basariyla giris yapildi",
            "master_admin_login_failed" => "Admin giris basarisiz",
            "password_changed" => "Hesap sifresi degistirildi",
            "2fa_enabled" => "Iki faktorlu dogrulama etkinlestirildi",
            "2fa_disabled" => "Iki faktorlu dogrulama devre disi birakildi",
            _ => eventType
        };

        // Try to extract additional info from metadata
        if (!string.IsNullOrEmpty(metadata) && eventType == "login_failed")
        {
            try
            {
                var json = System.Text.Json.JsonDocument.Parse(metadata);
                if (json.RootElement.TryGetProperty("reason", out var reason))
                {
                    baseDescription = reason.GetString() ?? baseDescription;
                }
            }
            catch { /* Ignore parse errors */ }
        }

        return baseDescription;
    }

    private static string ParseUserAgent(string? userAgent)
    {
        if (string.IsNullOrEmpty(userAgent)) return "Bilinmeyen Cihaz";

        if (userAgent.Contains("Windows")) return "Windows";
        if (userAgent.Contains("Mac")) return "macOS";
        if (userAgent.Contains("iPhone")) return "iPhone";
        if (userAgent.Contains("iPad")) return "iPad";
        if (userAgent.Contains("Android")) return "Android";
        if (userAgent.Contains("Linux")) return "Linux";

        return "Diger";
    }

    private static string ParseBrowser(string? userAgent)
    {
        if (string.IsNullOrEmpty(userAgent)) return "Bilinmeyen Tarayici";

        if (userAgent.Contains("Chrome") && !userAgent.Contains("Edg")) return "Chrome";
        if (userAgent.Contains("Firefox")) return "Firefox";
        if (userAgent.Contains("Safari") && !userAgent.Contains("Chrome")) return "Safari";
        if (userAgent.Contains("Edg")) return "Edge";
        if (userAgent.Contains("Opera") || userAgent.Contains("OPR")) return "Opera";

        return "Diger";
    }

    #endregion
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

public class DeleteAccountRequest
{
    public string ConfirmationText { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public bool ConfirmTenantDeletion { get; set; } = false;
}

public class DeleteAccountPreviewDto
{
    public string? Username { get; set; }
    public string? Email { get; set; }
    public bool IsOwner { get; set; }
    public bool WillDeleteTenant { get; set; }
    public string? TenantName { get; set; }
    public string? DatabaseName { get; set; }
    public int UserCount { get; set; }
    public long DataSizeMB { get; set; }
    public List<string> Warnings { get; set; } = new();
}

public class DeleteAccountResultDto
{
    public bool UserDeleted { get; set; }
    public bool TenantDeleted { get; set; }
    public bool DatabaseDeleted { get; set; }
}

public class SecurityOverviewDto
{
    public bool TwoFactorEnabled { get; set; }
    public DateTime? PasswordLastChanged { get; set; }
    public DateTime? LastLoginDate { get; set; }
    public int ActiveSessions { get; set; }
    public int SecurityScore { get; set; }
}

public class ActiveSessionDto
{
    public string Id { get; set; } = string.Empty;
    public string Device { get; set; } = string.Empty;
    public string Browser { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string IpAddress { get; set; } = string.Empty;
    public DateTime LastActive { get; set; }
    public bool IsCurrent { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class SecurityEventDto
{
    public string Id { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string IpAddress { get; set; } = string.Empty;
    public string? Device { get; set; }
    public DateTime Timestamp { get; set; }
    public bool Success { get; set; }
}

public class SecurityEventsResponse
{
    public List<SecurityEventDto> Items { get; set; } = new();
    public int TotalItems { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
}

#endregion
