using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.CRM.Domain.Events;
using Stocker.Modules.CRM.Domain.Services;

namespace Stocker.Modules.CRM.Application.EventHandlers;

#region SurveyResponse Event Handlers

/// <summary>
/// Handler for survey sent events
/// </summary>
public sealed class SurveySentEventHandler : INotificationHandler<SurveySentDomainEvent>
{
    private readonly ILogger<SurveySentEventHandler> _logger;

    public SurveySentEventHandler(ILogger<SurveySentEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(SurveySentDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Survey sent: {SurveyType} - {SurveyName} to {Email}",
            notification.SurveyType,
            notification.SurveyName,
            notification.RespondentEmail ?? "Unknown");

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for survey started events
/// </summary>
public sealed class SurveyStartedEventHandler : INotificationHandler<SurveyStartedDomainEvent>
{
    private readonly ILogger<SurveyStartedEventHandler> _logger;

    public SurveyStartedEventHandler(ILogger<SurveyStartedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(SurveyStartedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Survey started: {SurveyType} - {SurveyName} by {Respondent}",
            notification.SurveyType,
            notification.SurveyName,
            notification.RespondentName ?? notification.RespondentEmail ?? "Unknown");

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for survey completed events
/// </summary>
public sealed class SurveyCompletedEventHandler : INotificationHandler<SurveyCompletedDomainEvent>
{
    private readonly ICrmNotificationService _notificationService;
    private readonly ILogger<SurveyCompletedEventHandler> _logger;

    public SurveyCompletedEventHandler(
        ICrmNotificationService notificationService,
        ILogger<SurveyCompletedEventHandler> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Handle(SurveyCompletedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Survey completed: {SurveyType} - {SurveyName}, Customer: {CustomerName}, Score: {Score}, NPS: {NpsScore}",
            notification.SurveyType,
            notification.SurveyName,
            notification.CustomerName ?? "Unknown",
            notification.OverallScore ?? 0,
            notification.NpsScore ?? 0);

        await _notificationService.SendSurveyCompletedAsync(
            notification.TenantId,
            notification.SurveyResponseId,
            notification.SurveyType,
            notification.CustomerName,
            notification.OverallScore,
            notification.NpsScore,
            cancellationToken);
    }
}

/// <summary>
/// Handler for NPS score recorded events
/// </summary>
public sealed class NpsScoreRecordedEventHandler : INotificationHandler<NpsScoreRecordedDomainEvent>
{
    private readonly ILogger<NpsScoreRecordedEventHandler> _logger;

    public NpsScoreRecordedEventHandler(ILogger<NpsScoreRecordedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(NpsScoreRecordedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "NPS score recorded: Customer {CustomerName}, Score: {NpsScore} ({Category})",
            notification.CustomerName ?? "Unknown",
            notification.NpsScore,
            notification.NpsCategory);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for CSAT score recorded events
/// </summary>
public sealed class CsatScoreRecordedEventHandler : INotificationHandler<CsatScoreRecordedDomainEvent>
{
    private readonly ILogger<CsatScoreRecordedEventHandler> _logger;

    public CsatScoreRecordedEventHandler(ILogger<CsatScoreRecordedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(CsatScoreRecordedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "CSAT score recorded: Customer {CustomerName}, Score: {CsatScore}/{MaxScore}",
            notification.CustomerName ?? "Unknown",
            notification.CsatScore,
            notification.MaxScore);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for detractor response received events (NPS 0-6)
/// </summary>
public sealed class DetractorResponseReceivedEventHandler : INotificationHandler<DetractorResponseReceivedDomainEvent>
{
    private readonly ICrmNotificationService _notificationService;
    private readonly ILogger<DetractorResponseReceivedEventHandler> _logger;

    public DetractorResponseReceivedEventHandler(
        ICrmNotificationService notificationService,
        ILogger<DetractorResponseReceivedEventHandler> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Handle(DetractorResponseReceivedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Detractor response received: Customer {CustomerName}, NPS: {NpsScore}, Feedback: {Feedback}",
            notification.CustomerName ?? "Unknown",
            notification.NpsScore,
            notification.Feedback ?? "No feedback");

        if (notification.OwnerId.HasValue)
        {
            await _notificationService.SendDetractorAlertAsync(
                notification.TenantId,
                notification.SurveyResponseId,
                notification.CustomerId,
                notification.CustomerName,
                notification.NpsScore,
                notification.Feedback,
                notification.OwnerId.Value,
                cancellationToken);
        }
    }
}

/// <summary>
/// Handler for promoter response received events (NPS 9-10)
/// </summary>
public sealed class PromoterResponseReceivedEventHandler : INotificationHandler<PromoterResponseReceivedDomainEvent>
{
    private readonly ILogger<PromoterResponseReceivedEventHandler> _logger;

    public PromoterResponseReceivedEventHandler(ILogger<PromoterResponseReceivedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(PromoterResponseReceivedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Promoter response received: Customer {CustomerName}, NPS: {NpsScore}",
            notification.CustomerName ?? "Unknown",
            notification.NpsScore);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for survey follow-up required events
/// </summary>
public sealed class SurveyFollowUpRequiredEventHandler : INotificationHandler<SurveyFollowUpRequiredDomainEvent>
{
    private readonly ICrmNotificationService _notificationService;
    private readonly ILogger<SurveyFollowUpRequiredEventHandler> _logger;

    public SurveyFollowUpRequiredEventHandler(
        ICrmNotificationService notificationService,
        ILogger<SurveyFollowUpRequiredEventHandler> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Handle(SurveyFollowUpRequiredDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Survey follow-up required: {SurveyType}, Customer: {CustomerName}, Reason: {Reason}, Priority: {Priority}",
            notification.SurveyType,
            notification.CustomerName ?? "Unknown",
            notification.FollowUpReason,
            notification.Priority);

        if (notification.AssignedToUserId.HasValue)
        {
            await _notificationService.SendSurveyFollowUpRequiredAsync(
                notification.TenantId,
                notification.SurveyResponseId,
                notification.SurveyType,
                notification.CustomerName,
                notification.FollowUpReason,
                notification.Priority,
                notification.AssignedToUserId.Value,
                cancellationToken);
        }
    }
}

/// <summary>
/// Handler for survey response analyzed events
/// </summary>
public sealed class SurveyResponseAnalyzedEventHandler : INotificationHandler<SurveyResponseAnalyzedDomainEvent>
{
    private readonly ILogger<SurveyResponseAnalyzedEventHandler> _logger;

    public SurveyResponseAnalyzedEventHandler(ILogger<SurveyResponseAnalyzedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(SurveyResponseAnalyzedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Survey response analyzed: {SurveyType}, Sentiment: {Sentiment}, Themes: {ThemeCount}, Actions: {ActionCount}",
            notification.SurveyType,
            notification.Sentiment ?? "Neutral",
            notification.KeyThemes.Count,
            notification.ActionItems.Count);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for survey expired events
/// </summary>
public sealed class SurveyExpiredEventHandler : INotificationHandler<SurveyExpiredDomainEvent>
{
    private readonly ILogger<SurveyExpiredEventHandler> _logger;

    public SurveyExpiredEventHandler(ILogger<SurveyExpiredEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(SurveyExpiredDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Survey expired: {SurveyType} - {SurveyName}, Email: {Email}, Expired: {ExpiryDate}",
            notification.SurveyType,
            notification.SurveyName,
            notification.RespondentEmail ?? "Unknown",
            notification.ExpiryDate);

        return Task.CompletedTask;
    }
}

#endregion
