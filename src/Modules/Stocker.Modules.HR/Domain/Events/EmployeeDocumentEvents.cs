using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.HR.Domain.Events;

#region EmployeeDocument Events

/// <summary>
/// Raised when a document is uploaded for an employee
/// </summary>
public sealed record EmployeeDocumentUploadedDomainEvent(
    int EmployeeDocumentId,
    Guid TenantId,
    int EmployeeId,
    string EmployeeName,
    string DocumentType,
    string FileName,
    int UploadedById) : DomainEvent;

/// <summary>
/// Raised when an employee document is verified
/// </summary>
public sealed record EmployeeDocumentVerifiedDomainEvent(
    int EmployeeDocumentId,
    Guid TenantId,
    int EmployeeId,
    string DocumentType,
    int VerifiedById) : DomainEvent;

/// <summary>
/// Raised when an employee document is rejected
/// </summary>
public sealed record EmployeeDocumentRejectedDomainEvent(
    int EmployeeDocumentId,
    Guid TenantId,
    int EmployeeId,
    string DocumentType,
    string RejectionReason,
    int RejectedById) : DomainEvent;

/// <summary>
/// Raised when an employee document expires
/// </summary>
public sealed record EmployeeDocumentExpiredDomainEvent(
    int EmployeeDocumentId,
    Guid TenantId,
    int EmployeeId,
    string EmployeeName,
    string DocumentType,
    DateTime ExpiryDate) : DomainEvent;

/// <summary>
/// Raised when an employee document is deleted
/// </summary>
public sealed record EmployeeDocumentDeletedDomainEvent(
    int EmployeeDocumentId,
    Guid TenantId,
    int EmployeeId,
    string DocumentType,
    int DeletedById) : DomainEvent;

#endregion
