using MediatR;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace Stocker.API.Controllers.Master;

[SwaggerTag("Master Admin Panel - Role Management")]
public class RolesController : MasterControllerBase
{
    public RolesController(IMediator mediator, ILogger<RolesController> logger)
        : base(mediator, logger)
    {
    }

    /// <summary>
    /// Get all roles
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<List<RoleDto>>), 200)]
    public async Task<IActionResult> GetAll()
    {
        _logger.LogInformation("Getting all roles");

        // Mock data - this would typically come from database
        var roles = new List<RoleDto>
        {
            new RoleDto
            {
                Id = Guid.NewGuid().ToString(),
                Name = "Admin",
                Description = "Tam yetki - Tüm işlemleri yapabilir",
                Permissions = new List<string> { "*" },
                UserCount = 5,
                IsSystem = true,
                Color = "red"
            },
            new RoleDto
            {
                Id = Guid.NewGuid().ToString(),
                Name = "Manager",
                Description = "Yönetici yetkisi - Kullanıcı ve rapor yönetimi",
                Permissions = new List<string> { "users.read", "users.write", "reports.*", "settings.read" },
                UserCount = 12,
                IsSystem = false,
                Color = "orange"
            },
            new RoleDto
            {
                Id = Guid.NewGuid().ToString(),
                Name = "User",
                Description = "Standart kullanıcı - Temel okuma yetkileri",
                Permissions = new List<string> { "profile.*", "reports.read" },
                UserCount = 45,
                IsSystem = false,
                Color = "blue"
            },
            new RoleDto
            {
                Id = Guid.NewGuid().ToString(),
                Name = "Viewer",
                Description = "Görüntüleyici - Sadece okuma yetkisi",
                Permissions = new List<string> { "*.read" },
                UserCount = 8,
                IsSystem = false,
                Color = "green"
            }
        };

        return Ok(new ApiResponse<List<RoleDto>>
        {
            Success = true,
            Data = roles,
            Message = "Roles retrieved successfully"
        });
    }

    /// <summary>
    /// Get role by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<RoleDto>), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetById(Guid id)
    {
        _logger.LogInformation("Getting role {RoleId}", id);

        // Mock data
        var role = new RoleDto
        {
            Id = id.ToString(),
            Name = "Admin",
            Description = "Tam yetki - Tüm işlemleri yapabilir",
            Permissions = new List<string> { "*" },
            UserCount = 5,
            IsSystem = true,
            Color = "red"
        };

        return Ok(new ApiResponse<RoleDto>
        {
            Success = true,
            Data = role,
            Message = "Role retrieved successfully"
        });
    }

    /// <summary>
    /// Get all available permissions
    /// </summary>
    [HttpGet("permissions")]
    [ProducesResponseType(typeof(ApiResponse<List<PermissionDto>>), 200)]
    public async Task<IActionResult> GetAllPermissions()
    {
        _logger.LogInformation("Getting all permissions");

        // Mock permissions data
        var permissions = new List<PermissionDto>
        {
            new PermissionDto
            {
                Id = Guid.NewGuid().ToString(),
                Name = "users.read",
                Category = "Users",
                Description = "View users"
            },
            new PermissionDto
            {
                Id = Guid.NewGuid().ToString(),
                Name = "users.write",
                Category = "Users",
                Description = "Create and edit users"
            },
            new PermissionDto
            {
                Id = Guid.NewGuid().ToString(),
                Name = "users.delete",
                Category = "Users",
                Description = "Delete users"
            },
            new PermissionDto
            {
                Id = Guid.NewGuid().ToString(),
                Name = "reports.read",
                Category = "Reports",
                Description = "View reports"
            },
            new PermissionDto
            {
                Id = Guid.NewGuid().ToString(),
                Name = "reports.write",
                Category = "Reports",
                Description = "Create and edit reports"
            },
            new PermissionDto
            {
                Id = Guid.NewGuid().ToString(),
                Name = "settings.read",
                Category = "Settings",
                Description = "View settings"
            },
            new PermissionDto
            {
                Id = Guid.NewGuid().ToString(),
                Name = "settings.write",
                Category = "Settings",
                Description = "Modify settings"
            }
        };

        return Ok(new ApiResponse<List<PermissionDto>>
        {
            Success = true,
            Data = permissions,
            Message = "Permissions retrieved successfully"
        });
    }

    /// <summary>
    /// Create a new role
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<RoleDto>), 201)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> Create([FromBody] CreateRoleRequest request)
    {
        _logger.LogInformation("Creating new role: {RoleName}", request.Name);

        // Mock creation
        var newRole = new RoleDto
        {
            Id = Guid.NewGuid().ToString(),
            Name = request.Name,
            Description = request.Description,
            Permissions = request.Permissions,
            UserCount = 0,
            IsSystem = false,
            Color = request.Color
        };

        return CreatedAtAction(nameof(GetById), new { id = newRole.Id }, new ApiResponse<RoleDto>
        {
            Success = true,
            Data = newRole,
            Message = "Role created successfully"
        });
    }

    /// <summary>
    /// Update an existing role
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<bool>), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateRoleRequest request)
    {
        _logger.LogInformation("Updating role {RoleId}", id);

        // Mock update
        return Ok(new ApiResponse<bool>
        {
            Success = true,
            Data = true,
            Message = "Role updated successfully"
        });
    }

    /// <summary>
    /// Delete a role
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(typeof(ApiResponse<bool>), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> Delete(Guid id)
    {
        _logger.LogInformation("Deleting role {RoleId}", id);

        // Mock deletion with system role check
        // In real implementation, would check if role.IsSystem and reject deletion

        return Ok(new ApiResponse<bool>
        {
            Success = true,
            Data = true,
            Message = "Role deleted successfully"
        });
    }
}

// DTOs
public class RoleDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public List<string> Permissions { get; set; } = new();
    public int UserCount { get; set; }
    public bool IsSystem { get; set; }
    public string Color { get; set; } = string.Empty;
}

public class PermissionDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}

public class CreateRoleRequest
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public List<string> Permissions { get; set; } = new();
    public string Color { get; set; } = "blue";
}

public class UpdateRoleRequest
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public List<string> Permissions { get; set; } = new();
    public string Color { get; set; } = "blue";
}
