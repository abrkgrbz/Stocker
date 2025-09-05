using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Stocker.API.Controllers.Base;
using Stocker.Application.Common.Interfaces;
using Stocker.Identity.Services;
using Stocker.Persistence.Contexts;

namespace Stocker.API.Controllers.Tenant;

[Route("api/tenant/[controller]")]
[ApiController]
[Authorize]
public class UsersController : ApiController
{
    private readonly ILogger<UsersController> _logger;
    private readonly TenantDbContext _context;
    private readonly ICurrentTenantService _currentTenantService;
    private readonly IPasswordService _passwordService;
    private readonly ICurrentUserService _currentUserService;

    public UsersController(
        ILogger<UsersController> logger,
        TenantDbContext context,
        ICurrentTenantService currentTenantService,
        IPasswordService passwordService,
        ICurrentUserService currentUserService)
    {
        _logger = logger;
        _context = context;
        _currentTenantService = currentTenantService;
        _passwordService = passwordService;
        _currentUserService = currentUserService;
    }

    [HttpGet]
    public async Task<IActionResult> GetUsers(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null,
        [FromQuery] string? role = null,
        [FromQuery] string? status = null)
    {
        try
        {
            var tenantId = _currentTenantService.TenantId;
            var query = _context.TenantUsers
                .Include(u => u.Role)
                .Include(u => u.Department)
                .Include(u => u.Branch)
                .Where(u => u.TenantId == tenantId && !u.IsDeleted);

            // Apply search filter
            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(u => 
                    u.Username.Contains(search) ||
                    u.Email.Contains(search) ||
                    u.FirstName.Contains(search) ||
                    u.LastName.Contains(search));
            }

            // Apply role filter
            if (!string.IsNullOrEmpty(role))
            {
                query = query.Where(u => u.Role != null && u.Role.Name == role);
            }

            // Apply status filter
            if (!string.IsNullOrEmpty(status))
            {
                var isActive = status.ToLower() == "active";
                query = query.Where(u => u.IsActive == isActive);
            }

            var totalItems = await query.CountAsync();
            var totalPages = (int)Math.Ceiling(totalItems / (double)pageSize);

            var users = await query
                .OrderByDescending(u => u.CreatedDate)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(u => new
                {
                    id = u.Id,
                    username = u.Username,
                    email = u.Email,
                    firstName = u.FirstName,
                    lastName = u.LastName,
                    role = u.Role != null ? u.Role.Name : "User",
                    department = u.Department != null ? u.Department.Name : null,
                    branch = u.Branch != null ? u.Branch.Name : null,
                    isActive = u.IsActive,
                    lastLoginDate = u.LastLoginDate,
                    createdDate = u.CreatedDate
                })
                .ToListAsync();

            var response = new
            {
                items = users,
                totalItems,
                page,
                pageSize,
                totalPages
            };

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Data = response,
                Message = "Kullanıcılar başarıyla listelendi"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting users");
            return StatusCode(500, new ApiResponse<object>
            {
                Success = false,
                Message = "Kullanıcılar alınırken bir hata oluştu"
            });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetUser(Guid id)
    {
        try
        {
            var tenantId = _currentTenantService.TenantId;
            var user = await _context.TenantUsers
                .Include(u => u.Role)
                    .ThenInclude(r => r.RolePermissions)
                        .ThenInclude(rp => rp.Permission)
                .Include(u => u.Department)
                .Include(u => u.Branch)
                .Include(u => u.UserPermissions)
                    .ThenInclude(up => up.Permission)
                .Where(u => u.TenantId == tenantId && u.Id == id && !u.IsDeleted)
                .FirstOrDefaultAsync();

            if (user == null)
            {
                return NotFound(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Kullanıcı bulunamadı"
                });
            }

            // Get permissions from both role and direct user permissions
            var permissions = new List<string>();
            if (user.Role != null)
            {
                permissions.AddRange(user.Role.RolePermissions.Select(rp => rp.Permission.Code));
            }
            permissions.AddRange(user.UserPermissions.Select(up => up.Permission.Code));

            // Get login history
            var loginHistory = await _context.UserLoginHistories
                .Where(h => h.UserId == id && h.TenantId == tenantId)
                .OrderByDescending(h => h.LoginDate)
                .Take(10)
                .Select(h => new
                {
                    date = h.LoginDate,
                    ipAddress = h.IpAddress,
                    device = h.UserAgent,
                    status = h.IsSuccessful ? "Success" : "Failed"
                })
                .ToListAsync();

            var userData = new
            {
                id = user.Id,
                username = user.Username,
                email = user.Email,
                firstName = user.FirstName,
                lastName = user.LastName,
                phone = user.Phone,
                role = user.Role?.Name,
                department = user.Department?.Name,
                branch = user.Branch?.Name,
                isActive = user.IsActive,
                twoFactorEnabled = user.TwoFactorEnabled,
                emailConfirmed = user.EmailConfirmed,
                phoneConfirmed = user.PhoneConfirmed,
                lastLoginDate = user.LastLoginDate,
                lastPasswordChangeDate = user.PasswordChangedDate,
                createdDate = user.CreatedDate,
                permissions = permissions.Distinct().ToArray(),
                loginHistory
            };

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Data = userData,
                Message = "Kullanıcı detayları başarıyla getirildi"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user details");
            return StatusCode(500, new ApiResponse<object>
            {
                Success = false,
                Message = "Kullanıcı detayları alınırken bir hata oluştu"
            });
        }
    }

