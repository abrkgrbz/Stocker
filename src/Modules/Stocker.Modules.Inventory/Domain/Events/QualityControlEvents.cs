using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Inventory.Domain.Events;

#region QualityControl Events

/// <summary>
/// Kalite kontrol oluşturulduğunda tetiklenen event.
/// </summary>
public sealed record QualityControlCreatedDomainEvent(
    int QualityControlId,
    Guid TenantId,
    int ProductId,
    string InspectionType,
    int InspectorId,
    DateTime InspectionDate) : DomainEvent;

/// <summary>
/// Kalite kontrol tamamlandığında tetiklenen event.
/// </summary>
public sealed record QualityControlCompletedDomainEvent(
    int QualityControlId,
    Guid TenantId,
    int ProductId,
    string Result,
    bool IsPassed,
    string? Notes) : DomainEvent;

/// <summary>
/// Kalite kontrol başarısız olduğunda tetiklenen event.
/// </summary>
public sealed record QualityControlFailedDomainEvent(
    int QualityControlId,
    Guid TenantId,
    int ProductId,
    string FailureReason,
    decimal FailedQuantity,
    string RecommendedAction) : DomainEvent;

/// <summary>
/// Kalite kontrol onaylandığında tetiklenen event.
/// </summary>
public sealed record QualityControlApprovedDomainEvent(
    int QualityControlId,
    Guid TenantId,
    int ProductId,
    int ApprovedById,
    decimal ApprovedQuantity) : DomainEvent;

/// <summary>
/// Kalite kontrol reddedildiğinde tetiklenen event.
/// </summary>
public sealed record QualityControlRejectedDomainEvent(
    int QualityControlId,
    Guid TenantId,
    int ProductId,
    int RejectedById,
    string RejectionReason) : DomainEvent;

/// <summary>
/// Kalite kontrol yeniden inceleme talep edildiğinde tetiklenen event.
/// </summary>
public sealed record QualityControlReinspectionRequestedDomainEvent(
    int QualityControlId,
    Guid TenantId,
    int ProductId,
    int RequestedById,
    string Reason) : DomainEvent;

#endregion
