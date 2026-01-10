using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.HR.Domain.Events;

namespace Stocker.Modules.HR.Application.EventHandlers;

#region Grievance Event Handlers

public class GrievanceFiledEventHandler : INotificationHandler<GrievanceFiledDomainEvent>
{
    private readonly ILogger<GrievanceFiledEventHandler> _logger;

    public GrievanceFiledEventHandler(ILogger<GrievanceFiledEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(GrievanceFiledDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Grievance filed: {EmployeeName}, Category: {Category}, Subject: {Subject}",
            notification.EmployeeName,
            notification.Category,
            notification.Subject);

        return Task.CompletedTask;
    }
}

public class GrievanceResolvedEventHandler : INotificationHandler<GrievanceResolvedDomainEvent>
{
    private readonly ILogger<GrievanceResolvedEventHandler> _logger;

    public GrievanceResolvedEventHandler(ILogger<GrievanceResolvedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(GrievanceResolvedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Grievance resolved: {EmployeeName}, Resolution: {Resolution}",
            notification.EmployeeName,
            notification.Resolution);

        return Task.CompletedTask;
    }
}

public class GrievanceEscalatedEventHandler : INotificationHandler<GrievanceEscalatedDomainEvent>
{
    private readonly ILogger<GrievanceEscalatedEventHandler> _logger;

    public GrievanceEscalatedEventHandler(ILogger<GrievanceEscalatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(GrievanceEscalatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Grievance escalated: {Subject}, Reason: {EscalationReason}",
            notification.Subject,
            notification.EscalationReason);

        return Task.CompletedTask;
    }
}

#endregion
