using MediatR;
using Stocker.Modules.Inventory.Domain.Enums;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.Analytics.Queries;

/// <summary>
/// Query to get comprehensive inventory dashboard data
/// </summary>
public class GetInventoryDashboardQuery : IRequest<Result<InventoryDashboardDto>>
{
    public Guid TenantId { get; set; }
}

/// <summary>
/// Comprehensive inventory dashboard DTO
/// </summary>
public class InventoryDashboardDto
{
    // Overview KPIs
    public int TotalProducts { get; set; }
    public int ActiveProducts { get; set; }
    public int TotalCategories { get; set; }
    public int TotalBrands { get; set; }
    public int TotalWarehouses { get; set; }
    public int TotalSuppliers { get; set; }

    // Stock KPIs
    public decimal TotalStockValue { get; set; }
    public decimal TotalStockQuantity { get; set; }
    public int LowStockProductsCount { get; set; }
    public int OutOfStockProductsCount { get; set; }
    public int OverstockedProductsCount { get; set; }

    // Movement KPIs
    public int TodayMovementsCount { get; set; }
    public int WeekMovementsCount { get; set; }
    public int MonthMovementsCount { get; set; }
    public int PendingTransfersCount { get; set; }
    public int PendingStockCountsCount { get; set; }

    // Expiry & Alerts
    public int ExpiringIn30DaysCount { get; set; }
    public int ExpiredStockCount { get; set; }
    public int ReservationsCount { get; set; }

    // Breakdowns
    public List<CategoryStockBreakdownDto> StockByCategory { get; set; } = new();
    public List<WarehouseStockBreakdownDto> StockByWarehouse { get; set; } = new();
    public List<StockMovementTrendDto> MovementTrend { get; set; } = new();
    public List<TopProductDto> TopProductsByValue { get; set; } = new();
    public List<TopProductDto> TopProductsByMovement { get; set; } = new();
    public List<LowStockAlertDto> LowStockAlerts { get; set; } = new();
    public List<ExpiryAlertDto> ExpiryAlerts { get; set; } = new();
}

public class CategoryStockBreakdownDto
{
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = null!;
    public int ProductCount { get; set; }
    public decimal TotalQuantity { get; set; }
    public decimal TotalValue { get; set; }
    public decimal Percentage { get; set; }
}

public class WarehouseStockBreakdownDto
{
    public int WarehouseId { get; set; }
    public string WarehouseName { get; set; } = null!;
    public int ProductCount { get; set; }
    public decimal TotalQuantity { get; set; }
    public decimal TotalValue { get; set; }
    public decimal Percentage { get; set; }
    public decimal UtilizationPercentage { get; set; }
}

public class StockMovementTrendDto
{
    public DateTime Date { get; set; }
    public decimal InboundQuantity { get; set; }
    public decimal OutboundQuantity { get; set; }
    public int InboundCount { get; set; }
    public int OutboundCount { get; set; }
}

public class TopProductDto
{
    public int ProductId { get; set; }
    public string ProductCode { get; set; } = null!;
    public string ProductName { get; set; } = null!;
    public string? CategoryName { get; set; }
    public decimal Quantity { get; set; }
    public decimal Value { get; set; }
    public int MovementCount { get; set; }
}

public class LowStockAlertDto
{
    public int ProductId { get; set; }
    public string ProductCode { get; set; } = null!;
    public string ProductName { get; set; } = null!;
    public decimal CurrentStock { get; set; }
    public decimal MinimumStock { get; set; }
    public decimal ReorderPoint { get; set; }
    public string Severity { get; set; } = null!; // Critical, Warning, Info
}

public class ExpiryAlertDto
{
    public int LotBatchId { get; set; }
    public string LotNumber { get; set; } = null!;
    public int ProductId { get; set; }
    public string ProductName { get; set; } = null!;
    public DateTime ExpiryDate { get; set; }
    public decimal Quantity { get; set; }
    public int DaysUntilExpiry { get; set; }
    public string Severity { get; set; } = null!; // Expired, Critical, Warning
}

/// <summary>
/// Handler for GetInventoryDashboardQuery
/// </summary>
public class GetInventoryDashboardQueryHandler : IRequestHandler<GetInventoryDashboardQuery, Result<InventoryDashboardDto>>
{
    private readonly IProductRepository _productRepository;
    private readonly ICategoryRepository _categoryRepository;
    private readonly IBrandRepository _brandRepository;
    private readonly IWarehouseRepository _warehouseRepository;
    private readonly ISupplierRepository _supplierRepository;
    private readonly IStockRepository _stockRepository;
    private readonly IStockMovementRepository _stockMovementRepository;
    private readonly IStockTransferRepository _stockTransferRepository;
    private readonly IStockCountRepository _stockCountRepository;
    private readonly ILotBatchRepository _lotBatchRepository;
    private readonly IStockReservationRepository _stockReservationRepository;

