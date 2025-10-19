namespace Stocker.Modules.CRM.Domain.Enums;

public enum OpportunityStatus
{
    Open = 1,
    Won = 2,
    Lost = 3,
    OnHold = 4
}

public enum OpportunitySource
{
    Direct = 1,
    Website = 2,
    Referral = 3,
    Partner = 4,
    Campaign = 5,
    SocialMedia = 6,
    Email = 7,
    Phone = 8,
    Event = 9,
    Other = 10
}

public enum OpportunityType
{
    NewBusiness = 1,
    ExistingBusiness = 2,
    Renewal = 3,
    Upgrade = 4,
    Downgrade = 5
}

public enum OpportunityPriority
{
    Low = 1,
    Medium = 2,
    High = 3,
    Critical = 4
}

public enum ActivityType
{
    Call = 1,
    Email = 2,
    Meeting = 3,
    Task = 4,
    Note = 5,
    Event = 6,
    Demo = 7,
    Presentation = 8,
    Visit = 9,
    Other = 10
}

public enum ActivityStatus
{
    NotStarted = 1,
    InProgress = 2,
    Completed = 3,
    Cancelled = 4,
    Deferred = 5,
    WaitingOnSomeone = 6
}

public enum ActivityPriority
{
    Low = 1,
    Normal = 2,
    High = 3,
    Urgent = 4
}

public enum CampaignType
{
    Email = 1,
    SocialMedia = 2,
    Webinar = 3,
    Event = 4,
    Conference = 5,
    Advertisement = 6,
    Banner = 7,
    Telemarketing = 8,
    PublicRelations = 9,
    Partners = 10,
    ReferralProgram = 11,
    Other = 12
}

public enum CampaignStatus
{
    Planned = 1,
    InProgress = 2,
    Completed = 3,
    Aborted = 4,
    OnHold = 5
}

public enum CampaignMemberStatus
{
    Sent = 1,
    Received = 2,
    Opened = 3,
    Clicked = 4,
    Responded = 5,
    Converted = 6,
    Unsubscribed = 7,
    Bounced = 8
}

public enum DealStatus
{
    Open = 1,
    Won = 2,
    Lost = 3,
    Deleted = 4
}

public enum DealPriority
{
    Low = 1,
    Medium = 2,
    High = 3,
    VeryHigh = 4
}

public enum RecurringPeriod
{
    Daily = 1,
    Weekly = 2,
    Monthly = 3,
    Quarterly = 4,
    SemiAnnually = 5,
    Annually = 6
}

public enum PipelineType
{
    Sales = 1,
    Lead = 2,
    Deal = 3,
    Custom = 4
}

public enum ContactType
{
    Primary = 1,
    Secondary = 2,
    Billing = 3,
    Technical = 4,
    Executive = 5,
    Other = 6
}

public enum CustomerType
{
    Prospect = 1,
    Customer = 2,
    Partner = 3,
    Competitor = 4,
    Vendor = 5,
    Other = 6
}

public enum CustomerSegment
{
    Enterprise = 1,
    MidMarket = 2,
    SmallBusiness = 3,
    Startup = 4,
    Individual = 5
}

public enum LeadQualificationStatus
{
    Unqualified = 1,
    WorkingOn = 2,
    Qualified = 3,
    Disqualified = 4
}

public enum CommunicationType
{
    Email = 1,
    Phone = 2,
    Meeting = 3,
    Chat = 4,
    SMS = 5,
    SocialMedia = 6,
    Letter = 7,
    Fax = 8,
    Other = 9
}

public enum CommunicationDirection
{
    Inbound = 1,
    Outbound = 2
}

public enum EmailStatus
{
    Draft = 1,
    Queued = 2,
    Sent = 3,
    Delivered = 4,
    Read = 5,
    Opened = 6,
    Clicked = 7,
    Replied = 8,
    Bounced = 9,
    Failed = 10,
    Spam = 11
}

public enum TaskType
{
    FollowUp = 1,
    Preparation = 2,
    Research = 3,
    Documentation = 4,
    Review = 5,
    Approval = 6,
    Other = 7
}

public enum TaskStatus
{
    NotStarted = 1,
    InProgress = 2,
    Completed = 3,
    Cancelled = 4,
    Deferred = 5
}

public enum NoteType
{
    General = 1,
    MeetingNotes = 2,
    CallNotes = 3,
    Important = 4,
    Reminder = 5,
    Technical = 6,
    Financial = 7,
    Other = 8
}

public enum SegmentType
{
    Static = 1,
    Dynamic = 2
}

public enum SegmentMembershipReason
{
    Manual = 1,
    AutoCriteria = 2,
    Import = 3,
    Workflow = 4
}

public enum SegmentColor
{
    Red = 1,
    Orange = 2,
    Yellow = 3,
    Green = 4,
    Blue = 5,
    Purple = 6,
    Pink = 7,
    Gray = 8
}