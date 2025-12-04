namespace Stocker.Modules.Inventory.Application.DTOs;

// =====================================
// INVENTORY COSTING METHODS DTOs
// (FIFO / LIFO / WAC)
// =====================================

/// <summary>
/// Costing method types
/// </summary>
public enum CostingMethod
{
    /// <summary>First In, First Out</summary>
    FIFO,
    /// <summary>Last In, First Out</summary>
    LIFO,
    /// <summary>Weighted Average Cost</summary>
    WeightedAverageCost,
    /// <summary>Specific Identification</summary>
    SpecificIdentification,
    /// <summary>Standard Cost</summary>
    StandardCost
}

/// <summary>
/// Cost layer for FIFO/LIFO tracking
/// </summary>
public class CostLayerDto
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string ProductCode { get; set; } = default!;
    public string ProductName { get; set; } = default!;
    public int? WarehouseId { get; set; }
    public string? WarehouseName { get; set; }

    /// <summary>
    /// Date when this cost layer was created (purchase/production date)
    /// </summary>
    public DateTime LayerDate { get; set; }

    /// <summary>
    /// Reference document (PO number, production order, etc.)
    /// </summary>
    public string? ReferenceNumber { get; set; }
    public string? ReferenceType { get; set; }

    /// <summary>
    /// Original quantity received
    /// </summary>
    public decimal OriginalQuantity { get; set; }

    /// <summary>
    /// Remaining quantity in this layer
    /// </summary>
    public decimal RemainingQuantity { get; set; }

    /// <summary>
    /// Unit cost for this layer
    /// </summary>
    public decimal UnitCost { get; set; }

    /// <summary>
    /// Total cost = RemainingQuantity * UnitCost
    /// </summary>
    public decimal TotalCost { get; set; }

    /// <summary>
    /// Currency
    /// </summary>
    public string Currency { get; set; } = "TRY";

    /// <summary>
    /// Layer is fully consumed
    /// </summary>
    public bool IsFullyConsumed { get; set; }

    /// <summary>
    /// Order in the stack (for FIFO/LIFO)
    /// </summary>
    public int LayerOrder { get; set; }

    /// <summary>
    /// Creation timestamp
    /// </summary>
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// Filter for cost layers
/// </summary>
public class CostLayerFilterDto
{
    public int? ProductId { get; set; }
    public int? WarehouseId { get; set; }
    public bool? IncludeFullyConsumed { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 50;
}

/// <summary>
/// Paginated cost layers response
/// </summary>
public class PaginatedCostLayersDto
{
    public List<CostLayerDto> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
    public bool HasNextPage { get; set; }
    public bool HasPreviousPage { get; set; }

    // Summary
    public decimal TotalQuantity { get; set; }
    public decimal TotalValue { get; set; }
    public decimal WeightedAverageCost { get; set; }
}

/// <summary>
/// Product costing summary
/// </summary>
public class ProductCostingSummaryDto
{
    public int ProductId { get; set; }
    public string ProductCode { get; set; } = default!;
    public string ProductName { get; set; } = default!;
    public string? CategoryName { get; set; }

    /// <summary>
    /// Current costing method for this product
    /// </summary>
    public CostingMethod CostingMethod { get; set; }

    /// <summary>
    /// Total quantity on hand
    /// </summary>
    public decimal TotalQuantity { get; set; }

    /// <summary>
    /// Total inventory value
    /// </summary>
    public decimal TotalValue { get; set; }

    /// <summary>
    /// Weighted average cost per unit
    /// </summary>
    public decimal WeightedAverageCost { get; set; }

    /// <summary>
    /// FIFO unit cost (oldest layer)
    /// </summary>
    public decimal? FIFOUnitCost { get; set; }

    /// <summary>
    /// LIFO unit cost (newest layer)
    /// </summary>
    public decimal? LIFOUnitCost { get; set; }

    /// <summary>
    /// Standard cost (if set)
    /// </summary>
    public decimal? StandardCost { get; set; }

    /// <summary>
    /// Number of active cost layers
    /// </summary>
    public int ActiveLayerCount { get; set; }

    /// <summary>
    /// Oldest layer date
    /// </summary>
    public DateTime? OldestLayerDate { get; set; }

    /// <summary>
    /// Newest layer date
    /// </summary>
    public DateTime? NewestLayerDate { get; set; }

    /// <summary>
    /// Currency
    /// </summary>
    public string Currency { get; set; } = "TRY";

    /// <summary>
    /// Last cost calculation date
    /// </summary>
    public DateTime? LastCalculatedAt { get; set; }
}

/// <summary>
/// Cost calculation request for stock out
/// </summary>
public class CostCalculationRequestDto
{
    public int ProductId { get; set; }
    public int? WarehouseId { get; set; }
    public decimal Quantity { get; set; }
    public CostingMethod Method { get; set; }
}

/// <summary>
/// Cost calculation result
/// </summary>
public class CostCalculationResultDto
{
    public int ProductId { get; set; }
    public string ProductCode { get; set; } = default!;
    public string ProductName { get; set; } = default!;
    public decimal RequestedQuantity { get; set; }
    public CostingMethod MethodUsed { get; set; }