    public GetInventoryDashboardQueryHandler(
        IProductRepository productRepository,
        ICategoryRepository categoryRepository,
        IBrandRepository brandRepository,
        IWarehouseRepository warehouseRepository,
        ISupplierRepository supplierRepository,
        IStockRepository stockRepository,
        IStockMovementRepository stockMovementRepository,
        IStockTransferRepository stockTransferRepository,
        IStockCountRepository stockCountRepository,
        ILotBatchRepository lotBatchRepository,
        IStockReservationRepository stockReservationRepository)
    {
        _productRepository = productRepository;
        _categoryRepository = categoryRepository;
        _brandRepository = brandRepository;
        _warehouseRepository = warehouseRepository;
        _supplierRepository = supplierRepository;
        _stockRepository = stockRepository;
        _stockMovementRepository = stockMovementRepository;
        _stockTransferRepository = stockTransferRepository;
        _stockCountRepository = stockCountRepository;
        _lotBatchRepository = lotBatchRepository;
        _stockReservationRepository = stockReservationRepository;
    }

    // Define inbound and outbound movement types based on actual enum
    private static readonly StockMovementType[] InboundTypes =
    {
        StockMovementType.Purchase,
        StockMovementType.SalesReturn,
        StockMovementType.Production,
        StockMovementType.AdjustmentIncrease,
        StockMovementType.Opening,
        StockMovementType.Found
    };

    private static readonly StockMovementType[] OutboundTypes =
    {
        StockMovementType.Sales,
        StockMovementType.PurchaseReturn,
        StockMovementType.Consumption,
        StockMovementType.AdjustmentDecrease,
        StockMovementType.Damage,
        StockMovementType.Loss
    };

