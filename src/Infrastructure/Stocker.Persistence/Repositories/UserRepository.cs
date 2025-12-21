using Microsoft.EntityFrameworkCore;
using Stocker.Application.DTOs.Tenant.Users;
using Stocker.Application.Interfaces.Repositories;
using Stocker.Domain.Tenant.Entities;
using Stocker.Persistence.Contexts;
using BCrypt.Net;

namespace Stocker.Persistence.Repositories;

public class UserRepository : IUserRepository
{
    private readonly TenantDbContext _tenantContext;
    private readonly MasterDbContext _masterContext;

    public UserRepository(TenantDbContext tenantContext, MasterDbContext masterContext)
    {
        _tenantContext = tenantContext;
        _masterContext = masterContext;
    }

    // Tenant Users Implementation
    public async Task<UsersListDto> GetTenantUsersAsync(Guid tenantId, int page = 1, int pageSize = 10, string? searchTerm = null, CancellationToken cancellationToken = default)
    {
        // Build query without navigation properties (not defined in entity)
        var query = _tenantContext.TenantUsers
            .Where(u => u.TenantId == tenantId);

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            query = query.Where(u => 
                u.FirstName.Contains(searchTerm) ||
                u.LastName.Contains(searchTerm) ||
                u.Email.Value.Contains(searchTerm) ||
                u.Username.Contains(searchTerm));
        }

        var totalItems = await query.CountAsync(cancellationToken);
        var totalPages = (int)Math.Ceiling((double)totalItems / pageSize);

        // Get paginated data with eager loading
        var usersWithRoles = await query
            .OrderByDescending(u => u.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(u => new
            {
                User = u,
                RoleNames = _tenantContext.UserRoles
                    .Where(ur => ur.UserId == u.Id)
                    .Join(_tenantContext.Roles, ur => ur.RoleId, r => r.Id, (ur, r) => r.Name)
                    .ToList()
            })
            .ToListAsync(cancellationToken);

        // Map to DTOs after fetching
        var users = usersWithRoles.Select(item => new UserDto
        {
            Id = item.User.Id,
            Username = item.User.Username,
            Email = item.User.Email.Value,
            FirstName = item.User.FirstName,
            LastName = item.User.LastName,
            Roles = item.RoleNames.Count > 0 ? item.RoleNames : new List<string> { "User" },
            Department = item.User.DepartmentId.HasValue
                ? _tenantContext.Departments.Where(d => d.Id == item.User.DepartmentId.Value).Select(d => d.Name).FirstOrDefault()
                : null,
            Branch = item.User.BranchId.HasValue
                ? _tenantContext.Branches.Where(b => b.Id == item.User.BranchId.Value).Select(b => b.Name).FirstOrDefault()
                : null,
            IsActive = item.User.Status == Domain.Tenant.Enums.TenantUserStatus.Active,
            LastLoginDate = item.User.LastLoginAt,
            CreatedDate = item.User.CreatedAt
        }).ToList();

        return new UsersListDto
        {
            Items = users,
            TotalItems = totalItems,
            Page = page,
            PageSize = pageSize,
            TotalPages = totalPages
        };
    }

