using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Notifications.Commands.MarkAsRead;

public class MarkNotificationAsReadCommandHandler : IRequestHandler<MarkNotificationAsReadCommand, Result>
{
    private readonly ILogger<MarkNotificationAsReadCommandHandler> _logger;
    private readonly ITenantDbContext _tenantContext;

    public MarkNotificationAsReadCommandHandler(
        ILogger<MarkNotificationAsReadCommandHandler> logger,
        ITenantDbContext tenantContext)
    {
        _logger = logger;
        _tenantContext = tenantContext;
    }

    public async Task<Result> Handle(MarkNotificationAsReadCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Marking notification {NotificationId} as read for user {UserId}",
            request.NotificationId, request.UserId);

        try
        {
            if (_tenantContext?.TenantNotifications == null)
            {
                return Result.Failure(Error.NotFound("Notifications.NotFound", "Notification system not available"));
            }

            var notification = await _tenantContext.TenantNotifications
                .FirstOrDefaultAsync(n =>
                    n.Id == request.NotificationId &&
                    (n.TargetUserId == request.UserId || n.IsGlobal),
                    cancellationToken);

            if (notification == null)
            {
                return Result.Failure(Error.NotFound("Notification.NotFound", "Notification not found"));
            }

            notification.MarkAsRead();
            await _tenantContext.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Notification {NotificationId} marked as read", request.NotificationId);
            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error marking notification {NotificationId} as read", request.NotificationId);
            return Result.Failure(Error.Failure("Notification.MarkAsReadFailed", "Failed to mark notification as read"));
        }
    }
}
