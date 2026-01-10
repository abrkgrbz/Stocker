using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.CRM.Domain.Events;

namespace Stocker.Modules.CRM.Application.EventHandlers;

/// <summary>
/// Handler for contact created events
/// </summary>
public sealed class ContactCreatedEventHandler : INotificationHandler<ContactCreatedDomainEvent>
{
    private readonly ILogger<ContactCreatedEventHandler> _logger;

    public ContactCreatedEventHandler(ILogger<ContactCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(ContactCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Contact created: {ContactId} - {FullName} ({Email}) for Customer {CustomerId}, Primary: {IsPrimary}",
            notification.ContactId,
            notification.FullName,
            notification.Email,
            notification.CustomerId,
            notification.IsPrimary);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for contact updated events
/// </summary>
public sealed class ContactUpdatedEventHandler : INotificationHandler<ContactUpdatedDomainEvent>
{
    private readonly ILogger<ContactUpdatedEventHandler> _logger;

    public ContactUpdatedEventHandler(ILogger<ContactUpdatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(ContactUpdatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Contact updated: {ContactId} - {FullName} ({Email})",
            notification.ContactId,
            notification.FullName,
            notification.Email);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for contact marked as primary events
/// </summary>
public sealed class ContactMarkedAsPrimaryEventHandler : INotificationHandler<ContactMarkedAsPrimaryDomainEvent>
{
    private readonly ILogger<ContactMarkedAsPrimaryEventHandler> _logger;

    public ContactMarkedAsPrimaryEventHandler(ILogger<ContactMarkedAsPrimaryEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(ContactMarkedAsPrimaryDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Contact marked as primary: {ContactId} for Customer {CustomerId}",
            notification.ContactId,
            notification.CustomerId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for pipeline created events
/// </summary>
public sealed class PipelineCreatedEventHandler : INotificationHandler<PipelineCreatedDomainEvent>
{
    private readonly ILogger<PipelineCreatedEventHandler> _logger;

    public PipelineCreatedEventHandler(ILogger<PipelineCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(PipelineCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Pipeline created: {PipelineId} - {Name} with {StageCount} stages",
            notification.PipelineId,
            notification.Name,
            notification.StageCount);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for pipeline stage added events
/// </summary>
public sealed class PipelineStageAddedEventHandler : INotificationHandler<PipelineStageAddedDomainEvent>
{
    private readonly ILogger<PipelineStageAddedEventHandler> _logger;

    public PipelineStageAddedEventHandler(ILogger<PipelineStageAddedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(PipelineStageAddedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Pipeline stage added: {StageId} - {StageName} to Pipeline {PipelineId}, Order: {Order}",
            notification.StageId,
            notification.StageName,
            notification.PipelineId,
            notification.Order);

        return Task.CompletedTask;
    }
}

