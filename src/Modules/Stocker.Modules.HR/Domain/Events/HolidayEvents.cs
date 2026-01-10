using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.HR.Domain.Events;

#region Holiday Events

/// <summary>
/// Raised when a holiday is created
/// </summary>
public sealed record HolidayCreatedDomainEvent(
    int HolidayId,
    Guid TenantId,
    string Name,
    DateTime Date,
    bool IsRecurring) : DomainEvent;

/// <summary>
/// Raised when a holiday is updated
/// </summary>
public sealed record HolidayUpdatedDomainEvent(
    int HolidayId,
    Guid TenantId,
    string Name,
    DateTime Date) : DomainEvent;

/// <summary>
/// Raised when a holiday is deleted
/// </summary>
public sealed record HolidayDeletedDomainEvent(
    int HolidayId,
    Guid TenantId,
    string Name,
    DateTime Date) : DomainEvent;

/// <summary>
/// Raised when holidays are imported for a year
/// </summary>
public sealed record HolidaysImportedDomainEvent(
    Guid TenantId,
    int Year,
    int HolidayCount) : DomainEvent;

#endregion
