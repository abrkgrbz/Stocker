using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.HR.Domain.Events;

#region Certification Events

/// <summary>
/// Raised when an employee earns a certification
/// </summary>
public sealed record CertificationEarnedDomainEvent(
    int CertificationId,
    Guid TenantId,
    int EmployeeId,
    string EmployeeName,
    string CertificationName,
    string IssuingAuthority,
    DateTime EarnedDate,
    DateTime? ExpiryDate) : DomainEvent;

/// <summary>
/// Raised when a certification is renewed
/// </summary>
public sealed record CertificationRenewedDomainEvent(
    int CertificationId,
    Guid TenantId,
    int EmployeeId,
    string EmployeeName,
    string CertificationName,
    DateTime OldExpiryDate,
    DateTime NewExpiryDate) : DomainEvent;

/// <summary>
/// Raised when a certification is about to expire
/// </summary>
public sealed record CertificationExpiringDomainEvent(
    int CertificationId,
    Guid TenantId,
    int EmployeeId,
    string EmployeeName,
    string CertificationName,
    DateTime ExpiryDate,
    int DaysUntilExpiry) : DomainEvent;

/// <summary>
/// Raised when a certification has expired
/// </summary>
public sealed record CertificationExpiredDomainEvent(
    int CertificationId,
    Guid TenantId,
    int EmployeeId,
    string EmployeeName,
    string CertificationName,
    DateTime ExpiryDate) : DomainEvent;

/// <summary>
/// Raised when a certification is revoked
/// </summary>
public sealed record CertificationRevokedDomainEvent(
    int CertificationId,
    Guid TenantId,
    int EmployeeId,
    string EmployeeName,
    string CertificationName,
    string RevocationReason) : DomainEvent;

#endregion
