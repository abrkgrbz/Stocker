using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Sales.Domain.Events;

#region Opportunity Events

/// <summary>
/// Satış fırsatı oluşturulduğunda tetiklenen event
/// </summary>
public sealed record OpportunityCreatedDomainEvent(
    int OpportunityId,
    Guid TenantId,
    string OpportunityName,
    int CustomerId,
    string CustomerName,
    decimal EstimatedValue,
    string Stage,
    int SalesRepId) : DomainEvent;

/// <summary>
/// Satış fırsatı aşaması değiştiğinde tetiklenen event
/// </summary>
public sealed record OpportunityStageChangedDomainEvent(
    int OpportunityId,
    Guid TenantId,
    string OpportunityName,
    string OldStage,
    string NewStage,
    DateTime ChangedAt) : DomainEvent;

/// <summary>
/// Satış fırsatı kazanıldığında tetiklenen event
/// </summary>
public sealed record OpportunityWonDomainEvent(
    int OpportunityId,
    Guid TenantId,
    string OpportunityName,
    int CustomerId,
    decimal FinalValue,
    int SalesOrderId,
    DateTime WonAt) : DomainEvent;

/// <summary>
/// Satış fırsatı kaybedildiğinde tetiklenen event
/// </summary>
public sealed record OpportunityLostDomainEvent(
    int OpportunityId,
    Guid TenantId,
    string OpportunityName,
    int CustomerId,
    string LostReason,
    string CompetitorName,
    DateTime LostAt) : DomainEvent;

/// <summary>
/// Satış fırsatı değeri güncellendiğinde tetiklenen event
/// </summary>
public sealed record OpportunityValueUpdatedDomainEvent(
    int OpportunityId,
    Guid TenantId,
    string OpportunityName,
    decimal OldValue,
    decimal NewValue) : DomainEvent;

#endregion
