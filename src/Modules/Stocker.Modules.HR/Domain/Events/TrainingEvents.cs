using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.HR.Domain.Events;

#region Training Events

/// <summary>
/// Raised when a training program is created
/// </summary>
public sealed record TrainingProgramCreatedDomainEvent(
    int TrainingId,
    Guid TenantId,
    string TrainingName,
    string TrainingType,
    DateTime StartDate,
    DateTime EndDate,
    int MaxParticipants) : DomainEvent;

/// <summary>
/// Raised when employee is enrolled in training
/// </summary>
public sealed record EmployeeEnrolledInTrainingDomainEvent(
    int TrainingId,
    Guid TenantId,
    int EmployeeId,
    string EmployeeName,
    string TrainingName,
    DateTime StartDate) : DomainEvent;

/// <summary>
/// Raised when employee completes training
/// </summary>
public sealed record TrainingCompletedDomainEvent(
    int TrainingId,
    Guid TenantId,
    int EmployeeId,
    string EmployeeName,
    string TrainingName,
    DateTime CompletionDate,
    decimal? Score,
    bool Passed) : DomainEvent;

/// <summary>
/// Raised when training is cancelled
/// </summary>
public sealed record TrainingCancelledDomainEvent(
    int TrainingId,
    Guid TenantId,
    string TrainingName,
    string? CancellationReason,
    int AffectedParticipants) : DomainEvent;

/// <summary>
/// Raised when training deadline is approaching
/// </summary>
public sealed record TrainingDeadlineApproachingDomainEvent(
    int TrainingId,
    Guid TenantId,
    int EmployeeId,
    string EmployeeName,
    string TrainingName,
    DateTime Deadline,
    int DaysRemaining) : DomainEvent;

/// <summary>
/// Raised when mandatory training is overdue
/// </summary>
public sealed record MandatoryTrainingOverdueDomainEvent(
    int TrainingId,
    Guid TenantId,
    int EmployeeId,
    string EmployeeName,
    string TrainingName,
    DateTime DueDate,
    int DaysOverdue,
    int ManagerId) : DomainEvent;

#endregion
