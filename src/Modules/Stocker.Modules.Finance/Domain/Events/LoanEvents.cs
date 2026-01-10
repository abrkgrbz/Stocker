using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Finance.Domain.Events;

#region Loan Events

/// <summary>
/// Kredi oluşturulduğunda tetiklenen event
/// </summary>
public sealed record LoanCreatedDomainEvent(
    int LoanId,
    Guid TenantId,
    string LoanNumber,
    string LoanType,
    decimal PrincipalAmount,
    decimal InterestRate,
    int TermMonths,
    DateTime StartDate) : DomainEvent;

/// <summary>
/// Kredi taksiti ödendiğinde tetiklenen event
/// </summary>
public sealed record LoanInstallmentPaidDomainEvent(
    int LoanId,
    Guid TenantId,
    string LoanNumber,
    int InstallmentNumber,
    decimal PrincipalPaid,
    decimal InterestPaid,
    decimal RemainingBalance,
    DateTime PaidAt) : DomainEvent;

/// <summary>
/// Kredi kapatıldığında tetiklenen event
/// </summary>
public sealed record LoanClosedDomainEvent(
    int LoanId,
    Guid TenantId,
    string LoanNumber,
    decimal TotalPrincipalPaid,
    decimal TotalInterestPaid,
    DateTime ClosedAt) : DomainEvent;

/// <summary>
/// Kredi taksiti geciktiğinde tetiklenen event
/// </summary>
public sealed record LoanPaymentOverdueDomainEvent(
    int LoanId,
    Guid TenantId,
    string LoanNumber,
    int InstallmentNumber,
    decimal OverdueAmount,
    int DaysOverdue,
    DateTime DueDate) : DomainEvent;

#endregion
