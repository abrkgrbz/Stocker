using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.HR.Domain.Events;

#region Announcement Events

/// <summary>
/// Raised when an HR announcement is published
/// </summary>
public sealed record HrAnnouncementPublishedDomainEvent(
    int AnnouncementId,
    Guid TenantId,
    string Title,
    string AnnouncementType,
    DateTime PublishedDate,
    DateTime? ExpiryDate,
    int PublishedById) : DomainEvent;

/// <summary>
/// Raised when company policy is updated
/// </summary>
public sealed record PolicyUpdatedDomainEvent(
    int PolicyId,
    Guid TenantId,
    string PolicyName,
    string PolicyCategory,
    DateTime EffectiveDate,
    int UpdatedById) : DomainEvent;

/// <summary>
/// Raised when holiday calendar is updated
/// </summary>
public sealed record HolidayCalendarUpdatedDomainEvent(
    Guid TenantId,
    int Year,
    int TotalHolidays,
    DateTime UpdatedDate) : DomainEvent;

/// <summary>
/// Raised when upcoming holiday is approaching
/// </summary>
public sealed record UpcomingHolidayDomainEvent(
    Guid TenantId,
    string HolidayName,
    DateTime HolidayDate,
    int DaysRemaining) : DomainEvent;

#endregion