    /// <summary>
    /// Total cost of goods sold
    /// </summary>
    public decimal TotalCOGS { get; set; }

    /// <summary>
    /// Average unit cost for this transaction
    /// </summary>
    public decimal AverageUnitCost { get; set; }

    /// <summary>
    /// Cost layers consumed
    /// </summary>
    public List<CostLayerConsumptionDto> LayersConsumed { get; set; } = new();

    /// <summary>
    /// Remaining quantity in inventory after this transaction
    /// </summary>
    public decimal RemainingInventoryQuantity { get; set; }

    /// <summary>
    /// Remaining inventory value after this transaction
    /// </summary>
    public decimal RemainingInventoryValue { get; set; }

    /// <summary>
    /// Currency
    /// </summary>
    public string Currency { get; set; } = "TRY";

    /// <summary>
    /// Calculation notes or warnings
    /// </summary>
    public List<string> Notes { get; set; } = new();
}

/// <summary>
/// Cost layer consumption detail
/// </summary>
public class CostLayerConsumptionDto
{
    public int LayerId { get; set; }
    public DateTime LayerDate { get; set; }
    public string? ReferenceNumber { get; set; }
    public decimal UnitCost { get; set; }
    public decimal QuantityConsumed { get; set; }
    public decimal TotalCost { get; set; }
    public decimal RemainingAfterConsumption { get; set; }
}

/// <summary>
/// Create cost layer request (for receiving inventory)
/// </summary>
public class CreateCostLayerDto
{
    public int ProductId { get; set; }
    public int? WarehouseId { get; set; }
    public decimal Quantity { get; set; }
    public decimal UnitCost { get; set; }
    public string? ReferenceNumber { get; set; }
    public string? ReferenceType { get; set; }
    public DateTime? LayerDate { get; set; }
}

/// <summary>
/// Cost comparison across methods
/// </summary>
public class CostMethodComparisonDto
{
    public int ProductId { get; set; }
    public string ProductCode { get; set; } = default!;
    public string ProductName { get; set; } = default!;

    /// <summary>
    /// Quantity for comparison
    /// </summary>
    public decimal Quantity { get; set; }

    /// <summary>
    /// FIFO calculation
    /// </summary>
    public CostMethodResultDto FIFO { get; set; } = default!;

    /// <summary>
    /// LIFO calculation
    /// </summary>
    public CostMethodResultDto LIFO { get; set; } = default!;

    /// <summary>
    /// Weighted Average Cost calculation
    /// </summary>
    public CostMethodResultDto WeightedAverage { get; set; } = default!;

    /// <summary>
    /// Standard Cost calculation (if available)
    /// </summary>
    public CostMethodResultDto? StandardCost { get; set; }

    /// <summary>
    /// Difference between highest and lowest COGS
    /// </summary>
    public decimal COGSVariance { get; set; }

    /// <summary>
    /// Currency
    /// </summary>
    public string Currency { get; set; } = "TRY";
}

/// <summary>
/// Individual cost method result
/// </summary>
public class CostMethodResultDto
{
    public CostingMethod Method { get; set; }
    public decimal TotalCOGS { get; set; }
    public decimal AverageUnitCost { get; set; }
    public decimal RemainingInventoryValue { get; set; }
    public string? Notes { get; set; }
}

/// <summary>
/// Inventory valuation report
/// </summary>
public class InventoryValuationReportDto
{
    public DateTime ReportDate { get; set; }
    public CostingMethod Method { get; set; }
    public string Currency { get; set; } = "TRY";

    /// <summary>
    /// Total inventory value
    /// </summary>
    public decimal TotalInventoryValue { get; set; }

    /// <summary>
    /// Total quantity
    /// </summary>
    public decimal TotalQuantity { get; set; }

    /// <summary>
    /// Number of products
    /// </summary>
    public int ProductCount { get; set; }

    /// <summary>
    /// By category breakdown
    /// </summary>
    public List<CategoryValuationDto> ByCategory { get; set; } = new();

    /// <summary>
    /// By warehouse breakdown
    /// </summary>
    public List<WarehouseValuationDto> ByWarehouse { get; set; } = new();

