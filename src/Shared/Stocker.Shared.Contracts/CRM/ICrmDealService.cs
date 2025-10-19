namespace Stocker.Shared.Contracts.CRM;

/// <summary>
/// Cross-module contract for CRM deal operations
/// Used by Sales, Finance, and Inventory modules to interact with CRM deals
/// </summary>
public interface ICrmDealService
{
    /// <summary>
    /// Get deal by ID
    /// </summary>
    Task<DealDto?> GetDealByIdAsync(Guid dealId, Guid tenantId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get all won deals for a customer
    /// </summary>
    Task<IEnumerable<DealDto>> GetWonDealsByCustomerAsync(Guid customerId, Guid tenantId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get deal total value
    /// </summary>
    Task<decimal> GetDealTotalValueAsync(Guid dealId, Guid tenantId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Create invoice from deal (called by Finance module)
    /// </summary>
    Task<bool> MarkDealAsInvoicedAsync(Guid dealId, Guid tenantId, Guid invoiceId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get deal products for inventory reservation (called by Inventory module)
    /// </summary>
    Task<IEnumerable<DealProductDto>> GetDealProductsAsync(Guid dealId, Guid tenantId, CancellationToken cancellationToken = default);
}

/// <summary>
/// DTO for cross-module deal data transfer
/// </summary>
public record DealDto
{
    public Guid Id { get; init; }
    public Guid TenantId { get; init; }
    public Guid CustomerId { get; init; }
    public string Title { get; init; } = string.Empty;
    public string? Description { get; init; }
    public decimal Amount { get; init; }
    public string Currency { get; init; } = "USD";
    public string Stage { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public DateTime? ExpectedCloseDate { get; init; }
    public DateTime? ActualCloseDate { get; init; }
    public bool IsWon { get; init; }
    public DateTime CreatedAt { get; init; }
}

/// <summary>
/// DTO for deal product information
/// </summary>
public record DealProductDto
{
    public Guid ProductId { get; init; }
    public string ProductName { get; init; } = string.Empty;
    public decimal Quantity { get; init; }
    public decimal UnitPrice { get; init; }
    public decimal DiscountAmount { get; init; }
    public decimal TotalPrice { get; init; }
}
