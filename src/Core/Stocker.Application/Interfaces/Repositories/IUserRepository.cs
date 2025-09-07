using Stocker.Application.DTOs.Tenant.Users;
using Stocker.Domain.Tenant.Entities;

namespace Stocker.Application.Interfaces.Repositories;

public interface IUserRepository
{
    // Tenant Users
    Task<UsersListDto> GetTenantUsersAsync(Guid tenantId, int page = 1, int pageSize = 10, string? searchTerm = null, CancellationToken cancellationToken = default);
    Task<UserDetailDto?> GetTenantUserByIdAsync(Guid tenantId, Guid userId, CancellationToken cancellationToken = default);
    Task<TenantUser> CreateTenantUserAsync(TenantUser user, CancellationToken cancellationToken = default);
    Task<TenantUser?> UpdateTenantUserAsync(Guid tenantId, Guid userId, TenantUser user, CancellationToken cancellationToken = default);
    Task<bool> DeleteTenantUserAsync(Guid tenantId, Guid userId, CancellationToken cancellationToken = default);
    Task<bool> ToggleUserStatusAsync(Guid tenantId, Guid userId, CancellationToken cancellationToken = default);
    Task<bool> ResetUserPasswordAsync(Guid tenantId, Guid userId, string newPassword, CancellationToken cancellationToken = default);
    Task<List<RoleDto>> GetRolesAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<bool> AssignRoleAsync(Guid tenantId, Guid userId, Guid roleId, CancellationToken cancellationToken = default);
    
    // Master Users (Admin Panel)
    Task<object> GetMasterUsersAsync(int page = 1, int pageSize = 10, string? searchTerm = null, CancellationToken cancellationToken = default);
    Task<object?> GetMasterUserByIdAsync(string userId, CancellationToken cancellationToken = default);
    Task<bool> ToggleMasterUserStatusAsync(string userId, CancellationToken cancellationToken = default);
    Task<bool> AssignTenantToUserAsync(string userId, Guid tenantId, CancellationToken cancellationToken = default);
}

public class RoleDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public List<string> Permissions { get; set; } = new();
}