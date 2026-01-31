using MediatR;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace Stocker.API.Controllers.Master;

[SwaggerTag("Master Admin Panel - Role Management")]
public class RolesController : MasterControllerBase
{
    // Master system roles (predefined, not tenant-specific)
    private static readonly List<MasterRoleDto> MasterRoles = new()
    {
        new MasterRoleDto
        {
            Id = "super-admin",
            Name = "Super Admin",
            Description = "Full system access with all permissions",
            Permissions = new List<string>
            {
                "tenants.read", "tenants.create", "tenants.update", "tenants.delete",
                "users.read", "users.create", "users.update", "users.delete",
                "subscriptions.read", "subscriptions.create", "subscriptions.update", "subscriptions.delete",
                "packages.read", "packages.create", "packages.update", "packages.delete",
                "reports.read", "reports.export",
                "analytics.read",
                "settings.read", "settings.update",
                "audit.read", "audit.export",
                "system.manage", "system.maintenance"
            },
            IsSystem = true,
            Color = "red"
        },
        new MasterRoleDto
        {
            Id = "admin",
            Name = "Admin",
            Description = "Administrative access for tenant and user management",
            Permissions = new List<string>
            {
                "tenants.read", "tenants.create", "tenants.update",
                "users.read", "users.create", "users.update",
                "subscriptions.read", "subscriptions.update",
                "packages.read",
                "reports.read", "reports.export",
                "analytics.read",
                "settings.read",
                "audit.read"
            },
            IsSystem = true,
            Color = "blue"
        },
        new MasterRoleDto
        {
            Id = "support",
            Name = "Support",
            Description = "Customer support access for viewing and troubleshooting",
            Permissions = new List<string>
            {
                "tenants.read",
                "users.read",
                "subscriptions.read",
                "reports.read",
                "audit.read"
            },
            IsSystem = true,
            Color = "green"
        },
        new MasterRoleDto
        {
            Id = "viewer",
            Name = "Viewer",
            Description = "Read-only access to dashboards and reports",
            Permissions = new List<string>
            {
                "tenants.read",
                "reports.read",
                "analytics.read"
            },
            IsSystem = true,
            Color = "gray"
        },
        new MasterRoleDto
        {
            Id = "billing",
            Name = "Billing Manager",
            Description = "Access to billing, subscriptions and financial reports",
            Permissions = new List<string>
            {
                "subscriptions.read", "subscriptions.create", "subscriptions.update",
                "packages.read",
                "reports.read", "reports.export"
            },
            IsSystem = true,
            Color = "purple"
        }
    };

    // Master permission definitions
    private static readonly List<MasterPermissionDto> MasterPermissions = new()
    {
        // Tenant permissions
        new MasterPermissionDto { Id = "tenants.read", Name = "View Tenants", Category = "Tenants", Description = "View tenant list and details" },
        new MasterPermissionDto { Id = "tenants.create", Name = "Create Tenants", Category = "Tenants", Description = "Create new tenants" },
        new MasterPermissionDto { Id = "tenants.update", Name = "Update Tenants", Category = "Tenants", Description = "Update tenant information" },
        new MasterPermissionDto { Id = "tenants.delete", Name = "Delete Tenants", Category = "Tenants", Description = "Delete tenants" },

        // User permissions
        new MasterPermissionDto { Id = "users.read", Name = "View Users", Category = "Users", Description = "View user list and details" },
        new MasterPermissionDto { Id = "users.create", Name = "Create Users", Category = "Users", Description = "Create new users" },
        new MasterPermissionDto { Id = "users.update", Name = "Update Users", Category = "Users", Description = "Update user information" },
        new MasterPermissionDto { Id = "users.delete", Name = "Delete Users", Category = "Users", Description = "Delete users" },

        // Subscription permissions
        new MasterPermissionDto { Id = "subscriptions.read", Name = "View Subscriptions", Category = "Subscriptions", Description = "View subscription details" },
        new MasterPermissionDto { Id = "subscriptions.create", Name = "Create Subscriptions", Category = "Subscriptions", Description = "Create new subscriptions" },
        new MasterPermissionDto { Id = "subscriptions.update", Name = "Update Subscriptions", Category = "Subscriptions", Description = "Update subscription details" },
        new MasterPermissionDto { Id = "subscriptions.delete", Name = "Cancel Subscriptions", Category = "Subscriptions", Description = "Cancel or delete subscriptions" },

        // Package permissions
        new MasterPermissionDto { Id = "packages.read", Name = "View Packages", Category = "Packages", Description = "View available packages" },
        new MasterPermissionDto { Id = "packages.create", Name = "Create Packages", Category = "Packages", Description = "Create new packages" },
        new MasterPermissionDto { Id = "packages.update", Name = "Update Packages", Category = "Packages", Description = "Update package details" },
        new MasterPermissionDto { Id = "packages.delete", Name = "Delete Packages", Category = "Packages", Description = "Delete packages" },

        // Reports permissions
        new MasterPermissionDto { Id = "reports.read", Name = "View Reports", Category = "Reports", Description = "View reports and analytics" },
        new MasterPermissionDto { Id = "reports.export", Name = "Export Reports", Category = "Reports", Description = "Export reports to files" },

        // Analytics permissions
        new MasterPermissionDto { Id = "analytics.read", Name = "View Analytics", Category = "Analytics", Description = "View analytics dashboards" },

        // Settings permissions
        new MasterPermissionDto { Id = "settings.read", Name = "View Settings", Category = "Settings", Description = "View system settings" },
        new MasterPermissionDto { Id = "settings.update", Name = "Update Settings", Category = "Settings", Description = "Update system settings" },

        // Audit permissions
        new MasterPermissionDto { Id = "audit.read", Name = "View Audit Logs", Category = "Audit", Description = "View audit logs" },
        new MasterPermissionDto { Id = "audit.export", Name = "Export Audit Logs", Category = "Audit", Description = "Export audit logs" },

        // System permissions
        new MasterPermissionDto { Id = "system.manage", Name = "System Management", Category = "System", Description = "Access system management features" },
        new MasterPermissionDto { Id = "system.maintenance", Name = "System Maintenance", Category = "System", Description = "Perform system maintenance tasks" }
    };

