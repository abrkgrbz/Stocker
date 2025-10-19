using MassTransit;
using Microsoft.Extensions.Logging;
using Stocker.Shared.Events.CRM;

namespace Stocker.Modules.Finance.Infrastructure.EventConsumers;

/// <summary>
/// Finance module consumer for DealWonEvent from CRM
/// Automatically creates invoices and revenue recognition entries for won deals
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
            "Finance module processing DealWonEvent: DealId={DealId}, CustomerId={CustomerId}, Amount={Amount}, Currency={Currency}, TenantId={TenantId}",
            @event.DealId,
            @event.CustomerId,
            @event.Amount,
            @event.Currency,
            @event.TenantId);

        // TODO: Implement automatic invoice creation from won deal
        // Examples:
        // - Create draft invoice using IFinanceInvoiceService.CreateInvoiceFromDealAsync
        // - Add invoice line items from deal products
        // - Set invoice due date based on customer payment terms
        // - Create revenue recognition schedule (for recurring deals)
        // - Update accounts receivable
        // - Create journal entry for booking
        // - Send invoice notification to customer
        // - Publish InvoiceCreatedEvent for other modules

        _logger.LogInformation(
            "Invoice should be created for won deal: DealId={DealId}, Amount={Amount} {Currency}, Products={ProductCount}",
            @event.DealId,
            @event.Amount,
            @event.Currency,
            @event.Products.Count);

        await Task.CompletedTask;
    }
}
