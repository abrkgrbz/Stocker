using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.HR.Domain.Events;

namespace Stocker.Modules.HR.Application.EventHandlers;

#region EmployeeAsset Event Handlers

public class AssetAssignedToEmployeeEventHandler : INotificationHandler<AssetAssignedToEmployeeDomainEvent>
{
    private readonly ILogger<AssetAssignedToEmployeeEventHandler> _logger;

    public AssetAssignedToEmployeeEventHandler(ILogger<AssetAssignedToEmployeeEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(AssetAssignedToEmployeeDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Asset assigned to employee: {AssetName} ({AssetType}) → {EmployeeName}",
            notification.AssetName,
            notification.AssetType,
            notification.EmployeeName);

        return Task.CompletedTask;
    }
}

public class AssetReturnedByEmployeeEventHandler : INotificationHandler<AssetReturnedByEmployeeDomainEvent>
{
    private readonly ILogger<AssetReturnedByEmployeeEventHandler> _logger;

    public AssetReturnedByEmployeeEventHandler(ILogger<AssetReturnedByEmployeeEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(AssetReturnedByEmployeeDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Asset returned by employee: {AssetName} ← {EmployeeName}, Condition: {Condition}",
            notification.AssetName,
            notification.EmployeeName,
            notification.Condition ?? "Not specified");

        return Task.CompletedTask;
    }
}

public class AssetReportedLostOrDamagedEventHandler : INotificationHandler<AssetReportedLostOrDamagedDomainEvent>
{
    private readonly ILogger<AssetReportedLostOrDamagedEventHandler> _logger;

    public AssetReportedLostOrDamagedEventHandler(ILogger<AssetReportedLostOrDamagedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(AssetReportedLostOrDamagedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Asset reported {ReportType}: {AssetName}, Employee: {EmployeeName}, Description: {Description}",
            notification.ReportType,
            notification.AssetName,
            notification.EmployeeName,
            notification.Description);

        return Task.CompletedTask;
    }
}

#endregion
