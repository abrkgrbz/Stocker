using Stocker.SharedKernel.MultiTenancy;
using Stocker.Modules.CRM.Domain.Enums;

namespace Stocker.Modules.CRM.Domain.Entities;

public class Activity : TenantEntity
{
    public string Subject { get; private set; }
    public string? Description { get; private set; }
    public ActivityType Type { get; private set; }
    public ActivityStatus Status { get; private set; }
    public ActivityPriority Priority { get; private set; }
    public DateTime? DueDate { get; private set; }
    public DateTime? CompletedDate { get; private set; }
    public TimeSpan? Duration { get; private set; }
    public string? Location { get; private set; }
    
    // Specific relationships
    public Guid? CustomerId { get; private set; }
    public Guid? ContactId { get; private set; }
    public Guid? LeadId { get; private set; }
    public Guid? OpportunityId { get; private set; }
    public Guid? DealId { get; private set; }
    
    // Assignment
    public int OwnerId { get; private set; }
    public int? AssignedToId { get; private set; }
    
    // Communication details
    public string? CallDirection { get; private set; }
    public string? CallDuration { get; private set; }
    public string? CallRecordingUrl { get; private set; }
    public string? EmailFrom { get; private set; }
    public string? EmailTo { get; private set; }
    public string? EmailCc { get; private set; }
    public string? EmailBcc { get; private set; }
    public string? EmailSubject { get; private set; }
    public string? EmailBody { get; private set; }
    public bool? EmailHasAttachments { get; private set; }
    
    // Meeting details
    public DateTime? MeetingStartTime { get; private set; }
    public DateTime? MeetingEndTime { get; private set; }
    public string? MeetingAttendees { get; private set; }
    public string? MeetingAgenda { get; private set; }
    public string? MeetingNotes { get; private set; }
    public string? MeetingLink { get; private set; }
    
    // Task details
    public decimal? TaskProgress { get; private set; }
    public string? TaskOutcome { get; private set; }
    
    public virtual Customer? Customer { get; private set; }
    public virtual Contact? Contact { get; private set; }
    public virtual Lead? Lead { get; private set; }
    public virtual Opportunity? Opportunity { get; private set; }
    public virtual Deal? Deal { get; private set; }
    
    protected Activity() : base() { }
    
    public Activity(
        Guid tenantId,
        string subject,
        ActivityType type,
        int ownerId) : base(Guid.NewGuid(), tenantId)
    {
        Subject = subject;
        Type = type;
        OwnerId = ownerId;
        Status = ActivityStatus.NotStarted;
        Priority = ActivityPriority.Normal;
    }
    
    public void UpdateDetails(string subject, string? description, ActivityPriority priority)
    {
        Subject = subject;
        Description = description;
        Priority = priority;
    }
    
    public void SetDueDate(DateTime? dueDate)
    {
        DueDate = dueDate;
    }
    
    public void AssignTo(int userId)
    {
        AssignedToId = userId;
    }
    
    public void Start()
    {
        if (Status != ActivityStatus.NotStarted)
            throw new InvalidOperationException("Activity has already been started");
            
        Status = ActivityStatus.InProgress;
    }
    
    public void Complete(string? outcome = null)
    {
        Status = ActivityStatus.Completed;
        CompletedDate = DateTime.UtcNow;
        TaskOutcome = outcome;
        
        if (DueDate.HasValue)
        {
            Duration = CompletedDate.Value - DueDate.Value;
        }
    }
    
    public void Cancel(string? reason = null)
    {
        Status = ActivityStatus.Cancelled;
        TaskOutcome = reason;
    }
    
    public void Defer(DateTime newDueDate)
    {
        Status = ActivityStatus.Deferred;
        DueDate = newDueDate;
    }
    
    public void RelateToCustomer(Guid customerId)
    {
        CustomerId = customerId;
        // Clear other relationships
        ContactId = null;
        LeadId = null;
        OpportunityId = null;
        DealId = null;
    }

    public void RelateToContact(Guid contactId)
    {
        ContactId = contactId;
        // Clear other relationships
        CustomerId = null;
        LeadId = null;
        OpportunityId = null;
        DealId = null;
    }

    public void RelateToLead(Guid leadId)
    {
        LeadId = leadId;
        // Clear other relationships
        CustomerId = null;
        ContactId = null;
        OpportunityId = null;
        DealId = null;
    }

    public void RelateToOpportunity(Guid opportunityId)
    {
        OpportunityId = opportunityId;
        // Clear other relationships
        CustomerId = null;
        ContactId = null;
        LeadId = null;
        DealId = null;
    }

    public void RelateToDeal(Guid dealId)
    {
        DealId = dealId;
        // Clear other relationships
        CustomerId = null;
        ContactId = null;
        LeadId = null;
        OpportunityId = null;
    }
    
    // Call activity specific methods
    public void SetCallDetails(string direction, string duration, string? recordingUrl = null)
    {
        if (Type != ActivityType.Call)
            throw new InvalidOperationException("This method is only for Call activities");
            
        CallDirection = direction;
        CallDuration = duration;
        CallRecordingUrl = recordingUrl;
    }
    
    // Email activity specific methods
    public void SetEmailDetails(string from, string to, string subject, string body, 
        string? cc = null, string? bcc = null, bool hasAttachments = false)
    {
        if (Type != ActivityType.Email)
            throw new InvalidOperationException("This method is only for Email activities");
            
        EmailFrom = from;
        EmailTo = to;
        EmailSubject = subject;
        EmailBody = body;
        EmailCc = cc;
        EmailBcc = bcc;
        EmailHasAttachments = hasAttachments;
    }
    
    // Meeting activity specific methods
    public void SetMeetingDetails(DateTime startTime, DateTime endTime, string? location = null,
        string? attendees = null, string? agenda = null, string? meetingLink = null)
    {
        if (Type != ActivityType.Meeting)
            throw new InvalidOperationException("This method is only for Meeting activities");
            
        MeetingStartTime = startTime;
        MeetingEndTime = endTime;
        Location = location;
        MeetingAttendees = attendees;
        MeetingAgenda = agenda;
        MeetingLink = meetingLink;
    }
    
    public void AddMeetingNotes(string notes)
    {
        if (Type != ActivityType.Meeting)
            throw new InvalidOperationException("This method is only for Meeting activities");
            
        MeetingNotes = notes;
    }
    
    // Task activity specific methods
    public void UpdateTaskProgress(decimal progress)
    {
        if (Type != ActivityType.Task)
            throw new InvalidOperationException("This method is only for Task activities");
            
        if (progress < 0 || progress > 100)
            throw new ArgumentException("Progress must be between 0 and 100");
            
        TaskProgress = progress;
        
        if (progress == 100 && Status != ActivityStatus.Completed)
        {
            Complete("Task completed");
        }
    }
    
    public bool IsOverdue()
    {
        return Status != ActivityStatus.Completed && 
               Status != ActivityStatus.Cancelled && 
               DueDate.HasValue && 
               DueDate.Value < DateTime.UtcNow;
    }
}