    [HttpPost]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserRequest request)
    {
        try
        {
            var tenantId = _currentTenantService.TenantId;
            var currentUserId = _currentUserService.UserId;

            // Check if username or email already exists
            var existingUser = await _context.TenantUsers
                .Where(u => u.TenantId == tenantId && (u.Username == request.Username || u.Email == request.Email))
                .FirstOrDefaultAsync();

            if (existingUser != null)
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = existingUser.Username == request.Username 
                        ? "Bu kullanıcı adı zaten kullanımda" 
                        : "Bu e-posta adresi zaten kullanımda"
                });
            }

            // Get role
            var roleEntity = await _context.Roles
                .Where(r => r.TenantId == tenantId && r.Name == request.Role)
                .FirstOrDefaultAsync();

            // Get department
            Guid? departmentId = null;
            if (!string.IsNullOrEmpty(request.Department))
            {
                var department = await _context.Departments
                    .Where(d => d.TenantId == tenantId && d.Name == request.Department)
                    .FirstOrDefaultAsync();
                departmentId = department?.Id;
            }

            // Get branch
            Guid? branchId = null;
            if (!string.IsNullOrEmpty(request.Branch))
            {
                var branch = await _context.Branches
                    .Where(b => b.TenantId == tenantId && b.Name == request.Branch)
                    .FirstOrDefaultAsync();
                branchId = branch?.Id;
            }

            var user = new Domain.Tenant.Entities.TenantUser
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                Username = request.Username,
                Email = request.Email,
                Password = _passwordService.HashPassword(request.Password),
                FirstName = request.FirstName,
                LastName = request.LastName,
                Phone = request.Phone,
                RoleId = roleEntity?.Id,
                DepartmentId = departmentId,
                BranchId = branchId,
                IsActive = true,
                EmailConfirmed = false,
                PhoneConfirmed = false,
                TwoFactorEnabled = false,
                CreatedDate = DateTime.UtcNow,
                CreatedBy = currentUserId
            };

            _context.TenantUsers.Add(user);
            await _context.SaveChangesAsync();

            _logger.LogInformation("User created: {Username} for tenant: {TenantId}", user.Username, tenantId);

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Data = new
                {
                    id = user.Id,
                    username = user.Username,
                    email = user.Email,
                    firstName = user.FirstName,
                    lastName = user.LastName,
                    role = request.Role,
                    department = request.Department,
                    branch = request.Branch,
                    isActive = user.IsActive,
                    createdDate = user.CreatedDate
                },
                Message = "Kullanıcı başarıyla oluşturuldu"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating user");
            return StatusCode(500, new ApiResponse<object>
            {
                Success = false,
                Message = "Kullanıcı oluşturulurken bir hata oluştu"
            });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateUser(Guid id, [FromBody] UpdateUserRequest request)
    {
        try
        {
            var tenantId = _currentTenantService.TenantId;
            var currentUserId = _currentUserService.UserId;

            var user = await _context.TenantUsers
                .Where(u => u.TenantId == tenantId && u.Id == id && !u.IsDeleted)
                .FirstOrDefaultAsync();

            if (user == null)
            {
                return NotFound(new ApiResponse<bool>
                {
                    Success = false,
                    Message = "Kullanıcı bulunamadı"
                });
            }

            // Check if email is being changed and already exists
            if (!string.IsNullOrEmpty(request.Email) && request.Email != user.Email)
            {
                var emailExists = await _context.TenantUsers
                    .Where(u => u.TenantId == tenantId && u.Email == request.Email && u.Id != id)
                    .AnyAsync();

                if (emailExists)
                {
                    return BadRequest(new ApiResponse<bool>
                    {
                        Success = false,
                        Message = "Bu e-posta adresi zaten kullanımda"
                    });
                }

                user.Email = request.Email;
                user.EmailConfirmed = false;
            }

            // Update other fields
            if (!string.IsNullOrEmpty(request.FirstName))
                user.FirstName = request.FirstName;
            if (!string.IsNullOrEmpty(request.LastName))
                user.LastName = request.LastName;
            if (!string.IsNullOrEmpty(request.Phone))
                user.Phone = request.Phone;

            // Update role
            if (!string.IsNullOrEmpty(request.Role))
            {
                var role = await _context.Roles
                    .Where(r => r.TenantId == tenantId && r.Name == request.Role)
                    .FirstOrDefaultAsync();
                if (role != null)
                    user.RoleId = role.Id;
            }

            // Update department
            if (!string.IsNullOrEmpty(request.Department))
            {
                var department = await _context.Departments
                    .Where(d => d.TenantId == tenantId && d.Name == request.Department)
                    .FirstOrDefaultAsync();
                user.DepartmentId = department?.Id;
            }

            // Update branch
            if (!string.IsNullOrEmpty(request.Branch))
            {
                var branch = await _context.Branches
                    .Where(b => b.TenantId == tenantId && b.Name == request.Branch)
                    .FirstOrDefaultAsync();
                user.BranchId = branch?.Id;
            }

            user.ModifiedDate = DateTime.UtcNow;
            user.ModifiedBy = currentUserId;

            await _context.SaveChangesAsync();

            _logger.LogInformation("User updated: {UserId} by {CurrentUserId}", id, currentUserId);

            return Ok(new ApiResponse<bool>
            {
                Success = true,
                Data = true,
                Message = "Kullanıcı başarıyla güncellendi"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating user");
            return StatusCode(500, new ApiResponse<bool>
            {
                Success = false,
                Message = "Kullanıcı güncellenirken bir hata oluştu"
            });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(Guid id)
    {
        try
        {
            var tenantId = _currentTenantService.TenantId;
            var currentUserId = _currentUserService.UserId;

            var user = await _context.TenantUsers
                .Where(u => u.TenantId == tenantId && u.Id == id && !u.IsDeleted)
                .FirstOrDefaultAsync();

            if (user == null)
            {
                return NotFound(new ApiResponse<bool>
                {
                    Success = false,
                    Message = "Kullanıcı bulunamadı"
                });
            }

            // Prevent self-deletion
            if (user.Id.ToString() == currentUserId)
            {
                return BadRequest(new ApiResponse<bool>
                {
                    Success = false,
                    Message = "Kendi hesabınızı silemezsiniz"
                });
            }

            // Soft delete
            user.IsDeleted = true;
            user.DeletedDate = DateTime.UtcNow;
            user.DeletedBy = currentUserId;

            await _context.SaveChangesAsync();

            _logger.LogInformation("User deleted: {UserId} by {CurrentUserId}", id, currentUserId);

            return Ok(new ApiResponse<bool>
            {
                Success = true,
                Data = true,
                Message = "Kullanıcı başarıyla silindi"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting user");
            return StatusCode(500, new ApiResponse<bool>
            {
                Success = false,
                Message = "Kullanıcı silinirken bir hata oluştu"
            });
        }
    }

    [HttpPost("{id}/toggle-status")]
    public async Task<IActionResult> ToggleUserStatus(Guid id)
    {
        try
        {
            var tenantId = _currentTenantService.TenantId;
            var currentUserId = _currentUserService.UserId;

            var user = await _context.TenantUsers
                .Where(u => u.TenantId == tenantId && u.Id == id && !u.IsDeleted)
                .FirstOrDefaultAsync();

            if (user == null)
            {
                return NotFound(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Kullanıcı bulunamadı"
                });
            }

            // Prevent self-deactivation
            if (user.Id.ToString() == currentUserId && user.IsActive)
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Kendi hesabınızı devre dışı bırakamazsınız"
                });
            }

            user.IsActive = !user.IsActive;
            user.ModifiedDate = DateTime.UtcNow;
            user.ModifiedBy = currentUserId;

            await _context.SaveChangesAsync();

            _logger.LogInformation("User status toggled: {UserId} to {Status} by {CurrentUserId}", 
                id, user.IsActive ? "Active" : "Inactive", currentUserId);

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Data = new { isActive = user.IsActive },
                Message = $"Kullanıcı {(user.IsActive ? "aktif edildi" : "devre dışı bırakıldı")}"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error toggling user status");
            return StatusCode(500, new ApiResponse<object>
            {
                Success = false,
                Message = "Kullanıcı durumu değiştirilirken bir hata oluştu"
            });
        }
    }

    [HttpPost("{id}/reset-password")]
    public async Task<IActionResult> ResetPassword(Guid id)
    {
        try
        {
            var tenantId = _currentTenantService.TenantId;
            var currentUserId = _currentUserService.UserId;

            var user = await _context.TenantUsers
                .Where(u => u.TenantId == tenantId && u.Id == id && !u.IsDeleted)
                .FirstOrDefaultAsync();

            if (user == null)
            {
                return NotFound(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Kullanıcı bulunamadı"
                });
            }

            // Generate temporary password
            var temporaryPassword = GenerateTemporaryPassword();
            user.Password = _passwordService.HashPassword(temporaryPassword);
            user.PasswordChangedDate = DateTime.UtcNow;
            user.RequiresPasswordChange = true;
            user.ModifiedDate = DateTime.UtcNow;
            user.ModifiedBy = currentUserId;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Password reset for user: {UserId} by {CurrentUserId}", id, currentUserId);

            // In production, send this via email instead of returning it
            return Ok(new ApiResponse<object>
            {
                Success = true,
                Data = new { temporaryPassword },
                Message = "Şifre başarıyla sıfırlandı. Geçici şifre kullanıcıya iletilmelidir."
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error resetting password");
            return StatusCode(500, new ApiResponse<object>
            {
                Success = false,
                Message = "Şifre sıfırlanırken bir hata oluştu"
            });
        }
    }

    [HttpGet("{id}/permissions")]
    public async Task<IActionResult> GetUserPermissions(Guid id)
    {
        try
        {
            var tenantId = _currentTenantService.TenantId;
            
            var user = await _context.TenantUsers
                .Include(u => u.Role)
                    .ThenInclude(r => r.RolePermissions)
                        .ThenInclude(rp => rp.Permission)
                .Include(u => u.UserPermissions)
                    .ThenInclude(up => up.Permission)
                .Where(u => u.TenantId == tenantId && u.Id == id && !u.IsDeleted)
                .FirstOrDefaultAsync();

            if (user == null)
            {
                return NotFound(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Kullanıcı bulunamadı"
                });
            }

            // Get all available permissions grouped by module
            var allPermissions = await _context.Permissions
                .Where(p => p.TenantId == tenantId || p.TenantId == null)
                .GroupBy(p => p.Module)
                .Select(g => new
                {
                    name = g.Key,
                    permissions = g.Select(p => new
                    {
                        code = p.Code,
                        name = p.Name,
                        granted = user.Role.RolePermissions.Any(rp => rp.PermissionId == p.Id) ||
                                 user.UserPermissions.Any(up => up.PermissionId == p.Id)
                    }).ToList()
                })
                .ToListAsync();

            var response = new
            {
                modules = allPermissions
            };

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Data = response,
                Message = "Kullanıcı yetkileri başarıyla getirildi"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user permissions");
            return StatusCode(500, new ApiResponse<object>
            {
                Success = false,
                Message = "Kullanıcı yetkileri alınırken bir hata oluştu"
            });
        }
    }

    [HttpPut("{id}/permissions")]
    public async Task<IActionResult> UpdateUserPermissions(Guid id, [FromBody] UpdatePermissionsRequest request)
    {
        try
        {
            var tenantId = _currentTenantService.TenantId;
            var currentUserId = _currentUserService.UserId;

            var user = await _context.TenantUsers
                .Include(u => u.UserPermissions)
                .Where(u => u.TenantId == tenantId && u.Id == id && !u.IsDeleted)
                .FirstOrDefaultAsync();

            if (user == null)
            {
                return NotFound(new ApiResponse<bool>
                {
                    Success = false,
                    Message = "Kullanıcı bulunamadı"
                });
            }

            // Remove existing user-specific permissions
            _context.UserPermissions.RemoveRange(user.UserPermissions);

            // Add new permissions
            foreach (var permissionCode in request.Permissions)
            {
                var permission = await _context.Permissions
                    .Where(p => p.Code == permissionCode && (p.TenantId == tenantId || p.TenantId == null))
                    .FirstOrDefaultAsync();

                if (permission != null)
                {
                    _context.UserPermissions.Add(new Domain.Tenant.Entities.UserPermission
                    {
                        Id = Guid.NewGuid(),
                        UserId = user.Id,
                        PermissionId = permission.Id,
                        TenantId = tenantId,
                        CreatedDate = DateTime.UtcNow,
                        CreatedBy = currentUserId
                    });
                }
            }

            await _context.SaveChangesAsync();

            _logger.LogInformation("User permissions updated for user: {UserId} by {CurrentUserId}", id, currentUserId);

            return Ok(new ApiResponse<bool>
            {
                Success = true,
                Data = true,
                Message = "Kullanıcı yetkileri başarıyla güncellendi"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating user permissions");
            return StatusCode(500, new ApiResponse<bool>
            {
                Success = false,
                Message = "Kullanıcı yetkileri güncellenirken bir hata oluştu"
            });
        }
    }

    [HttpGet("roles")]
    public async Task<IActionResult> GetRoles()
    {
        try
        {
            var tenantId = _currentTenantService.TenantId;

            var roles = await _context.Roles
                .Where(r => r.TenantId == tenantId && !r.IsDeleted)
                .Select(r => new
                {
                    id = r.Id,
                    name = r.Name,
                    description = r.Description,
                    userCount = _context.TenantUsers.Count(u => u.RoleId == r.Id && !u.IsDeleted)
                })
                .ToListAsync();

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Data = roles,
                Message = "Roller başarıyla listelendi"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting roles");
            return StatusCode(500, new ApiResponse<object>
            {
                Success = false,
                Message = "Roller alınırken bir hata oluştu"
            });
        }
    }

    private string GenerateTemporaryPassword()
    {
        const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
        var random = new Random();
        var password = new string(Enumerable.Repeat(chars, 12)
            .Select(s => s[random.Next(s.Length)]).ToArray());
        return password;
    }
}

public class CreateUserRequest
{
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string? Department { get; set; }
    public string? Branch { get; set; }
    public string? Phone { get; set; }
}

public class UpdateUserRequest
{
    public string? Email { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Role { get; set; }
    public string? Department { get; set; }
    public string? Branch { get; set; }
    public string? Phone { get; set; }
}

public class UpdatePermissionsRequest
{
    public List<string> Permissions { get; set; } = new();
}