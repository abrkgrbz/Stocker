using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.API.Controllers.Base;
using Stocker.API.Authorization;
using Stocker.Application.Common.Exceptions;
using Stocker.Application.DTOs.Tenant.Users;
using Stocker.Application.Features.Tenant.Roles.Commands;
using Stocker.Application.Features.Tenant.Users.Queries;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.API.Controllers.Tenant;

[Route("api/tenant/[controller]")]
[ApiController]
[Authorize]
[HasPermission("Settings.Roles", "View")] // Default permission for controller
public class RolesController : ApiController
{
    private readonly IMediator _mediator;
    private readonly ICurrentUserService _currentUserService;

    public RolesController(IMediator mediator, ICurrentUserService currentUserService)
    {
        _mediator = mediator;
        _currentUserService = currentUserService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<List<RoleDto>>), 200)]
    public async Task<IActionResult> GetRoles()
    {
        var tenantId = _currentUserService.TenantId ?? Guid.Empty;
        if (tenantId == Guid.Empty)
            throw new UnauthorizedException("Tenant bulunamadı");

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

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<RoleDto>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 404)]
    public async Task<IActionResult> GetRole(Guid id)
    {
        var tenantId = _currentUserService.TenantId ?? Guid.Empty;
        if (tenantId == Guid.Empty)
            throw new UnauthorizedException("Tenant bulunamadı");

        var query = new GetRoleByIdQuery
        {
            TenantId = tenantId,
            RoleId = id
        };

        var result = await _mediator.Send(query);

        if (result == null)
            throw new NotFoundException("Role", id);

        return Ok(new ApiResponse<RoleDto>
        {
            Success = true,
            Data = result,
            Message = "Rol başarıyla getirildi"
        });
    }

    [HttpPost]
    [HasPermission("Settings.Roles", "Create")]
    [ProducesResponseType(typeof(ApiResponse<RoleDto>), 201)]
    [ProducesResponseType(typeof(ApiResponse<object>), 400)]
    public async Task<IActionResult> CreateRole([FromBody] CreateRoleDto dto)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage));
            throw new ValidationException("Model", string.Join(", ", errors));
        }

        var tenantId = _currentUserService.TenantId ?? Guid.Empty;
        if (tenantId == Guid.Empty)
            throw new UnauthorizedException("Tenant bulunamadı");

        var command = new CreateRoleCommand
        {
            TenantId = tenantId,
            Name = dto.Name,
            Description = dto.Description,
            Permissions = dto.Permissions.Select(p => new PermissionDto
            {
                Resource = p.Resource,
                PermissionType = p.PermissionType
            }).ToList()
        };

        var result = await _mediator.Send(command);

        return CreatedAtAction(nameof(GetRoles), new ApiResponse<RoleDto>
        {
            Success = true,
            Data = result,
            Message = "Rol başarıyla oluşturuldu"
        });
    }

    [HttpPut("{id}")]
    [HasPermission("Settings.Roles", "Edit")]
    [ProducesResponseType(typeof(ApiResponse<bool>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 404)]
    public async Task<IActionResult> UpdateRole(Guid id, [FromBody] UpdateRoleDto dto)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage));
            throw new ValidationException("Model", string.Join(", ", errors));
        }

        var tenantId = _currentUserService.TenantId ?? Guid.Empty;
        if (tenantId == Guid.Empty)
            throw new UnauthorizedException("Tenant bulunamadı");

        var command = new UpdateRoleCommand
        {
            TenantId = tenantId,
            RoleId = id,
            Name = dto.Name,
            Description = dto.Description,
            Permissions = dto.Permissions.Select(p => new PermissionDto
            {
                Resource = p.Resource,
                PermissionType = p.PermissionType
            }).ToList()
        };

        var result = await _mediator.Send(command);

        if (!result)
            throw new NotFoundException("Role", id);

        return Ok(new ApiResponse<bool>
        {
            Success = true,
            Data = true,
            Message = "Rol başarıyla güncellendi"
        });
    }

    [HttpDelete("{id}")]
    [HasPermission("Settings.Roles", "Delete")]
    [ProducesResponseType(typeof(ApiResponse<bool>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 404)]
    public async Task<IActionResult> DeleteRole(Guid id)
    {
        var tenantId = _currentUserService.TenantId ?? Guid.Empty;
        if (tenantId == Guid.Empty)
            throw new UnauthorizedException("Tenant bulunamadı");

        var command = new DeleteRoleCommand
        {
            TenantId = tenantId,
            RoleId = id
        };

        try
        {
            var result = await _mediator.Send(command);

            if (!result)
                throw new NotFoundException("Role", id);

            return Ok(new ApiResponse<bool>
            {
                Success = true,
                Data = true,
                Message = "Rol başarıyla silindi"
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new ApiResponse<bool>
            {
                Success = false,
                Message = ex.Message
            });
        }
    }
}

// DTOs
public class CreateRoleDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public List<PermissionItemDto> Permissions { get; set; } = new();
}

public class UpdateRoleDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public List<PermissionItemDto> Permissions { get; set; } = new();
}

public class PermissionItemDto
{
    public string Resource { get; set; } = string.Empty;
    public int PermissionType { get; set; }
}
