using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Invoices.Commands.SendReminder;

public class SendInvoiceReminderCommandHandler : IRequestHandler<SendInvoiceReminderCommand, Result<bool>>
{
    private readonly IMasterDbContext _context;
    private readonly IEmailService _emailService;
    private readonly ILogger<SendInvoiceReminderCommandHandler> _logger;

    public SendInvoiceReminderCommandHandler(
        IMasterDbContext context,
        IEmailService emailService,
        ILogger<SendInvoiceReminderCommandHandler> logger)
    {
        _context = context;
        _emailService = emailService;
        _logger = logger;
    }

    public async Task<Result<bool>> Handle(SendInvoiceReminderCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var invoice = await _context.Invoices
                .Include(i => i.Items)
                .FirstOrDefaultAsync(i => i.Id == request.InvoiceId, cancellationToken);

            if (invoice == null)
            {
                return Result<bool>.Failure(Error.NotFound("Invoice.NotFound", $"Invoice with ID {request.InvoiceId} not found"));
            }

            var tenant = await _context.Tenants
                .FirstOrDefaultAsync(t => t.Id == invoice.TenantId, cancellationToken);

            if (tenant == null)
            {
                return Result<bool>.Failure(Error.NotFound("Tenant.NotFound", $"Tenant with ID {invoice.TenantId} not found"));
            }

            // Check if invoice is in a state that allows reminders
            if (invoice.Status == Domain.Master.Enums.InvoiceStatus.Odendi)
            {
                return Result<bool>.Failure(Error.Validation("Invoice.AlreadyPaid", "Cannot send reminder for a paid invoice"));
            }

            if (invoice.Status == Domain.Master.Enums.InvoiceStatus.IptalEdildi)
            {
                return Result<bool>.Failure(Error.Validation("Invoice.Cancelled", "Cannot send reminder for a cancelled invoice"));
            }

            if (invoice.Status == Domain.Master.Enums.InvoiceStatus.IadeEdildi)
            {
                return Result<bool>.Failure(Error.Validation("Invoice.Refunded", "Cannot send reminder for a refunded invoice"));
            }

            // Build email content
            var emailSubject = $"Ödeme Hatırlatması - Fatura #{invoice.InvoiceNumber}";
            var emailBody = BuildReminderEmailBody(invoice, tenant.Name);

            var emailMessage = new EmailMessage
            {
                To = tenant.ContactEmail.Value,
                Subject = emailSubject,
                Body = emailBody,
                IsHtml = true
            };

            await _emailService.SendAsync(emailMessage, cancellationToken);

            _logger.LogInformation(
                "Payment reminder sent for invoice {InvoiceId} to {Email}",
                request.InvoiceId,
                tenant.ContactEmail.Value);

            return Result<bool>.Success(true);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending payment reminder for invoice {InvoiceId}", request.InvoiceId);
            return Result<bool>.Failure(Error.Failure("Invoice.ReminderFailed", "Failed to send payment reminder"));
        }
    }

    private static string BuildReminderEmailBody(Domain.Master.Entities.Invoice invoice, string tenantName)
    {
        var isOverdue = invoice.DueDate < DateTime.UtcNow;
        var daysOverdue = isOverdue ? (DateTime.UtcNow - invoice.DueDate).Days : 0;

        var statusText = isOverdue
            ? $"<span style='color: #dc3545; font-weight: bold;'>Vadesi {daysOverdue} gün geçmiş</span>"
            : $"<span style='color: #ffc107; font-weight: bold;'>Son ödeme tarihi: {invoice.DueDate:dd.MM.yyyy}</span>";

        return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <style>
        body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background-color: #1a365d; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }}
        .content {{ background-color: #f8f9fa; padding: 30px; border: 1px solid #dee2e6; }}
        .invoice-details {{ background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; }}
        .amount {{ font-size: 24px; font-weight: bold; color: #1a365d; }}
        .footer {{ text-align: center; padding: 20px; color: #6c757d; font-size: 12px; }}
        .btn {{ display: inline-block; padding: 12px 24px; background-color: #1a365d; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }}
        table {{ width: 100%; border-collapse: collapse; }}
        th, td {{ padding: 10px; text-align: left; border-bottom: 1px solid #dee2e6; }}
        th {{ background-color: #f1f3f4; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>Ödeme Hatırlatması</h1>
        </div>
        <div class='content'>
            <p>Sayın <strong>{tenantName}</strong>,</p>

            <p>Aşağıdaki faturanız için ödeme beklenmektedir:</p>

            <div class='invoice-details'>
                <table>
                    <tr>
                        <th>Fatura No</th>
                        <td>{invoice.InvoiceNumber}</td>
                    </tr>
                    <tr>
                        <th>Düzenlenme Tarihi</th>
                        <td>{invoice.IssueDate:dd.MM.yyyy}</td>
                    </tr>
                    <tr>
                        <th>Durum</th>
                        <td>{statusText}</td>
                    </tr>
                    <tr>
                        <th>Ara Toplam</th>
                        <td>{invoice.Subtotal.Amount:N2} {invoice.Subtotal.Currency}</td>
                    </tr>
                    <tr>
                        <th>KDV (%{invoice.TaxRate:N0})</th>
                        <td>{invoice.TaxAmount.Amount:N2} {invoice.TaxAmount.Currency}</td>
                    </tr>
                    <tr>
                        <th>Ödenen</th>
                        <td>{invoice.PaidAmount.Amount:N2} {invoice.PaidAmount.Currency}</td>
                    </tr>
                    <tr>
                        <th style='font-size: 18px;'>Kalan Tutar</th>
                        <td class='amount'>{(invoice.TotalAmount.Amount - invoice.PaidAmount.Amount):N2} {invoice.TotalAmount.Currency}</td>
                    </tr>
                </table>
            </div>

            <p>Ödemenizi en kısa sürede gerçekleştirmenizi rica ederiz.</p>

            <p>Sorularınız için bizimle iletişime geçebilirsiniz.</p>

            <p>Saygılarımızla,<br/>Stocker Ekibi</p>
        </div>
        <div class='footer'>
            <p>Bu e-posta otomatik olarak gönderilmiştir. Lütfen bu e-postayı yanıtlamayınız.</p>
            <p>© {DateTime.UtcNow.Year} Stocker. Tüm hakları saklıdır.</p>
        </div>
    </div>
</body>
</html>";
    }
}
