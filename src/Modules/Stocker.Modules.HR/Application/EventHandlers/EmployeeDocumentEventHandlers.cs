using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.HR.Domain.Events;

namespace Stocker.Modules.HR.Application.EventHandlers;

#region EmployeeDocument Event Handlers

public class EmployeeDocumentUploadedEventHandler : INotificationHandler<EmployeeDocumentUploadedDomainEvent>
{
    private readonly ILogger<EmployeeDocumentUploadedEventHandler> _logger;

    public EmployeeDocumentUploadedEventHandler(ILogger<EmployeeDocumentUploadedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(EmployeeDocumentUploadedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Document uploaded: {FileName} for Employee {EmployeeId}, Type: {DocumentType}",
            notification.FileName,
            notification.EmployeeId,
            notification.DocumentType);

        return Task.CompletedTask;
    }
}

public class EmployeeDocumentVerifiedEventHandler : INotificationHandler<EmployeeDocumentVerifiedDomainEvent>
{
    private readonly ILogger<EmployeeDocumentVerifiedEventHandler> _logger;

    public EmployeeDocumentVerifiedEventHandler(ILogger<EmployeeDocumentVerifiedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(EmployeeDocumentVerifiedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Document verified: Employee {EmployeeId}, Type: {DocumentType}",
            notification.EmployeeId,
            notification.DocumentType);

        return Task.CompletedTask;
    }
}

public class EmployeeDocumentRejectedEventHandler : INotificationHandler<EmployeeDocumentRejectedDomainEvent>
{
    private readonly ILogger<EmployeeDocumentRejectedEventHandler> _logger;

    public EmployeeDocumentRejectedEventHandler(ILogger<EmployeeDocumentRejectedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(EmployeeDocumentRejectedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Document rejected: Employee {EmployeeId}, Type: {DocumentType}, Reason: {RejectionReason}",
            notification.EmployeeId,
            notification.DocumentType,
            notification.RejectionReason);

        return Task.CompletedTask;
    }
}

public class EmployeeDocumentExpiredEventHandler : INotificationHandler<EmployeeDocumentExpiredDomainEvent>
{
    private readonly ILogger<EmployeeDocumentExpiredEventHandler> _logger;

    public EmployeeDocumentExpiredEventHandler(ILogger<EmployeeDocumentExpiredEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(EmployeeDocumentExpiredDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Document expired: {EmployeeName}, Type: {DocumentType}, Expiry: {ExpiryDate:d}",
            notification.EmployeeName,
            notification.DocumentType,
            notification.ExpiryDate);

        return Task.CompletedTask;
    }
}

public class EmployeeDocumentDeletedEventHandler : INotificationHandler<EmployeeDocumentDeletedDomainEvent>
{
    private readonly ILogger<EmployeeDocumentDeletedEventHandler> _logger;

    public EmployeeDocumentDeletedEventHandler(ILogger<EmployeeDocumentDeletedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(EmployeeDocumentDeletedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Document deleted: Employee {EmployeeId}, Type: {DocumentType}",
            notification.EmployeeId,
            notification.DocumentType);

        return Task.CompletedTask;
    }
}

#endregion