    public async Task<Result<InventoryDashboardDto>> Handle(GetInventoryDashboardQuery request, CancellationToken cancellationToken)
    {
        var dashboard = new InventoryDashboardDto();
        var today = DateTime.UtcNow.Date;
        var weekAgo = today.AddDays(-7);
        var monthAgo = today.AddDays(-30);

        // Get all data sequentially to avoid DbContext threading issues
        // DbContext is not thread-safe and cannot handle concurrent operations
        var products = await _productRepository.GetAllAsync(cancellationToken);
        var categories = await _categoryRepository.GetAllAsync(cancellationToken);
        var brands = await _brandRepository.GetAllAsync(cancellationToken);
        var warehouses = await _warehouseRepository.GetAllAsync(cancellationToken);
        var suppliers = await _supplierRepository.GetAllAsync(cancellationToken);
        var stocks = await _stockRepository.GetAllAsync(cancellationToken);
        var lotBatches = await _lotBatchRepository.GetAllAsync(cancellationToken);

        // Overview KPIs
        dashboard.TotalProducts = products.Count;
        dashboard.ActiveProducts = products.Count(p => p.IsActive);
        dashboard.TotalCategories = categories.Count;
        dashboard.TotalBrands = brands.Count;
        dashboard.TotalWarehouses = warehouses.Count;
        dashboard.TotalSuppliers = suppliers.Count;

        // Stock KPIs
        dashboard.TotalStockQuantity = stocks.Sum(s => s.Quantity);
        dashboard.TotalStockValue = stocks.Sum(s =>
        {
            var product = products.FirstOrDefault(p => p.Id == s.ProductId);
            return s.Quantity * (product?.UnitPrice?.Amount ?? 0);
        });

        // Low stock analysis
        var stockByProduct = stocks.GroupBy(s => s.ProductId)
            .Select(g => new { ProductId = g.Key, TotalQuantity = g.Sum(s => s.Quantity) })
            .ToDictionary(x => x.ProductId, x => x.TotalQuantity);

        foreach (var product in products.Where(p => p.IsActive))
        {
            var currentStock = stockByProduct.GetValueOrDefault(product.Id, 0);

            if (currentStock <= 0)
                dashboard.OutOfStockProductsCount++;
            else if (currentStock <= product.MinimumStock)
                dashboard.LowStockProductsCount++;
            else if (product.MaximumStock > 0 && currentStock > product.MaximumStock)
                dashboard.OverstockedProductsCount++;
        }

        // Movement KPIs
        var movements = await _stockMovementRepository.GetByDateRangeAsync(monthAgo, today.AddDays(1), cancellationToken);
        dashboard.MonthMovementsCount = movements.Count;
        dashboard.WeekMovementsCount = movements.Count(m => m.CreatedDate >= weekAgo);
        dashboard.TodayMovementsCount = movements.Count(m => m.CreatedDate >= today);

        // Pending operations
        var transfers = await _stockTransferRepository.GetAllAsync(cancellationToken);
        dashboard.PendingTransfersCount = transfers.Count(t =>
            t.Status == TransferStatus.Draft ||
            t.Status == TransferStatus.Pending ||
            t.Status == TransferStatus.Approved ||
            t.Status == TransferStatus.InTransit);

        var stockCounts = await _stockCountRepository.GetAllAsync(cancellationToken);
        dashboard.PendingStockCountsCount = stockCounts.Count(sc =>
            sc.Status == StockCountStatus.Draft ||
            sc.Status == StockCountStatus.InProgress);

        // Reservations - check by status
        var reservations = await _stockReservationRepository.GetAllAsync(cancellationToken);
        dashboard.ReservationsCount = reservations.Count(r => r.Status == ReservationStatus.Active);

        // Expiry analysis - LotBatch uses Status enum, not IsActive
        var activeLots = lotBatches.Where(l => l.Status == LotBatchStatus.Received || l.Status == LotBatchStatus.Approved).ToList();
        var expiringLots = activeLots.Where(l => l.ExpiryDate.HasValue).ToList();
        dashboard.ExpiredStockCount = expiringLots.Count(l => l.ExpiryDate!.Value.Date < today);
        dashboard.ExpiringIn30DaysCount = expiringLots.Count(l =>
            l.ExpiryDate!.Value.Date >= today && l.ExpiryDate.Value.Date <= today.AddDays(30));

        // Stock by Category - CategoryId is int, not nullable
        var categoryBreakdown = products
            .GroupBy(p => p.CategoryId)
            .Select(g =>
            {
                var category = categories.FirstOrDefault(c => c.Id == g.Key);
                var categoryStocks = stocks.Where(s => g.Any(p => p.Id == s.ProductId));
                var totalValue = categoryStocks.Sum(s =>
                {
                    var product = g.FirstOrDefault(p => p.Id == s.ProductId);
                    return s.Quantity * (product?.UnitPrice?.Amount ?? 0);
                });

                return new CategoryStockBreakdownDto
                {
                    CategoryId = g.Key,
                    CategoryName = category?.Name ?? "Unknown",
                    ProductCount = g.Count(),
                    TotalQuantity = categoryStocks.Sum(s => s.Quantity),
                    TotalValue = totalValue
                };
            })
            .OrderByDescending(c => c.TotalValue)
            .Take(10)
            .ToList();

        // Calculate percentages
        var totalCategoryValue = categoryBreakdown.Sum(c => c.TotalValue);
        foreach (var cat in categoryBreakdown)
        {
            cat.Percentage = totalCategoryValue > 0 ? (cat.TotalValue / totalCategoryValue) * 100 : 0;
        }
        dashboard.StockByCategory = categoryBreakdown;

        // Stock by Warehouse - Warehouse doesn't have Capacity, use TotalArea instead
        var warehouseBreakdown = warehouses
            .Select(w =>
            {
                var warehouseStocks = stocks.Where(s => s.WarehouseId == w.Id);
                var totalValue = warehouseStocks.Sum(s =>
                {
                    var product = products.FirstOrDefault(p => p.Id == s.ProductId);
                    return s.Quantity * (product?.UnitPrice?.Amount ?? 0);
                });

                return new WarehouseStockBreakdownDto
                {
                    WarehouseId = w.Id,
                    WarehouseName = w.Name,
                    ProductCount = warehouseStocks.Select(s => s.ProductId).Distinct().Count(),
                    TotalQuantity = warehouseStocks.Sum(s => s.Quantity),
                    TotalValue = totalValue,
                    UtilizationPercentage = 0 // Can be calculated if capacity tracking is added
                };
            })
            .OrderByDescending(w => w.TotalValue)
            .ToList();

        var totalWarehouseValue = warehouseBreakdown.Sum(w => w.TotalValue);
        foreach (var wh in warehouseBreakdown)
        {
            wh.Percentage = totalWarehouseValue > 0 ? (wh.TotalValue / totalWarehouseValue) * 100 : 0;
        }
        dashboard.StockByWarehouse = warehouseBreakdown;

        // Movement Trend (last 30 days)
        var movementTrend = Enumerable.Range(0, 30)
            .Select(i => today.AddDays(-29 + i))
            .Select(date =>
            {
                var dayMovements = movements.Where(m => m.CreatedDate.Date == date).ToList();
                return new StockMovementTrendDto
                {
                    Date = date,
                    InboundQuantity = dayMovements
                        .Where(m => InboundTypes.Contains(m.MovementType))
                        .Sum(m => m.Quantity),
                    OutboundQuantity = dayMovements
                        .Where(m => OutboundTypes.Contains(m.MovementType))
                        .Sum(m => m.Quantity),
                    InboundCount = dayMovements.Count(m => InboundTypes.Contains(m.MovementType)),
                    OutboundCount = dayMovements.Count(m => OutboundTypes.Contains(m.MovementType))
                };
            })
            .ToList();
        dashboard.MovementTrend = movementTrend;

        // Top Products by Value
        dashboard.TopProductsByValue = stocks
            .GroupBy(s => s.ProductId)
            .Select(g =>
            {
                var product = products.FirstOrDefault(p => p.Id == g.Key);
                var category = categories.FirstOrDefault(c => c.Id == product?.CategoryId);
                var totalQty = g.Sum(s => s.Quantity);
                var value = totalQty * (product?.UnitPrice?.Amount ?? 0);

                return new TopProductDto
                {
                    ProductId = g.Key,
                    ProductCode = product?.Code ?? "",
                    ProductName = product?.Name ?? "",
                    CategoryName = category?.Name,
                    Quantity = totalQty,
                    Value = value
                };
            })
            .OrderByDescending(p => p.Value)
            .Take(10)
            .ToList();

        // Top Products by Movement
        var movementsByProduct = movements
            .GroupBy(m => m.ProductId)
            .ToDictionary(g => g.Key, g => g.Count());

        dashboard.TopProductsByMovement = products
            .Where(p => movementsByProduct.ContainsKey(p.Id))
            .Select(p =>
            {
                var category = categories.FirstOrDefault(c => c.Id == p.CategoryId);
                var qty = stockByProduct.GetValueOrDefault(p.Id, 0);

                return new TopProductDto
                {
                    ProductId = p.Id,
                    ProductCode = p.Code,
                    ProductName = p.Name,
                    CategoryName = category?.Name,
                    Quantity = qty,
                    Value = qty * (p.UnitPrice?.Amount ?? 0),
                    MovementCount = movementsByProduct[p.Id]
                };
            })
            .OrderByDescending(p => p.MovementCount)
            .Take(10)
            .ToList();

        // Low Stock Alerts
        dashboard.LowStockAlerts = products
            .Where(p => p.IsActive)
            .Select(p =>
            {
                var currentStock = stockByProduct.GetValueOrDefault(p.Id, 0);
                string? severity = null;

                if (currentStock <= 0)
                    severity = "Critical";
                else if (currentStock <= p.MinimumStock)
                    severity = "Warning";
                else if (currentStock <= p.ReorderPoint)
                    severity = "Info";

                return severity != null ? new LowStockAlertDto
                {
                    ProductId = p.Id,
                    ProductCode = p.Code,
                    ProductName = p.Name,
                    CurrentStock = currentStock,
                    MinimumStock = p.MinimumStock,
                    ReorderPoint = p.ReorderPoint,
                    Severity = severity
                } : null;
            })
            .Where(a => a != null)
            .Cast<LowStockAlertDto>()
            .OrderBy(a => a.Severity == "Critical" ? 0 : a.Severity == "Warning" ? 1 : 2)
            .ThenBy(a => a.CurrentStock)
            .Take(20)
            .ToList();

        // Expiry Alerts
        dashboard.ExpiryAlerts = expiringLots
            .Where(l => l.ExpiryDate!.Value.Date <= today.AddDays(90))
            .Select(l =>
            {
                var product = products.FirstOrDefault(p => p.Id == l.ProductId);
                var daysUntil = (l.ExpiryDate!.Value.Date - today).Days;
                var severity = daysUntil < 0 ? "Expired" : daysUntil <= 7 ? "Critical" : "Warning";

                return new ExpiryAlertDto
                {
                    LotBatchId = l.Id,
                    LotNumber = l.LotNumber,
                    ProductId = l.ProductId,
                    ProductName = product?.Name ?? "",
                    ExpiryDate = l.ExpiryDate.Value,
                    Quantity = l.CurrentQuantity,
                    DaysUntilExpiry = daysUntil,
                    Severity = severity
                };
            })
            .OrderBy(e => e.DaysUntilExpiry)
            .Take(20)
            .ToList();

        return Result<InventoryDashboardDto>.Success(dashboard);
    }
}
