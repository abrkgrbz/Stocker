using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.Results;
using System.Text;

namespace Stocker.Application.Features.Invoices.Queries.GenerateInvoicePdf;

public class GenerateInvoicePdfQueryHandler : IRequestHandler<GenerateInvoicePdfQuery, Result<InvoicePdfResponse>>
{
    private readonly IMasterDbContext _context;
    private readonly ILogger<GenerateInvoicePdfQueryHandler> _logger;

    public GenerateInvoicePdfQueryHandler(IMasterDbContext context, ILogger<GenerateInvoicePdfQueryHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result<InvoicePdfResponse>> Handle(GenerateInvoicePdfQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var invoice = await _context.Invoices
                .Include(i => i.Items)
                .FirstOrDefaultAsync(i => i.Id == request.InvoiceId, cancellationToken);

            if (invoice == null)
            {
                return Result<InvoicePdfResponse>.Failure(Error.NotFound("Invoice.NotFound", "Invoice not found"));
            }

            // Get tenant name
            var tenant = await _context.Tenants
                .FirstOrDefaultAsync(t => t.Id == invoice.TenantId, cancellationToken);

            // Generate HTML content for PDF
            var htmlContent = GenerateInvoiceHtml(invoice, tenant?.Name ?? "N/A");

            // Convert HTML to PDF bytes (simplified - in production use a PDF library like QuestPDF or iTextSharp)
            var pdfBytes = Encoding.UTF8.GetBytes(htmlContent);

            var fileName = $"Fatura_{invoice.InvoiceNumber}_{DateTime.UtcNow:yyyyMMdd}.pdf";

            _logger.LogInformation("Generated PDF for invoice {InvoiceId}, file: {FileName}", request.InvoiceId, fileName);

            return Result<InvoicePdfResponse>.Success(new InvoicePdfResponse(
                PdfContent: pdfBytes,
                FileName: fileName,
                ContentType: "application/pdf"
            ));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating PDF for invoice {InvoiceId}", request.InvoiceId);
            return Result<InvoicePdfResponse>.Failure(Error.Failure("Invoice.Pdf.Error", ex.Message));
        }
    }

    private static string GenerateInvoiceHtml(Domain.Master.Entities.Invoice invoice, string tenantName)
    {
        var sb = new StringBuilder();

        sb.AppendLine("<!DOCTYPE html>");
        sb.AppendLine("<html><head><style>");
        sb.AppendLine("body { font-family: Arial, sans-serif; margin: 40px; }");
        sb.AppendLine("h1 { color: #333; }");
        sb.AppendLine("table { width: 100%; border-collapse: collapse; margin-top: 20px; }");
        sb.AppendLine("th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }");
        sb.AppendLine("th { background-color: #f4f4f4; }");
        sb.AppendLine(".total { font-weight: bold; font-size: 1.2em; }");
        sb.AppendLine("</style></head><body>");

        sb.AppendLine($"<h1>FATURA #{invoice.InvoiceNumber}</h1>");
        sb.AppendLine($"<p><strong>Tarih:</strong> {invoice.IssueDate:dd.MM.yyyy}</p>");
        sb.AppendLine($"<p><strong>Vade Tarihi:</strong> {invoice.DueDate:dd.MM.yyyy}</p>");
        sb.AppendLine($"<p><strong>Durum:</strong> {invoice.Status}</p>");

        sb.AppendLine("<hr/>");
        sb.AppendLine($"<h3>Müşteri: {tenantName}</h3>");

        sb.AppendLine("<table>");
        sb.AppendLine("<tr><th>Açıklama</th><th>Miktar</th><th>Birim Fiyat</th><th>Toplam</th></tr>");

        foreach (var item in invoice.Items)
        {
            sb.AppendLine($"<tr>");
            sb.AppendLine($"<td>{item.Description}</td>");
            sb.AppendLine($"<td>{item.Quantity}</td>");
            sb.AppendLine($"<td>{item.UnitPrice.Amount:N2} {item.UnitPrice.Currency}</td>");
            sb.AppendLine($"<td>{item.LineTotal.Amount:N2} {item.LineTotal.Currency}</td>");
            sb.AppendLine($"</tr>");
        }

        sb.AppendLine("</table>");

        sb.AppendLine("<div style='margin-top: 20px; text-align: right;'>");
        sb.AppendLine($"<p><strong>Ara Toplam:</strong> {invoice.Subtotal:N2}</p>");
        sb.AppendLine($"<p><strong>KDV ({invoice.TaxRate}%):</strong> {invoice.TaxAmount:N2}</p>");
        sb.AppendLine($"<p class='total'><strong>Genel Toplam:</strong> {invoice.TotalAmount:N2}</p>");
        sb.AppendLine("</div>");

        sb.AppendLine("</body></html>");

        return sb.ToString();
    }
}
