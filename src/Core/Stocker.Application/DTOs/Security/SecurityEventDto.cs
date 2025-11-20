namespace Stocker.Application.DTOs.Security;

/// <summary>
/// Security event DTO for security-focused tab
/// </summary>
public class SecurityEventDto
{
    public Guid Id { get; set; }
    public DateTime Timestamp { get; set; }
    public string Type { get; set; } = string.Empty; // Event type
    public string Severity { get; set; } = string.Empty; // Info, Warning, Error, Critical
    public string Source { get; set; } = string.Empty; // IP address or system component
    public string Target { get; set; } = string.Empty; // User email or resource
    public string Status { get; set; } = string.Empty; // Success, Failed, Blocked
    public string? Description { get; set; } // Event description
    public int? RiskScore { get; set; }
}
