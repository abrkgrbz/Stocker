using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Sales.Domain.Events;

#region Warranty Events

/// <summary>
/// Garanti kaydı oluşturulduğunda tetiklenen event
/// </summary>
public sealed record WarrantyRegisteredDomainEvent(
    int WarrantyId,
    Guid TenantId,
    string WarrantyNumber,
    int ProductId,
    string ProductName,
    int CustomerId,
    DateTime StartDate,
    DateTime EndDate) : DomainEvent;

/// <summary>
/// Garanti talebi oluşturulduğunda tetiklenen event
/// </summary>
public sealed record WarrantyClaimCreatedDomainEvent(
    int WarrantyId,
    Guid TenantId,
    string WarrantyNumber,
    string ClaimNumber,
    string IssueDescription,
    DateTime ClaimDate) : DomainEvent;

/// <summary>
/// Garanti talebi onaylandığında tetiklenen event
/// </summary>
public sealed record WarrantyClaimApprovedDomainEvent(
    int WarrantyId,
    Guid TenantId,
    string ClaimNumber,
    string Resolution,
    DateTime ApprovedAt) : DomainEvent;

/// <summary>
/// Garanti talebi reddedildiğinde tetiklenen event
/// </summary>
public sealed record WarrantyClaimRejectedDomainEvent(
    int WarrantyId,
    Guid TenantId,
    string ClaimNumber,
    string RejectionReason,
    DateTime RejectedAt) : DomainEvent;

/// <summary>
/// Garanti süresi dolduğunda tetiklenen event
/// </summary>
public sealed record WarrantyExpiredDomainEvent(
    int WarrantyId,
    Guid TenantId,
    string WarrantyNumber,
    int ProductId,
    int CustomerId,
    DateTime ExpiredAt) : DomainEvent;

#endregion
