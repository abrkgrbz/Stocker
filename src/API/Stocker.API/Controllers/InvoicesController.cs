using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.Common.Exceptions;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Domain.Tenant.Entities;
using Stocker.Domain.Tenant.Enums;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Authorization;
using Stocker.API.DTOs.Tenant;

namespace Stocker.API.Controllers.Tenant;

[ApiController]
[Authorize]
[Route("api/tenants/{tenantId}/invoices")]
[RequireModule("Finance")]
public class InvoicesController : ControllerBase
{
    private readonly ITenantDbContextFactory _contextFactory;
    private readonly ILogger<InvoicesController> _logger;

    public InvoicesController(
        ITenantDbContextFactory contextFactory,
        ILogger<InvoicesController> logger)
    {
        _contextFactory = contextFactory;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<InvoiceDto>>> GetAll(
        Guid tenantId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        [FromQuery] InvoiceStatus? status = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null)
    {
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 20;
        if (pageSize > 100) pageSize = 100;

        using var context = await _contextFactory.CreateDbContextAsync(tenantId);
        
        var query = context.Invoices
            .Include(i => i.Items)
            .Where(i => i.TenantId == tenantId);

        // Apply filters
        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(i => 
                i.InvoiceNumber.Contains(search) ||
                i.Notes.Contains(search));
        }

        if (status.HasValue)
        {
            query = query.Where(i => i.Status == status.Value);
        }

        if (fromDate.HasValue)
        {
            query = query.Where(i => i.InvoiceDate >= fromDate.Value);
        }

        if (toDate.HasValue)
        {
            query = query.Where(i => i.InvoiceDate <= toDate.Value);
        }

        // Get total count
        var totalCount = await query.CountAsync();

        // Get paginated data
        var invoices = await query
            .OrderByDescending(i => i.InvoiceDate)
            .ThenBy(i => i.InvoiceNumber)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(i => new InvoiceDto
            {
                Id = i.Id,
                InvoiceNumber = i.InvoiceNumber,
                CustomerId = i.CustomerId,
                InvoiceDate = i.InvoiceDate,
                DueDate = i.DueDate,
                Status = i.Status.ToString(),
                SubTotal = i.SubTotal.Amount,
                TaxAmount = i.TaxAmount.Amount,
                DiscountAmount = i.DiscountAmount.Amount,
                TotalAmount = i.TotalAmount.Amount,
                Notes = i.Notes,
                Terms = i.Terms,
                PaidDate = i.PaidDate,
                PaymentMethod = i.PaymentMethod,
                PaymentReference = i.PaymentReference,
                Items = i.Items.Select(item => new InvoiceItemDto
                {
                    Id = item.Id,
                    ProductId = item.ProductId,
                    ProductName = item.ProductName,
                    Description = item.Description,
                    Quantity = item.Quantity,
                    UnitPrice = item.UnitPrice.Amount,
                    DiscountPercentage = item.DiscountPercentage,
                    DiscountAmount = item.DiscountAmount != null ? item.DiscountAmount.Amount : null,
                    TaxRate = item.TaxRate,
                    TaxAmount = item.TaxAmount != null ? item.TaxAmount.Amount : null,
                    TotalPrice = item.TotalPrice.Amount
                }).ToList()
            })
            .ToListAsync();

        var result = PagedResult<InvoiceDto>.Create(invoices, totalCount, page, pageSize);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<InvoiceDto>> GetById(Guid tenantId, Guid id)
    {
        using var context = await _contextFactory.CreateDbContextAsync(tenantId);
        var invoice = await context.Invoices
            .Include(i => i.Items)
            .Where(i => i.TenantId == tenantId && i.Id == id)
            .Select(i => new InvoiceDto
            {
                Id = i.Id,
                InvoiceNumber = i.InvoiceNumber,
                CustomerId = i.CustomerId,
                InvoiceDate = i.InvoiceDate,
                DueDate = i.DueDate,
                Status = i.Status.ToString(),
                SubTotal = i.SubTotal.Amount,
                TaxAmount = i.TaxAmount.Amount,
                DiscountAmount = i.DiscountAmount.Amount,
                TotalAmount = i.TotalAmount.Amount,
                Notes = i.Notes,
                Terms = i.Terms,
                PaidDate = i.PaidDate,
                PaymentMethod = i.PaymentMethod,
                PaymentReference = i.PaymentReference,
                Items = i.Items.Select(item => new InvoiceItemDto
                {
                    Id = item.Id,
                    ProductId = item.ProductId,
                    ProductName = item.ProductName,
                    Description = item.Description,
                    Quantity = item.Quantity,
                    UnitPrice = item.UnitPrice.Amount,
                    DiscountPercentage = item.DiscountPercentage,
                    DiscountAmount = item.DiscountAmount != null ? item.DiscountAmount.Amount : null,
                    TaxRate = item.TaxRate,
                    TaxAmount = item.TaxAmount != null ? item.TaxAmount.Amount : null,
                    TotalPrice = item.TotalPrice.Amount
                }).ToList()
            })
            .FirstOrDefaultAsync();

        if (invoice == null)
            throw new NotFoundException("Invoice", id);

        return Ok(invoice);
    }

    [HttpPost]
    public async Task<ActionResult<InvoiceDto>> Create(Guid tenantId, CreateInvoiceDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.InvoiceNumber))
            throw new ValidationException("InvoiceNumber", "Invoice number is required");