    public RolesController(IMediator mediator, ILogger<RolesController> logger)
        : base(mediator, logger)
    {
    }

    /// <summary>
    /// Get all master roles
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<List<MasterRoleDto>>), 200)]
    public Task<IActionResult> GetAll()
    {
        _logger.LogInformation("Getting all master roles");

        return Task.FromResult<IActionResult>(Ok(new ApiResponse<List<MasterRoleDto>>
        {
            Success = true,
            Data = MasterRoles,
            Message = "Roles retrieved successfully"
        }));
    }

    /// <summary>
    /// Get role by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<MasterRoleDto>), 200)]
    [ProducesResponseType(404)]
    public Task<IActionResult> GetById(string id)
    {
        _logger.LogInformation("Getting role {RoleId}", id);

        var role = MasterRoles.FirstOrDefault(r => r.Id == id);

        if (role == null)
        {
            return Task.FromResult<IActionResult>(NotFound(new ApiResponse<MasterRoleDto>
            {
                Success = false,
                Message = $"Role with ID '{id}' not found"
            }));
        }

        return Task.FromResult<IActionResult>(Ok(new ApiResponse<MasterRoleDto>
        {
            Success = true,
            Data = role,
            Message = "Role retrieved successfully"
        }));
    }

    /// <summary>
    /// Get all available permissions
    /// </summary>
    [HttpGet("permissions")]
    [ProducesResponseType(typeof(ApiResponse<List<MasterPermissionDto>>), 200)]
    public Task<IActionResult> GetAllPermissions()
    {
        _logger.LogInformation("Getting all permissions");

        return Task.FromResult<IActionResult>(Ok(new ApiResponse<List<MasterPermissionDto>>
        {
            Success = true,
            Data = MasterPermissions,
            Message = "Permissions retrieved successfully"
        }));
    }

    /// <summary>
    /// Get permissions grouped by category
    /// </summary>
    [HttpGet("permissions/grouped")]
    [ProducesResponseType(typeof(ApiResponse<Dictionary<string, List<MasterPermissionDto>>>), 200)]
    public Task<IActionResult> GetPermissionsGrouped()
    {
        _logger.LogInformation("Getting permissions grouped by category");

        var grouped = MasterPermissions
            .GroupBy(p => p.Category)
            .ToDictionary(g => g.Key, g => g.ToList());

        return Task.FromResult<IActionResult>(Ok(new ApiResponse<Dictionary<string, List<MasterPermissionDto>>>
        {
            Success = true,
            Data = grouped,
            Message = "Permissions retrieved successfully"
        }));
    }

    /// <summary>
    /// Create a new role (custom roles - not system roles)
    /// </summary>
    /// <remarks>
    /// Note: System roles cannot be created. This endpoint is for custom roles only.
    /// Custom roles are stored in the database (future implementation).
    /// </remarks>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<MasterRoleDto>), 201)]
    [ProducesResponseType(400)]
    public Task<IActionResult> Create([FromBody] CreateMasterRoleRequest request)
    {
        _logger.LogInformation("Creating new role: {RoleName}", request.Name);

        // Validate permissions
        var invalidPermissions = request.Permissions
            .Where(p => !MasterPermissions.Any(mp => mp.Id == p))
            .ToList();

        if (invalidPermissions.Any())
        {
            return Task.FromResult<IActionResult>(BadRequest(new ApiResponse<MasterRoleDto>
            {
                Success = false,
                Message = $"Invalid permissions: {string.Join(", ", invalidPermissions)}"
            }));
        }

        // Check for duplicate name
        if (MasterRoles.Any(r => r.Name.Equals(request.Name, StringComparison.OrdinalIgnoreCase)))
        {
            return Task.FromResult<IActionResult>(BadRequest(new ApiResponse<MasterRoleDto>
            {
                Success = false,
                Message = $"A role with name '{request.Name}' already exists"
            }));
        }

        // Note: In a real implementation, this would save to the database
        // For now, we'll return a mock response
        var newRole = new MasterRoleDto
        {
            Id = Guid.NewGuid().ToString(),
            Name = request.Name,
            Description = request.Description,
            Permissions = request.Permissions,
            IsSystem = false,
            Color = request.Color
        };

        _logger.LogInformation("Custom role creation is not persisted yet. Role: {RoleName}", request.Name);

        return Task.FromResult<IActionResult>(Ok(new ApiResponse<MasterRoleDto>
        {
            Success = true,
            Data = newRole,
            Message = "Role created successfully (Note: Custom role persistence not yet implemented)"
        }));
    }

    /// <summary>
    /// Update an existing role
    /// </summary>
    /// <remarks>
    /// Note: System roles cannot be modified.
    /// </remarks>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<bool>), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(400)]
    public Task<IActionResult> Update(string id, [FromBody] UpdateMasterRoleRequest request)
    {
        _logger.LogInformation("Updating role {RoleId}", id);

        var role = MasterRoles.FirstOrDefault(r => r.Id == id);

        if (role == null)
        {
            return Task.FromResult<IActionResult>(NotFound(new ApiResponse<bool>
            {
                Success = false,
                Message = $"Role with ID '{id}' not found"
            }));
        }

        if (role.IsSystem)
        {
            return Task.FromResult<IActionResult>(BadRequest(new ApiResponse<bool>
            {
                Success = false,
                Message = "System roles cannot be modified"
            }));
        }

        // Note: In a real implementation, this would update the database
        _logger.LogInformation("Custom role update is not persisted yet. Role: {RoleId}", id);

        return Task.FromResult<IActionResult>(Ok(new ApiResponse<bool>
        {
            Success = true,
            Data = true,
            Message = "Role updated successfully (Note: Custom role persistence not yet implemented)"
        }));
    }

    /// <summary>
    /// Delete a role
    /// </summary>
    /// <remarks>
    /// Note: System roles cannot be deleted.
    /// </remarks>
    [HttpDelete("{id}")]
    [ProducesResponseType(typeof(ApiResponse<bool>), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(400)]
    public Task<IActionResult> Delete(string id)
    {
        _logger.LogInformation("Deleting role {RoleId}", id);

        var role = MasterRoles.FirstOrDefault(r => r.Id == id);

        if (role == null)
        {
            return Task.FromResult<IActionResult>(NotFound(new ApiResponse<bool>
            {
                Success = false,
                Message = $"Role with ID '{id}' not found"
            }));
        }

        if (role.IsSystem)
        {
            return Task.FromResult<IActionResult>(BadRequest(new ApiResponse<bool>
            {
                Success = false,
                Message = "System roles cannot be deleted"
            }));
        }

        // Note: In a real implementation, this would delete from the database
        _logger.LogInformation("Custom role deletion is not persisted yet. Role: {RoleId}", id);

        return Task.FromResult<IActionResult>(Ok(new ApiResponse<bool>
        {
            Success = true,
            Data = true,
            Message = "Role deleted successfully (Note: Custom role persistence not yet implemented)"
        }));
    }
}

// DTOs
public class MasterRoleDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public List<string> Permissions { get; set; } = new();
    public int UserCount { get; set; }
    public bool IsSystem { get; set; }
    public string Color { get; set; } = string.Empty;
}

public class MasterPermissionDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}

public class CreateMasterRoleRequest
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public List<string> Permissions { get; set; } = new();
    public string Color { get; set; } = "blue";
}

public class UpdateMasterRoleRequest
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public List<string> Permissions { get; set; } = new();
    public string Color { get; set; } = "blue";
}
