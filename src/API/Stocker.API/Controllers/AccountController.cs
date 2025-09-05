using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Stocker.API.Controllers.Base;
using Stocker.Application.Common.Interfaces;
using Stocker.Domain.Master.Entities;
using Stocker.Identity.Services;
using Stocker.Persistence.Contexts;
using System.Security.Claims;

namespace Stocker.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class AccountController : ApiController
{
    private readonly ILogger<AccountController> _logger;
    private readonly ICurrentUserService _currentUserService;
    private readonly IPasswordService _passwordService;
    private readonly MasterDbContext _masterContext;
    private readonly TenantDbContext _tenantContext;

    public AccountController(
        ILogger<AccountController> logger,
        ICurrentUserService currentUserService,
        IPasswordService passwordService,
        MasterDbContext masterContext,
        TenantDbContext tenantContext)
    {
        _logger = logger;
        _currentUserService = currentUserService;
        _passwordService = passwordService;
        _masterContext = masterContext;
        _tenantContext = tenantContext;
    }

    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile()
    {
        try
        {
            var userId = _currentUserService.UserId;
            var userRole = _currentUserService.Role;

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Kullanıcı kimliği bulunamadı"
                });
            }

            // Check if user is MasterUser or TenantUser
            if (userRole == "SystemAdmin")
            {
                // Get from MasterUser
                var masterUser = await _masterContext.MasterUsers
                    .FirstOrDefaultAsync(u => u.Id == Guid.Parse(userId));

                if (masterUser == null)
                {
                    return NotFound(new ApiResponse<object>
                    {
                        Success = false,
                        Message = "Kullanıcı bulunamadı"
                    });
                }

                var profile = new
                {
                    id = masterUser.Id,
                    username = masterUser.Username,
                    email = masterUser.Email,
                    firstName = masterUser.FirstName,
                    lastName = masterUser.LastName,
                    phone = masterUser.Phone,
                    role = "SystemAdmin",
                    profileImage = masterUser.ProfileImage,
                    createdDate = masterUser.CreatedDate,
                    lastLoginDate = masterUser.LastLoginDate,
                    twoFactorEnabled = masterUser.TwoFactorEnabled,
                    emailConfirmed = masterUser.EmailConfirmed,
                    phoneConfirmed = masterUser.PhoneConfirmed,
                    preferences = new
                    {
                        language = masterUser.Language ?? "tr",
                        theme = masterUser.Theme ?? "light",
                        notifications = masterUser.NotificationsEnabled,
                        newsletter = false
                    }
                };

                return Ok(new ApiResponse<object>
                {
                    Success = true,
                    Data = profile,
                    Message = "Profil bilgileri başarıyla yüklendi"
                });
            }
            else
            {
                // Get from TenantUser
                var tenantUser = await _tenantContext.TenantUsers
                    .Include(u => u.Role)
                    .Include(u => u.Department)
                    .Include(u => u.Branch)
                    .FirstOrDefaultAsync(u => u.Id == Guid.Parse(userId));

                if (tenantUser == null)
                {
                    return NotFound(new ApiResponse<object>
                    {
                        Success = false,
                        Message = "Kullanıcı bulunamadı"
                    });
                }

                var profile = new
                {
                    id = tenantUser.Id,
                    username = tenantUser.Username,
                    email = tenantUser.Email,
                    firstName = tenantUser.FirstName,
                    lastName = tenantUser.LastName,
                    phone = tenantUser.Phone,
                    role = tenantUser.Role?.Name,
                    department = tenantUser.Department?.Name,
                    branch = tenantUser.Branch?.Name,
                    profileImage = tenantUser.ProfileImage,
                    createdDate = tenantUser.CreatedDate,
                    lastLoginDate = tenantUser.LastLoginDate,
                    twoFactorEnabled = tenantUser.TwoFactorEnabled,
                    emailConfirmed = tenantUser.EmailConfirmed,
                    phoneConfirmed = tenantUser.PhoneConfirmed,
                    preferences = new
                    {
                        language = tenantUser.Language ?? "tr",
                        theme = tenantUser.Theme ?? "light",
                        notifications = tenantUser.NotificationsEnabled,
                        newsletter = false
                    }
                };

                return Ok(new ApiResponse<object>
                {
                    Success = true,
                    Data = profile,
                    Message = "Profil bilgileri başarıyla yüklendi"
                });
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user profile");
            return StatusCode(500, new ApiResponse<object>
            {
                Success = false,
                Message = "Profil bilgileri alınırken bir hata oluştu"
            });
        }
    }

    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        try
        {
            var userId = _currentUserService.UserId;
            var userRole = _currentUserService.Role;

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new ApiResponse<bool>
                {
                    Success = false,
                    Message = "Kullanıcı kimliği bulunamadı"
                });
            }

            if (userRole == "SystemAdmin")
            {
                var masterUser = await _masterContext.MasterUsers
                    .FirstOrDefaultAsync(u => u.Id == Guid.Parse(userId));

                if (masterUser == null)
                {
                    return NotFound(new ApiResponse<bool>
                    {
                        Success = false,
                        Message = "Kullanıcı bulunamadı"
                    });
                }

                if (!string.IsNullOrEmpty(request.FirstName))
                    masterUser.FirstName = request.FirstName;
                if (!string.IsNullOrEmpty(request.LastName))
                    masterUser.LastName = request.LastName;
                if (!string.IsNullOrEmpty(request.Phone))
                    masterUser.Phone = request.Phone;

                masterUser.ModifiedDate = DateTime.UtcNow;
                masterUser.ModifiedBy = userId;

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
                        Message = "Kullanıcı bulunamadı"
                    });
                }

                if (!string.IsNullOrEmpty(request.FirstName))
                    tenantUser.FirstName = request.FirstName;
                if (!string.IsNullOrEmpty(request.LastName))
                    tenantUser.LastName = request.LastName;
                if (!string.IsNullOrEmpty(request.Phone))
                    tenantUser.Phone = request.Phone;

                // Update department and branch if provided
                if (!string.IsNullOrEmpty(request.Department))
                {
                    var department = await _tenantContext.Departments
                        .FirstOrDefaultAsync(d => d.Name == request.Department);
                    if (department != null)
                        tenantUser.DepartmentId = department.Id;
                }

                if (!string.IsNullOrEmpty(request.Branch))
                {
                    var branch = await _tenantContext.Branches
                        .FirstOrDefaultAsync(b => b.Name == request.Branch);
                    if (branch != null)
                        tenantUser.BranchId = branch.Id;
                }

                tenantUser.ModifiedDate = DateTime.UtcNow;
                tenantUser.ModifiedBy = userId;

                await _tenantContext.SaveChangesAsync();
            }

            _logger.LogInformation("Profile updated for user: {UserId}", userId);

            return Ok(new ApiResponse<bool>
            {
                Success = true,
                Data = true,
                Message = "Profil başarıyla güncellendi"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating profile");
            return StatusCode(500, new ApiResponse<bool>
            {
                Success = false,
                Message = "Profil güncellenirken bir hata oluştu"
            });
        }
    }

    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        try
        {
            var userId = _currentUserService.UserId;
            var userRole = _currentUserService.Role;

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new ApiResponse<bool>
                {
                    Success = false,
                    Message = "Kullanıcı kimliği bulunamadı"
                });
            }

            // Validate passwords
            if (string.IsNullOrEmpty(request.CurrentPassword))
            {
                return BadRequest(new ApiResponse<bool>
                {
                    Success = false,
                    Message = "Mevcut şifre boş olamaz"
                });
            }

            if (request.NewPassword != request.ConfirmPassword)
            {
                return BadRequest(new ApiResponse<bool>
                {
                    Success = false,
                    Message = "Yeni şifreler eşleşmiyor"
                });
            }

            // Validate password strength
            var passwordValidation = _passwordService.ValidatePassword(request.NewPassword);
            if (!passwordValidation.IsValid)
            {
                return BadRequest(new ApiResponse<bool>
                {
                    Success = false,
                    Message = string.Join(", ", passwordValidation.Errors)
                });
            }

            if (userRole == "SystemAdmin")
            {
                var masterUser = await _masterContext.MasterUsers
                    .FirstOrDefaultAsync(u => u.Id == Guid.Parse(userId));

                if (masterUser == null)
                {
                    return NotFound(new ApiResponse<bool>
                    {
                        Success = false,
                        Message = "Kullanıcı bulunamadı"
                    });
                }

                // Verify current password
                if (!_passwordService.VerifyPassword(masterUser.Password, request.CurrentPassword))
                {
                    return BadRequest(new ApiResponse<bool>
                    {
                        Success = false,
                        Message = "Mevcut şifre hatalı"
                    });
                }

                // Hash and update new password
                masterUser.Password = _passwordService.HashPassword(request.NewPassword);
                masterUser.PasswordChangedDate = DateTime.UtcNow;
                masterUser.ModifiedDate = DateTime.UtcNow;
                masterUser.ModifiedBy = userId;

                // Add to password history
                _masterContext.PasswordHistories.Add(new PasswordHistory
                {
                    UserId = masterUser.Id,
                    Password = masterUser.Password,
                    CreatedDate = DateTime.UtcNow
                });

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
                        Message = "Kullanıcı bulunamadı"
                    });
                }

                // Verify current password
                if (!_passwordService.VerifyPassword(tenantUser.Password, request.CurrentPassword))
                {
                    return BadRequest(new ApiResponse<bool>
                    {
                        Success = false,
                        Message = "Mevcut şifre hatalı"
                    });
                }

                // Hash and update new password
                tenantUser.Password = _passwordService.HashPassword(request.NewPassword);
                tenantUser.PasswordChangedDate = DateTime.UtcNow;
                tenantUser.ModifiedDate = DateTime.UtcNow;
                tenantUser.ModifiedBy = userId;

                await _tenantContext.SaveChangesAsync();
            }

            _logger.LogInformation("Password changed for user: {UserId}", userId);

            return Ok(new ApiResponse<bool>
            {
                Success = true,
                Data = true,
                Message = "Şifre başarıyla değiştirildi"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error changing password");
            return StatusCode(500, new ApiResponse<bool>
            {
                Success = false,
                Message = "Şifre değiştirilirken bir hata oluştu"
            });
        }
    }

    [HttpGet("activity-log")]
    public async Task<IActionResult> GetActivityLog([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        try
        {
            var userId = _currentUserService.UserId;
            var userRole = _currentUserService.Role;

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Kullanıcı kimliği bulunamadı"
                });
            }

            List<object> activities = new();

            if (userRole == "SystemAdmin")
            {
                var loginHistory = await _masterContext.UserLoginHistories
                    .Where(h => h.UserId == Guid.Parse(userId))
                    .OrderByDescending(h => h.LoginDate)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(h => new
                    {
                        id = h.Id,
                        action = "Login",
                        description = h.IsSuccessful ? "Başarılı giriş" : "Başarısız giriş denemesi",
                        ipAddress = h.IpAddress,
                        device = h.UserAgent,
                        timestamp = h.LoginDate,
                        status = h.IsSuccessful ? "Success" : "Failed"
                    })
                    .ToListAsync();

                activities.AddRange(loginHistory);

                var totalItems = await _masterContext.UserLoginHistories
                    .Where(h => h.UserId == Guid.Parse(userId))
                    .CountAsync();

                var response = new
                {
                    items = activities,
                    totalItems,
                    page,
                    pageSize,
                    totalPages = (int)Math.Ceiling(totalItems / (double)pageSize)
                };

                return Ok(new ApiResponse<object>
                {
                    Success = true,
                    Data = response,
                    Message = "Aktivite geçmişi başarıyla yüklendi"
                });
            }
            else
            {
                // For tenant users, we would need an audit log table
                // For now, return empty list
                return Ok(new ApiResponse<object>
                {
                    Success = true,
                    Data = new
                    {
                        items = activities,
                        totalItems = 0,
                        page,
                        pageSize,
                        totalPages = 0
                    },
                    Message = "Aktivite geçmişi başarıyla yüklendi"
                });
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting activity log");
            return StatusCode(500, new ApiResponse<object>
            {
                Success = false,
                Message = "Aktivite geçmişi alınırken bir hata oluştu"
            });
        }
    }

    [HttpPost("profile-image")]
    public async Task<IActionResult> UploadProfileImage(IFormFile file)
    {
        try
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Dosya seçilmedi"
                });
            }

            // Validate file type
            var allowedTypes = new[] { "image/jpeg", "image/jpg", "image/png", "image/gif" };
            if (!allowedTypes.Contains(file.ContentType.ToLower()))
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Sadece resim dosyaları yüklenebilir (JPG, PNG, GIF)"
                });
            }

            // Validate file size (max 5MB)
            if (file.Length > 5 * 1024 * 1024)
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Dosya boyutu 5MB'dan büyük olamaz"
                });
            }

            var userId = _currentUserService.UserId;
            var fileName = $"{userId}_{DateTime.UtcNow.Ticks}{Path.GetExtension(file.FileName)}";
            var filePath = Path.Combine("wwwroot", "uploads", "profiles", fileName);

            // Ensure directory exists
            Directory.CreateDirectory(Path.GetDirectoryName(filePath)!);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var imageUrl = $"/uploads/profiles/{fileName}";

            // Update user profile image path in database
            var userRole = _currentUserService.Role;
            if (userRole == "SystemAdmin")
            {
                var masterUser = await _masterContext.MasterUsers
                    .FirstOrDefaultAsync(u => u.Id == Guid.Parse(userId!));
                if (masterUser != null)
                {
                    masterUser.ProfileImage = imageUrl;
                    await _masterContext.SaveChangesAsync();
                }
            }
            else
            {
                var tenantUser = await _tenantContext.TenantUsers
                    .FirstOrDefaultAsync(u => u.Id == Guid.Parse(userId!));
                if (tenantUser != null)
                {
                    tenantUser.ProfileImage = imageUrl;
                    await _tenantContext.SaveChangesAsync();
                }
            }

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Data = new { imageUrl },
                Message = "Profil resmi başarıyla yüklendi"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading profile image");
            return StatusCode(500, new ApiResponse<object>
            {
                Success = false,
                Message = "Profil resmi yüklenirken bir hata oluştu"
            });
        }
    }
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