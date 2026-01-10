using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.CRM.Domain.Events;

#region Deal Events

/// <summary>
/// Raised when a new deal is created
/// </summary>
public sealed record DealCreatedDomainEvent(
    Guid DealId,
    Guid TenantId,
    string DealName,
    decimal Value,
    string Currency,
    Guid PipelineId,
    int OwnerId) : DomainEvent;

/// <summary>
/// Raised when deal details are updated
/// </summary>
public sealed record DealUpdatedDomainEvent(
    Guid DealId,
    Guid TenantId,
    string DealName,
    decimal Value) : DomainEvent;

/// <summary>
/// Raised when a deal moves to a new stage
/// </summary>
public sealed record DealStageChangedDomainEvent(
    Guid DealId,
    Guid TenantId,
    Guid OldStageId,
    Guid NewStageId,
    decimal Probability) : DomainEvent;

/// <summary>
/// Raised when a deal is won
/// </summary>
public sealed record DealWonDomainEvent(
    Guid DealId,
    Guid TenantId,
    string DealName,
    decimal Value,
    string Currency,
    Guid? CustomerId,
    int OwnerId,
    DateTime WonDate) : DomainEvent;

/// <summary>
/// Raised when a deal is lost
/// </summary>
public sealed record DealLostDomainEvent(
    Guid DealId,
    Guid TenantId,
    string DealName,
    decimal Value,
    string LostReason,
    string? CompetitorName,
    int OwnerId,
    DateTime LostDate) : DomainEvent;

/// <summary>
/// Raised when a deal is reopened
/// </summary>
public sealed record DealReopenedDomainEvent(
    Guid DealId,
    Guid TenantId,
    string DealName) : DomainEvent;

/// <summary>
/// Raised when a deal becomes rotten (no activity)
/// </summary>
public sealed record DealRottenDomainEvent(
    Guid DealId,
    Guid TenantId,
    string DealName,
    int DaysSinceLastActivity,
    int OwnerId) : DomainEvent;

/// <summary>
/// Raised when a deal is assigned to a customer
/// </summary>
public sealed record DealAssignedToCustomerDomainEvent(
    Guid DealId,
    Guid TenantId,
    Guid CustomerId,
    Guid? ContactId) : DomainEvent;

/// <summary>
/// Raised when a product is added to a deal
/// </summary>
public sealed record DealProductAddedDomainEvent(
    Guid DealId,
    Guid TenantId,
    int ProductId,
    decimal Quantity,
    decimal TotalPrice) : DomainEvent;

/// <summary>
/// Raised when deal priority changes
/// </summary>
public sealed record DealPriorityChangedDomainEvent(
    Guid DealId,
    Guid TenantId,
    string OldPriority,
    string NewPriority) : DomainEvent;

#endregion
