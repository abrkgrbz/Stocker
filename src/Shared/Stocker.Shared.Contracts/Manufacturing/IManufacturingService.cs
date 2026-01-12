namespace Stocker.Shared.Contracts.Manufacturing;

/// <summary>
/// Cross-module manufacturing service interface
/// Provides manufacturing capabilities for other modules (Sales, Inventory, etc.)
/// </summary>
public interface IManufacturingService
{
    /// <summary>
    /// Gets the Bill of Material for a product
    /// </summary>
    Task<BomDto?> GetBomByProductIdAsync(int productId, Guid tenantId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Calculates material requirements for producing a product
    /// </summary>
    Task<MaterialRequirementDto> CalculateMaterialRequirementsAsync(int productId, decimal quantity, Guid tenantId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if production capacity is available for a given product and quantity
    /// </summary>
    Task<bool> HasAvailableCapacityAsync(int productId, decimal quantity, DateTime requiredDate, Guid tenantId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets estimated production cost for a product
    /// </summary>
    Task<ProductionCostDto> GetEstimatedProductionCostAsync(int productId, decimal quantity, Guid tenantId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Creates a production order from a sales order
    /// </summary>
    Task<int?> CreateProductionOrderFromSalesOrderAsync(CreateProductionOrderFromSalesDto request, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets active production orders for a product
    /// </summary>
    Task<IEnumerable<ProductionOrderSummaryDto>> GetActiveProductionOrdersAsync(int productId, Guid tenantId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets production order status
    /// </summary>
    Task<ProductionOrderStatusDto?> GetProductionOrderStatusAsync(int productionOrderId, Guid tenantId, CancellationToken cancellationToken = default);
}

/// <summary>
/// Bill of Material summary DTO
/// </summary>
public class BomDto
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public decimal BaseQuantity { get; set; }
    public string BaseUnit { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public decimal TotalEstimatedCost { get; set; }
    public List<BomLineDto> Lines { get; set; } = new();
}

/// <summary>
/// BOM line item DTO
/// </summary>
public class BomLineDto
{
    public int ComponentProductId { get; set; }
    public string ComponentCode { get; set; } = string.Empty;
    public string ComponentName { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public string Unit { get; set; } = string.Empty;
    public decimal ScrapRate { get; set; }
    public decimal? UnitCost { get; set; }
}

/// <summary>
/// Material requirement calculation result
/// </summary>
public class MaterialRequirementDto
{
    public int ProductId { get; set; }
    public decimal ProductionQuantity { get; set; }
    public List<MaterialRequirementLineDto> Requirements { get; set; } = new();
    public decimal TotalEstimatedCost { get; set; }
    public List<string> Shortages { get; set; } = new();
}

/// <summary>
/// Individual material requirement line
/// </summary>
public class MaterialRequirementLineDto
{
    public int ComponentProductId { get; set; }
    public string ComponentCode { get; set; } = string.Empty;
    public string ComponentName { get; set; } = string.Empty;
    public decimal RequiredQuantity { get; set; }
    public string Unit { get; set; } = string.Empty;
    public decimal AvailableStock { get; set; }
    public decimal ShortageQuantity { get; set; }
    public decimal EstimatedCost { get; set; }
}

/// <summary>
/// Production cost estimate
/// </summary>
public class ProductionCostDto
{
    public int ProductId { get; set; }
    public decimal Quantity { get; set; }
    public decimal MaterialCost { get; set; }
    public decimal LaborCost { get; set; }
    public decimal MachineCost { get; set; }
    public decimal OverheadCost { get; set; }
    public decimal TotalCost { get; set; }
    public decimal UnitCost { get; set; }
}

/// <summary>
/// Request to create production order from sales order
/// </summary>
public class CreateProductionOrderFromSalesDto
{
    public Guid TenantId { get; set; }
    public int ProductId { get; set; }
    public decimal Quantity { get; set; }
    public string Unit { get; set; } = string.Empty;
    public DateTime RequiredDate { get; set; }
    public int? SalesOrderId { get; set; }
    public int? SalesOrderLineId { get; set; }
    public string? Notes { get; set; }
}

/// <summary>
/// Production order summary for cross-module queries
/// </summary>
public class ProductionOrderSummaryDto
{
    public int Id { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public int ProductId { get; set; }
    public decimal PlannedQuantity { get; set; }
    public decimal CompletedQuantity { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime PlannedStartDate { get; set; }
    public DateTime PlannedEndDate { get; set; }
    public decimal CompletionPercent { get; set; }
}

/// <summary>
/// Production order status details
/// </summary>
public class ProductionOrderStatusDto
{
    public int Id { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public decimal PlannedQuantity { get; set; }
    public decimal CompletedQuantity { get; set; }
    public decimal ScrapQuantity { get; set; }
    public decimal CompletionPercent { get; set; }
    public DateTime PlannedStartDate { get; set; }
    public DateTime PlannedEndDate { get; set; }
    public DateTime? ActualStartDate { get; set; }
    public DateTime? ActualEndDate { get; set; }
    public int CurrentOperationSequence { get; set; }
    public string? CurrentOperationName { get; set; }
}
