using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.API.Controllers.Base;
using Stocker.Application.Interfaces.Repositories;
using Stocker.Domain.Tenant.Entities;

namespace Stocker.API.Controllers.Tenant;

[Route("api/tenant/[controller]")]
[ApiController]
[Authorize]
public class UsersController : ApiController
{
    private readonly IUserRepository _userRepository;

    public UsersController(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<object>), 200)]
    public async Task<IActionResult> GetUsers(
        [FromQuery] int page = 1, 
        [FromQuery] int pageSize = 10, 
        [FromQuery] string? searchTerm = null)
    {
        // TODO: Get tenantId from current user context
        var tenantId = Guid.NewGuid(); // This should come from ICurrentTenantService
        
        var users = await _userRepository.GetTenantUsersAsync(tenantId, page, pageSize, searchTerm);
        
        return Ok(new ApiResponse<object>
        {
            Success = true,
            Data = users,
            Message = "Kullanıcılar başarıyla listelendi"
        });
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<object>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 404)]
    public async Task<IActionResult> GetUser(Guid id)
    {
        // TODO: Get tenantId from current user context
        var tenantId = Guid.NewGuid();
        
        var user = await _userRepository.GetTenantUserByIdAsync(tenantId, id);
        
        if (user == null)
        {
            return NotFound(new ApiResponse<object>
            {
                Success = false,
                Message = "Kullanıcı bulunamadı"
            });
        }
        
        return Ok(new ApiResponse<object>
        {
            Success = true,
            Data = user,
            Message = "Kullanıcı detayları başarıyla getirildi"
        });
    }

    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<object>), 201)]
    [ProducesResponseType(typeof(ApiResponse<object>), 400)]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new ApiResponse<object>
            {
                Success = false,
                Message = "Geçersiz veri",
                Errors = ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage)).ToList()
            });
        }

        // TODO: Get tenantId from current user context
        var tenantId = Guid.NewGuid();
        
        var user = new TenantUser
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            UserName = dto.Username,
            Email = dto.Email,
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            PhoneNumber = dto.PhoneNumber,
            Title = dto.Title,
            DepartmentId = dto.DepartmentId,
            BranchId = dto.BranchId,
            PasswordHash = dto.Password, // Will be hashed in service
            CreatedDate = DateTime.UtcNow,
            IsActive = true
        };

        var createdUser = await _userRepository.CreateTenantUserAsync(user);
        
        return CreatedAtAction(nameof(GetUser), new { id = createdUser.Id }, new ApiResponse<object>
        {
            Success = true,
            Data = new { id = createdUser.Id },
            Message = "Kullanıcı başarıyla oluşturuldu"
        });
    }

    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<object>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 404)]
    public async Task<IActionResult> UpdateUser(Guid id, [FromBody] UpdateUserDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new ApiResponse<object>
            {
                Success = false,
                Message = "Geçersiz veri",
                Errors = ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage)).ToList()
            });
        }

        // TODO: Get tenantId from current user context
        var tenantId = Guid.NewGuid();
        
        var user = new TenantUser
        {
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Email = dto.Email,
            PhoneNumber = dto.PhoneNumber,
            Title = dto.Title,
            Bio = dto.Bio,
            Avatar = dto.Avatar,
            DepartmentId = dto.DepartmentId,
            BranchId = dto.BranchId
        };

        var updatedUser = await _userRepository.UpdateTenantUserAsync(tenantId, id, user);
        
        if (updatedUser == null)
        {
            return NotFound(new ApiResponse<object>
            {
                Success = false,
                Message = "Kullanıcı bulunamadı"
            });
        }
        
        return Ok(new ApiResponse<object>
        {
            Success = true,
            Message = "Kullanıcı başarıyla güncellendi"
        });
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(typeof(ApiResponse<object>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 404)]
    public async Task<IActionResult> DeleteUser(Guid id)
    {
        // TODO: Get tenantId from current user context
        var tenantId = Guid.NewGuid();
        
        var result = await _userRepository.DeleteTenantUserAsync(tenantId, id);
        
        if (!result)
        {
            return NotFound(new ApiResponse<object>
            {
                Success = false,
                Message = "Kullanıcı bulunamadı"
            });
        }
        
        return Ok(new ApiResponse<object>
        {
            Success = true,
            Message = "Kullanıcı başarıyla silindi"
        });
    }

    [HttpPost("{id}/toggle-status")]
    [ProducesResponseType(typeof(ApiResponse<object>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 404)]
    public async Task<IActionResult> ToggleUserStatus(Guid id)
    {
        // TODO: Get tenantId from current user context
        var tenantId = Guid.NewGuid();
        
        var result = await _userRepository.ToggleUserStatusAsync(tenantId, id);
        
        if (!result)
        {
            return NotFound(new ApiResponse<object>
            {
                Success = false,
                Message = "Kullanıcı bulunamadı"
            });
        }
        
        return Ok(new ApiResponse<object>
        {
            Success = true,
            Message = "Kullanıcı durumu başarıyla güncellendi"
        });
    }

    [HttpPost("{id}/reset-password")]
    [ProducesResponseType(typeof(ApiResponse<object>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 404)]
    public async Task<IActionResult> ResetPassword(Guid id, [FromBody] ResetPasswordDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new ApiResponse<object>
            {
                Success = false,
                Message = "Geçersiz veri",
                Errors = ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage)).ToList()
            });
        }

        // TODO: Get tenantId from current user context
        var tenantId = Guid.NewGuid();
        
        var result = await _userRepository.ResetUserPasswordAsync(tenantId, id, dto.NewPassword);
        
        if (!result)
        {
            return NotFound(new ApiResponse<object>
            {
                Success = false,
                Message = "Kullanıcı bulunamadı"
            });
        }
        
        return Ok(new ApiResponse<object>
        {
            Success = true,
            Message = "Şifre başarıyla sıfırlandı"
        });
    }

    [HttpGet("roles")]
    [ProducesResponseType(typeof(ApiResponse<object>), 200)]
    public async Task<IActionResult> GetRoles()
    {
        // TODO: Get tenantId from current user context
        var tenantId = Guid.NewGuid();
        
        var roles = await _userRepository.GetRolesAsync(tenantId);
        
        return Ok(new ApiResponse<object>
        {
            Success = true,
            Data = roles,
            Message = "Roller başarıyla listelendi"
        });
    }

    [HttpPost("{id}/assign-role")]
    [ProducesResponseType(typeof(ApiResponse<object>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 404)]
    public async Task<IActionResult> AssignRole(Guid id, [FromBody] AssignRoleDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new ApiResponse<object>
            {
                Success = false,
                Message = "Geçersiz veri",
                Errors = ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage)).ToList()
            });
        }

        // TODO: Get tenantId from current user context
        var tenantId = Guid.NewGuid();
        
        var result = await _userRepository.AssignRoleAsync(tenantId, id, dto.RoleId);
        
        if (!result)
        {
            return NotFound(new ApiResponse<object>
            {
                Success = false,
                Message = "Kullanıcı veya rol bulunamadı"
            });
        }
        
        return Ok(new ApiResponse<object>
        {
            Success = true,
            Message = "Rol başarıyla atandı"
        });
    }
}

// DTOs
public class CreateUserDto
{
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public string? Title { get; set; }
    public Guid? DepartmentId { get; set; }
    public Guid? BranchId { get; set; }
}

public class UpdateUserDto
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public string? Title { get; set; }
    public string? Bio { get; set; }
    public string? Avatar { get; set; }
    public Guid? DepartmentId { get; set; }
    public Guid? BranchId { get; set; }
}

public class ResetPasswordDto
{
    public string NewPassword { get; set; } = string.Empty;
}

public class AssignRoleDto
{
    public Guid RoleId { get; set; }
}