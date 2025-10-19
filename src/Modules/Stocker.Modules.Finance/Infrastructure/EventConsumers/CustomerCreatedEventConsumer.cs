using MassTransit;
using Microsoft.Extensions.Logging;
using Stocker.Shared.Events.CRM;

namespace Stocker.Modules.Finance.Infrastructure.EventConsumers;

/// <summary>
/// Finance module consumer for CustomerCreatedEvent from CRM
/// Sets up financial accounts and credit terms for new customers
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
            "Finance module processing CustomerCreatedEvent: CustomerId={CustomerId}, CompanyName={CompanyName}, TenantId={TenantId}",
            @event.CustomerId,
            @event.CompanyName,
            @event.TenantId);

        // TODO: Implement finance-specific logic for new customers
        // Examples:
        // - Create customer account in chart of accounts
        // - Set up default payment terms (Net 30, Net 60, etc.)
        // - Initialize credit limit tracking
        // - Create accounts receivable record
        // - Set up billing preferences
        // - Initialize payment history tracking

        await Task.CompletedTask;
    }
}
