namespace Stocker.Application.Common.Interfaces;

/// <summary>
/// Service for security and authentication audit logging
/// </summary>
public interface ISecurityAuditService
{
    /// <summary>
    /// Log authentication event (login, logout, etc.)
    /// </summary>
    Task LogAuthEventAsync(SecurityAuditEvent evt, CancellationToken cancellationToken = default);

    /// <summary>
    /// Log security event (rate limit, blocked, HMAC failure, etc.)
    /// </summary>
    Task LogSecurityEventAsync(SecurityAuditEvent evt, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get security audit logs with filtering
    /// </summary>
    Task<IEnumerable<SecurityAuditEvent>> GetAuditLogsAsync(
        SecurityAuditFilter filter,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Get failed login attempts for email (for rate limiting)
    /// </summary>
    Task<int> GetFailedLoginAttemptsAsync(
        string email,
        TimeSpan timeWindow,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Get suspicious activity count for IP address
    /// </summary>
    Task<int> GetSuspiciousActivityCountAsync(
        string ipAddress,
        TimeSpan timeWindow,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Check if user has unusual login pattern (new location, new device, etc.)
    /// </summary>
    Task<bool> HasUnusualLoginPatternAsync(
        string email,
        string ipAddress,
        string? userAgent = null,
        CancellationToken cancellationToken = default);
}

/// <summary>
/// Security audit event model
/// </summary>
public class SecurityAuditEvent
{
    public string Event { get; set; } = default!;
    public string? Email { get; set; }
    public string? TenantCode { get; set; }
    public Guid? UserId { get; set; }
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
    public string? RequestId { get; set; }
    public int? RiskScore { get; set; }
    public bool Blocked { get; set; }
    public string? Metadata { get; set; } // JSON
    public int? DurationMs { get; set; }
    public string? GdprCategory { get; set; }
}

/// <summary>
/// Filter for security audit logs
/// </summary>
public class SecurityAuditFilter
{
    public string? Email { get; set; }
    public string? TenantCode { get; set; }
    public string? IpAddress { get; set; }
    public string? Event { get; set; }
    public int? MinRiskScore { get; set; }
    public bool? BlockedOnly { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}
