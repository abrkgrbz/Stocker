using MassTransit;
using Microsoft.Extensions.Logging;
using Stocker.Shared.Events.CRM;

namespace Stocker.Modules.CRM.Infrastructure.EventConsumers;

/// <summary>
/// Sample consumer for CustomerCreatedEvent
/// Demonstrates event consumption pattern for cross-module integration
/// </summary>
public class CustomerCreatedEventConsumer : IConsumer<CustomerCreatedEvent>
{
    private readonly ILogger<CustomerCreatedEventConsumer> _logger;

    public CustomerCreatedEventConsumer(ILogger<CustomerCreatedEventConsumer> logger)
    {
        _logger = logger;
    }

    public async Task Consume(ConsumeContext<CustomerCreatedEvent> context)
    {
        var @event = context.Message;

        _logger.LogInformation(
            "CustomerCreatedEvent consumed: CustomerId={CustomerId}, CompanyName={CompanyName}, TenantId={TenantId}, EventId={EventId}",
            @event.CustomerId,
            @event.CompanyName,
            @event.TenantId,
            @event.EventId);

        // TODO: Implement actual business logic
        // Examples:
        // - Sync customer to external CRM system
        // - Create default sales pipeline for new customer
        // - Send welcome email
        // - Initialize analytics tracking
        // - Create audit log entry

        await Task.CompletedTask;
    }
}
