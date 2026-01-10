using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.HR.Domain.Events;

#region JobApplication Events

/// <summary>
/// Raised when a job application is submitted
/// </summary>
public sealed record JobApplicationSubmittedDomainEvent(
    int JobApplicationId,
    Guid TenantId,
    int JobPostingId,
    string JobTitle,
    string CandidateName,
    string CandidateEmail) : DomainEvent;

/// <summary>
/// Raised when a job application is reviewed
/// </summary>
public sealed record JobApplicationReviewedDomainEvent(
    int JobApplicationId,
    Guid TenantId,
    string CandidateName,
    int ReviewedById,
    string Status) : DomainEvent;

/// <summary>
/// Raised when a job application is shortlisted
/// </summary>
public sealed record JobApplicationShortlistedDomainEvent(
    int JobApplicationId,
    Guid TenantId,
    string CandidateName,
    string JobTitle,
    int ShortlistedById) : DomainEvent;

/// <summary>
/// Raised when a job application is rejected
/// </summary>
public sealed record JobApplicationRejectedDomainEvent(
    int JobApplicationId,
    Guid TenantId,
    string CandidateName,
    string JobTitle,
    string RejectionReason) : DomainEvent;

/// <summary>
/// Raised when a job application moves to next stage
/// </summary>
public sealed record JobApplicationStageChangedDomainEvent(
    int JobApplicationId,
    Guid TenantId,
    string CandidateName,
    string OldStage,
    string NewStage) : DomainEvent;

/// <summary>
/// Raised when a candidate is hired
/// </summary>
public sealed record CandidateHiredDomainEvent(
    int JobApplicationId,
    Guid TenantId,
    string CandidateName,
    int JobPostingId,
    string JobTitle,
    DateTime StartDate,
    decimal OfferedSalary) : DomainEvent;

#endregion
