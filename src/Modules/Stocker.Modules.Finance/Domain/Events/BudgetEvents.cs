using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Finance.Domain.Events;

#region Budget Events

/// <summary>
/// Bütçe oluşturulduğunda tetiklenen event
/// </summary>
public sealed record BudgetCreatedDomainEvent(
    int BudgetId,
    Guid TenantId,
    string BudgetName,
    int FiscalYear,
    decimal TotalAmount,
    string Currency) : DomainEvent;

/// <summary>
/// Bütçe onaylandığında tetiklenen event
/// </summary>
public sealed record BudgetApprovedDomainEvent(
    int BudgetId,
    Guid TenantId,
    string BudgetName,
    int ApprovedById,
    DateTime ApprovedAt) : DomainEvent;

/// <summary>
/// Bütçe aşıldığında tetiklenen event
/// </summary>
public sealed record BudgetExceededDomainEvent(
    int BudgetId,
    Guid TenantId,
    string BudgetName,
    decimal BudgetAmount,
    decimal ActualAmount,
    decimal ExceededAmount) : DomainEvent;

/// <summary>
/// Bütçe revize edildiğinde tetiklenen event
/// </summary>
public sealed record BudgetRevisedDomainEvent(
    int BudgetId,
    Guid TenantId,
    string BudgetName,
    decimal OldAmount,
    decimal NewAmount,
    string RevisionReason) : DomainEvent;

#endregion
