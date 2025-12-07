using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Notifications.Commands.DeleteNotification;

public class DeleteNotificationCommandHandler : IRequestHandler<DeleteNotificationCommand, Result>
{
    private readonly ILogger<DeleteNotificationCommandHandler> _logger;
    private readonly ITenantDbContext _tenantContext;

    public DeleteNotificationCommandHandler(
        ILogger<DeleteNotificationCommandHandler> logger,
        ITenantDbContext tenantContext)
    {
        _logger = logger;
        _tenantContext = tenantContext;
    }

    public async Task<Result> Handle(DeleteNotificationCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Deleting notification {NotificationId} for user {UserId}",
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

            // Check if notification is persistent (cannot be deleted)
            if (notification.Persistent)
            {
                return Result.Failure(Error.Forbidden("Notification.CannotDelete", "This notification cannot be deleted"));
            }

            // Archive instead of hard delete for audit trail
            notification.Archive();
            await _tenantContext.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Notification {NotificationId} archived/deleted", request.NotificationId);
            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting notification {NotificationId}", request.NotificationId);
            return Result.Failure(Error.Failure("Notification.DeleteFailed", "Failed to delete notification"));
        }
    }
}
