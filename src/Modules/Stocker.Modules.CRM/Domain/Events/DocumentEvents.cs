using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.CRM.Domain.Events;

#region Document Events

/// <summary>
/// Raised when a new document is uploaded
/// </summary>
public sealed record DocumentUploadedDomainEvent(
    Guid DocumentId,
    Guid TenantId,
    string FileName,
    string FileType,
    long FileSize,
    string? RelatedEntityType,
    Guid? RelatedEntityId,
    int UploadedById) : DomainEvent;

/// <summary>
/// Raised when a document is shared
/// </summary>
public sealed record DocumentSharedDomainEvent(
    Guid DocumentId,
    Guid TenantId,
    string FileName,
    int SharedWithUserId,
    string Permission,
    int SharedById) : DomainEvent;

/// <summary>
/// Raised when a document is downloaded
/// </summary>
public sealed record DocumentDownloadedDomainEvent(
    Guid DocumentId,
    Guid TenantId,
    string FileName,
    int DownloadedById) : DomainEvent;

/// <summary>
/// Raised when a document is deleted
/// </summary>
public sealed record DocumentDeletedDomainEvent(
    Guid DocumentId,
    Guid TenantId,
    string FileName,
    string? RelatedEntityType,
    Guid? RelatedEntityId,
    int DeletedById) : DomainEvent;

/// <summary>
/// Raised when a document version is updated
/// </summary>
public sealed record DocumentVersionUpdatedDomainEvent(
    Guid DocumentId,
    Guid TenantId,
    string FileName,
    int OldVersion,
    int NewVersion,
    int UpdatedById) : DomainEvent;

/// <summary>
/// Raised when document approval is requested
/// </summary>
public sealed record DocumentApprovalRequestedDomainEvent(
    Guid DocumentId,
    Guid TenantId,
    string FileName,
    int RequestedById,
    int ApproverId) : DomainEvent;

/// <summary>
/// Raised when a document is approved
/// </summary>
public sealed record DocumentApprovedDomainEvent(
    Guid DocumentId,
    Guid TenantId,
    string FileName,
    int ApprovedById,
    int RequestedById) : DomainEvent;

/// <summary>
/// Raised when a document is rejected
/// </summary>
public sealed record DocumentRejectedDomainEvent(
    Guid DocumentId,
    Guid TenantId,
    string FileName,
    string RejectionReason,
    int RejectedById,
    int RequestedById) : DomainEvent;

#endregion