    /// <summary>
    /// Product details
    /// </summary>
    public List<ProductValuationDto> Products { get; set; } = new();
}

/// <summary>
/// Category valuation summary
/// </summary>
public class CategoryValuationDto
{
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = default!;
    public int ProductCount { get; set; }
    public decimal TotalQuantity { get; set; }
    public decimal TotalValue { get; set; }
    public decimal PercentageOfTotal { get; set; }
}

/// <summary>
/// Warehouse valuation summary
/// </summary>
public class WarehouseValuationDto
{
    public int WarehouseId { get; set; }
    public string WarehouseName { get; set; } = default!;
    public int ProductCount { get; set; }
    public decimal TotalQuantity { get; set; }
    public decimal TotalValue { get; set; }
    public decimal PercentageOfTotal { get; set; }
}

/// <summary>
/// Product valuation detail
/// </summary>
public class ProductValuationDto
{
    public int ProductId { get; set; }
    public string ProductCode { get; set; } = default!;
    public string ProductName { get; set; } = default!;
    public string? CategoryName { get; set; }
    public decimal Quantity { get; set; }
    public decimal UnitCost { get; set; }
    public decimal TotalValue { get; set; }
    public int LayerCount { get; set; }
}

/// <summary>
/// Cost adjustment request
/// </summary>
public class CostAdjustmentDto
{
    public int ProductId { get; set; }
    public int? WarehouseId { get; set; }
    public decimal NewUnitCost { get; set; }
    public string Reason { get; set; } = default!;
    public bool ApplyToAllLayers { get; set; }
    public int? SpecificLayerId { get; set; }
}

/// <summary>
/// Standard cost setting
/// </summary>
public class SetStandardCostDto
{
    public int ProductId { get; set; }
    public decimal StandardCost { get; set; }
    public DateTime? EffectiveFrom { get; set; }
    public string? Reason { get; set; }
}

/// <summary>
/// Cost variance analysis
/// </summary>
public class CostVarianceAnalysisDto
{
    public int ProductId { get; set; }
    public string ProductCode { get; set; } = default!;
    public string ProductName { get; set; } = default!;

    /// <summary>
    /// Standard cost
    /// </summary>
    public decimal StandardCost { get; set; }

    /// <summary>
    /// Actual cost (weighted average)
    /// </summary>
    public decimal ActualCost { get; set; }

    /// <summary>
    /// Variance amount
    /// </summary>
    public decimal VarianceAmount { get; set; }

    /// <summary>
    /// Variance percentage
    /// </summary>
    public decimal VariancePercentage { get; set; }

    /// <summary>
    /// Variance type
    /// </summary>
    public string VarianceType { get; set; } = default!; // "Favorable", "Unfavorable"

    /// <summary>
    /// Total quantity
    /// </summary>
    public decimal TotalQuantity { get; set; }

    /// <summary>
    /// Total variance impact
    /// </summary>
    public decimal TotalVarianceImpact { get; set; }

    /// <summary>
    /// Currency
    /// </summary>
    public string Currency { get; set; } = "TRY";
}

/// <summary>
/// COGS report for a period
/// </summary>
public class COGSReportDto
{
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public CostingMethod Method { get; set; }
    public string Currency { get; set; } = "TRY";

    /// <summary>
    /// Total COGS for the period
    /// </summary>
    public decimal TotalCOGS { get; set; }

    /// <summary>
    /// Total quantity sold
    /// </summary>
    public decimal TotalQuantitySold { get; set; }

    /// <summary>
    /// Beginning inventory value
    /// </summary>
    public decimal BeginningInventoryValue { get; set; }

    /// <summary>
    /// Purchases during period
    /// </summary>
    public decimal PurchasesDuringPeriod { get; set; }

    /// <summary>
    /// Ending inventory value
    /// </summary>
    public decimal EndingInventoryValue { get; set; }

    /// <summary>
    /// COGS verification: Beginning + Purchases - Ending = COGS
    /// </summary>
    public decimal CalculatedCOGS { get; set; }

    /// <summary>
    /// Variance between actual and calculated COGS
    /// </summary>
    public decimal COGSVariance { get; set; }

    /// <summary>
    /// By category breakdown
    /// </summary>
    public List<CategoryCOGSDto> ByCategory { get; set; } = new();

    /// <summary>
    /// Monthly breakdown
    /// </summary>
    public List<MonthlyCOGSDto> MonthlyBreakdown { get; set; } = new();
}

/// <summary>
/// Category COGS
/// </summary>
public class CategoryCOGSDto
{
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = default!;
    public decimal COGS { get; set; }
    public decimal QuantitySold { get; set; }
    public decimal PercentageOfTotal { get; set; }
}

/// <summary>
/// Monthly COGS breakdown
/// </summary>
public class MonthlyCOGSDto
{
    public int Year { get; set; }
    public int Month { get; set; }
    public string MonthName { get; set; } = default!;
    public decimal COGS { get; set; }
    public decimal QuantitySold { get; set; }
    public decimal AverageUnitCost { get; set; }
}

/// <summary>
/// Filter for inventory valuation
/// </summary>
public class InventoryValuationFilterDto
{
    public int? CategoryId { get; set; }
    public int? WarehouseId { get; set; }
    public CostingMethod Method { get; set; } = CostingMethod.WeightedAverageCost;
    public DateTime? AsOfDate { get; set; }
    public bool IncludeZeroQuantity { get; set; }
}

/// <summary>
/// Filter for COGS report
/// </summary>
public class COGSReportFilterDto
{
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public int? CategoryId { get; set; }
    public int? WarehouseId { get; set; }
    public CostingMethod Method { get; set; } = CostingMethod.WeightedAverageCost;
}