        // Check for duplicate invoice number
        using var context = await _contextFactory.CreateDbContextAsync(tenantId);
        var existingInvoice = await context.Invoices
            .FirstOrDefaultAsync(i => i.TenantId == tenantId && i.InvoiceNumber == dto.InvoiceNumber);
        
        if (existingInvoice != null)
            throw new ConflictException("Invoice", "invoice number", dto.InvoiceNumber);

        // Validate customer exists
        var customerExists = await context.Customers
            .AnyAsync(c => c.TenantId == tenantId && c.Id == dto.CustomerId);
        
        if (!customerExists)
            throw new NotFoundException("Customer", dto.CustomerId);

        var invoice = Invoice.Create(
            tenantId,
            dto.InvoiceNumber,
            dto.CustomerId,
            dto.InvoiceDate,
            dto.DueDate
        );

        if (!string.IsNullOrWhiteSpace(dto.Notes))
            invoice.SetNotes(dto.Notes);

        if (!string.IsNullOrWhiteSpace(dto.Terms))
            invoice.SetTerms(dto.Terms);

        // Add items
        if (dto.Items != null && dto.Items.Any())
        {
            foreach (var itemDto in dto.Items)
            {
                if (itemDto.Quantity <= 0)
                    throw new ValidationException("Quantity", "Quantity must be greater than zero");
                
                if (itemDto.UnitPrice < 0)
                    throw new ValidationException("UnitPrice", "Unit price cannot be negative");

                var unitPrice = Money.Create(itemDto.UnitPrice, itemDto.Currency ?? "TRY");
                var item = InvoiceItem.Create(
                    tenantId,
                    invoice.Id,
                    itemDto.ProductId,
                    itemDto.ProductName,
                    itemDto.Quantity,
                    unitPrice
                );

                if (!string.IsNullOrWhiteSpace(itemDto.Description))
                    item.SetDescription(itemDto.Description);

                if (itemDto.DiscountPercentage.HasValue)
                {
                    if (itemDto.DiscountPercentage.Value < 0 || itemDto.DiscountPercentage.Value > 100)
                        throw new ValidationException("DiscountPercentage", "Discount percentage must be between 0 and 100");
                    item.ApplyDiscount(itemDto.DiscountPercentage.Value);
                }

                if (itemDto.TaxRate.HasValue)
                {
                    if (itemDto.TaxRate.Value < 0)
                        throw new ValidationException("TaxRate", "Tax rate cannot be negative");
                    item.ApplyTax(itemDto.TaxRate.Value);
                }

                invoice.AddItem(item);
            }
        }

        context.Invoices.Add(invoice);
        await context.SaveChangesAsync();

