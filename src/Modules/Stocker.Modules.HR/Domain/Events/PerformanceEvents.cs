using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.HR.Domain.Events;

#region Performance Review Events

/// <summary>
/// Raised when a performance review is created
/// </summary>
public sealed record PerformanceReviewCreatedDomainEvent(
    int ReviewId,
    Guid TenantId,
    int EmployeeId,
    string EmployeeName,
    int ReviewerId,
    string ReviewerName,
    string ReviewPeriod,
    DateTime ReviewDate) : DomainEvent;

/// <summary>
/// Raised when a performance review is submitted
/// </summary>
public sealed record PerformanceReviewSubmittedDomainEvent(
    int ReviewId,
    Guid TenantId,
    int EmployeeId,
    string EmployeeName,
    int ReviewerId,
    string ReviewerName,
    decimal OverallRating,
    string ReviewPeriod) : DomainEvent;

/// <summary>
/// Raised when employee acknowledges performance review
/// </summary>
public sealed record PerformanceReviewAcknowledgedDomainEvent(
    int ReviewId,
    Guid TenantId,
    int EmployeeId,
    string EmployeeName,
    decimal OverallRating,
    DateTime AcknowledgedDate) : DomainEvent;

/// <summary>
/// Raised when performance review is approved
/// </summary>
public sealed record PerformanceReviewApprovedDomainEvent(
    int ReviewId,
    Guid TenantId,
    int EmployeeId,
    string EmployeeName,
    decimal OverallRating,
    int ApprovedById,
    string ApprovedByName) : DomainEvent;

/// <summary>
/// Raised when performance review is due soon
/// </summary>
public sealed record PerformanceReviewDueDomainEvent(
    int EmployeeId,
    Guid TenantId,
    string EmployeeName,
    int ReviewerId,
    string ReviewPeriod,
    DateTime DueDate,
    int DaysRemaining) : DomainEvent;

/// <summary>
/// Raised when performance rating is below threshold
/// </summary>
public sealed record LowPerformanceRatingDomainEvent(
    int ReviewId,
    Guid TenantId,
    int EmployeeId,
    string EmployeeName,
    decimal Rating,
    decimal ThresholdRating,
    int ManagerId) : DomainEvent;

/// <summary>
/// Raised when performance improvement plan is required
/// </summary>
public sealed record PerformanceImprovementPlanRequiredDomainEvent(
    int EmployeeId,
    Guid TenantId,
    string EmployeeName,
    decimal CurrentRating,
    string ImprovementAreas,
    int ManagerId) : DomainEvent;

#endregion
