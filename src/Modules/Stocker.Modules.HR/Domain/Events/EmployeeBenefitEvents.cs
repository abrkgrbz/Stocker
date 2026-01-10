using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.HR.Domain.Events;

#region EmployeeBenefit Events

/// <summary>
/// Raised when a benefit is enrolled for an employee
/// </summary>
public sealed record BenefitEnrolledDomainEvent(
    int EmployeeBenefitId,
    Guid TenantId,
    int EmployeeId,
    string EmployeeName,
    string BenefitType,
    string BenefitPlan,
    DateTime EffectiveDate) : DomainEvent;

/// <summary>
/// Raised when a benefit enrollment is updated
/// </summary>
public sealed record BenefitEnrollmentUpdatedDomainEvent(
    int EmployeeBenefitId,
    Guid TenantId,
    int EmployeeId,
    string EmployeeName,
    string BenefitType,
    string OldPlan,
    string NewPlan) : DomainEvent;

/// <summary>
/// Raised when a benefit is terminated
/// </summary>
public sealed record BenefitTerminatedDomainEvent(
    int EmployeeBenefitId,
    Guid TenantId,
    int EmployeeId,
    string EmployeeName,
    string BenefitType,
    DateTime TerminationDate,
    string TerminationReason) : DomainEvent;

/// <summary>
/// Raised when benefit enrollment period opens
/// </summary>
public sealed record BenefitEnrollmentPeriodOpenedDomainEvent(
    Guid TenantId,
    DateTime OpenDate,
    DateTime CloseDate,
    int EligibleEmployeeCount) : DomainEvent;

#endregion
