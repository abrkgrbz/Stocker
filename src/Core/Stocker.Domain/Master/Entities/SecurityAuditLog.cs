using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Master.Entities;

/// <summary>
/// Security and authentication audit log for compliance and threat detection
/// </summary>
public sealed class SecurityAuditLog : Entity
{
    public DateTime Timestamp { get; private set; }
    public string Event { get; private set; }

    // User/Auth info
    public Guid? UserId { get; private set; }
    public string? Email { get; private set; }
    public string? TenantCode { get; private set; }

    // Request info
    public string? IpAddress { get; private set; }
    public string? UserAgent { get; private set; }
    public string? RequestId { get; private set; }

    // Security
    public int? RiskScore { get; private set; }
    public bool Blocked { get; private set; }

    // Metadata
    public string? Metadata { get; private set; } // JSON
    public int? DurationMs { get; private set; }

    // Compliance
    public string? GdprCategory { get; private set; }
    public int RetentionDays { get; private set; }

    public DateTime CreatedAt { get; private set; }

    private SecurityAuditLog() : base() { } // EF Core

    private SecurityAuditLog(
        string eventName,
        string? email,
        string? tenantCode) : base(Guid.NewGuid())
    {
        Event = eventName;
        Email = email;
        TenantCode = tenantCode;
        Timestamp = DateTime.UtcNow;
        CreatedAt = DateTime.UtcNow;
        RetentionDays = 365;
        Blocked = false;
    }

    /// <summary>
    /// Create authentication audit log
    /// </summary>
    public static SecurityAuditLog CreateAuthEvent(
        string eventName,
        string email,
        string? tenantCode = null,
        Guid? userId = null,
        string? ipAddress = null,
        string? userAgent = null)
    {
        var auditLog = new SecurityAuditLog(eventName, email, tenantCode)
        {
            UserId = userId,
            IpAddress = ipAddress,
            UserAgent = userAgent,
            GdprCategory = "authentication"
        };

        return auditLog;
    }

    /// <summary>
    /// Create security event (rate limit, blocked, etc.)
    /// </summary>
    public static SecurityAuditLog CreateSecurityEvent(
        string eventName,
        string? email = null,
        string? tenantCode = null,
        string? ipAddress = null,
        int? riskScore = null,
        bool blocked = false)
    {
        var auditLog = new SecurityAuditLog(eventName, email, tenantCode)
        {
            IpAddress = ipAddress,
            RiskScore = riskScore,
            Blocked = blocked,
            GdprCategory = "security"
        };

        return auditLog;
    }

    /// <summary>
    /// Set request metadata
    /// </summary>
    public SecurityAuditLog WithRequestInfo(
        string? requestId,
        string? userAgent = null)
    {
        RequestId = requestId;
        if (!string.IsNullOrEmpty(userAgent))
            UserAgent = userAgent;
        return this;
    }

    /// <summary>
    /// Set additional metadata as JSON
    /// </summary>
    public SecurityAuditLog WithMetadata(string jsonMetadata)
    {
        Metadata = jsonMetadata;
        return this;
    }

    /// <summary>
    /// Set execution duration
    /// </summary>
    public SecurityAuditLog WithDuration(int durationMs)
    {
        DurationMs = durationMs;
        return this;
    }

    /// <summary>
    /// Set risk score (0-100)
    /// </summary>
    public SecurityAuditLog WithRiskScore(int score)
    {
        if (score < 0 || score > 100)
            throw new ArgumentException("Risk score must be between 0 and 100", nameof(score));

        RiskScore = score;
        return this;
    }

    /// <summary>
    /// Mark as blocked
    /// </summary>
    public SecurityAuditLog MarkAsBlocked()
    {
        Blocked = true;
        return this;
    }

    /// <summary>
    /// Set custom retention period
    /// </summary>
    public SecurityAuditLog WithRetention(int days)
    {
        if (days < 30)
            throw new ArgumentException("Retention must be at least 30 days", nameof(days));

        RetentionDays = days;
        return this;
    }

    /// <summary>
    /// Calculate risk score based on event patterns
    /// </summary>
    public static int CalculateRiskScore(
        string eventType,
        int failedAttempts = 0,
        bool isVpn = false,
        bool isNewLocation = false)
    {
        int score = 0;

        // Base score by event type
        score += eventType switch
        {
            "login_failed" => 20,
            "login_rate_limit_email" => 40,
            "login_rate_limit_ip" => 50,
            "login_invalid_signature" => 80,
            "multiple_tenant_access" => 60,
            _ => 10
        };

        // Failed attempts multiplier
        score += failedAttempts * 5;

        // VPN/Proxy detection
        if (isVpn) score += 15;

        // New location
        if (isNewLocation) score += 10;

        return Math.Min(score, 100);
    }
}
