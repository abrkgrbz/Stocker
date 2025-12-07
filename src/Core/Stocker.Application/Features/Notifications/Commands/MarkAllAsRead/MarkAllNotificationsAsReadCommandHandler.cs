using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Notifications.Commands.MarkAllAsRead;

public class MarkAllNotificationsAsReadCommandHandler : IRequestHandler<MarkAllNotificationsAsReadCommand, Result>
{
    private readonly ILogger<MarkAllNotificationsAsReadCommandHandler> _logger;
    private readonly ITenantDbContext _tenantContext;

    public MarkAllNotificationsAsReadCommandHandler(
        ILogger<MarkAllNotificationsAsReadCommandHandler> logger,
        ITenantDbContext tenantContext)
    {
        _logger = logger;
        _tenantContext = tenantContext;
    }

    public async Task<Result> Handle(MarkAllNotificationsAsReadCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Marking all notifications as read for user {UserId}", request.UserId);

        try
        {
            if (_tenantContext?.TenantNotifications == null)
            {
                return Result.Failure(Error.NotFound("Notifications.NotFound", "Notification system not available"));
            }

            var notifications = await _tenantContext.TenantNotifications
                .Where(n =>
                    (n.TargetUserId == request.UserId || n.IsGlobal) &&
                    !n.IsRead &&
                    !n.IsDismissed &&
                    !n.IsArchived)
                .ToListAsync(cancellationToken);

            foreach (var notification in notifications)
            {
                notification.MarkAsRead();
            }

            await _tenantContext.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Marked {Count} notifications as read for user {UserId}", notifications.Count, request.UserId);
            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error marking all notifications as read for user {UserId}", request.UserId);
            return Result.Failure(Error.Failure("Notification.MarkAllAsReadFailed", "Failed to mark all notifications as read"));
        }
    }
}
