namespace Stocker.Application.DTOs.Security;

/// <summary>
/// Statistics for audit logs dashboard
/// </summary>
public class AuditLogStatisticsDto
{
    public int TotalEvents { get; set; }
    public int FailedLogins { get; set; }
    public int SuccessfulOperations { get; set; }
    public int TotalOperations { get; set; }
    public int UniqueUsers { get; set; }
    public int TopOperationsCount { get; set; }
    public int TopUsersCount { get; set; }

    // Additional statistics
    public int BlockedEvents { get; set; }
    public int HighRiskEvents { get; set; }
    public int CriticalEvents { get; set; }

    // Top lists
    public List<TopEventDto> TopEvents { get; set; } = new();
    public List<TopUserDto> TopUsers { get; set; } = new();
}

public class TopEventDto
{
    public string Event { get; set; } = string.Empty;
    public int Count { get; set; }
}

public class TopUserDto
{
    public string Email { get; set; } = string.Empty;
    public int EventCount { get; set; }
    public int FailedAttempts { get; set; }
}
