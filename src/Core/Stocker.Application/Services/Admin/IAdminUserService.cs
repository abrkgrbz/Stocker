using Stocker.Application.Common.Models;
using Stocker.Application.Common.Enums;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Services.Admin;

/// <summary>
/// Service for admin user management operations
/// </summary>
public interface IAdminUserService
{
    /// <summary>
    /// Gets all admin users with pagination
    /// </summary>
    Task<Result<PagedResult<AdminUserDto>>> GetAdminUsersAsync(AdminUserFilter filter);
    
    /// <summary>
    /// Creates a new admin user
    /// </summary>
    Task<Result<AdminUserDto>> CreateAdminUserAsync(CreateAdminUserRequest request);
    
    /// <summary>
    /// Updates admin user permissions
    /// </summary>
    Task<Result> UpdateAdminPermissionsAsync(Guid userId, UpdateAdminPermissionsRequest request);
    
    /// <summary>
    /// Enables/Disables an admin user
    /// </summary>
    Task<Result> SetAdminStatusAsync(Guid userId, bool isActive);
    
    /// <summary>
    /// Removes admin privileges from a user
    /// </summary>
    Task<Result> RemoveAdminPrivilegesAsync(Guid userId);
    
    /// <summary>
    /// Gets admin activity summary
    /// </summary>
    Task<Result<AdminActivitySummary>> GetAdminActivitySummaryAsync(Guid userId, DateTime fromDate);
}

/// <summary>
/// Admin user DTO
/// </summary>
public class AdminUserDto
{
    public Guid Id { get; set; }
    public string Email { get; set; } = default!;
    public string FullName { get; set; } = default!;
    public AdminLevel AdminLevel { get; set; }
    public List<string> Permissions { get; set; } = new();
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? LastLoginAt { get; set; }
    public Guid? TenantId { get; set; }
}

/// <summary>
/// Filter for admin users
/// </summary>
public class AdminUserFilter
{
    public string? SearchTerm { get; set; }
    public AdminLevel? Level { get; set; }
    public bool? IsActive { get; set; }
    public Guid? TenantId { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

/// <summary>
/// Request to create admin user
/// </summary>
public class CreateAdminUserRequest
{
    public string Email { get; set; } = default!;
    public string Password { get; set; } = default!;
    public string FullName { get; set; } = default!;
    public AdminLevel AdminLevel { get; set; }
    public List<string> Permissions { get; set; } = new();
    public Guid? TenantId { get; set; }
}

/// <summary>
/// Request to update admin permissions
/// </summary>
public class UpdateAdminPermissionsRequest
{
    public List<string> Permissions { get; set; } = new();
    public AdminLevel? NewLevel { get; set; }
}

/// <summary>
/// Admin activity summary
/// </summary>
public class AdminActivitySummary
{
    public int TotalActions { get; set; }
    public int SuccessfulActions { get; set; }
    public int FailedActions { get; set; }
    public Dictionary<string, int> ActionsByType { get; set; } = new();
    public DateTime LastActivityAt { get; set; }
}