namespace Stocker.Modules.CRM.Domain.Enums;

/// <summary>
/// Account types
/// </summary>
public enum AccountType
{
    Prospect,
    Customer,
    Partner,
    Vendor,
    Competitor,
    Other
}

/// <summary>
/// Account status
/// </summary>
public enum AccountStatus
{
    Active,
    Inactive,
    Pending,
    Suspended
}

/// <summary>
/// Account rating
/// </summary>
public enum AccountRating
{
    Hot,
    Warm,
    Cold
}


/// <summary>
/// Task priority
/// </summary>
public enum TaskPriority
{
    Low,
    Normal,
    High,
    Urgent
}

/// <summary>
/// Related entity types
/// </summary>
public enum RelatedEntityType
{
    Account,
    Contact,
    Lead,
    Opportunity,
    Deal,
    Quote,
    Invoice,
    Contract,
    Ticket,
    Campaign,
    Product
}

/// <summary>
/// Recurrence types
/// </summary>
public enum RecurrenceType
{
    Daily,
    Weekly,
    Monthly,
    Yearly
}

/// <summary>
/// Quote status
/// </summary>
public enum QuoteStatus
{
    Draft,
    InReview,
    Sent,
    Accepted,
    Rejected,
    Expired,
    Converted
}

/// <summary>
/// Approval status
/// </summary>
public enum ApprovalStatus
{
    NotSubmitted,
    Pending,
    Approved,
    Rejected
}

/// <summary>
/// Invoice status
/// </summary>
public enum InvoiceStatus
{
    Draft,
    Sent,
    Paid,
    PartiallyPaid,
    Overdue,
    Cancelled,
    Refunded
}

/// <summary>
/// Contract status
/// </summary>
public enum ContractStatus
{
    Draft,
    InApproval,
    Active,
    Expired,
    Terminated,
    Renewed
}

/// <summary>
/// Ticket status
/// </summary>
public enum TicketStatus
{
    New,
    Open,
    InProgress,
    OnHold,
    Resolved,
    Closed,
    Cancelled
}

/// <summary>
/// Ticket priority
/// </summary>
public enum TicketPriority
{
    Low,
    Normal,
    High,
    Critical
}

/// <summary>
/// Ticket type
/// </summary>
public enum TicketType
{
    Question,
    Problem,
    Feature,
    Bug,
    Task,
    Other
}


/// <summary>
/// Product type
/// </summary>
public enum ProductType
{
    Physical,
    Service,
    Digital,
    Subscription
}

/// <summary>
/// Product status
/// </summary>
public enum ProductStatus
{
    Active,
    Inactive,
    Discontinued,
    OutOfStock
}

/// <summary>
/// Price list type
/// </summary>
public enum PriceListType
{
    Standard,
    Discount,
    Wholesale,
    Retail,
    Custom
}


/// <summary>
/// Meeting status
/// </summary>
public enum MeetingStatus
{
    Scheduled,
    InProgress,
    Completed,
    Cancelled,
    NoShow
}

/// <summary>
/// Call status
/// </summary>
public enum CallStatus
{
    Scheduled,
    InProgress,
    Completed,
    Missed,
    Cancelled,
    Failed
}

/// <summary>
/// Call direction
/// </summary>
public enum CallDirection
{
    Inbound,
    Outbound
}

/// <summary>
/// Tag category
/// </summary>
public enum TagCategory
{
    General,
    Industry,
    Source,
    Product,
    Service,
    Campaign,
    Custom
}