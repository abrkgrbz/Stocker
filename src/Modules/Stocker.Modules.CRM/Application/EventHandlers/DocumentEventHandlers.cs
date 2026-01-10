using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.CRM.Domain.Events;
using Stocker.Modules.CRM.Domain.Services;

namespace Stocker.Modules.CRM.Application.EventHandlers;

#region Document Event Handlers

/// <summary>
/// Handler for document uploaded events
/// </summary>
public sealed class DocumentUploadedEventHandler : INotificationHandler<DocumentUploadedDomainEvent>
{
    private readonly ILogger<DocumentUploadedEventHandler> _logger;

    public DocumentUploadedEventHandler(ILogger<DocumentUploadedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(DocumentUploadedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Document uploaded: {DocumentId} - {FileName}, Size: {FileSize} bytes, Related to: {RelatedEntityType}",
            notification.DocumentId,
            notification.FileName,
            notification.FileSize,
            notification.RelatedEntityType ?? "None");

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for document shared events
/// </summary>
public sealed class DocumentSharedEventHandler : INotificationHandler<DocumentSharedDomainEvent>
{
    private readonly ICrmNotificationService _notificationService;
    private readonly ILogger<DocumentSharedEventHandler> _logger;

    public DocumentSharedEventHandler(
        ICrmNotificationService notificationService,
        ILogger<DocumentSharedEventHandler> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Handle(DocumentSharedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Document shared: {DocumentId} - {FileName} → User {SharedWithUserId}",
            notification.DocumentId,
            notification.FileName,
            notification.SharedWithUserId);

        await _notificationService.SendDocumentSharedAsync(
            notification.TenantId,
            notification.DocumentId,
            notification.FileName,
            notification.SharedWithUserId,
            notification.SharedById,
            cancellationToken);
    }
}

/// <summary>
/// Handler for document downloaded events
/// </summary>
public sealed class DocumentDownloadedEventHandler : INotificationHandler<DocumentDownloadedDomainEvent>
{
    private readonly ILogger<DocumentDownloadedEventHandler> _logger;

    public DocumentDownloadedEventHandler(ILogger<DocumentDownloadedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(DocumentDownloadedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Document downloaded: {DocumentId} - {FileName} by user {DownloadedById}",
            notification.DocumentId,
            notification.FileName,
            notification.DownloadedById);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for document deleted events
/// </summary>
public sealed class DocumentDeletedEventHandler : INotificationHandler<DocumentDeletedDomainEvent>
{
    private readonly ILogger<DocumentDeletedEventHandler> _logger;

    public DocumentDeletedEventHandler(ILogger<DocumentDeletedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(DocumentDeletedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Document deleted: {DocumentId} - {FileName} by user {DeletedById}",
            notification.DocumentId,
            notification.FileName,
            notification.DeletedById);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for document version updated events
/// </summary>
public sealed class DocumentVersionUpdatedEventHandler : INotificationHandler<DocumentVersionUpdatedDomainEvent>
{
    private readonly ILogger<DocumentVersionUpdatedEventHandler> _logger;

    public DocumentVersionUpdatedEventHandler(ILogger<DocumentVersionUpdatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(DocumentVersionUpdatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Document version updated: {DocumentId} - {FileName}, Version: {OldVersion} → {NewVersion}",
            notification.DocumentId,
            notification.FileName,
            notification.OldVersion,
            notification.NewVersion);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for document approval requested events
/// </summary>
public sealed class DocumentApprovalRequestedEventHandler : INotificationHandler<DocumentApprovalRequestedDomainEvent>
{
    private readonly ICrmNotificationService _notificationService;
    private readonly ILogger<DocumentApprovalRequestedEventHandler> _logger;

    public DocumentApprovalRequestedEventHandler(
        ICrmNotificationService notificationService,
        ILogger<DocumentApprovalRequestedEventHandler> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Handle(DocumentApprovalRequestedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Document approval requested: {DocumentId} - {FileName} from user {ApproverId}",
            notification.DocumentId,
            notification.FileName,
            notification.ApproverId);

        await _notificationService.SendDocumentApprovalRequestedAsync(
            notification.TenantId,
            notification.DocumentId,
            notification.FileName,
            notification.ApproverId,
            notification.RequestedById,
            cancellationToken);
    }
}

/// <summary>
/// Handler for document approved events
/// </summary>
public sealed class DocumentApprovedEventHandler : INotificationHandler<DocumentApprovedDomainEvent>
{
    private readonly ICrmNotificationService _notificationService;
    private readonly ILogger<DocumentApprovedEventHandler> _logger;

    public DocumentApprovedEventHandler(
        ICrmNotificationService notificationService,
        ILogger<DocumentApprovedEventHandler> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Handle(DocumentApprovedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Document approved: {DocumentId} - {FileName} by user {ApprovedById}",
            notification.DocumentId,
            notification.FileName,
            notification.ApprovedById);

        await _notificationService.SendDocumentApprovedAsync(
            notification.TenantId,
            notification.DocumentId,
            notification.FileName,
            notification.RequestedById,
            cancellationToken);
    }
}

/// <summary>
/// Handler for document rejected events
/// </summary>
public sealed class DocumentRejectedEventHandler : INotificationHandler<DocumentRejectedDomainEvent>
{
    private readonly ICrmNotificationService _notificationService;
    private readonly ILogger<DocumentRejectedEventHandler> _logger;

    public DocumentRejectedEventHandler(
        ICrmNotificationService notificationService,
        ILogger<DocumentRejectedEventHandler> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Handle(DocumentRejectedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Document rejected: {DocumentId} - {FileName} by user {RejectedById}, Reason: {RejectionReason}",
            notification.DocumentId,
            notification.FileName,
            notification.RejectedById,
            notification.RejectionReason ?? "Not specified");

        await _notificationService.SendDocumentRejectedAsync(
            notification.TenantId,
            notification.DocumentId,
            notification.FileName,
            notification.RequestedById,
            notification.RejectionReason,
            cancellationToken);
    }
}

#endregion
