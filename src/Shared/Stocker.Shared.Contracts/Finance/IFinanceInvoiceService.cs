namespace Stocker.Shared.Contracts.Finance;

/// <summary>
/// Cross-module contract for Finance invoice operations
/// Used by CRM and Sales modules to interact with invoices
/// </summary>
public interface IFinanceInvoiceService
{
    /// <summary>
    /// Get invoice by ID
    /// </summary>
    Task<InvoiceDto?> GetInvoiceByIdAsync(Guid invoiceId, Guid tenantId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get all invoices for a customer
    /// </summary>
    Task<IEnumerable<InvoiceDto>> GetInvoicesByCustomerAsync(Guid customerId, Guid tenantId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Create invoice from sales order
    /// </summary>
    Task<Guid> CreateInvoiceFromOrderAsync(Guid orderId, Guid tenantId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Create invoice from CRM deal
    /// </summary>
    Task<Guid> CreateInvoiceFromDealAsync(Guid dealId, Guid tenantId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get customer outstanding balance
    /// </summary>
    Task<decimal> GetCustomerBalanceAsync(Guid customerId, Guid tenantId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Record payment (called by CRM or Sales modules)
    /// </summary>
    Task<bool> RecordPaymentAsync(Guid invoiceId, Guid tenantId, decimal amount, DateTime paymentDate, CancellationToken cancellationToken = default);
}

/// <summary>
/// DTO for cross-module invoice data transfer
/// </summary>
public record InvoiceDto
{
    public Guid Id { get; init; }
    public Guid TenantId { get; init; }
    public Guid CustomerId { get; init; }
    public string InvoiceNumber { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public decimal TotalAmount { get; init; }
    public decimal PaidAmount { get; init; }
    public decimal Balance { get; init; }
    public string Currency { get; init; } = "USD";
    public DateTime InvoiceDate { get; init; }
    public DateTime? DueDate { get; init; }
    public DateTime CreatedAt { get; init; }
}
