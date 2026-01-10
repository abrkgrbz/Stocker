using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.HR.Domain.Events;

#region Interview Events

/// <summary>
/// Raised when an interview is scheduled
/// </summary>
public sealed record InterviewScheduledDomainEvent(
    int InterviewId,
    Guid TenantId,
    int JobApplicationId,
    string CandidateName,
    DateTime ScheduledDate,
    string InterviewType,
    int InterviewerId) : DomainEvent;

/// <summary>
/// Raised when an interview is rescheduled
/// </summary>
public sealed record InterviewRescheduledDomainEvent(
    int InterviewId,
    Guid TenantId,
    string CandidateName,
    DateTime OldDate,
    DateTime NewDate,
    string Reason) : DomainEvent;

/// <summary>
/// Raised when an interview is completed
/// </summary>
public sealed record InterviewCompletedDomainEvent(
    int InterviewId,
    Guid TenantId,
    string CandidateName,
    int InterviewerId,
    string Result,
    int? Rating) : DomainEvent;

/// <summary>
/// Raised when an interview is cancelled
/// </summary>
public sealed record InterviewCancelledDomainEvent(
    int InterviewId,
    Guid TenantId,
    string CandidateName,
    DateTime ScheduledDate,
    string CancellationReason) : DomainEvent;

/// <summary>
/// Raised when interview feedback is submitted
/// </summary>
public sealed record InterviewFeedbackSubmittedDomainEvent(
    int InterviewId,
    Guid TenantId,
    string CandidateName,
    int InterviewerId,
    string Recommendation) : DomainEvent;

#endregion
