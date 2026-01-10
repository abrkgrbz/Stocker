using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.CRM.Domain.Events;
using Stocker.Modules.CRM.Domain.Services;

namespace Stocker.Modules.CRM.Application.EventHandlers;

#region Competitor Event Handlers

/// <summary>
/// Handler for competitor created events
/// </summary>
public sealed class CompetitorCreatedEventHandler : INotificationHandler<CompetitorCreatedDomainEvent>
{
    private readonly ILogger<CompetitorCreatedEventHandler> _logger;

    public CompetitorCreatedEventHandler(ILogger<CompetitorCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(CompetitorCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Competitor created: {CompetitorId} - {Name}, Threat Level: {ThreatLevel}",
            notification.CompetitorId,
            notification.Name,
            notification.ThreatLevel);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for competitor threat level changed events
/// </summary>
public sealed class CompetitorThreatLevelChangedEventHandler : INotificationHandler<CompetitorThreatLevelChangedDomainEvent>
{
    private readonly ICrmNotificationService _notificationService;
    private readonly ILogger<CompetitorThreatLevelChangedEventHandler> _logger;

    public CompetitorThreatLevelChangedEventHandler(
        ICrmNotificationService notificationService,
        ILogger<CompetitorThreatLevelChangedEventHandler> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Handle(CompetitorThreatLevelChangedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Competitor threat level changed: {Name}, {OldLevel} → {NewLevel}",
            notification.Name,
            notification.OldThreatLevel,
            notification.NewThreatLevel);

        await _notificationService.SendCompetitorThreatLevelChangedAsync(
            notification.TenantId,
            notification.CompetitorId,
            notification.Name,
            notification.OldThreatLevel,
            notification.NewThreatLevel,
            cancellationToken);
    }
}

/// <summary>
/// Handler for competitor product added events
/// </summary>
public sealed class CompetitorProductAddedEventHandler : INotificationHandler<CompetitorProductAddedDomainEvent>
{
    private readonly ILogger<CompetitorProductAddedEventHandler> _logger;

    public CompetitorProductAddedEventHandler(ILogger<CompetitorProductAddedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(CompetitorProductAddedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Competitor product added: {CompetitorName} - {ProductName}, Price: {Price}",
            notification.CompetitorName,
            notification.ProductName,
            notification.Price?.ToString("C") ?? "Unknown");

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for competitor strength added events
/// </summary>
public sealed class CompetitorStrengthAddedEventHandler : INotificationHandler<CompetitorStrengthAddedDomainEvent>
{
    private readonly ILogger<CompetitorStrengthAddedEventHandler> _logger;

    public CompetitorStrengthAddedEventHandler(ILogger<CompetitorStrengthAddedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(CompetitorStrengthAddedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Competitor strength identified: {CompetitorName} - {Strength}",
            notification.CompetitorName,
            notification.Strength);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for competitor weakness added events
/// </summary>
public sealed class CompetitorWeaknessAddedEventHandler : INotificationHandler<CompetitorWeaknessAddedDomainEvent>
{
    private readonly ILogger<CompetitorWeaknessAddedEventHandler> _logger;

    public CompetitorWeaknessAddedEventHandler(ILogger<CompetitorWeaknessAddedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(CompetitorWeaknessAddedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Competitor weakness identified: {CompetitorName} - {Weakness}",
            notification.CompetitorName,
            notification.Weakness);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for competitor linked to deal events
/// </summary>
public sealed class CompetitorLinkedToDealEventHandler : INotificationHandler<CompetitorLinkedToDealDomainEvent>
{
    private readonly ILogger<CompetitorLinkedToDealEventHandler> _logger;

    public CompetitorLinkedToDealEventHandler(ILogger<CompetitorLinkedToDealEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(CompetitorLinkedToDealDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Competitor linked to deal: {CompetitorName} → {DealName}, Position: {Position}",
            notification.CompetitorName,
            notification.DealName,
            notification.Position);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for competitor intelligence report created events
/// </summary>
public sealed class CompetitorIntelligenceReportCreatedEventHandler : INotificationHandler<CompetitorIntelligenceReportCreatedDomainEvent>
{
    private readonly ICrmNotificationService _notificationService;
    private readonly ILogger<CompetitorIntelligenceReportCreatedEventHandler> _logger;

    public CompetitorIntelligenceReportCreatedEventHandler(
        ICrmNotificationService notificationService,
        ILogger<CompetitorIntelligenceReportCreatedEventHandler> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Handle(CompetitorIntelligenceReportCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Competitor intelligence report created: {CompetitorName}, Type: {ReportType}",
            notification.CompetitorName,
            notification.ReportType);

        await _notificationService.SendCompetitorIntelligenceReportAsync(
            notification.TenantId,
            notification.CompetitorId,
            notification.CompetitorName,
            notification.ReportType,
            cancellationToken);
    }
}

/// <summary>
/// Handler for competitor market share updated events
/// </summary>
public sealed class CompetitorMarketShareUpdatedEventHandler : INotificationHandler<CompetitorMarketShareUpdatedDomainEvent>
{
    private readonly ILogger<CompetitorMarketShareUpdatedEventHandler> _logger;

    public CompetitorMarketShareUpdatedEventHandler(ILogger<CompetitorMarketShareUpdatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(CompetitorMarketShareUpdatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Competitor market share updated: {Name}, {OldShare}% → {NewShare}%",
            notification.Name,
            notification.OldMarketShare?.ToString("F2") ?? "Unknown",
            notification.NewMarketShare?.ToString("F2") ?? "Unknown");

        return Task.CompletedTask;
    }
}

#endregion