    public async Task<UserDetailDto?> GetTenantUserByIdAsync(Guid tenantId, Guid userId, CancellationToken cancellationToken = default)
    {
        // Fetch user (navigation properties not available)
        var user = await _tenantContext.TenantUsers
            .Where(u => u.Id == userId)
            .FirstOrDefaultAsync(cancellationToken);

        if (user == null)
            return null;

        // Fetch roles separately
        var userRoles = await _tenantContext.UserRoles
            .Where(ur => ur.UserId == userId)
            .Join(_tenantContext.Roles, ur => ur.RoleId, r => r.Id, (ur, r) => r)
            .ToListAsync(cancellationToken);

        var userPermissions = await _tenantContext.UserPermissions
            .Where(up => up.UserId == userId)
            .ToListAsync(cancellationToken);

        // Map to DTO
        return new UserDetailDto
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email.Value,
            FirstName = user.FirstName,
            LastName = user.LastName,
            PhoneNumber = user.Phone?.Value,
            Title = user.Title,
            Bio = null,
            Avatar = user.ProfilePictureUrl,
            IsActive = user.Status == Domain.Tenant.Enums.TenantUserStatus.Active,
            EmailConfirmed = true,
            PhoneNumberConfirmed = false,
            TwoFactorEnabled = false,
            LockoutEnabled = false,
            LockoutEnd = null,
            AccessFailedCount = 0,
            LastLoginDate = user.LastLoginAt,
            LastPasswordChangeDate = null,
            CreatedDate = user.CreatedAt,
            ModifiedDate = user.UpdatedAt,
            Department = user.DepartmentId.HasValue
                ? new DepartmentDto
                {
                    Id = user.DepartmentId.Value,
                    Name = await _tenantContext.Departments.Where(d => d.Id == user.DepartmentId.Value).Select(d => d.Name).FirstOrDefaultAsync(cancellationToken) ?? ""
                }
                : null,
            Branch = user.BranchId.HasValue
                ? new BranchDto
                {
                    Id = user.BranchId.Value,
                    Name = await _tenantContext.Branches.Where(b => b.Id == user.BranchId.Value).Select(b => b.Name).FirstOrDefaultAsync(cancellationToken) ?? ""
                }
                : null,
            Roles = userRoles.Select(r => new RoleDto
            {
                Id = r.Id,
                Name = r.Name,
                Description = r.Description ?? "",
                Permissions = _tenantContext.RolePermissions
                    .Where(rp => rp.RoleId == r.Id)
                    .Select(rp => $"{rp.Resource}:{rp.PermissionType}")
                    .ToList()
            }).ToList(),
            Permissions = userPermissions
                .Select(up => $"{up.Resource}:{up.PermissionType}")
                .ToList(),
            Settings = new UserSettingsDto
            {
                Theme = "light",
                Language = "tr",
                NotificationsEnabled = true,
                EmailNotifications = true,
                SmsNotifications = false
            }
        };
    }

    public async Task<TenantUser> CreateTenantUserAsync(TenantUser user, CancellationToken cancellationToken = default)
    {
        // TenantUser is created through factory methods, not directly
        // This method signature needs to be changed
        _tenantContext.TenantUsers.Add(user);
        await _tenantContext.SaveChangesAsync(cancellationToken);

        return user;
    }

    public async Task<TenantUser?> GetTenantUserEntityByIdAsync(Guid tenantId, Guid userId, CancellationToken cancellationToken = default)
    {
        return await _tenantContext.TenantUsers
            .FirstOrDefaultAsync(u => u.Id == userId && u.TenantId == tenantId, cancellationToken);
    }

    public async Task<TenantUser?> UpdateTenantUserAsync(TenantUser user, CancellationToken cancellationToken = default)
    {
        _tenantContext.TenantUsers.Update(user);
        await _tenantContext.SaveChangesAsync(cancellationToken);
        return user;
    }

    public async Task<TenantUser?> UpdateTenantUserAsync(Guid tenantId, Guid userId, TenantUser user, CancellationToken cancellationToken = default)
    {
        var existingUser = await _tenantContext.TenantUsers
            .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);

        if (existingUser == null)
            return null;

        // TenantUser entity has read-only properties, need to use Update methods
        existingUser.UpdateProfile(
            user.FirstName,
            user.LastName,
            user.Phone,
            user.Mobile,
            user.Title);
        
        existingUser.UpdateEmployeeInfo(
            user.EmployeeCode,
            user.DepartmentId,
            user.BranchId,
            user.ManagerId);

        await _tenantContext.SaveChangesAsync(cancellationToken);

        return existingUser;
    }

    public async Task<bool> DeleteTenantUserAsync(Guid tenantId, Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await _tenantContext.TenantUsers
            .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);

        if (user == null)
            return false;

        // Soft delete - just deactivate the user
        user.Deactivate();

        await _tenantContext.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<bool> ToggleUserStatusAsync(Guid tenantId, Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await _tenantContext.TenantUsers
            .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);

        if (user == null)
            return false;

        if (user.Status == Domain.Tenant.Enums.TenantUserStatus.Active)
            user.Deactivate();
        else
            user.Activate();

        await _tenantContext.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<bool> ResetUserPasswordAsync(Guid tenantId, Guid userId, string newPassword, CancellationToken cancellationToken = default)
    {
        var user = await _tenantContext.TenantUsers
            .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);

        if (user == null)
            return false;

        // Password is managed at MasterUser level, not TenantUser
        // This functionality needs to be moved to MasterUser management
        return false;
    }

    public async Task<List<RoleDto>> GetRolesAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        // Fetch roles without navigation property (not available)
        // Database-per-tenant: TenantId filtrelemeye gerek yok
        var roles = await _tenantContext.Roles
            .ToListAsync(cancellationToken);

        // Map to DTOs with separate permission query and user count
        return roles.Select(r => new RoleDto
        {
            Id = r.Id,
            Name = r.Name,
            Description = r.Description ?? "",
            Permissions = _tenantContext.RolePermissions
                .Where(rp => rp.RoleId == r.Id)
                .Select(rp => $"{rp.Resource}:{rp.PermissionType}")
                .ToList(),
            UserCount = _tenantContext.UserRoles
                .Count(ur => ur.RoleId == r.Id),
            IsSystemRole = r.IsSystemRole,
            CreatedDate = r.CreatedDate
        }).ToList();
    }

    private async Task<List<RoleDto>> GetRolesAsyncOriginal(Guid tenantId, CancellationToken cancellationToken = default)
    {
        // Database-per-tenant: TenantId filtrelemeye gerek yok
        var roles = await _tenantContext.Roles
            .Select(r => new RoleDto
            {
                Id = r.Id,
                Name = r.Name,
                Description = r.Description ?? "",
                Permissions = _tenantContext.RolePermissions
                    .Where(rp => rp.RoleId == r.Id)
                    .Select(rp => $"{rp.Resource}:{rp.PermissionType}")
                    .ToList()
            })
            .ToListAsync(cancellationToken);

        return roles;
    }

    public async Task<int> GetTenantUserCountAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        return await _tenantContext.TenantUsers
            .Where(u => u.TenantId == tenantId)
            .CountAsync(cancellationToken);
    }

    public async Task<bool> AssignRoleAsync(Guid tenantId, Guid userId, Guid roleId, CancellationToken cancellationToken = default)
    {
        var user = await _tenantContext.TenantUsers
            .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);

        if (user == null)
            return false;

        var role = await _tenantContext.Roles
            .FirstOrDefaultAsync(r => r.Id == roleId, cancellationToken);

        if (role == null)
            return false;

        // Remove existing roles
        var existingUserRoles = await _tenantContext.UserRoles
            .Where(ur => ur.UserId == userId)
            .ToListAsync(cancellationToken);

        _tenantContext.UserRoles.RemoveRange(existingUserRoles);

        // Add new role
        var userRole = new UserRole(userId, roleId, tenantId);

        _tenantContext.UserRoles.Add(userRole);
        await _tenantContext.SaveChangesAsync(cancellationToken);

        return true;
    }

    // Master Users Implementation
    public async Task<object> GetMasterUsersAsync(int page = 1, int pageSize = 10, string? searchTerm = null, CancellationToken cancellationToken = default)
    {
        var query = _masterContext.MasterUsers.AsQueryable();

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            query = query.Where(u => 
                u.FirstName.Contains(searchTerm) ||
                u.LastName.Contains(searchTerm) ||
                u.Email.Value.Contains(searchTerm) ||
                u.Username.Contains(searchTerm));
        }

        var totalItems = await query.CountAsync(cancellationToken);
        var totalPages = (int)Math.Ceiling((double)totalItems / pageSize);

        var users = await query
            .OrderByDescending(u => u.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(u => new
            {
                id = u.Id,
                username = u.Username,
                email = u.Email.Value,
                name = u.FirstName + " " + u.LastName,
                isActive = u.IsActive,
                isSystemAdmin = u.UserType == Domain.Master.Enums.UserType.SistemYoneticisi,
                lastLoginDate = u.LastLoginAt,
                createdDate = u.CreatedAt,
                // UserTenants moved to Tenant domain
                tenants = _masterContext.Tenants
                    .Select(t => new
                    {
                        id = t.Id,
                        name = t.Name,
                        subdomain = t.Code
                    })
                    .ToList()
            })
            .ToListAsync(cancellationToken);

        return new
        {
            items = users,
            totalItems,
            page,
            pageSize,
            totalPages
        };
    }

    public async Task<object?> GetMasterUserByIdAsync(string userId, CancellationToken cancellationToken = default)
    {
        if (!Guid.TryParse(userId, out var guidUserId))
        {
            return null; // Invalid GUID format
        }

        var user = await _masterContext.MasterUsers
            .Include(u => u.LoginHistory)
            .Where(u => u.Id == guidUserId)
            .Select(u => new
            {
                id = u.Id,
                username = u.Username,
                email = u.Email.Value,
                name = u.FirstName + " " + u.LastName,
                phoneNumber = u.PhoneNumber != null ? u.PhoneNumber.Value : null,
                isActive = u.IsActive,
                isSystemAdmin = u.UserType == Domain.Master.Enums.UserType.SistemYoneticisi,
                emailConfirmed = u.IsEmailVerified,
                phoneNumberConfirmed = false,
                twoFactorEnabled = u.TwoFactorEnabled,
                lockoutEnabled = u.LockoutEndAt.HasValue,
                lockoutEnd = u.LockoutEndAt,
                accessFailedCount = u.FailedLoginAttempts,
                lastLoginDate = u.LastLoginAt,
                lastPasswordChangeDate = u.PasswordChangedAt,
                createdDate = u.CreatedAt,
                modifiedDate = u.CreatedAt,
                // UserTenants moved to Tenant domain
                tenants = _masterContext.Tenants
                    .Select(t => new
                    {
                        id = t.Id,
                        name = t.Name,
                        subdomain = t.Code,
                        isActive = t.IsActive,
                        assignedDate = (DateTime?)null
                    })
                    .ToList(),
                loginHistory = u.LoginHistory
                    .OrderByDescending(ulh => ulh.LoginAt)
                    .Take(10)
                    .Select(ulh => new
                    {
                        loginTime = ulh.LoginAt,
                        ipAddress = ulh.IpAddress,
                        userAgent = ulh.UserAgent,
                        isSuccessful = ulh.IsSuccessful
                    })
                    .ToList()
            })
            .FirstOrDefaultAsync(cancellationToken);

        return user;
    }

    public async Task<bool> ToggleMasterUserStatusAsync(string userId, CancellationToken cancellationToken = default)
    {
        if (!Guid.TryParse(userId, out var guidUserId))
        {
            return false; // Invalid GUID format
        }

        var user = await _masterContext.MasterUsers
            .FirstOrDefaultAsync(u => u.Id == guidUserId, cancellationToken);

        if (user == null)
            return false;

        if (user.IsActive)
            user.Deactivate();
        else
            user.Activate();

        await _masterContext.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<bool> AssignTenantToUserAsync(string userId, Guid tenantId, CancellationToken cancellationToken = default)
    {
        if (!Guid.TryParse(userId, out var guidUserId))
        {
            return false; // Invalid GUID format
        }

        var user = await _masterContext.MasterUsers
            // UserTenants moved to Tenant domain
            .FirstOrDefaultAsync(u => u.Id == guidUserId, cancellationToken);

        if (user == null)
            return false;

        var tenant = await _masterContext.Tenants
            .FirstOrDefaultAsync(t => t.Id == tenantId, cancellationToken);

        if (tenant == null)
            return false;

        // UserTenants moved to Tenant domain - tenant assignment should be done through Tenant context
        // For now, just call the method which will throw NotSupportedException
        try
        {
            user.AssignToTenant(tenantId, Domain.Master.Enums.UserType.Personel);
        }
        catch (NotSupportedException)
        {
            // This operation should be done through Tenant context
            return false;
        }
        
        await _masterContext.SaveChangesAsync(cancellationToken);

        return true;
    }
}