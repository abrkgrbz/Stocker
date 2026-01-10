using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.CRM.Domain.Events;
using Stocker.Modules.CRM.Domain.Services;

namespace Stocker.Modules.CRM.Application.EventHandlers;

/// <summary>
/// Handler for lead created events
/// </summary>
public sealed class LeadCreatedEventHandler : INotificationHandler<LeadCreatedDomainEvent>
{
    private readonly ILogger<LeadCreatedEventHandler> _logger;

    public LeadCreatedEventHandler(ILogger<LeadCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(LeadCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Lead created: {LeadId} - {FullName} ({Email}), Source: {Source}, Status: {Status}",
            notification.LeadId,
            notification.FullName,
            notification.Email,
            notification.Source ?? "Unknown",
            notification.Status);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for lead status changed events
/// </summary>
public sealed class LeadStatusChangedEventHandler : INotificationHandler<LeadStatusChangedDomainEvent>
{
    private readonly ILogger<LeadStatusChangedEventHandler> _logger;

    public LeadStatusChangedEventHandler(ILogger<LeadStatusChangedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(LeadStatusChangedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Lead status changed: {LeadId} - {OldStatus} → {NewStatus}",
            notification.LeadId,
            notification.OldStatus,
            notification.NewStatus);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for lead assigned events - sends notification to assigned user
/// </summary>
public sealed class LeadAssignedEventHandler : INotificationHandler<LeadAssignedDomainEvent>
{
    private readonly ICrmNotificationService _notificationService;
    private readonly ILogger<LeadAssignedEventHandler> _logger;

    public LeadAssignedEventHandler(
        ICrmNotificationService notificationService,
        ILogger<LeadAssignedEventHandler> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Handle(LeadAssignedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Lead assigned: {LeadId} ({LeadName}) → User {AssignedToUserId}",
            notification.LeadId,
            notification.LeadName,
            notification.AssignedToUserId);

        // Send real-time notification to assigned user
        await _notificationService.SendLeadAssignedAsync(
            notification.TenantId,
            notification.LeadId,
            notification.LeadName,
            notification.AssignedToUserId,
            cancellationToken);
    }
}

/// <summary>
/// Handler for lead converted events - sends notification to tenant
/// </summary>
public sealed class LeadConvertedEventHandler : INotificationHandler<LeadConvertedDomainEvent>
{
    private readonly ICrmNotificationService _notificationService;
    private readonly ILogger<LeadConvertedEventHandler> _logger;

    public LeadConvertedEventHandler(
        ICrmNotificationService notificationService,
        ILogger<LeadConvertedEventHandler> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Handle(LeadConvertedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Lead converted to customer: Lead {LeadId} ({LeadName}) → Customer {CustomerId}",
            notification.LeadId,
            notification.LeadName,
            notification.CustomerId);

        // Send real-time notification to tenant
        await _notificationService.SendLeadConvertedAsync(
            notification.TenantId,
            notification.LeadId,
            notification.LeadName,
            notification.CustomerId,
            cancellationToken);
    }
}

/// <summary>
/// Handler for lead score changed events
/// </summary>
public sealed class LeadScoreChangedEventHandler : INotificationHandler<LeadScoreChangedDomainEvent>
{
    private readonly ILogger<LeadScoreChangedEventHandler> _logger;

    public LeadScoreChangedEventHandler(ILogger<LeadScoreChangedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(LeadScoreChangedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Lead score changed: {LeadId} - Score: {OldScore} → {NewScore}",
            notification.LeadId,
            notification.OldScore,
            notification.NewScore);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for lead qualified events
/// </summary>
public sealed class LeadQualifiedEventHandler : INotificationHandler<LeadQualifiedDomainEvent>
{
    private readonly ILogger<LeadQualifiedEventHandler> _logger;

    public LeadQualifiedEventHandler(ILogger<LeadQualifiedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(LeadQualifiedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Lead qualified: {LeadId} ({LeadName}), Score: {Score}",
            notification.LeadId,
            notification.LeadName,
            notification.Score);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for lead disqualified events
/// </summary>
public sealed class LeadDisqualifiedEventHandler : INotificationHandler<LeadDisqualifiedDomainEvent>
{
    private readonly ILogger<LeadDisqualifiedEventHandler> _logger;

    public LeadDisqualifiedEventHandler(ILogger<LeadDisqualifiedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(LeadDisqualifiedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Lead disqualified: {LeadId} ({LeadName}), Reason: {Reason}",
            notification.LeadId,
            notification.LeadName,
            notification.Reason ?? "Not specified");

        return Task.CompletedTask;
    }
}
