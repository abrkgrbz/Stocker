namespace Stocker.Application.DTOs.Security;

/// <summary>
/// Summary audit log DTO for list views
/// </summary>
public class SecurityAuditLogListDto
{
    public Guid Id { get; set; }
    public DateTime Timestamp { get; set; }
    public string Event { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? TenantCode { get; set; }
    public string? IpAddress { get; set; }
    public int? RiskScore { get; set; }
    public string? RiskLevel { get; set; }
    public bool Blocked { get; set; }
    public string? TimeAgo { get; set; }
}
