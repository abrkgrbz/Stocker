using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.CRM.Domain.Events;

#region ProductInterest Events

/// <summary>
/// Raised when a product interest is recorded
/// </summary>
public sealed record ProductInterestRecordedDomainEvent(
    Guid ProductInterestId,
    Guid TenantId,
    int ProductId,
    string ProductName,
    string InterestLevel,
    string Source,
    Guid? CustomerId,
    Guid? ContactId,
    Guid? LeadId,
    int RecordedById) : DomainEvent;

/// <summary>
/// Raised when product interest level changes
/// </summary>
public sealed record ProductInterestLevelChangedDomainEvent(
    Guid ProductInterestId,
    Guid TenantId,
    int ProductId,
    string ProductName,
    string OldLevel,
    string NewLevel,
    int ChangedById) : DomainEvent;

/// <summary>
/// Raised when product interest status changes
/// </summary>
public sealed record ProductInterestStatusChangedDomainEvent(
    Guid ProductInterestId,
    Guid TenantId,
    int ProductId,
    string ProductName,
    string OldStatus,
    string NewStatus,
    int ChangedById) : DomainEvent;

/// <summary>
/// Raised when a product interest converts to opportunity
/// </summary>
public sealed record ProductInterestConvertedToOpportunityDomainEvent(
    Guid ProductInterestId,
    Guid TenantId,
    int ProductId,
    string ProductName,
    Guid OpportunityId,
    decimal? EstimatedValue,
    int ConvertedById) : DomainEvent;

/// <summary>
/// Raised when product interest quantity is updated
/// </summary>
public sealed record ProductInterestQuantityUpdatedDomainEvent(
    Guid ProductInterestId,
    Guid TenantId,
    int ProductId,
    string ProductName,
    decimal? OldQuantity,
    decimal? NewQuantity,
    int UpdatedById) : DomainEvent;

/// <summary>
/// Raised when a follow-up is scheduled for product interest
/// </summary>
public sealed record ProductInterestFollowUpScheduledDomainEvent(
    Guid ProductInterestId,
    Guid TenantId,
    int ProductId,
    string ProductName,
    DateTime FollowUpDate,
    int AssignedToUserId,
    int ScheduledById) : DomainEvent;

/// <summary>
/// Raised when product interest is linked to a quote
/// </summary>
public sealed record ProductInterestLinkedToQuoteDomainEvent(
    Guid ProductInterestId,
    Guid TenantId,
    int ProductId,
    string ProductName,
    Guid QuoteId,
    string QuoteNumber,
    int LinkedById) : DomainEvent;

/// <summary>
/// Raised when product interest expires
/// </summary>
public sealed record ProductInterestExpiredDomainEvent(
    Guid ProductInterestId,
    Guid TenantId,
    int ProductId,
    string ProductName,
    Guid? CustomerId,
    string? CustomerName,
    int DaysSinceLastActivity) : DomainEvent;

/// <summary>
/// Raised when competitor product comparison is added
/// </summary>
public sealed record ProductInterestCompetitorComparisonAddedDomainEvent(
    Guid ProductInterestId,
    Guid TenantId,
    int ProductId,
    string ProductName,
    Guid CompetitorId,
    string CompetitorName,
    string? CompetitorProductName,
    int AddedById) : DomainEvent;

#endregion
