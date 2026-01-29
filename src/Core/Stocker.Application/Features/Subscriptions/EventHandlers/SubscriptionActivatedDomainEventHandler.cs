using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.Domain.Master.Events;

namespace Stocker.Application.Features.Subscriptions.EventHandlers;

/// <summary>
/// Handles subscription activation events.
/// Updates tenant module access and sends notifications.
/// </summary>
public sealed class SubscriptionActivatedDomainEventHandler : INotificationHandler<SubscriptionActivatedDomainEvent>
{
    private readonly IMasterDbContext _masterContext;
    private readonly ILogger<SubscriptionActivatedDomainEventHandler> _logger;

    public SubscriptionActivatedDomainEventHandler(
        IMasterDbContext masterContext,
        ILogger<SubscriptionActivatedDomainEventHandler> logger)
    {
        _masterContext = masterContext;
        _logger = logger;
    }

    public async Task Handle(SubscriptionActivatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Handling SubscriptionActivatedDomainEvent for subscription: {SubscriptionId}, tenant: {TenantId}",
            notification.SubscriptionId, notification.TenantId);

        try
        {
            // Get subscription with modules
            var subscription = await _masterContext.Subscriptions
                .Include(s => s.Modules)
                .Include(s => s.Package)
                .ThenInclude(p => p.Modules)
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

            // Activate modules based on subscription
            var moduleCodes = subscription.Modules
                .Select(m => m.ModuleCode)
                .ToList();

            // If subscription has a package, also include package modules
            if (subscription.Package?.Modules != null)
            {
                var packageModuleCodes = subscription.Package.Modules
                    .Select(pm => pm.ModuleCode);
                moduleCodes.AddRange(packageModuleCodes);
            }

            // Include custom module codes if any
            var customModuleCodes = subscription.GetCustomModuleCodes();
            if (customModuleCodes.Any())
            {
                moduleCodes.AddRange(customModuleCodes);
            }

            // Remove duplicates
            moduleCodes = moduleCodes.Distinct().ToList();

            _logger.LogInformation(
                "Activating {ModuleCount} modules for tenant {TenantId}: {Modules}",
                moduleCodes.Count, notification.TenantId, string.Join(", ", moduleCodes));

            // Update tenant's enabled modules
            tenant.UpdateEnabledModules(moduleCodes);

            await _masterContext.SaveChangesAsync(cancellationToken);

            _logger.LogInformation(
                "Successfully activated subscription {SubscriptionId} for tenant {TenantId}",
                notification.SubscriptionId, notification.TenantId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Error handling SubscriptionActivatedDomainEvent for subscription: {SubscriptionId}",
                notification.SubscriptionId);
            throw;
        }
    }
}
