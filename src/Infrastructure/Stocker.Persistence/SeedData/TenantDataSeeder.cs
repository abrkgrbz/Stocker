using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using TenantEntities = Stocker.Domain.Tenant.Entities;
using Stocker.Domain.Tenant.Enums;
using Stocker.Persistence.Contexts;
using Stocker.Domain.Common.ValueObjects;

namespace Stocker.Persistence.SeedData;

public class TenantDataSeeder
{
    private readonly TenantDbContext _context;
    private readonly ILogger<TenantDataSeeder> _logger;
    private readonly Guid _tenantId;
    private readonly string? _packageType;
    private readonly Guid? _masterUserId;
    private readonly string? _adminEmail;
    private readonly string? _adminFirstName;
    private readonly string? _adminLastName;

    public TenantDataSeeder(
        TenantDbContext context,
        ILogger<TenantDataSeeder> logger,
        Guid tenantId,
        string? packageType = null,
        Guid? masterUserId = null,
        string? adminEmail = null,
        string? adminFirstName = null,
        string? adminLastName = null)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _tenantId = tenantId;
        _packageType = packageType;
        _masterUserId = masterUserId;
        _adminEmail = adminEmail;
        _adminFirstName = adminFirstName;
        _adminLastName = adminLastName;
    }

    public async Task SeedAsync()
    {
        await SeedPackageBasedRolesAsync();
        await _context.SaveChangesAsync(); // Save roles first so they're available for user creation
        await SeedDefaultAdminUserAsync();
        await _context.SaveChangesAsync(); // Save user after role assignment
    }

    private async Task SeedPackageBasedRolesAsync()
    {
        if (await _context.Roles.AnyAsync())
        {
            _logger.LogInformation("Roles already seeded.");
            return;
        }

        var roles = new List<TenantEntities.Role>();

        // Always create Administrator role
        var adminRole = CreateAdminRole();
        roles.Add(adminRole);

        // Add package-specific roles
        switch (_packageType?.ToLower())
        {
            case "enterprise":
                roles.Add(CreateManagerRole());
                roles.Add(CreateEmployeeRole());
                roles.Add(CreateReadOnlyRole());
                roles.Add(CreateDepartmentHeadRole());
                break;
            
            case "professional":
                roles.Add(CreateManagerRole());
                roles.Add(CreateEmployeeRole());
                roles.Add(CreateReadOnlyRole());
                break;
            
            case "starter":
            default:
                roles.Add(CreateEmployeeRole());
                break;
        }

        await _context.Roles.AddRangeAsync(roles);
        _logger.LogInformation("Seeded {Count} roles for {Package} package.", roles.Count, _packageType ?? "default");
    }

    private TenantEntities.Role CreateAdminRole()
    {
        var adminRole = TenantEntities.Role.Create(
            name: "Administrator",
            description: "Full system access",
            isSystemRole: true);

        // Add all permissions
        var resources = new[] { "Company", "User", "Role", "Department", "Branch", "Reports", "Settings", "Invoice", "Payment" };
        foreach (var resource in resources)
        {
            foreach (PermissionType permissionType in Enum.GetValues(typeof(PermissionType)))
            {
                adminRole.AddPermission(resource, permissionType);
            }
        }

        return adminRole;
    }

    private TenantEntities.Role CreateManagerRole()
    {
        var managerRole = TenantEntities.Role.Create(
            name: "Manager",
            description: "Department/Branch manager access",
            isSystemRole: true);

        // Manager permissions
        var managerResources = new[] { "User", "Department", "Branch", "Reports", "Invoice", "Payment" };
        foreach (var resource in managerResources)
        {
            managerRole.AddPermission(resource, PermissionType.View);
            managerRole.AddPermission(resource, PermissionType.Create);
            managerRole.AddPermission(resource, PermissionType.Edit);
            
            if (resource == "Reports")
            {
                managerRole.AddPermission(resource, PermissionType.Export);
            }
        }

        return managerRole;
    }

    private TenantEntities.Role CreateEmployeeRole()
    {
        var employeeRole = TenantEntities.Role.Create(
            name: "Employee",
            description: "Basic employee access",
            isSystemRole: true);

        // Employee permissions
        employeeRole.AddPermission("User", PermissionType.View); // View own profile
        employeeRole.AddPermission("Department", PermissionType.View);
        employeeRole.AddPermission("Branch", PermissionType.View);
        employeeRole.AddPermission("Reports", PermissionType.View);
        employeeRole.AddPermission("Invoice", PermissionType.View);

        return employeeRole;
    }

    private TenantEntities.Role CreateReadOnlyRole()
    {
        var readOnlyRole = TenantEntities.Role.Create(
            name: "Read-Only",
            description: "View-only access",
            isSystemRole: true);

        // Read-only permissions
        var resources = new[] { "Company", "User", "Role", "Department", "Branch", "Reports", "Settings", "Invoice", "Payment" };
        foreach (var resource in resources)
        {
            readOnlyRole.AddPermission(resource, PermissionType.View);
        }

        return readOnlyRole;
    }

    private TenantEntities.Role CreateDepartmentHeadRole()
    {
        var deptHeadRole = TenantEntities.Role.Create(
            name: "Department Head",
            description: "Department head with special permissions",
            isSystemRole: true);

        // Department Head permissions - similar to Manager but with approval rights
        var resources = new[] { "User", "Department", "Reports", "Invoice", "Payment" };
        foreach (var resource in resources)
        {
            foreach (PermissionType permissionType in Enum.GetValues(typeof(PermissionType)))
            {
                deptHeadRole.AddPermission(resource, permissionType);
            }
        }

        return deptHeadRole;
    }


    private async Task SeedDefaultAdminUserAsync()
    {
        // Validate we have required data
        if (!_masterUserId.HasValue || _masterUserId.Value == Guid.Empty)
        {
            _logger.LogWarning("MasterUserId not provided - TenantUser will not be created");
            return;
        }

        if (string.IsNullOrEmpty(_adminEmail))
        {
            _logger.LogWarning("Admin email not provided - TenantUser will not be created");
            return;
        }

        // Check if TenantUser already exists for this MasterUser
        var existingUser = await _context.TenantUsers
            .FirstOrDefaultAsync(u => u.MasterUserId == _masterUserId.Value);

        if (existingUser != null)
        {
            _logger.LogInformation("TenantUser already exists for MasterUser: {MasterUserId}", _masterUserId);
            return;
        }

        // Get Administrator role
        var adminRole = await _context.Roles
            .FirstOrDefaultAsync(r => r.Name == "Administrator");

        if (adminRole == null)
        {
            _logger.LogError("Administrator role not found - cannot create TenantUser");
            return;
        }

        try
        {
            _logger.LogInformation("Creating TenantUser for MasterUser: {MasterUserId}, Email: {Email}",
                _masterUserId, _adminEmail);

            // Create Email value object
            var emailResult = Email.Create(_adminEmail);
            if (emailResult.IsFailure)
            {
                _logger.LogError("Invalid email format: {Email}", _adminEmail);
                return;
            }

            // Create TenantUser (shadow user referencing MasterUser)
            // Using default password hash for seeded admin (password: Admin123!)
            var defaultPasswordHash = "$2a$11$8h9QGZDKQzCKFJR5YOxYZ.TGQz0KGZDKQzCKFJR5YOxYZ0KGZDKQzC";

            var tenantUser = TenantEntities.TenantUser.Create(
                tenantId: _tenantId,
                masterUserId: _masterUserId.Value,
                username: _adminEmail,
                passwordHash: defaultPasswordHash,
                email: emailResult.Value,
                firstName: _adminFirstName ?? "Admin",
                lastName: _adminLastName ?? "User"
            );

            // Activate user
            tenantUser.Activate();

            // Assign Administrator role
            tenantUser.AssignRole(adminRole.Id);

            _context.TenantUsers.Add(tenantUser);

            _logger.LogInformation(
                "✅ TenantUser created successfully - MasterUserId: {MasterUserId}, Email: {Email}, TenantId: {TenantId}",
                _masterUserId, _adminEmail, _tenantId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "❌ Failed to create TenantUser for MasterUser: {MasterUserId}, Email: {Email}",
                _masterUserId, _adminEmail);
            throw;
        }
    }
     
}