using Microsoft.EntityFrameworkCore;
using Stocker.Application.DTOs.Tenant.Users;
using Stocker.Application.Interfaces.Repositories;
using Stocker.Domain.Tenant.Entities;
using Stocker.Persistence.Contexts;
using BCrypt.Net;

namespace Stocker.Application.Services;

public class UserService : IUserRepository
{
    private readonly TenantDbContext _tenantContext;
    private readonly MasterDbContext _masterContext;

    public UserService(TenantDbContext tenantContext, MasterDbContext masterContext)
    {
        _tenantContext = tenantContext;
        _masterContext = masterContext;
    }

    // Tenant Users Implementation
    public async Task<UsersListDto> GetTenantUsersAsync(Guid tenantId, int page = 1, int pageSize = 10, string? searchTerm = null, CancellationToken cancellationToken = default)
    {
        var query = _tenantContext.TenantUsers
            .Where(u => u.TenantId == tenantId);

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            query = query.Where(u => 
                u.FirstName.Contains(searchTerm) ||
                u.LastName.Contains(searchTerm) ||
                u.Email.Contains(searchTerm) ||
                u.UserName.Contains(searchTerm));
        }

        var totalItems = await query.CountAsync(cancellationToken);
        var totalPages = (int)Math.Ceiling((double)totalItems / pageSize);

        var users = await query
            .OrderByDescending(u => u.CreatedDate)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(u => new UserDto
            {
                Id = u.Id,
                Username = u.UserName,
                Email = u.Email,
                FirstName = u.FirstName,
                LastName = u.LastName,
                Role = _tenantContext.UserRoles
                    .Where(ur => ur.UserId == u.Id)
                    .Join(_tenantContext.Roles, ur => ur.RoleId, r => r.Id, (ur, r) => r.Name)
                    .FirstOrDefault() ?? "User",
                Department = u.DepartmentId.HasValue 
                    ? _tenantContext.Departments.Where(d => d.Id == u.DepartmentId.Value).Select(d => d.Name).FirstOrDefault()
                    : null,
                Branch = u.BranchId.HasValue
                    ? _tenantContext.Branches.Where(b => b.Id == u.BranchId.Value).Select(b => b.Name).FirstOrDefault()
                    : null,
                IsActive = u.IsActive,
                LastLoginDate = u.LastLoginDate,
                CreatedDate = u.CreatedDate
            })
            .ToListAsync(cancellationToken);

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
        var user = await _tenantContext.TenantUsers
            .Where(u => u.TenantId == tenantId && u.Id == userId)
            .Select(u => new UserDetailDto
            {
                Id = u.Id,
                Username = u.UserName,
                Email = u.Email,
                FirstName = u.FirstName,
                LastName = u.LastName,
                PhoneNumber = u.PhoneNumber,
                Title = u.Title,
                Bio = u.Bio,
                Avatar = u.Avatar,
                IsActive = u.IsActive,
                EmailConfirmed = u.EmailConfirmed,
                PhoneNumberConfirmed = u.PhoneNumberConfirmed,
                TwoFactorEnabled = u.TwoFactorEnabled,
                LockoutEnabled = u.LockoutEnabled,
                LockoutEnd = u.LockoutEnd,
                AccessFailedCount = u.AccessFailedCount,
                LastLoginDate = u.LastLoginDate,
                LastPasswordChangeDate = u.LastPasswordChangeDate,
                CreatedDate = u.CreatedDate,
                ModifiedDate = u.ModifiedDate,
                Department = u.DepartmentId.HasValue 
                    ? new DepartmentDto
                    {
                        Id = u.DepartmentId.Value,
                        Name = _tenantContext.Departments.Where(d => d.Id == u.DepartmentId.Value).Select(d => d.Name).FirstOrDefault() ?? ""
                    }
                    : null,
                Branch = u.BranchId.HasValue
                    ? new BranchDto
                    {
                        Id = u.BranchId.Value,
                        Name = _tenantContext.Branches.Where(b => b.Id == u.BranchId.Value).Select(b => b.Name).FirstOrDefault() ?? ""
                    }
                    : null,
                Roles = _tenantContext.UserRoles
                    .Where(ur => ur.UserId == u.Id)
                    .Join(_tenantContext.Roles, ur => ur.RoleId, r => r.Id, (ur, r) => new RoleDto
                    {
                        Id = r.Id,
                        Name = r.Name,
                        Description = r.Description ?? "",
                        Permissions = _tenantContext.RolePermissions
                            .Where(rp => rp.RoleId == r.Id)
                            .Select(rp => $"{rp.Resource}:{rp.PermissionType}")
                            .ToList()
                    })
                    .ToList(),
                Permissions = _tenantContext.UserPermissions
                    .Where(up => up.UserId == u.Id)
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
            })
            .FirstOrDefaultAsync(cancellationToken);

