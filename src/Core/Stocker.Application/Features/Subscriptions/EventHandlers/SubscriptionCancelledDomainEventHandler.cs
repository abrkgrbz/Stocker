using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.Domain.Master.Events;

namespace Stocker.Application.Features.Subscriptions.EventHandlers;

/// <summary>
/// Handles subscription cancellation events.
/// Updates tenant module access and sends notifications.
/// </summary>
public sealed class SubscriptionCancelledDomainEventHandler : INotificationHandler<SubscriptionCancelledDomainEvent>
{
    private readonly IMasterDbContext _masterContext;
    private readonly ILogger<SubscriptionCancelledDomainEventHandler> _logger;

    public SubscriptionCancelledDomainEventHandler(
        IMasterDbContext masterContext,
        ILogger<SubscriptionCancelledDomainEventHandler> logger)
    {
        _masterContext = masterContext;
        _logger = logger;
    }

    public async Task Handle(SubscriptionCancelledDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Handling SubscriptionCancelledDomainEvent for subscription: {SubscriptionId}, tenant: {TenantId}, reason: {Reason}",
            notification.SubscriptionId, notification.TenantId, notification.Reason);

        try
        {
            // Get subscription
            var subscription = await _masterContext.Subscriptions
                .FirstOrDefaultAsync(s => s.Id == notification.SubscriptionId, cancellationToken);

            if (subscription == null)
            {
                _logger.LogWarning("Subscription not found: {SubscriptionId}", notification.SubscriptionId);
                return;
            }

            // Get tenant
            var tenant = await _masterContext.Tenants
                .FirstOrDefaultAsync(t => t.Id == notification.TenantId, cancellationToken);

            if (tenant == null)
            {
                _logger.LogWarning("Tenant not found: {TenantId}", notification.TenantId);
                return;
            }

            // Check if subscription has remaining access period
            if (subscription.CurrentPeriodEnd > DateTime.UtcNow)
            {
                _logger.LogInformation(
                    "Subscription {SubscriptionId} cancelled but access continues until {EndDate}",
                    notification.SubscriptionId, subscription.CurrentPeriodEnd);

                // Don't revoke access immediately - user has paid until CurrentPeriodEnd
                return;
            }

            // Subscription period has ended, revoke module access
            _logger.LogInformation(
                "Revoking module access for tenant {TenantId} due to subscription cancellation",
                notification.TenantId);

            // Clear enabled modules (or set to basic/free tier modules if applicable)
            tenant.UpdateEnabledModules(new List<string>());

            await _masterContext.SaveChangesAsync(cancellationToken);

            _logger.LogInformation(
                "Successfully handled subscription cancellation for tenant {TenantId}",
                notification.TenantId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Error handling SubscriptionCancelledDomainEvent for subscription: {SubscriptionId}",
                notification.SubscriptionId);
            throw;
        }
    }
}
