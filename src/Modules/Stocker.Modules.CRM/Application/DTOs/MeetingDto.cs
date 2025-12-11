using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Domain.Enums;

namespace Stocker.Modules.CRM.Application.DTOs;

public class MeetingDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public MeetingType MeetingType { get; set; }
    public Domain.Entities.MeetingStatus Status { get; set; }
    public MeetingPriority Priority { get; set; }

    // Time Information
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public bool IsAllDay { get; set; }
    public string? Timezone { get; set; }
    public DateTime? ActualStartTime { get; set; }
    public DateTime? ActualEndTime { get; set; }

    // Location Information
    public MeetingLocationType LocationType { get; set; }
    public string? Location { get; set; }
    public string? MeetingRoom { get; set; }
    public string? OnlineMeetingLink { get; set; }
    public string? OnlineMeetingPlatform { get; set; }
    public string? MeetingPassword { get; set; }
    public string? DialInNumber { get; set; }

    // Relationships
    public Guid? CustomerId { get; set; }
    public string? CustomerName { get; set; }
    public Guid? ContactId { get; set; }
    public string? ContactName { get; set; }
    public Guid? LeadId { get; set; }
    public string? LeadName { get; set; }
    public Guid? OpportunityId { get; set; }
    public string? OpportunityName { get; set; }
    public Guid? DealId { get; set; }
    public string? DealTitle { get; set; }
    public Guid? CampaignId { get; set; }
    public string? CampaignName { get; set; }

    // Organizer Information
    public int OrganizerId { get; set; }
    public string? OrganizerName { get; set; }
    public string? OrganizerEmail { get; set; }

    // Content Information
    public string? Agenda { get; set; }
    public string? Notes { get; set; }
    public string? Outcome { get; set; }
    public string? ActionItems { get; set; }

    // Reminder Information
    public bool HasReminder { get; set; }
    public int? ReminderMinutesBefore { get; set; }
    public bool ReminderSent { get; set; }

    // Recurrence Information
    public bool IsRecurring { get; set; }
    public string? RecurrencePattern { get; set; }
    public Guid? ParentMeetingId { get; set; }
    public DateTime? RecurrenceEndDate { get; set; }

    // Recording Information
    public bool HasRecording { get; set; }
    public string? RecordingUrl { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    public TimeSpan Duration => EndTime - StartTime;
    public bool IsUpcoming => Status == Domain.Entities.MeetingStatus.Scheduled && StartTime > DateTime.UtcNow;
    public bool IsOverdue => Status == Domain.Entities.MeetingStatus.Scheduled && EndTime < DateTime.UtcNow;
}
