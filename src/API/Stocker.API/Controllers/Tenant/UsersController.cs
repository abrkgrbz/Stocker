using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.API.Controllers.Base;
using Stocker.Application.DTOs.Tenant.Users;
using Stocker.Application.Features.Tenant.Users.Commands;
using Stocker.Application.Features.Tenant.Users.Queries;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.API.Controllers.Tenant;

[Route("api/tenant/[controller]")]
[ApiController]
[Authorize]
public class UsersController : ApiController
{
    private readonly IMediator _mediator;
    private readonly ICurrentUserService _currentUserService;

    public UsersController(IMediator mediator, ICurrentUserService currentUserService)
    {
        _mediator = mediator;
        _currentUserService = currentUserService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<UsersListDto>), 200)]
    public async Task<IActionResult> GetUsers(
        [FromQuery] int page = 1, 
        [FromQuery] int pageSize = 10, 
        [FromQuery] string? searchTerm = null)
    {
        var tenantId = _currentUserService.TenantId ?? Guid.Empty;
        if (tenantId == Guid.Empty)
        {
            return BadRequest(new ApiResponse<object>
            {
                Success = false,
                Message = "Tenant bulunamadı"
            });
        }

        var query = new GetUsersQuery
        {
            TenantId = tenantId,
            Page = page,
            PageSize = pageSize,
            Search = searchTerm
        };

        var result = await _mediator.Send(query);
        
        return Ok(new ApiResponse<UsersListDto>
        {
            Success = true,
            Data = result,
            Message = "Kullanıcılar başarıyla listelendi"
        });
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<UserDetailDto>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 404)]
    public async Task<IActionResult> GetUser(Guid id)
    {
        var tenantId = _currentUserService.TenantId ?? Guid.Empty;
        if (tenantId == Guid.Empty)
        {
            return BadRequest(new ApiResponse<object>
            {
                Success = false,
                Message = "Tenant bulunamadı"
            });
        }

        var query = new GetUserByIdQuery
        {
            TenantId = tenantId,
            UserId = id
        };

        var result = await _mediator.Send(query);
        
        if (result == null)
        {
            return NotFound(new ApiResponse<object>
            {
                Success = false,
                Message = "Kullanıcı bulunamadı"
            });
        }
        
        return Ok(new ApiResponse<UserDetailDto>
        {
            Success = true,
            Data = result,
            Message = "Kullanıcı detayları başarıyla getirildi"
        });
    }

    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<UserDto>), 201)]
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

        var tenantId = _currentUserService.TenantId ?? Guid.Empty;
        if (tenantId == Guid.Empty)
        {
            return BadRequest(new ApiResponse<object>
            {
                Success = false,
                Message = "Tenant bulunamadı"
            });
        }

        var command = new CreateUserCommand
        {
            TenantId = tenantId,
            Username = dto.Username,
            Email = dto.Email,
            Password = dto.Password,
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Phone = dto.PhoneNumber,
            Role = dto.Role ?? "User",
            Department = dto.Department,
            Branch = dto.Branch,
            CreatedBy = User.Identity?.Name
        };

        var result = await _mediator.Send(command);
        
        return CreatedAtAction(nameof(GetUser), new { id = result.Id }, new ApiResponse<UserDto>
        {
            Success = true,
            Data = result,
            Message = "Kullanıcı başarıyla oluşturuldu"
        });
    }

    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<bool>), 200)]
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

        var tenantId = _currentUserService.TenantId ?? Guid.Empty;
        if (tenantId == Guid.Empty)
        {
            return BadRequest(new ApiResponse<object>
            {
                Success = false,
                Message = "Tenant bulunamadı"
            });
        }

        var command = new UpdateUserCommand
        {
            TenantId = tenantId,
            UserId = id,
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Email = dto.Email,
            Phone = dto.PhoneNumber,
            ModifiedBy = User.Identity?.Name
        };

        var result = await _mediator.Send(command);
        
        if (!result)
        {
            return NotFound(new ApiResponse<bool>
            {
                Success = false,
                Message = "Kullanıcı bulunamadı"
            });
        }
        
        return Ok(new ApiResponse<bool>
        {
            Success = true,
            Data = true,
            Message = "Kullanıcı başarıyla güncellendi"
        });
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(typeof(ApiResponse<bool>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 404)]
    public async Task<IActionResult> DeleteUser(Guid id)
    {
        var tenantId = _currentUserService.TenantId ?? Guid.Empty;
        if (tenantId == Guid.Empty)
        {
            return BadRequest(new ApiResponse<object>
            {
                Success = false,
                Message = "Tenant bulunamadı"
            });
        }

        var command = new DeleteUserCommand
        {
            TenantId = tenantId,
            UserId = id,
            DeletedBy = User.Identity?.Name
        };

        var result = await _mediator.Send(command);
        
        if (!result)
        {
            return NotFound(new ApiResponse<bool>
            {
                Success = false,
                Message = "Kullanıcı bulunamadı"
            });
        }
        
        return Ok(new ApiResponse<bool>
        {
            Success = true,
            Data = true,
            Message = "Kullanıcı başarıyla silindi"
        });
    }

    [HttpPost("{id}/toggle-status")]
    [ProducesResponseType(typeof(ApiResponse<ToggleUserStatusResult>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 404)]
    public async Task<IActionResult> ToggleUserStatus(Guid id)
    {
        var tenantId = _currentUserService.TenantId ?? Guid.Empty;
        if (tenantId == Guid.Empty)
        {
            return BadRequest(new ApiResponse<object>
            {
                Success = false,
                Message = "Tenant bulunamadı"
            });
        }

        var command = new ToggleUserStatusCommand
        {
            TenantId = tenantId,
            UserId = id,
            ModifiedBy = User.Identity?.Name
        };

        var result = await _mediator.Send(command);
        
        return Ok(new ApiResponse<ToggleUserStatusResult>
        {
            Success = true,
            Data = result,
            Message = "Kullanıcı durumu başarıyla güncellendi"
        });
    }

    [HttpPost("{id}/reset-password")]
    [ProducesResponseType(typeof(ApiResponse<bool>), 200)]
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

        var tenantId = _currentUserService.TenantId ?? Guid.Empty;
        if (tenantId == Guid.Empty)
        {
            return BadRequest(new ApiResponse<object>
            {
                Success = false,
                Message = "Tenant bulunamadı"
            });
        }

        var command = new ResetPasswordCommand
        {
            TenantId = tenantId,
            UserId = id,
            NewPassword = dto.NewPassword,
            ModifiedBy = User.Identity?.Name
        };

        var result = await _mediator.Send(command);
        
        if (!result)
        {
            return NotFound(new ApiResponse<bool>
            {
                Success = false,
                Message = "Kullanıcı bulunamadı"
            });
        }
        
        return Ok(new ApiResponse<bool>
        {
            Success = true,
            Data = true,
            Message = "Şifre başarıyla sıfırlandı"
        });
    }

    [HttpGet("roles")]
    [ProducesResponseType(typeof(ApiResponse<List<RoleDto>>), 200)]
    public async Task<IActionResult> GetRoles()
    {
        var tenantId = _currentUserService.TenantId ?? Guid.Empty;
        if (tenantId == Guid.Empty)
        {
            return BadRequest(new ApiResponse<object>
            {
                Success = false,
                Message = "Tenant bulunamadı"
            });
        }

        var query = new GetRolesQuery
        {
            TenantId = tenantId
        };

        var result = await _mediator.Send(query);
        
        return Ok(new ApiResponse<List<RoleDto>>
        {
            Success = true,
            Data = result,
            Message = "Roller başarıyla listelendi"
        });
    }

    [HttpPost("{id}/assign-role")]
    [ProducesResponseType(typeof(ApiResponse<bool>), 200)]
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

        var tenantId = _currentUserService.TenantId ?? Guid.Empty;
        if (tenantId == Guid.Empty)
        {
            return BadRequest(new ApiResponse<object>
            {
                Success = false,
                Message = "Tenant bulunamadı"
            });
        }

        var command = new AssignRoleCommand
        {
            TenantId = tenantId,
            UserId = id,
            RoleId = dto.RoleId,
            ModifiedBy = User.Identity?.Name
        };

        var result = await _mediator.Send(command);
        
        if (!result)
        {
            return NotFound(new ApiResponse<bool>
            {
                Success = false,
                Message = "Kullanıcı veya rol bulunamadı"
            });
        }
        
        return Ok(new ApiResponse<bool>
        {
            Success = true,
            Data = true,
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
    public string? Role { get; set; }
    public string? Department { get; set; }
    public string? Branch { get; set; }
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