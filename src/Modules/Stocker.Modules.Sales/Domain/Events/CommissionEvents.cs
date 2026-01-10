using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Sales.Domain.Events;

#region Commission Events

/// <summary>
/// Komisyon hesaplandığında tetiklenen event
/// </summary>
public sealed record CommissionCalculatedDomainEvent(
    int CommissionId,
    Guid TenantId,
    int SalesRepId,
    string SalesRepName,
    int SalesOrderId,
    decimal SaleAmount,
    decimal CommissionRate,
    decimal CommissionAmount) : DomainEvent;

/// <summary>
/// Komisyon onaylandığında tetiklenen event
/// </summary>
public sealed record CommissionApprovedDomainEvent(
    int CommissionId,
    Guid TenantId,
    int SalesRepId,
    decimal CommissionAmount,
    int ApprovedById,
    DateTime ApprovedAt) : DomainEvent;

/// <summary>
/// Komisyon ödendiğinde tetiklenen event
/// </summary>
public sealed record CommissionPaidDomainEvent(
    int CommissionId,
    Guid TenantId,
    int SalesRepId,
    string SalesRepName,
    decimal PaidAmount,
    DateTime PaidAt) : DomainEvent;

/// <summary>
/// Komisyon iptal edildiğinde tetiklenen event
/// </summary>
public sealed record CommissionCancelledDomainEvent(
    int CommissionId,
    Guid TenantId,
    int SalesRepId,
    string CancellationReason,
    DateTime CancelledAt) : DomainEvent;

#endregion
