using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.HR.Domain.Events;

#region Onboarding Events

/// <summary>
/// Raised when onboarding process is started
/// </summary>
public sealed record OnboardingStartedDomainEvent(
    int OnboardingId,
    Guid TenantId,
    int EmployeeId,
    string EmployeeName,
    DateTime StartDate,
    int TaskCount) : DomainEvent;

/// <summary>
/// Raised when an onboarding task is completed
/// </summary>
public sealed record OnboardingTaskCompletedDomainEvent(
    int OnboardingId,
    Guid TenantId,
    int EmployeeId,
    string TaskName,
    int CompletedTasks,
    int TotalTasks) : DomainEvent;

/// <summary>
/// Raised when onboarding process is completed
/// </summary>
public sealed record OnboardingCompletedDomainEvent(
    int OnboardingId,
    Guid TenantId,
    int EmployeeId,
    string EmployeeName,
    DateTime CompletionDate,
    int DaysToComplete) : DomainEvent;

/// <summary>
/// Raised when onboarding is overdue
/// </summary>
public sealed record OnboardingOverdueDomainEvent(
    int OnboardingId,
    Guid TenantId,
    int EmployeeId,
    string EmployeeName,
    int OverdueTasks,
    int DaysOverdue) : DomainEvent;

/// <summary>
/// Raised when mentor is assigned for onboarding
/// </summary>
public sealed record OnboardingMentorAssignedDomainEvent(
    int OnboardingId,
    Guid TenantId,
    int EmployeeId,
    string EmployeeName,
    int MentorId,
    string MentorName) : DomainEvent;

#endregion
