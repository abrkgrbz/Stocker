using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Sales.Domain.Events;

#region Opportunity Events

/// <summary>
/// Satış fırsatı oluşturulduğunda tetiklenen event
/// </summary>
public sealed record OpportunityCreatedDomainEvent(
    Guid OpportunityId,
    Guid TenantId,
    string OpportunityName,
    Guid? CustomerId,
    string CustomerName,
    decimal EstimatedValue,
    string Stage,
    Guid? SalesRepId) : DomainEvent;

/// <summary>
/// Satış fırsatı aşaması değiştiğinde tetiklenen event
/// </summary>
public sealed record OpportunityStageChangedDomainEvent(
    Guid OpportunityId,
    Guid TenantId,
    string OpportunityName,
    string OldStage,
    string NewStage,
    DateTime ChangedAt) : DomainEvent;

/// <summary>
/// Satış fırsatı kazanıldığında tetiklenen event
/// </summary>
public sealed record OpportunityWonDomainEvent(
    Guid OpportunityId,
    Guid TenantId,
    string OpportunityName,
    Guid? CustomerId,
    decimal FinalValue,
    Guid SalesOrderId,
    DateTime WonAt) : DomainEvent;

/// <summary>
/// Satış fırsatı kaybedildiğinde tetiklenen event
/// </summary>
public sealed record OpportunityLostDomainEvent(
    Guid OpportunityId,
    Guid TenantId,
    string OpportunityName,
    Guid? CustomerId,
    string LostReason,
    string CompetitorName,
    DateTime LostAt) : DomainEvent;

/// <summary>
/// Satış fırsatı değeri güncellendiğinde tetiklenen event
/// </summary>
public sealed record OpportunityValueUpdatedDomainEvent(
    Guid OpportunityId,
    Guid TenantId,
    string OpportunityName,
    decimal OldValue,
    decimal NewValue) : DomainEvent;

#endregion
