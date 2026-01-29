using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Sales.Domain.Events;

#region Warranty Events

/// <summary>
/// Garanti kaydı oluşturulduğunda tetiklenen event
/// </summary>
public sealed record WarrantyRegisteredDomainEvent(
    Guid WarrantyId,
    Guid TenantId,
    string WarrantyNumber,
    Guid? ProductId,
    string ProductName,
    Guid? CustomerId,
    DateTime StartDate,
    DateTime EndDate) : DomainEvent;

/// <summary>
/// Garanti talebi oluşturulduğunda tetiklenen event
/// </summary>
public sealed record WarrantyClaimCreatedDomainEvent(
    Guid WarrantyId,
    Guid TenantId,
    string WarrantyNumber,
    string ClaimNumber,
    string IssueDescription,
    DateTime ClaimDate) : DomainEvent;

/// <summary>
/// Garanti talebi onaylandığında tetiklenen event
/// </summary>
public sealed record WarrantyClaimApprovedDomainEvent(
    Guid WarrantyId,
    Guid TenantId,
    string ClaimNumber,
    string Resolution,
    DateTime ApprovedAt) : DomainEvent;

/// <summary>
/// Garanti talebi reddedildiğinde tetiklenen event
/// </summary>
public sealed record WarrantyClaimRejectedDomainEvent(
    Guid WarrantyId,
    Guid TenantId,
    string ClaimNumber,
    string RejectionReason,
    DateTime RejectedAt) : DomainEvent;

/// <summary>
/// Garanti süresi dolduğunda tetiklenen event
/// </summary>
public sealed record WarrantyExpiredDomainEvent(
    Guid WarrantyId,
    Guid TenantId,
    string WarrantyNumber,
    Guid? ProductId,
    Guid? CustomerId,
    DateTime ExpiredAt) : DomainEvent;

#endregion
