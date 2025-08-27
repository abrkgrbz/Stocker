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

    public TenantDataSeeder(TenantDbContext context, ILogger<TenantDataSeeder> logger, Guid tenantId, string? packageType = null)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _tenantId = tenantId;
        _packageType = packageType;
    }

    public async Task SeedAsync()
    {
        await SeedPackageBasedRolesAsync();
        await SeedDefaultAdminUserAsync();
        await _context.SaveChangesAsync();
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
            tenantId: _tenantId,
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
            tenantId: _tenantId,
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
            tenantId: _tenantId,
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
            tenantId: _tenantId,
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
            tenantId: _tenantId,
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

    private async Task SeedDefaultRolesAsync()
    {
        if (await _context.Roles.AnyAsync())
        {
            _logger.LogInformation("Roles already seeded.");
            return;
        }

        var tenantId = _tenantId;

        if (tenantId == Guid.Empty)
        {
            _logger.LogWarning("Cannot seed roles without a valid tenant context.");
            return;
        }

        var roles = new List<TenantEntities.Role>();

        // Admin Role
        var adminRole = TenantEntities.Role.Create(
            tenantId: tenantId,
            name: "Administrator",
            description: "Full system access",
            isSystemRole: true);

        // Add all permissions
        var resources = new[] { "Company", "User", "Role", "Department", "Branch", "Reports", "Settings" };
        foreach (var resource in resources)
        {
            foreach (PermissionType permissionType in Enum.GetValues(typeof(PermissionType)))
            {
                adminRole.AddPermission(resource, permissionType);
            }
        }

        roles.Add(adminRole);

        // Manager Role
        var managerRole = TenantEntities.Role.Create(
            tenantId: tenantId,
            name: "Manager",
            description: "Department/Branch manager access",
            isSystemRole: true);

        // Manager permissions
        var managerResources = new[] { "User", "Department", "Branch", "Reports" };
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

        roles.Add(managerRole);

        // Employee Role
        var employeeRole = TenantEntities.Role.Create(
            tenantId: tenantId,
            name: "Employee",
            description: "Basic employee access",
            isSystemRole: true);

        // Employee permissions
        employeeRole.AddPermission("User", PermissionType.View); // View own profile
        employeeRole.AddPermission("Department", PermissionType.View);
        employeeRole.AddPermission("Branch", PermissionType.View);
        employeeRole.AddPermission("Reports", PermissionType.View);

        roles.Add(employeeRole);

        // Read-Only Role
        var readOnlyRole = TenantEntities.Role.Create(
            tenantId: tenantId,
            name: "Read-Only",
            description: "View-only access",
            isSystemRole: true);

        // Read-only permissions
        foreach (var resource in resources)
        {
            readOnlyRole.AddPermission(resource, PermissionType.View);
        }

        roles.Add(readOnlyRole);

        await _context.Roles.AddRangeAsync(roles);
        _logger.LogInformation("Seeded {Count} default roles.", roles.Count);
    }

    private async Task SeedDefaultAdminUserAsync()
    {
        // Bu metod şu an için devre dışı bırakılmıştır.
        // Tenant admin kullanıcısı, MasterDataSeeder'da oluşturulan "tenantadmin" kullanıcısı ile
        // tenant oluşturulduktan sonra API üzerinden giriş yapılarak eklenmelidir.
        // 
        // Kullanım:
        // 1. MasterDataSeeder'ı çalıştırın (otomatik olarak çalışır)
        // 2. Tenant oluşturun
        // 3. "tenantadmin" kullanıcısı ile o tenant'a giriş yapın:
        //    POST /api/auth/login
        
        await Task.CompletedTask;
        //    Headers: X-Tenant-Code: {tenant-code}
        //    Body: { "username": "tenantadmin", "password": "Admin123!" }
        // 
        // Bu işlem otomatik olarak TenantUser kaydı oluşturacaktır.
        
        _logger.LogInformation("Tenant admin user should be created by logging in with the 'tenantadmin' MasterUser.");
    }
     
}