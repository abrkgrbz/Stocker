using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Finance.Domain.Events;

#region Expense Events

/// <summary>
/// Masraf oluşturulduğunda tetiklenen event
/// </summary>
public sealed record ExpenseCreatedDomainEvent(
    int ExpenseId,
    Guid TenantId,
    string ExpenseNumber,
    string Category,
    decimal Amount,
    string Currency,
    DateTime ExpenseDate) : DomainEvent;

/// <summary>
/// Masraf onaylandığında tetiklenen event
/// </summary>
public sealed record ExpenseApprovedDomainEvent(
    int ExpenseId,
    Guid TenantId,
    string ExpenseNumber,
    int ApprovedById,
    DateTime ApprovedAt) : DomainEvent;

/// <summary>
/// Masraf reddedildiğinde tetiklenen event
/// </summary>
public sealed record ExpenseRejectedDomainEvent(
    int ExpenseId,
    Guid TenantId,
    string ExpenseNumber,
    int RejectedById,
    string RejectionReason,
    DateTime RejectedAt) : DomainEvent;

/// <summary>
/// Masraf ödendiğinde tetiklenen event
/// </summary>
public sealed record ExpensePaidDomainEvent(
    int ExpenseId,
    Guid TenantId,
    string ExpenseNumber,
    int PaymentId,
    decimal PaidAmount,
    DateTime PaidAt) : DomainEvent;

#endregion
