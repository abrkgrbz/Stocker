using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Notifications.Queries.GetTenantNotifications;

public class GetTenantNotificationsQueryHandler : IRequestHandler<GetTenantNotificationsQuery, Result<GetTenantNotificationsResponse>>
{
    private readonly ILogger<GetTenantNotificationsQueryHandler> _logger;
    private readonly ITenantDbContext _tenantContext;

    public GetTenantNotificationsQueryHandler(
        ILogger<GetTenantNotificationsQueryHandler> logger,
        ITenantDbContext tenantContext)
    {
        _logger = logger;
        _tenantContext = tenantContext;
    }

    public async Task<Result<GetTenantNotificationsResponse>> Handle(GetTenantNotificationsQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Getting notifications for userId: {UserId}, IsRead filter: {IsRead}", request.UserId, request.IsRead);

        try
        {
            if (_tenantContext?.TenantNotifications == null)
            {
                _logger.LogWarning("TenantNotifications DbSet is null - returning empty list");
                return Result.Success(new GetTenantNotificationsResponse());
            }

            // Base query - get notifications for this user (user-specific or global)
            var query = _tenantContext.TenantNotifications
                .Where(n =>
                    (n.TargetUserId == request.UserId || n.IsGlobal) &&
                    !n.IsDismissed &&
                    !n.IsArchived &&
                    (n.ExpiresAt == null || n.ExpiresAt > DateTime.UtcNow)
                );

            // Apply IsRead filter
            if (request.IsRead.HasValue)
            {
                query = query.Where(n => n.IsRead == request.IsRead.Value);
            }

            // Get total count before pagination
            var totalCount = await query.CountAsync(cancellationToken);

            // Get unread count (for all notifications, not just filtered)
            var unreadCount = await _tenantContext.TenantNotifications
                .Where(n =>
                    (n.TargetUserId == request.UserId || n.IsGlobal) &&
                    !n.IsRead &&
                    !n.IsDismissed &&
                    !n.IsArchived &&
                    (n.ExpiresAt == null || n.ExpiresAt > DateTime.UtcNow)
                )
                .CountAsync(cancellationToken);

            // Get paginated results
            var notifications = await query
                .OrderByDescending(n => n.CreatedAt)
                .Skip(request.Skip)
                .Take(request.Take)
                .Select(n => new TenantNotificationDto
                {
                    Id = n.Id,
                    Title = n.Title,
                    Message = n.Message,
                    Description = n.Description,
                    Type = n.Type.ToString(),
                    Category = n.Category.ToString(),
                    Priority = n.Priority.ToString(),
                    IsRead = n.IsRead,
                    ReadAt = n.ReadAt,
                    IsDismissed = n.IsDismissed,
                    RequiresAcknowledgment = n.RequiresAcknowledgment,
                    IsAcknowledged = n.IsAcknowledged,
                    IconName = n.IconName,
                    IconColor = n.IconColor,
                    ActionUrl = n.ActionUrl,
                    ActionText = n.ActionText,
                    CreatedAt = n.CreatedAt,
                    ExpiresAt = n.ExpiresAt,
                    CreatedBy = n.CreatedBy,
                    Tags = n.Tags
                })
                .ToListAsync(cancellationToken);

            _logger.LogInformation("Found {Count} notifications for user {UserId}", notifications.Count, request.UserId);

            return Result.Success(new GetTenantNotificationsResponse
            {
                Notifications = notifications,
                TotalCount = totalCount,
                UnreadCount = unreadCount
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting notifications for userId: {UserId}", request.UserId);
            return Result.Success(new GetTenantNotificationsResponse());
        }
    }
}
