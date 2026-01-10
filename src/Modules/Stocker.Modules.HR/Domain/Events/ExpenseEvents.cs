using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.HR.Domain.Events;

#region Expense Events

/// <summary>
/// Raised when an expense is submitted for approval
/// </summary>
public sealed record ExpenseSubmittedDomainEvent(
    int ExpenseId,
    Guid TenantId,
    int EmployeeId,
    string EmployeeName,
    string ExpenseType,
    decimal Amount,
    string Currency,
    DateTime ExpenseDate,
    int ApproverId) : DomainEvent;

/// <summary>
/// Raised when an expense is approved
/// </summary>
public sealed record ExpenseApprovedDomainEvent(
    int ExpenseId,
    Guid TenantId,
    int EmployeeId,
    string EmployeeName,
    string ExpenseType,
    decimal Amount,
    string Currency,
    int ApprovedById,
    string ApprovedByName) : DomainEvent;

/// <summary>
/// Raised when an expense is rejected
/// </summary>
public sealed record ExpenseRejectedDomainEvent(
    int ExpenseId,
    Guid TenantId,
    int EmployeeId,
    string EmployeeName,
    string ExpenseType,
    decimal Amount,
    string Currency,
    string RejectionReason,
    int RejectedById) : DomainEvent;

/// <summary>
/// Raised when an expense is paid
/// </summary>
public sealed record ExpensePaidDomainEvent(
    int ExpenseId,
    Guid TenantId,
    int EmployeeId,
    string EmployeeName,
    decimal Amount,
    string Currency,
    DateTime PaymentDate) : DomainEvent;

/// <summary>
/// Raised when an expense is cancelled
/// </summary>
public sealed record ExpenseCancelledDomainEvent(
    int ExpenseId,
    Guid TenantId,
    int EmployeeId,
    string EmployeeName,
    string ExpenseType,
    decimal Amount,
    string? CancellationReason) : DomainEvent;

/// <summary>
/// Raised when expense exceeds budget limit
/// </summary>
public sealed record ExpenseBudgetExceededDomainEvent(
    int EmployeeId,
    Guid TenantId,
    string EmployeeName,
    string BudgetCategory,
    decimal BudgetLimit,
    decimal CurrentSpending,
    decimal ExcessAmount,
    int ManagerId) : DomainEvent;

#endregion
