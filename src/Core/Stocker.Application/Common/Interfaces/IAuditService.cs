using Stocker.Application.Common.Models;
using Stocker.SharedKernel.Pagination;

namespace Stocker.Application.Common.Interfaces;

/// <summary>
/// Service for handling audit logging
/// </summary>
public interface IAuditService
{
    /// <summary>
    /// Logs an admin action
    /// </summary>
    Task LogAdminActionAsync(AdminAuditEntry entry);
    
    /// <summary>
    /// Logs a general audit entry
    /// </summary>
    Task LogAsync(AuditEntry entry);
    
    /// <summary>
    /// Gets audit logs with filtering
    /// </summary>
    Task<PagedResult<AdminAuditEntry>> GetAdminAuditLogsAsync(AdminAuditFilter filter);
    
    /// <summary>
    /// Gets audit logs for a specific entity
    /// </summary>
    Task<IEnumerable<AuditEntry>> GetEntityAuditLogsAsync(string entityType, string entityId);
}

/// <summary>
/// Admin audit entry model
/// </summary>
public class AdminAuditEntry
{
    public Guid Id { get; set; }
    public string AdminUserId { get; set; } = default!;
    public string Action { get; set; } = default!;
    public string? Controller { get; set; }
    public string? ActionMethod { get; set; }
    public string? RequestPath { get; set; }
    public string? RequestMethod { get; set; }
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
    public string? RequestData { get; set; }
    public string? Data { get; set; }
    public int? ResponseStatusCode { get; set; }
    public bool Success { get; set; }
    public string? ErrorMessage { get; set; }
    public DateTime Timestamp { get; set; }
    public Guid? TenantId { get; set; }
}

/// <summary>
/// General audit entry model
/// </summary>
public class AuditEntry
{
    public Guid Id { get; set; }
    public string UserId { get; set; } = default!;
    public string EntityType { get; set; } = default!;
    public string EntityId { get; set; } = default!;
    public string Action { get; set; } = default!;
    public string? OldValues { get; set; }
    public string? NewValues { get; set; }
    public DateTime Timestamp { get; set; }
    public Guid? TenantId { get; set; }
}

/// <summary>
/// Filter for admin audit logs
/// </summary>
public class AdminAuditFilter
{
    public string? AdminUserId { get; set; }
    public string? Action { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public bool? SuccessOnly { get; set; }
    public Guid? TenantId { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}