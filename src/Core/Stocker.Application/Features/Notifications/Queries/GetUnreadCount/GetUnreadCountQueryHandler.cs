using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Notifications.Queries.GetUnreadCount;

public class GetUnreadCountQueryHandler : IRequestHandler<GetUnreadCountQuery, Result<UnreadCountResponse>>
{
    private readonly ILogger<GetUnreadCountQueryHandler> _logger;
    private readonly ITenantDbContext _tenantContext;

    public GetUnreadCountQueryHandler(
        ILogger<GetUnreadCountQueryHandler> _logger,
        ITenantDbContext tenantContext)
    {
        this._logger = _logger;
        _tenantContext = tenantContext;
    }

    public async Task<Result<UnreadCountResponse>> Handle(GetUnreadCountQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Getting unread notification count for userId: {UserId}", request.UserId);

        try
        {
            // Check if TenantNotifications table exists (migration may not be run yet)
            if (_tenantContext.TenantNotifications == null)
            {
                _logger.LogWarning("TenantNotifications DbSet is null - table may not exist yet. Returning 0 count.");
                return Result.Success(new UnreadCountResponse { UnreadCount = 0 });
            }

            // Count unread notifications for the user
            var unreadCount = await _tenantContext.TenantNotifications
                .Where(n =>
                    (n.TargetUserId == request.UserId || n.IsGlobal) &&  // User-specific or global notifications
                    !n.IsRead &&                                          // Not read
                    !n.IsDismissed &&                                     // Not dismissed
                    !n.IsArchived &&                                      // Not archived
                    (n.ExpiresAt == null || n.ExpiresAt > DateTime.UtcNow) // Not expired
                )
                .CountAsync(cancellationToken);

            _logger.LogInformation("User {UserId} has {UnreadCount} unread notifications", request.UserId, unreadCount);

            return Result.Success(new UnreadCountResponse
            {
                UnreadCount = unreadCount
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting unread notification count for userId: {UserId}", request.UserId);

            // Gracefully handle database errors (e.g., table doesn't exist)
            _logger.LogWarning("Notification system not fully initialized - returning 0 count");
            return Result.Success(new UnreadCountResponse { UnreadCount = 0 });
        }
    }
}
