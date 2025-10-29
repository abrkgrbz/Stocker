using Stocker.Modules.CRM.Domain.Enums;

namespace Stocker.Modules.CRM.Application.DTOs;

public class ActivityDto
{
    public Guid Id { get; set; }
    public string Subject { get; set; } = string.Empty;
    public string? Description { get; set; }
    public ActivityType Type { get; set; }
    public ActivityStatus Status { get; set; }
    public ActivityPriority Priority { get; set; }
    public DateTime DueDate { get; set; }
    public DateTime? CompletedAt { get; set; }
    public int? Duration { get; set; }
    public string? Location { get; set; }
    public Guid? LeadId { get; set; }
    public string? LeadName { get; set; }
    public Guid? CustomerId { get; set; }
    public string? CustomerName { get; set; }
    public Guid? ContactId { get; set; }
    public string? ContactName { get; set; }
    public Guid? OpportunityId { get; set; }
    public string? OpportunityName { get; set; }
    public Guid? DealId { get; set; }
    public string? DealTitle { get; set; }
    public string? AssignedToId { get; set; }
    public string? AssignedToName { get; set; }
    public string? Outcome { get; set; }
    public string? Notes { get; set; }
    public bool IsOverdue => !CompletedAt.HasValue && DueDate < DateTime.UtcNow;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    
    // Frontend compatibility aliases
    public string Title => Subject;
    public DateTime StartTime => DueDate;
    public DateTime? EndTime => Duration.HasValue ? DueDate.AddMinutes(Duration.Value) : null;
}

public class ActivityStatisticsDto
{
    public int TotalActivities { get; set; }
    public int CompletedActivities { get; set; }
    public int PendingActivities { get; set; }
    public int OverdueActivities { get; set; }
    public decimal CompletionRate { get; set; }
    public Dictionary<ActivityType, int> ActivitiesByType { get; set; } = new();
    public Dictionary<ActivityStatus, int> ActivitiesByStatus { get; set; } = new();
    public List<UserActivityDto> UserActivities { get; set; } = new();
    public List<DailyActivityDto> DailyActivities { get; set; } = new();
}

public class UserActivityDto
{
    public string UserId { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public int TotalActivities { get; set; }
    public int CompletedActivities { get; set; }
    public int OverdueActivities { get; set; }
    public decimal CompletionRate { get; set; }
}

public class DailyActivityDto
{
    public DateTime Date { get; set; }
    public int CreatedCount { get; set; }
    public int CompletedCount { get; set; }
    public int OverdueCount { get; set; }
}
