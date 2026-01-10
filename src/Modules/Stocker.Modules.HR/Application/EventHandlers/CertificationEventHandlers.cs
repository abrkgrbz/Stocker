using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.HR.Domain.Events;

namespace Stocker.Modules.HR.Application.EventHandlers;

#region Certification Event Handlers

public class CertificationEarnedEventHandler : INotificationHandler<CertificationEarnedDomainEvent>
{
    private readonly ILogger<CertificationEarnedEventHandler> _logger;

    public CertificationEarnedEventHandler(ILogger<CertificationEarnedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(CertificationEarnedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Certification earned: {EmployeeName} - {CertificationName}",
            notification.EmployeeName,
            notification.CertificationName);

        return Task.CompletedTask;
    }
}

public class CertificationExpiringEventHandler : INotificationHandler<CertificationExpiringDomainEvent>
{
    private readonly ILogger<CertificationExpiringEventHandler> _logger;

    public CertificationExpiringEventHandler(ILogger<CertificationExpiringEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(CertificationExpiringDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Certification expiring: {EmployeeName} - {CertificationName}, Days: {DaysUntilExpiry}",
            notification.EmployeeName,
            notification.CertificationName,
            notification.DaysUntilExpiry);

        return Task.CompletedTask;
    }
}

public class CertificationExpiredEventHandler : INotificationHandler<CertificationExpiredDomainEvent>
{
    private readonly ILogger<CertificationExpiredEventHandler> _logger;

    public CertificationExpiredEventHandler(ILogger<CertificationExpiredEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(CertificationExpiredDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogError(
            "Certification expired: {EmployeeName} - {CertificationName}",
            notification.EmployeeName,
            notification.CertificationName);

        return Task.CompletedTask;
    }
}

#endregion