        return user;
    }

    public async Task<TenantUser> CreateTenantUserAsync(TenantUser user, CancellationToken cancellationToken = default)
    {
        // Hash password
        if (!string.IsNullOrEmpty(user.PasswordHash))
        {
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(user.PasswordHash);
        }

        user.CreatedDate = DateTime.UtcNow;
        user.IsActive = true;

        _tenantContext.TenantUsers.Add(user);
        await _tenantContext.SaveChangesAsync(cancellationToken);

        return user;
    }

    public async Task<TenantUser?> UpdateTenantUserAsync(Guid tenantId, Guid userId, TenantUser user, CancellationToken cancellationToken = default)
    {
        var existingUser = await _tenantContext.TenantUsers
            .FirstOrDefaultAsync(u => u.TenantId == tenantId && u.Id == userId, cancellationToken);

        if (existingUser == null)
            return null;

        existingUser.FirstName = user.FirstName;
        existingUser.LastName = user.LastName;
        existingUser.Email = user.Email;
        existingUser.PhoneNumber = user.PhoneNumber;
        existingUser.Title = user.Title;
        existingUser.Bio = user.Bio;
        existingUser.Avatar = user.Avatar;
        existingUser.DepartmentId = user.DepartmentId;
        existingUser.BranchId = user.BranchId;
        existingUser.ModifiedDate = DateTime.UtcNow;

        await _tenantContext.SaveChangesAsync(cancellationToken);

        return existingUser;
    }

    public async Task<bool> DeleteTenantUserAsync(Guid tenantId, Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await _tenantContext.TenantUsers
            .FirstOrDefaultAsync(u => u.TenantId == tenantId && u.Id == userId, cancellationToken);

        if (user == null)
            return false;

        // Soft delete
        user.IsDeleted = true;
        user.DeletedDate = DateTime.UtcNow;
        user.IsActive = false;

        await _tenantContext.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<bool> ToggleUserStatusAsync(Guid tenantId, Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await _tenantContext.TenantUsers
            .FirstOrDefaultAsync(u => u.TenantId == tenantId && u.Id == userId, cancellationToken);

        if (user == null)
            return false;

        user.IsActive = !user.IsActive;
        user.ModifiedDate = DateTime.UtcNow;

        await _tenantContext.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<bool> ResetUserPasswordAsync(Guid tenantId, Guid userId, string newPassword, CancellationToken cancellationToken = default)
    {
        var user = await _tenantContext.TenantUsers
            .FirstOrDefaultAsync(u => u.TenantId == tenantId && u.Id == userId, cancellationToken);

        if (user == null)
            return false;

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
        user.ModifiedDate = DateTime.UtcNow;

        await _tenantContext.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<List<RoleDto>> GetRolesAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        var roles = await _tenantContext.Roles
            .Where(r => r.TenantId == tenantId)
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

    public async Task<bool> AssignRoleAsync(Guid tenantId, Guid userId, Guid roleId, CancellationToken cancellationToken = default)
    {
        var user = await _tenantContext.TenantUsers
            .FirstOrDefaultAsync(u => u.TenantId == tenantId && u.Id == userId, cancellationToken);

        if (user == null)
            return false;

        var role = await _tenantContext.Roles
            .FirstOrDefaultAsync(r => r.TenantId == tenantId && r.Id == roleId, cancellationToken);

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
                tenants = _masterContext.UserTenants
                    .Where(ut => ut.UserId == u.Id)
                    .Join(_masterContext.Tenants, ut => ut.TenantId, t => t.Id, (ut, t) => new
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
        var guidUserId = Guid.Parse(userId);
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
                tenants = _masterContext.UserTenants
                    .Where(ut => ut.UserId == guidUserId)
                    .Join(_masterContext.Tenants, ut => ut.TenantId, t => t.Id, (ut, t) => new
                    {
                        id = t.Id,
                        name = t.Name,
                        subdomain = t.Code,
                        isActive = t.IsActive,
                        assignedDate = ut.AssignedAt
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
        var guidUserId = Guid.Parse(userId);
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
        var guidUserId = Guid.Parse(userId);
        var user = await _masterContext.MasterUsers
            .Include(u => u.UserTenants)
            .FirstOrDefaultAsync(u => u.Id == guidUserId, cancellationToken);

        if (user == null)
            return false;

        var tenant = await _masterContext.Tenants
            .FirstOrDefaultAsync(t => t.Id == tenantId, cancellationToken);

        if (tenant == null)
            return false;

        // Check if already assigned
        if (user.UserTenants.Any(ut => ut.TenantId == tenantId))
            return true; // Already assigned

        user.AssignToTenant(tenantId, Domain.Master.Enums.UserType.Personel);
        
        await _masterContext.SaveChangesAsync(cancellationToken);

        return true;
    }
}