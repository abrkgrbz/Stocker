using MassTransit;
using Microsoft.Extensions.Logging;
using Stocker.Shared.Events.CRM;

namespace Stocker.Modules.CRM.Infrastructure.EventConsumers;

/// <summary>
/// Sample consumer for DealWonEvent
/// Demonstrates event consumption pattern for deal completion workflows
/// </summary>
public class DealWonEventConsumer : IConsumer<DealWonEvent>
{
    private readonly ILogger<DealWonEventConsumer> _logger;

    public DealWonEventConsumer(ILogger<DealWonEventConsumer> logger)
    {
        _logger = logger;
    }

    public async Task Consume(ConsumeContext<DealWonEvent> context)
    {
        var @event = context.Message;

        _logger.LogInformation(
            "DealWonEvent consumed: DealId={DealId}, CustomerId={CustomerId}, Amount={Amount} {Currency}, TenantId={TenantId}, EventId={EventId}",
            @event.DealId,
            @event.CustomerId,
            @event.Amount,
            @event.Currency,
            @event.TenantId,
            @event.EventId);

        // Log product details
        if (@event.Products.Any())
        {
            _logger.LogInformation(
                "Deal contains {ProductCount} products",
                @event.Products.Count);

            foreach (var product in @event.Products)
            {
                _logger.LogInformation(
                    "  - {ProductName}: {Quantity} x {UnitPrice} (Discount: {DiscountAmount})",
                    product.ProductName,
                    product.Quantity,
                    product.UnitPrice,
                    product.DiscountAmount);
            }
        }

        // TODO: Implement actual business logic
        // Examples:
        // - Trigger invoice generation in Finance module
        // - Reserve inventory in Inventory module
        // - Create sales order in Sales module
        // - Update sales forecasts and analytics
        // - Send congratulations email to sales rep
        // - Update customer lifetime value calculations
        // - Trigger commission calculations
        // - Create fulfillment workflow
        // - Update CRM dashboards and metrics
        // - Send notifications to relevant stakeholders

        await Task.CompletedTask;
    }
}
