using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Domain.Master.Enums;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Invoices.Commands.RefundInvoice;

public class RefundInvoiceCommandHandler : IRequestHandler<RefundInvoiceCommand, Result<RefundInvoiceResponse>>
{
    private readonly IMasterDbContext _context;
    private readonly ILogger<RefundInvoiceCommandHandler> _logger;

    public RefundInvoiceCommandHandler(IMasterDbContext context, ILogger<RefundInvoiceCommandHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result<RefundInvoiceResponse>> Handle(RefundInvoiceCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var invoice = await _context.Invoices
                .Include(i => i.Items)
                .Include(i => i.Payments)
                .FirstOrDefaultAsync(i => i.Id == request.InvoiceId, cancellationToken);

            if (invoice == null)
            {
                return Result<RefundInvoiceResponse>.Failure(Error.NotFound("Invoice.NotFound", "Invoice not found"));
            }

            if (invoice.Status != InvoiceStatus.Odendi)
            {
                return Result<RefundInvoiceResponse>.Failure(Error.Validation("Invoice.NotPaid", "Only paid invoices can be refunded"));
            }

            var refundAmount = request.IsFullRefund ? invoice.TotalAmount.Amount : request.RefundAmount;

            if (refundAmount <= 0 || refundAmount > invoice.TotalAmount.Amount)
            {
                return Result<RefundInvoiceResponse>.Failure(Error.Validation("Invoice.InvalidRefundAmount", "Invalid refund amount"));
            }

            // Use domain method to process refund
            var refundMoney = Money.Create(refundAmount, invoice.TotalAmount.Currency);
            invoice.Refund(refundMoney, request.Reason);

            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation(
                "Refund processed for invoice {InvoiceId}. Amount: {Amount} {Currency}",
                request.InvoiceId, refundAmount, invoice.TotalAmount.Currency);

            return Result<RefundInvoiceResponse>.Success(new RefundInvoiceResponse(
                OriginalInvoiceId: invoice.Id,
                CreditNoteId: null, // Domain method creates payment, not credit note
                CreditNoteNumber: null,
                RefundAmount: refundAmount,
                Currency: invoice.TotalAmount.Currency,
                RefundDate: DateTime.UtcNow
            ));
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Invalid refund operation for invoice {InvoiceId}", request.InvoiceId);
            return Result<RefundInvoiceResponse>.Failure(Error.Validation("Invoice.Refund.Invalid", ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing refund for invoice {InvoiceId}", request.InvoiceId);
            return Result<RefundInvoiceResponse>.Failure(Error.Failure("Invoice.Refund.Error", ex.Message));
        }
    }
}
