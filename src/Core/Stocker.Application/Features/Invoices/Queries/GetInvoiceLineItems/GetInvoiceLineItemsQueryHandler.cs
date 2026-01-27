using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Invoices.Queries.GetInvoiceLineItems;

public class GetInvoiceLineItemsQueryHandler : IRequestHandler<GetInvoiceLineItemsQuery, Result<List<InvoiceLineItemDto>>>
{
    private readonly IMasterDbContext _context;
    private readonly ILogger<GetInvoiceLineItemsQueryHandler> _logger;

    public GetInvoiceLineItemsQueryHandler(IMasterDbContext context, ILogger<GetInvoiceLineItemsQueryHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result<List<InvoiceLineItemDto>>> Handle(GetInvoiceLineItemsQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var invoice = await _context.Invoices
                .Include(i => i.Items)
                .FirstOrDefaultAsync(i => i.Id == request.InvoiceId, cancellationToken);

            if (invoice == null)
            {
                return Result<List<InvoiceLineItemDto>>.Failure(Error.NotFound("Invoice.NotFound", "Invoice not found"));
            }

            var lineItems = invoice.Items.Select(item => new InvoiceLineItemDto(
                Id: item.Id,
                Description: item.Description,
                Quantity: item.Quantity,
                UnitPrice: item.UnitPrice.Amount,
                TaxRate: invoice.TaxRate,
                TaxAmount: item.LineTotal.Amount * (invoice.TaxRate / 100),
                DiscountAmount: 0,
                LineTotal: item.LineTotal.Amount,
                ProductCode: null,
                ProductName: null,
                Currency: item.UnitPrice.Currency
            )).ToList();

            return Result<List<InvoiceLineItemDto>>.Success(lineItems);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting line items for invoice {InvoiceId}", request.InvoiceId);
            return Result<List<InvoiceLineItemDto>>.Failure(Error.Failure("Invoice.LineItems.Error", ex.Message));
        }
    }
}
