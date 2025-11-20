namespace Stocker.Application.DTOs.Security;

/// <summary>
/// Detailed security audit log DTO
/// </summary>
public class SecurityAuditLogDto
{
    public Guid Id { get; set; }
    public DateTime Timestamp { get; set; }
    public string Event { get; set; } = string.Empty;

    // User info
    public Guid? UserId { get; set; }
    public string? Email { get; set; }
    public string? TenantCode { get; set; }

    // Request info
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
    public string? RequestId { get; set; }

    // Security
    public int? RiskScore { get; set; }
    public string? RiskLevel { get; set; } // Low, Medium, High, Critical
    public bool Blocked { get; set; }

    // Metadata
    public string? Metadata { get; set; } // JSON string
    public int? DurationMs { get; set; }

    // Compliance
    public string? GdprCategory { get; set; }
    public int RetentionDays { get; set; }

    public DateTime CreatedAt { get; set; }
    public string? TimeAgo { get; set; } // "2 hours ago"
}
