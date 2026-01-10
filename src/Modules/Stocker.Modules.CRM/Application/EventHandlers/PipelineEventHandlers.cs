using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.CRM.Domain.Events;

namespace Stocker.Modules.CRM.Application.EventHandlers;

#region Pipeline Event Handlers

/// <summary>
/// Handler for pipeline updated events
/// </summary>
public sealed class PipelineUpdatedEventHandler : INotificationHandler<PipelineUpdatedDomainEvent>
{
    private readonly ILogger<PipelineUpdatedEventHandler> _logger;

    public PipelineUpdatedEventHandler(ILogger<PipelineUpdatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(PipelineUpdatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Pipeline updated: {PipelineId} - {Name}",
            notification.PipelineId,
            notification.Name);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for pipeline set as default events
/// </summary>
public sealed class PipelineSetAsDefaultEventHandler : INotificationHandler<PipelineSetAsDefaultDomainEvent>
{
    private readonly ILogger<PipelineSetAsDefaultEventHandler> _logger;

    public PipelineSetAsDefaultEventHandler(ILogger<PipelineSetAsDefaultEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(PipelineSetAsDefaultDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Pipeline set as default: {PipelineId} - {Name}",
            notification.PipelineId,
            notification.Name);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for pipeline activated events
/// </summary>
public sealed class PipelineActivatedEventHandler : INotificationHandler<PipelineActivatedDomainEvent>
{
    private readonly ILogger<PipelineActivatedEventHandler> _logger;

    public PipelineActivatedEventHandler(ILogger<PipelineActivatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(PipelineActivatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Pipeline activated: {PipelineId} - {Name}",
            notification.PipelineId,
            notification.Name);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for pipeline deactivated events
/// </summary>
public sealed class PipelineDeactivatedEventHandler : INotificationHandler<PipelineDeactivatedDomainEvent>
{
    private readonly ILogger<PipelineDeactivatedEventHandler> _logger;

    public PipelineDeactivatedEventHandler(ILogger<PipelineDeactivatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(PipelineDeactivatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Pipeline deactivated: {PipelineId} - {Name}",
            notification.PipelineId,
            notification.Name);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for pipeline stage updated events
/// </summary>
public sealed class PipelineStageUpdatedEventHandler : INotificationHandler<PipelineStageUpdatedDomainEvent>
{
    private readonly ILogger<PipelineStageUpdatedEventHandler> _logger;

    public PipelineStageUpdatedEventHandler(ILogger<PipelineStageUpdatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(PipelineStageUpdatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Pipeline stage updated: {StageName}, Probability: {Probability}%",
            notification.StageName,
            notification.Probability);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for pipeline stage removed events
/// </summary>
public sealed class PipelineStageRemovedEventHandler : INotificationHandler<PipelineStageRemovedDomainEvent>
{
    private readonly ILogger<PipelineStageRemovedEventHandler> _logger;

    public PipelineStageRemovedEventHandler(ILogger<PipelineStageRemovedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(PipelineStageRemovedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Pipeline stage removed: {PipelineName} ← {StageName}",
            notification.PipelineName,
            notification.StageName);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for pipeline metrics calculated events
/// </summary>
public sealed class PipelineMetricsCalculatedEventHandler : INotificationHandler<PipelineMetricsCalculatedDomainEvent>
{
    private readonly ILogger<PipelineMetricsCalculatedEventHandler> _logger;

    public PipelineMetricsCalculatedEventHandler(ILogger<PipelineMetricsCalculatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(PipelineMetricsCalculatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Pipeline metrics calculated: {PipelineName}, Deals: {TotalDeals}, Value: {TotalValue}, Weighted: {WeightedValue}",
            notification.PipelineName,
            notification.TotalDeals,
            notification.TotalValue.ToString("C"),
            notification.WeightedValue.ToString("C"));

        return Task.CompletedTask;
    }
}

#endregion
