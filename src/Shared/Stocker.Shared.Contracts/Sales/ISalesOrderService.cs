namespace Stocker.Shared.Contracts.Sales;

/// <summary>
/// Cross-module contract for Sales order operations
/// Used by CRM, Finance, and Inventory modules to interact with sales orders
/// </summary>
public interface ISalesOrderService
{
    /// <summary>
    /// Get sales order by ID
    /// </summary>
    Task<SalesOrderDto?> GetOrderByIdAsync(Guid orderId, Guid tenantId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get all orders for a customer
    /// </summary>
    Task<IEnumerable<SalesOrderDto>> GetOrdersByCustomerAsync(Guid customerId, Guid tenantId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Create sales order from CRM deal
    /// </summary>
    Task<Guid> CreateOrderFromDealAsync(Guid dealId, Guid tenantId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Update order status (called by Inventory or Finance modules)
    /// </summary>
    Task<bool> UpdateOrderStatusAsync(Guid orderId, Guid tenantId, string newStatus, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get pending orders for inventory fulfillment
    /// </summary>
    Task<IEnumerable<SalesOrderDto>> GetPendingOrdersAsync(Guid tenantId, CancellationToken cancellationToken = default);
}

/// <summary>
/// DTO for cross-module sales order data transfer
/// </summary>
public record SalesOrderDto
{
    public Guid Id { get; init; }
    public Guid TenantId { get; init; }
    public Guid CustomerId { get; init; }
    public string OrderNumber { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public decimal TotalAmount { get; init; }
    public string Currency { get; init; } = "USD";
    public DateTime OrderDate { get; init; }
    public DateTime? ShipDate { get; init; }
    public DateTime CreatedAt { get; init; }
}
