using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.API.Controllers.Base;

namespace Stocker.API.Controllers.Tenant;

[Route("api/tenant/[controller]")]
[ApiController]
[Authorize]
public class UsersController : ApiController
{
    private readonly ILogger<UsersController> _logger;

    public UsersController(ILogger<UsersController> logger)
    {
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetUsers(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null,
        [FromQuery] string? role = null,
        [FromQuery] string? status = null)
    {
        var users = new[]
        {
            new
            {
                id = Guid.NewGuid(),
                username = "ahmet.yilmaz",
                email = "ahmet.yilmaz@company.com",
                firstName = "Ahmet",
                lastName = "Yılmaz",
                role = "Admin",
                department = "Yönetim",
                branch = "Merkez",
                isActive = true,
                lastLoginDate = DateTime.UtcNow.AddHours(-2),
                createdDate = DateTime.UtcNow.AddMonths(-6)
            },
            new
            {
                id = Guid.NewGuid(),
                username = "mehmet.oz",
                email = "mehmet.oz@company.com",
                firstName = "Mehmet",
                lastName = "Öz",
                role = "Manager",
                department = "Satış",
                branch = "Ankara",
                isActive = true,
                lastLoginDate = DateTime.UtcNow.AddDays(-1),
                createdDate = DateTime.UtcNow.AddMonths(-4)
            },
            new
            {
                id = Guid.NewGuid(),
                username = "ayse.kaya",
                email = "ayse.kaya@company.com",
                firstName = "Ayşe",
                lastName = "Kaya",
                role = "User",
                department = "Muhasebe",
                branch = "İstanbul",
                isActive = true,
                lastLoginDate = DateTime.UtcNow.AddHours(-5),
                createdDate = DateTime.UtcNow.AddMonths(-3)
            }
        };

        var response = new
        {
            items = users,
            totalItems = 15,
            page = page,
            pageSize = pageSize,
            totalPages = 2
        };

        return Ok(new ApiResponse<object>
        {
            Success = true,
            Data = response,
            Message = "Kullanıcılar başarıyla listelendi"
        });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetUser(Guid id)
    {
        var user = new
        {
            id = id,
            username = "ahmet.yilmaz",
            email = "ahmet.yilmaz@company.com",
            firstName = "Ahmet",
            lastName = "Yılmaz",
            phone = "+90 532 123 4567",
            role = "Admin",
            department = "Yönetim",
            branch = "Merkez",
            isActive = true,
            twoFactorEnabled = true,
            emailConfirmed = true,
            phoneConfirmed = false,
            lastLoginDate = DateTime.UtcNow.AddHours(-2),
            lastPasswordChangeDate = DateTime.UtcNow.AddDays(-30),
            createdDate = DateTime.UtcNow.AddMonths(-6),
            permissions = new[]
            {
                "users.view", "users.create", "users.edit", "users.delete",
                "reports.view", "reports.create",
                "settings.view", "settings.edit"
            },
            loginHistory = new[]
            {
                new { date = DateTime.UtcNow.AddHours(-2), ipAddress = "192.168.1.100", device = "Chrome / Windows", status = "Success" },
                new { date = DateTime.UtcNow.AddDays(-1), ipAddress = "192.168.1.100", device = "Chrome / Windows", status = "Success" },
                new { date = DateTime.UtcNow.AddDays(-2), ipAddress = "192.168.1.101", device = "Mobile / iOS", status = "Success" }
            }
        };

        return Ok(new ApiResponse<object>
        {
            Success = true,
            Data = user,
            Message = "Kullanıcı detayları başarıyla getirildi"
        });
    }

    [HttpPost]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserRequest request)
    {
        var user = new
        {
            id = Guid.NewGuid(),
            username = request.Username,
            email = request.Email,
            firstName = request.FirstName,
            lastName = request.LastName,
            role = request.Role,
            department = request.Department,
            branch = request.Branch,
            isActive = true,
            createdDate = DateTime.UtcNow
        };

        return Ok(new ApiResponse<object>
        {
            Success = true,
            Data = user,
            Message = "Kullanıcı başarıyla oluşturuldu"
        });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateUser(Guid id, [FromBody] UpdateUserRequest request)
    {
        return Ok(new ApiResponse<bool>
        {
            Success = true,
            Data = true,
            Message = "Kullanıcı başarıyla güncellendi"
        });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(Guid id)
    {
        return Ok(new ApiResponse<bool>
        {
            Success = true,
            Data = true,
            Message = "Kullanıcı başarıyla silindi"
        });
    }

    [HttpPost("{id}/toggle-status")]
    public async Task<IActionResult> ToggleUserStatus(Guid id)
    {
        return Ok(new ApiResponse<object>
        {
            Success = true,
            Data = new { isActive = true },
            Message = "Kullanıcı durumu başarıyla değiştirildi"
        });
    }

    [HttpPost("{id}/reset-password")]
    public async Task<IActionResult> ResetPassword(Guid id)
    {
        return Ok(new ApiResponse<object>
        {
            Success = true,
            Data = new { temporaryPassword = "Temp@123456" },
            Message = "Şifre başarıyla sıfırlandı"
        });
    }

    [HttpGet("{id}/permissions")]
    public async Task<IActionResult> GetUserPermissions(Guid id)
    {
        var permissions = new
        {
            modules = new[]
            {
                new
                {
                    name = "Users",
                    permissions = new[]
                    {
                        new { code = "users.view", name = "Görüntüle", granted = true },
                        new { code = "users.create", name = "Oluştur", granted = true },
                        new { code = "users.edit", name = "Düzenle", granted = true },
                        new { code = "users.delete", name = "Sil", granted = false }
                    }
                },
                new
                {
                    name = "Reports",
                    permissions = new[]
                    {
                        new { code = "reports.view", name = "Görüntüle", granted = true },
                        new { code = "reports.create", name = "Oluştur", granted = false },
                        new { code = "reports.export", name = "Dışa Aktar", granted = true }
                    }
                }
            }
        };

        return Ok(new ApiResponse<object>
        {
            Success = true,
            Data = permissions,
            Message = "Kullanıcı yetkileri başarıyla getirildi"
        });
    }

    [HttpPut("{id}/permissions")]
    public async Task<IActionResult> UpdateUserPermissions(Guid id, [FromBody] UpdatePermissionsRequest request)
    {
        return Ok(new ApiResponse<bool>
        {
            Success = true,
            Data = true,
            Message = "Kullanıcı yetkileri başarıyla güncellendi"
        });
    }

    [HttpGet("roles")]
    public async Task<IActionResult> GetRoles()
    {
        var roles = new[]
        {
            new { id = 1, name = "Admin", description = "Sistem Yöneticisi", userCount = 2 },
            new { id = 2, name = "Manager", description = "Yönetici", userCount = 5 },
            new { id = 3, name = "User", description = "Kullanıcı", userCount = 15 },
            new { id = 4, name = "ReadOnly", description = "Sadece Görüntüleme", userCount = 3 }
        };

        return Ok(new ApiResponse<object>
        {
            Success = true,
            Data = roles,
            Message = "Roller başarıyla listelendi"
        });
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