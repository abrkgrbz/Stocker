using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Purchase.Domain.Events;

#region PurchaseBudget Events

/// <summary>
/// Satın alma bütçesi oluşturulduğunda tetiklenen event
/// </summary>
public sealed record PurchaseBudgetCreatedDomainEvent(
    int PurchaseBudgetId,
    Guid TenantId,
    string BudgetName,
    int FiscalYear,
    decimal AllocatedAmount,
    string Currency) : DomainEvent;

/// <summary>
/// Satın alma bütçesi onaylandığında tetiklenen event
/// </summary>
public sealed record PurchaseBudgetApprovedDomainEvent(
    int PurchaseBudgetId,
    Guid TenantId,
    string BudgetName,
    int ApprovedById,
    DateTime ApprovedAt) : DomainEvent;

/// <summary>
/// Satın alma bütçesi aşıldığında tetiklenen event
/// </summary>
public sealed record PurchaseBudgetExceededDomainEvent(
    int PurchaseBudgetId,
    Guid TenantId,
    string BudgetName,
    decimal BudgetAmount,
    decimal ActualAmount,
    decimal ExceededAmount) : DomainEvent;

/// <summary>
/// Satın alma bütçesi eşik değerine ulaştığında tetiklenen event
/// </summary>
public sealed record PurchaseBudgetThresholdReachedDomainEvent(
    int PurchaseBudgetId,
    Guid TenantId,
    string BudgetName,
    decimal ThresholdPercentage,
    decimal CurrentUsagePercentage) : DomainEvent;

#endregion
