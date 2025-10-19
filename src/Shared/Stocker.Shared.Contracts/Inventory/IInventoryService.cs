namespace Stocker.Shared.Contracts.Inventory;

/// <summary>
/// Cross-module contract for Inventory operations
/// Used by Sales and CRM modules to check product availability
/// </summary>
public interface IInventoryService
{
    /// <summary>
    /// Check if product has sufficient stock
    /// </summary>
    Task<bool> HasSufficientStockAsync(Guid productId, Guid tenantId, decimal quantity, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get available stock quantity for a product
    /// </summary>
    Task<decimal> GetAvailableStockAsync(Guid productId, Guid tenantId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Reserve stock for sales order (called by Sales module)
    /// </summary>
    Task<bool> ReserveStockAsync(Guid orderId, Guid tenantId, IEnumerable<StockReservationDto> reservations, CancellationToken cancellationToken = default);

    /// <summary>
    /// Release reserved stock (called when order is cancelled)
    /// </summary>
    Task<bool> ReleaseReservedStockAsync(Guid orderId, Guid tenantId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get product details for CRM/Sales modules
    /// </summary>
    Task<ProductDto?> GetProductByIdAsync(Guid productId, Guid tenantId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get all active products
    /// </summary>
    Task<IEnumerable<ProductDto>> GetActiveProductsAsync(Guid tenantId, CancellationToken cancellationToken = default);
}

/// <summary>
/// DTO for stock reservation requests
/// </summary>
public record StockReservationDto
{
    public Guid ProductId { get; init; }
    public decimal Quantity { get; init; }
    public string Unit { get; init; } = string.Empty;
}

/// <summary>
/// DTO for product information
/// </summary>
public record ProductDto
{
    public Guid Id { get; init; }
    public Guid TenantId { get; init; }
    public string ProductCode { get; init; } = string.Empty;
    public string ProductName { get; init; } = string.Empty;
    public string? Description { get; init; }
    public decimal UnitPrice { get; init; }
    public string Currency { get; init; } = "USD";
    public decimal AvailableStock { get; init; }
    public string Unit { get; init; } = string.Empty;
    public bool IsActive { get; init; }
}