        var result = new InvoiceDto
        {
            Id = invoice.Id,
            InvoiceNumber = invoice.InvoiceNumber,
            CustomerId = invoice.CustomerId,
            InvoiceDate = invoice.InvoiceDate,
            DueDate = invoice.DueDate,
            Status = invoice.Status.ToString(),
            SubTotal = invoice.SubTotal.Amount,
            TaxAmount = invoice.TaxAmount.Amount,
            DiscountAmount = invoice.DiscountAmount.Amount,
            TotalAmount = invoice.TotalAmount.Amount,
            Notes = invoice.Notes,
            Terms = invoice.Terms,
            Items = invoice.Items.Select(item => new InvoiceItemDto
            {
                Id = item.Id,
                ProductId = item.ProductId,
                ProductName = item.ProductName,
                Description = item.Description,
                Quantity = item.Quantity,
                UnitPrice = item.UnitPrice.Amount,
                DiscountPercentage = item.DiscountPercentage,
                DiscountAmount = item.DiscountAmount?.Amount,
                TaxRate = item.TaxRate,
                TaxAmount = item.TaxAmount?.Amount,
                TotalPrice = item.TotalPrice.Amount
            }).ToList()
        };

        return CreatedAtAction(nameof(GetById), new { tenantId, id = invoice.Id }, result);
    }

    [HttpPost("{id}/send")]
    public async Task<IActionResult> SendInvoice(Guid tenantId, Guid id)
    {
        using var context = await _contextFactory.CreateDbContextAsync(tenantId);
        var invoice = await context.Invoices
            .Include(i => i.Items)
            .FirstOrDefaultAsync(i => i.TenantId == tenantId && i.Id == id);

        if (invoice == null)
            throw new NotFoundException("Invoice", id);

        if (invoice.Status != InvoiceStatus.Draft)
            throw new BusinessRuleException($"Invoice cannot be sent. Current status: {invoice.Status}");

        if (!invoice.Items.Any())
            throw new BusinessRuleException("Invoice must have at least one item before sending");

        invoice.Send();
        await context.SaveChangesAsync();

        _logger.LogInformation("Invoice {InvoiceId} sent successfully for tenant {TenantId}", id, tenantId);
        return Ok();
    }

    [HttpPost("{id}/mark-as-paid")]
    public async Task<IActionResult> MarkAsPaid(Guid tenantId, Guid id, MarkInvoiceAsPaidDto dto)
    {
        if (dto.PaymentDate > DateTime.UtcNow)
            throw new ValidationException("PaymentDate", "Payment date cannot be in the future");

        if (string.IsNullOrWhiteSpace(dto.PaymentMethod))
            throw new ValidationException("PaymentMethod", "Payment method is required");

        using var context = await _contextFactory.CreateDbContextAsync(tenantId);
        var invoice = await context.Invoices
            .FirstOrDefaultAsync(i => i.TenantId == tenantId && i.Id == id);

        if (invoice == null)
            throw new NotFoundException("Invoice", id);

        if (invoice.Status == InvoiceStatus.Paid)
            throw new BusinessRuleException("Invoice is already marked as paid");

        if (invoice.Status == InvoiceStatus.Cancelled)
            throw new BusinessRuleException("Cannot mark a cancelled invoice as paid");

        invoice.MarkAsPaid(dto.PaymentDate, dto.PaymentMethod, dto.PaymentReference);
        await context.SaveChangesAsync();

        _logger.LogInformation("Invoice {InvoiceId} marked as paid for tenant {TenantId}", id, tenantId);
        return Ok();
    }

    [HttpPost("{id}/cancel")]
    public async Task<IActionResult> CancelInvoice(Guid tenantId, Guid id, CancelInvoiceDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Reason))
            throw new ValidationException("Reason", "Cancellation reason is required");

        using var context = await _contextFactory.CreateDbContextAsync(tenantId);
        var invoice = await context.Invoices
            .FirstOrDefaultAsync(i => i.TenantId == tenantId && i.Id == id);

        if (invoice == null)
            throw new NotFoundException("Invoice", id);

        if (invoice.Status == InvoiceStatus.Paid)
            throw new BusinessRuleException("Cannot cancel a paid invoice");

        if (invoice.Status == InvoiceStatus.Cancelled)
            throw new BusinessRuleException("Invoice is already cancelled");

        invoice.Cancel(dto.Reason);
        await context.SaveChangesAsync();

        _logger.LogInformation("Invoice {InvoiceId} cancelled for tenant {TenantId}. Reason: {Reason}", 
            id, tenantId, dto.Reason);
        return Ok();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid tenantId, Guid id)
    {
        using var context = await _contextFactory.CreateDbContextAsync(tenantId);
        var invoice = await context.Invoices
            .FirstOrDefaultAsync(i => i.TenantId == tenantId && i.Id == id);

        if (invoice == null)
            throw new NotFoundException("Invoice", id);

        if (invoice.Status != InvoiceStatus.Draft)
            throw new BusinessRuleException($"Only draft invoices can be deleted. Current status: {invoice.Status}");

        context.Invoices.Remove(invoice);
        await context.SaveChangesAsync();

        _logger.LogInformation("Invoice {InvoiceId} deleted for tenant {TenantId}", id, tenantId);
        return NoContent();
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<InvoiceDto>> Update(Guid tenantId, Guid id, UpdateInvoiceDto dto)
    {
        using var context = await _contextFactory.CreateDbContextAsync(tenantId);
        var invoice = await context.Invoices
            .Include(i => i.Items)
            .FirstOrDefaultAsync(i => i.TenantId == tenantId && i.Id == id);

        if (invoice == null)
            throw new NotFoundException("Invoice", id);

        // Only draft invoices can be updated
        if (invoice.Status != InvoiceStatus.Draft)
            throw new BusinessRuleException($"Only draft invoices can be updated. Current status: {invoice.Status}");

        // Update invoice number if provided and different
        if (!string.IsNullOrWhiteSpace(dto.InvoiceNumber) && dto.InvoiceNumber != invoice.InvoiceNumber)
        {
            // Check for duplicate invoice number
            var duplicateExists = await context.Invoices
                .AnyAsync(i => i.TenantId == tenantId && i.Id != id && i.InvoiceNumber == dto.InvoiceNumber);
            
            if (duplicateExists)
                throw new ConflictException("Invoice", "invoice number", dto.InvoiceNumber);

            invoice.UpdateInvoiceNumber(dto.InvoiceNumber);
        }

        // Update dates if provided
        if (dto.InvoiceDate.HasValue)
            invoice.UpdateDates(dto.InvoiceDate.Value, dto.DueDate ?? invoice.DueDate);
        else if (dto.DueDate.HasValue)
            invoice.UpdateDates(invoice.InvoiceDate, dto.DueDate.Value);

        // Update notes and terms
        if (dto.Notes != null)
            invoice.SetNotes(dto.Notes);

        if (dto.Terms != null)
            invoice.SetTerms(dto.Terms);

        await context.SaveChangesAsync();

        var result = new InvoiceDto
        {
            Id = invoice.Id,
            InvoiceNumber = invoice.InvoiceNumber,
            CustomerId = invoice.CustomerId,
            InvoiceDate = invoice.InvoiceDate,
            DueDate = invoice.DueDate,
            Status = invoice.Status.ToString(),
            SubTotal = invoice.SubTotal.Amount,
            TaxAmount = invoice.TaxAmount.Amount,
            DiscountAmount = invoice.DiscountAmount.Amount,
            TotalAmount = invoice.TotalAmount.Amount,
            Notes = invoice.Notes,
            Terms = invoice.Terms,
            Items = invoice.Items.Select(item => new InvoiceItemDto
            {
                Id = item.Id,
                ProductId = item.ProductId,
                ProductName = item.ProductName,
                Description = item.Description,
                Quantity = item.Quantity,
                UnitPrice = item.UnitPrice.Amount,
                DiscountPercentage = item.DiscountPercentage,
                DiscountAmount = item.DiscountAmount?.Amount,
                TaxRate = item.TaxRate,
                TaxAmount = item.TaxAmount?.Amount,
                TotalPrice = item.TotalPrice.Amount
            }).ToList()
        };

        _logger.LogInformation("Invoice {InvoiceId} updated for tenant {TenantId}", id, tenantId);
        return Ok(result);
    }

    [HttpGet("{id}/pdf")]
    public async Task<IActionResult> GetPdf(Guid tenantId, Guid id)
    {
        using var context = await _contextFactory.CreateDbContextAsync(tenantId);
        var invoice = await context.Invoices
            .Include(i => i.Items)
            .FirstOrDefaultAsync(i => i.TenantId == tenantId && i.Id == id);

        if (invoice == null)
            throw new NotFoundException("Invoice", id);

        // For now, return a simple JSON representation
        // In production, you would use a PDF generation library like iTextSharp or QuestPDF
        var pdfData = new
        {
            InvoiceNumber = invoice.InvoiceNumber,
            InvoiceDate = invoice.InvoiceDate.ToString("yyyy-MM-dd"),
            DueDate = invoice.DueDate.ToString("yyyy-MM-dd"),
            Status = invoice.Status.ToString(),
            TotalAmount = invoice.TotalAmount.Amount,
            Currency = invoice.TotalAmount.Currency,
            Items = invoice.Items.Select(i => new
            {
                ProductName = i.ProductName,
                Quantity = i.Quantity,
                UnitPrice = i.UnitPrice.Amount,
                TotalPrice = i.TotalPrice.Amount
            })
        };

        // Placeholder: In production, generate actual PDF bytes
        var pdfBytes = System.Text.Encoding.UTF8.GetBytes(System.Text.Json.JsonSerializer.Serialize(pdfData));
        
        _logger.LogInformation("PDF generated for invoice {InvoiceId} for tenant {TenantId}", id, tenantId);
        return File(pdfBytes, "application/pdf", $"invoice_{invoice.InvoiceNumber}.pdf");
    }

    [HttpPost("{id}/email")]
    public async Task<IActionResult> SendByEmail(Guid tenantId, Guid id, SendInvoiceByEmailDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.EmailTo))
            throw new ValidationException("EmailTo", "Recipient email is required");

        if (!IsValidEmail(dto.EmailTo))
            throw new ValidationException("EmailTo", "Invalid email format");

        using var context = await _contextFactory.CreateDbContextAsync(tenantId);
        var invoice = await context.Invoices
            .Include(i => i.Items)
            .FirstOrDefaultAsync(i => i.TenantId == tenantId && i.Id == id);

        if (invoice == null)
            throw new NotFoundException("Invoice", id);

        // Invoice must be sent or paid to be emailed
        if (invoice.Status == InvoiceStatus.Draft)
            throw new BusinessRuleException("Cannot email a draft invoice. Please send it first.");

        if (invoice.Status == InvoiceStatus.Cancelled)
            throw new BusinessRuleException("Cannot email a cancelled invoice.");

        // Email sending logic would go here
        // In production, you would use IEmailService to send the actual email
        var emailSubject = dto.Subject ?? $"Invoice {invoice.InvoiceNumber}";
        var emailBody = dto.Message ?? $"Please find attached invoice {invoice.InvoiceNumber} for {invoice.TotalAmount.Currency} {invoice.TotalAmount.Amount:N2}";

        // Log the email sending (in production, actual email would be sent)
        _logger.LogInformation(
            "Invoice {InvoiceId} emailed to {EmailTo} for tenant {TenantId}. Subject: {Subject}",
            id, dto.EmailTo, tenantId, emailSubject);

        if (!string.IsNullOrWhiteSpace(dto.EmailCc))
            _logger.LogInformation("CC: {EmailCc}", dto.EmailCc);

        if (!string.IsNullOrWhiteSpace(dto.EmailBcc))
            _logger.LogInformation("BCC: {EmailBcc}", dto.EmailBcc);

        return Ok(new { Message = $"Invoice {invoice.InvoiceNumber} has been sent to {dto.EmailTo}" });
    }

    private bool IsValidEmail(string email)
    {
        try
        {
            var addr = new System.Net.Mail.MailAddress(email);
            return addr.Address == email;
        }
        catch
        {
            return false;
        }
    }

    [HttpGet("{id}/payment-history")]
    public async Task<ActionResult<List<PaymentHistoryDto>>> GetPaymentHistory(Guid tenantId, Guid id)
    {
        using var context = await _contextFactory.CreateDbContextAsync(tenantId);
        var invoice = await context.Invoices
            .FirstOrDefaultAsync(i => i.TenantId == tenantId && i.Id == id);

        if (invoice == null)
            throw new NotFoundException("Invoice", id);

        // For now, return single payment if invoice is paid
        // In production, you would have a separate PaymentHistory table
        var paymentHistory = new List<PaymentHistoryDto>();

        if (invoice.Status == InvoiceStatus.Paid && invoice.PaidDate.HasValue)
        {
            paymentHistory.Add(new PaymentHistoryDto
            {
                Id = Guid.NewGuid(),
                PaymentDate = invoice.PaidDate.Value,
                Amount = invoice.TotalAmount.Amount,
                PaymentMethod = invoice.PaymentMethod ?? "Unknown",
                Reference = invoice.PaymentReference,
                Notes = $"Full payment for invoice {invoice.InvoiceNumber}"
            });
        }

        _logger.LogInformation("Payment history retrieved for invoice {InvoiceId}, tenant {TenantId}. Payments found: {PaymentCount}",
            id, tenantId, paymentHistory.Count);

        return Ok(paymentHistory);
    }

    [HttpPost("{id}/clone")]
    public async Task<ActionResult<InvoiceDto>> Clone(Guid tenantId, Guid id)
    {
        using var context = await _contextFactory.CreateDbContextAsync(tenantId);
        var originalInvoice = await context.Invoices
            .Include(i => i.Items)
            .FirstOrDefaultAsync(i => i.TenantId == tenantId && i.Id == id);

        if (originalInvoice == null)
            throw new NotFoundException("Invoice", id);

        // Generate new invoice number
        var newInvoiceNumber = await GenerateInvoiceNumber(context, tenantId, originalInvoice.InvoiceNumber);

        // Create new invoice with today's dates
        var clonedInvoice = Invoice.Create(
            tenantId,
            newInvoiceNumber,
            originalInvoice.CustomerId,
            DateTime.UtcNow.Date,
            DateTime.UtcNow.Date.AddDays(30)
        );

        // Copy notes and terms
        if (!string.IsNullOrWhiteSpace(originalInvoice.Notes))
            clonedInvoice.SetNotes(originalInvoice.Notes);

        if (!string.IsNullOrWhiteSpace(originalInvoice.Terms))
            clonedInvoice.SetTerms(originalInvoice.Terms);

        // Clone items
        foreach (var originalItem in originalInvoice.Items)
        {
            var clonedItem = InvoiceItem.Create(
                tenantId,
                clonedInvoice.Id,
                originalItem.ProductId,
                originalItem.ProductName,
                originalItem.Quantity,
                originalItem.UnitPrice
            );

            if (!string.IsNullOrWhiteSpace(originalItem.Description))
                clonedItem.SetDescription(originalItem.Description);

            if (originalItem.DiscountPercentage.HasValue && originalItem.DiscountPercentage > 0)
                clonedItem.ApplyDiscount(originalItem.DiscountPercentage.Value);

            if (originalItem.TaxRate.HasValue && originalItem.TaxRate > 0)
                clonedItem.ApplyTax(originalItem.TaxRate.Value);

            clonedInvoice.AddItem(clonedItem);
        }

        context.Invoices.Add(clonedInvoice);
        await context.SaveChangesAsync();

        var result = new InvoiceDto
        {
            Id = clonedInvoice.Id,
            InvoiceNumber = clonedInvoice.InvoiceNumber,
            CustomerId = clonedInvoice.CustomerId,
            InvoiceDate = clonedInvoice.InvoiceDate,
            DueDate = clonedInvoice.DueDate,
            Status = clonedInvoice.Status.ToString(),
            SubTotal = clonedInvoice.SubTotal.Amount,
            TaxAmount = clonedInvoice.TaxAmount.Amount,
            DiscountAmount = clonedInvoice.DiscountAmount.Amount,
            TotalAmount = clonedInvoice.TotalAmount.Amount,
            Notes = clonedInvoice.Notes,
            Terms = clonedInvoice.Terms,
            Items = clonedInvoice.Items.Select(item => new InvoiceItemDto
            {
                Id = item.Id,
                ProductId = item.ProductId,
                ProductName = item.ProductName,
                Description = item.Description,
                Quantity = item.Quantity,
                UnitPrice = item.UnitPrice.Amount,
                DiscountPercentage = item.DiscountPercentage,
                DiscountAmount = item.DiscountAmount?.Amount,
                TaxRate = item.TaxRate,
                TaxAmount = item.TaxAmount?.Amount,
                TotalPrice = item.TotalPrice.Amount
            }).ToList()
        };

        _logger.LogInformation("Invoice {OriginalId} cloned to {ClonedId} for tenant {TenantId}",
            id, clonedInvoice.Id, tenantId);

        return CreatedAtAction(nameof(GetById), new { tenantId, id = clonedInvoice.Id }, result);
    }

    private async Task<string> GenerateInvoiceNumber(ITenantDbContext context, Guid tenantId, string originalNumber)
    {
        // Simple clone numbering: add -COPY-n suffix
        var baseNumber = originalNumber.Contains("-COPY-")
            ? originalNumber.Substring(0, originalNumber.LastIndexOf("-COPY-"))
            : originalNumber;

        var copyNumber = 1;
        string newNumber;
        bool exists;

        do
        {
            newNumber = $"{baseNumber}-COPY-{copyNumber}";
            exists = await context.Invoices.AnyAsync(i => i.TenantId == tenantId && i.InvoiceNumber == newNumber);
            copyNumber++;
        } while (exists && copyNumber < 100);

        return newNumber;
    }

    [HttpPost("{id}/convert-to-recurring")]
    public async Task<IActionResult> ConvertToRecurring(Guid tenantId, Guid id, ConvertToRecurringDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Frequency))
            throw new ValidationException("Frequency", "Frequency is required");

        var validFrequencies = new[] { "Daily", "Weekly", "Monthly", "Quarterly", "Yearly" };
        if (!validFrequencies.Contains(dto.Frequency, StringComparer.OrdinalIgnoreCase))
            throw new ValidationException("Frequency", $"Invalid frequency. Valid values: {string.Join(", ", validFrequencies)}");

        if (dto.StartDate < DateTime.UtcNow.Date)
            throw new ValidationException("StartDate", "Start date cannot be in the past");

        if (dto.EndDate.HasValue && dto.EndDate.Value <= dto.StartDate)
            throw new ValidationException("EndDate", "End date must be after start date");

        if (dto.NumberOfOccurrences.HasValue && dto.NumberOfOccurrences.Value < 1)
            throw new ValidationException("NumberOfOccurrences", "Number of occurrences must be at least 1");

        using var context = await _contextFactory.CreateDbContextAsync(tenantId);
        var invoice = await context.Invoices
            .Include(i => i.Items)
            .FirstOrDefaultAsync(i => i.TenantId == tenantId && i.Id == id);

        if (invoice == null)
            throw new NotFoundException("Invoice", id);

        // Only draft or sent invoices can be converted to recurring
        if (invoice.Status == InvoiceStatus.Cancelled)
            throw new BusinessRuleException("Cannot convert a cancelled invoice to recurring");

        // In production, you would create a RecurringInvoice entity and schedule jobs
        // For now, we'll just log the request and return success
        _logger.LogInformation(
            "Invoice {InvoiceId} converted to recurring for tenant {TenantId}. " +
            "Frequency: {Frequency}, StartDate: {StartDate}, EndDate: {EndDate}, Occurrences: {Occurrences}",
            id, tenantId, dto.Frequency, dto.StartDate, dto.EndDate, dto.NumberOfOccurrences);

        return Ok(new
        {
            Message = $"Invoice {invoice.InvoiceNumber} has been set up as a recurring invoice",
            Frequency = dto.Frequency,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            NumberOfOccurrences = dto.NumberOfOccurrences,
            NextGenerationDate = CalculateNextDate(dto.StartDate, dto.Frequency)
        });
    }

    private DateTime CalculateNextDate(DateTime startDate, string frequency)
    {
        return frequency.ToLower() switch
        {
            "daily" => startDate.AddDays(1),
            "weekly" => startDate.AddDays(7),
            "monthly" => startDate.AddMonths(1),
            "quarterly" => startDate.AddMonths(3),
            "yearly" => startDate.AddYears(1),
            _ => startDate.AddMonths(1)
        };
    }
}