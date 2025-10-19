using MassTransit;
using Microsoft.Extensions.Logging;
using Stocker.Shared.Events.CRM;

namespace Stocker.Modules.CRM.Infrastructure.EventConsumers;

/// <summary>
/// Sample consumer for CustomerUpdatedEvent
/// Demonstrates event consumption pattern for tracking customer changes
/// </summary>
public class CustomerUpdatedEventConsumer : IConsumer<CustomerUpdatedEvent>
{
    private readonly ILogger<CustomerUpdatedEventConsumer> _logger;

    public CustomerUpdatedEventConsumer(ILogger<CustomerUpdatedEventConsumer> logger)
    {
        _logger = logger;
    }

    public async Task Consume(ConsumeContext<CustomerUpdatedEvent> context)
    {
        var @event = context.Message;

        _logger.LogInformation(
            "CustomerUpdatedEvent consumed: CustomerId={CustomerId}, CompanyName={CompanyName}, TenantId={TenantId}, EventId={EventId}",
            @event.CustomerId,
            @event.CompanyName,
            @event.TenantId,
            @event.EventId);

        // TODO: Implement actual business logic
        // Examples:
        // - Sync updated customer data to external systems
        // - Update search indexes
        // - Trigger re-calculation of customer scores/segments
        // - Send change notifications to stakeholders
        // - Update cached data

        await Task.CompletedTask;
    }
}
