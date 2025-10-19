using MassTransit;
using Microsoft.Extensions.Logging;
using Stocker.Shared.Events.CRM;

namespace Stocker.Modules.Stocker.Modules.Sales.Infrastructure.EventConsumers;

/// <summary>
/// Consumes CustomerCreatedEvent from CRM module to sync customer data in Sales module
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
            "Sales module processing CustomerCreatedEvent: CustomerId={CustomerId}, CompanyName={CompanyName}, TenantId={TenantId}",
            @event.CustomerId,
            @event.CompanyName,
            @event.TenantId);

        // TODO: Implement sales-specific logic for new customers
        // Examples:
        // - Create default price list for customer
        // - Set up customer-specific product catalog
        // - Initialize sales history tracking
        // - Assign to default sales team
        // - Create welcome sales order template

        await Task.CompletedTask;
    }
}
