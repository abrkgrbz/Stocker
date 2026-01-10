using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.HR.Domain.Events;
using Stocker.Modules.HR.Domain.Services;

namespace Stocker.Modules.HR.Application.EventHandlers;

/// <summary>
/// Handler for HR announcement published events - sends notification to all employees
/// </summary>
public sealed class HrAnnouncementPublishedEventHandler : INotificationHandler<HrAnnouncementPublishedDomainEvent>
{
    private readonly IHrNotificationService _notificationService;
    private readonly ILogger<HrAnnouncementPublishedEventHandler> _logger;

    public HrAnnouncementPublishedEventHandler(
        IHrNotificationService notificationService,
        ILogger<HrAnnouncementPublishedEventHandler> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Handle(HrAnnouncementPublishedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "📢 HR announcement published: {AnnouncementId} - {Title}, Type: {AnnouncementType}",
            notification.AnnouncementId,
            notification.Title,
            notification.AnnouncementType);

        await _notificationService.SendAnnouncementPublishedAsync(
            notification.TenantId,
            notification.AnnouncementId,
            notification.Title,
            notification.AnnouncementType,
            cancellationToken);
    }
}

/// <summary>
/// Handler for policy updated events
/// </summary>
public sealed class PolicyUpdatedEventHandler : INotificationHandler<PolicyUpdatedDomainEvent>
{
    private readonly ILogger<PolicyUpdatedEventHandler> _logger;

    public PolicyUpdatedEventHandler(ILogger<PolicyUpdatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(PolicyUpdatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "📋 Policy updated: {PolicyId} - {PolicyName}, Category: {PolicyCategory}, Effective: {EffectiveDate:d}",
            notification.PolicyId,
            notification.PolicyName,
            notification.PolicyCategory,
            notification.EffectiveDate);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for holiday calendar updated events
/// </summary>
public sealed class HolidayCalendarUpdatedEventHandler : INotificationHandler<HolidayCalendarUpdatedDomainEvent>
{
    private readonly ILogger<HolidayCalendarUpdatedEventHandler> _logger;

    public HolidayCalendarUpdatedEventHandler(ILogger<HolidayCalendarUpdatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(HolidayCalendarUpdatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "📅 Holiday calendar updated: Year {Year}, Total holidays: {TotalHolidays}",
            notification.Year,
            notification.TotalHolidays);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for upcoming holiday events - sends notification to all employees
/// </summary>
public sealed class UpcomingHolidayEventHandler : INotificationHandler<UpcomingHolidayDomainEvent>
{
    private readonly IHrNotificationService _notificationService;
    private readonly ILogger<UpcomingHolidayEventHandler> _logger;

    public UpcomingHolidayEventHandler(
        IHrNotificationService notificationService,
        ILogger<UpcomingHolidayEventHandler> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Handle(UpcomingHolidayDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "🎉 Upcoming holiday: {HolidayName} on {HolidayDate:d} ({DaysRemaining} days remaining)",
            notification.HolidayName,
            notification.HolidayDate,
            notification.DaysRemaining);

        await _notificationService.SendUpcomingHolidayAsync(
            notification.TenantId,
            notification.HolidayName,
            notification.HolidayDate,
            notification.DaysRemaining,
            cancellationToken);
    }
}
