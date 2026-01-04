using MassTransit;
using Microsoft.Extensions.Logging;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Modules.Finance.Domain.Entities;
using Stocker.Modules.Finance.Domain.Enums;
using Stocker.Modules.Finance.Interfaces;
using Stocker.Shared.Events.CRM;

namespace Stocker.Modules.Finance.Infrastructure.EventConsumers;

/// <summary>
/// Finance module consumer for DealWonEvent from CRM
/// Automatically creates a draft invoice when a CRM deal is won
/// </summary>
public class DealWonEventConsumer : IConsumer<DealWonEvent>
{
    private readonly IFinanceUnitOfWork _unitOfWork;
    private readonly ILogger<DealWonEventConsumer> _logger;

    public DealWonEventConsumer(
        IFinanceUnitOfWork unitOfWork,
        ILogger<DealWonEventConsumer> logger)
    {
        _unitOfWork = unitOfWork;
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

        try
        {
            // Find the CurrentAccount linked to this CRM Customer
            // Note: Customer ID mapping needs to be handled based on actual ID linking strategy
            var currentAccounts = await _unitOfWork.CurrentAccounts.SearchAsync(
                @event.CustomerId.ToString(),
                context.CancellationToken);

            var currentAccount = currentAccounts.FirstOrDefault();

            if (currentAccount == null)
            {
                _logger.LogWarning(
                    "No CurrentAccount found for CRM Customer {CustomerId}. Invoice will not be auto-created. DealId={DealId}",
                    @event.CustomerId,
                    @event.DealId);
                return;
            }

            // Generate invoice number
            var (series, sequenceNumber, invoiceNumber) = await GenerateInvoiceNumberAsync(context.CancellationToken);

            // Determine currency (use deal currency or default to TRY)
            var currency = string.IsNullOrWhiteSpace(@event.Currency) ? "TRY" : @event.Currency;

            // Create draft invoice
            var invoice = new Invoice(
                invoiceNumber: invoiceNumber,
                series: series,
                sequenceNumber: sequenceNumber,
                invoiceDate: @event.ClosedDate,
                invoiceType: InvoiceType.Sales,
                eInvoiceType: currentAccount.IsEInvoiceRegistered ? EInvoiceType.EInvoice : EInvoiceType.EArchive,
                scenario: InvoiceScenario.Commercial,
                currentAccountId: currentAccount.Id,
                currentAccountName: currentAccount.Name,
                currency: currency);

            // Copy tax info from CurrentAccount
            invoice.SetTaxInfo(
                currentAccount.TaxNumber,
                currentAccount.IdentityNumber,
                currentAccount.TaxOffice);

            // Copy billing address from CurrentAccount
            invoice.SetBillingAddress(
                currentAccount.Address,
                currentAccount.District,
                currentAccount.City,
                currentAccount.Country,
                currentAccount.PostalCode);

            // Set payment terms based on CurrentAccount defaults
            var dueDate = @event.ClosedDate.AddDays(currentAccount.PaymentDays);
            invoice.SetPaymentInfo(
                dueDate: dueDate,
                paymentMethod: null,
                paymentTerms: $"Net {currentAccount.PaymentDays}",
                paymentNote: null);

            // Set VAT withholding if applicable
            if (currentAccount.ApplyWithholding && currentAccount.WithholdingCode.HasValue)
            {
                invoice.SetVatWithholding(
                    apply: true,
                    rate: VatWithholdingRate.FiveTenths, // Default rate, can be adjusted
                    code: currentAccount.WithholdingCode,
                    reason: null);
            }

            // Add notes referencing the CRM deal
            invoice.SetNotes(
                notes: $"Auto-generated from CRM Deal: {@event.DealId}",
                internalNotes: $"Deal closed on {@event.ClosedDate:yyyy-MM-dd} by {@event.WonBy}");

            // Add to repository (but don't save yet - we need to add lines first)
            await _unitOfWork.Invoices.AddAsync(invoice, context.CancellationToken);
            await _unitOfWork.SaveChangesAsync(context.CancellationToken);

            // Add invoice lines from deal products
            var lineNumber = 1;
            foreach (var product in @event.Products)
            {
                var unitPrice = Money.Create(product.UnitPrice, currency);

                var line = new InvoiceLine(
                    invoiceId: invoice.Id,
                    lineNumber: lineNumber++,
                    description: product.ProductName,
                    quantity: product.Quantity,
                    unit: "ADET",
                    unitPrice: unitPrice,
                    vatRate: currentAccount.DefaultVatRate,
                    currency: currency);

                // Apply discount if any
                if (product.DiscountAmount > 0 && product.Quantity > 0)
                {
                    var discountRate = (product.DiscountAmount / (product.Quantity * product.UnitPrice)) * 100;
                    line.SetDiscount(discountRate, "Deal discount");
                }

                invoice.AddLine(line);
            }

            // If no products in deal, create a single line with the total amount
            if (!@event.Products.Any())
            {
                var unitPrice = Money.Create(@event.Amount, currency);

                var line = new InvoiceLine(
                    invoiceId: invoice.Id,
                    lineNumber: 1,
                    description: "Services as per agreement",
                    quantity: 1,
                    unit: "ADET",
                    unitPrice: unitPrice,
                    vatRate: currentAccount.DefaultVatRate,
                    currency: currency);

                invoice.AddLine(line);
            }

            // Save the invoice with lines
            await _unitOfWork.SaveChangesAsync(context.CancellationToken);

            _logger.LogInformation(
                "Draft invoice created successfully from CRM Deal. InvoiceId={InvoiceId}, InvoiceNumber={InvoiceNumber}, DealId={DealId}, Amount={Amount} {Currency}",
                invoice.Id,
                invoice.InvoiceNumber,
                @event.DealId,
                invoice.GrandTotal.Amount,
                invoice.Currency);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Failed to create invoice from CRM Deal. DealId={DealId}, CustomerId={CustomerId}",
                @event.DealId,
                @event.CustomerId);
            throw;
        }
    }

    private async Task<(string Series, int SequenceNumber, string InvoiceNumber)> GenerateInvoiceNumberAsync(
        CancellationToken cancellationToken)
    {
        // Generate invoice number format: SLS2024000000001 (3 char series + 4 year + 9 sequence)
        var series = "SLS";
        var year = DateTime.UtcNow.Year;
        var sequenceNumber = await _unitOfWork.Invoices.GetNextSequenceNumberAsync(series, cancellationToken);
        var invoiceNumber = $"{series}{year}{sequenceNumber:D9}";

        return (series, sequenceNumber, invoiceNumber);
    }
}
