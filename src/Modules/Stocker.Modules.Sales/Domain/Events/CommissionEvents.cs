using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Sales.Domain.Events;

#region Commission Events

/// <summary>
/// Komisyon hesaplandığında tetiklenen event
/// </summary>
public sealed record CommissionCalculatedDomainEvent(
    Guid CommissionId,
    Guid TenantId,
    Guid? SalesRepId,
    string SalesRepName,
    Guid? SalesOrderId,
    decimal SaleAmount,
    decimal CommissionRate,
    decimal CommissionAmount) : DomainEvent;

/// <summary>
/// Komisyon onaylandığında tetiklenen event
/// </summary>
public sealed record CommissionApprovedDomainEvent(
    Guid CommissionId,
    Guid TenantId,
    Guid? SalesRepId,
    decimal CommissionAmount,
    Guid? ApprovedById,
    DateTime ApprovedAt) : DomainEvent;

/// <summary>
/// Komisyon ödendiğinde tetiklenen event
/// </summary>
public sealed record CommissionPaidDomainEvent(
    Guid CommissionId,
    Guid TenantId,
    Guid? SalesRepId,
    string SalesRepName,
    decimal PaidAmount,
    DateTime PaidAt) : DomainEvent;

/// <summary>
/// Komisyon iptal edildiğinde tetiklenen event
/// </summary>
public sealed record CommissionCancelledDomainEvent(
    Guid CommissionId,
    Guid TenantId,
    Guid? SalesRepId,
    string CancellationReason,
    DateTime CancelledAt) : DomainEvent;

#endregion
