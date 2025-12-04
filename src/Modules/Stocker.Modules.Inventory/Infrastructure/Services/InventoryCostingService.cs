using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Application.Services;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Domain.Enums;
using Stocker.Modules.Inventory.Infrastructure.Persistence;

namespace Stocker.Modules.Inventory.Infrastructure.Services;

/// <summary>
/// Implementation of inventory costing service (FIFO/LIFO/WAC)
/// </summary>
public class InventoryCostingService : IInventoryCostingService
{
    private readonly InventoryDbContext _context;

    public InventoryCostingService(InventoryDbContext context)
    {
        _context = context;
    }

    // =====================================
    // COST LAYER OPERATIONS
    // =====================================

    public async Task<PaginatedCostLayersDto> GetCostLayersAsync(
        CostLayerFilterDto filter,
        CancellationToken cancellationToken = default)
    {
        // For now, we'll simulate cost layers from stock movements
        // In a real implementation, you'd have a dedicated CostLayer table
        var query = _context.StockMovements
            .Include(m => m.Product)
            .Include(m => m.Warehouse)
            .Where(m => m.MovementType == StockMovementType.Purchase ||
                       m.MovementType == StockMovementType.Opening ||
                       m.MovementType == StockMovementType.Production)
            .OrderByDescending(m => m.MovementDate)
            .AsQueryable();

        if (filter.ProductId.HasValue)
            query = query.Where(m => m.ProductId == filter.ProductId.Value);

        if (filter.WarehouseId.HasValue)
            query = query.Where(m => m.WarehouseId == filter.WarehouseId.Value);

        if (filter.FromDate.HasValue)
            query = query.Where(m => m.MovementDate >= filter.FromDate.Value);

        if (filter.ToDate.HasValue)
            query = query.Where(m => m.MovementDate <= filter.ToDate.Value);

        var totalCount = await query.CountAsync(cancellationToken);
        var movements = await query
            .Skip((filter.PageNumber - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ToListAsync(cancellationToken);

        var layers = movements.Select((m, index) => new CostLayerDto
        {
            Id = m.Id,
            ProductId = m.ProductId,
            ProductCode = m.Product?.Code ?? "",
            ProductName = m.Product?.Name ?? "",
            WarehouseId = m.WarehouseId,
            WarehouseName = m.Warehouse?.Name,
            LayerDate = m.MovementDate,
            ReferenceNumber = m.ReferenceDocumentNumber,
            ReferenceType = m.MovementType.ToString(),
            OriginalQuantity = m.Quantity,
            RemainingQuantity = m.Quantity, // Simplified
            UnitCost = m.UnitCost,
            TotalCost = m.Quantity * m.UnitCost,
            Currency = "TRY",
            IsFullyConsumed = false,
            LayerOrder = index + 1,
            CreatedAt = m.MovementDate
        }).ToList();

        var totalQuantity = layers.Sum(l => l.RemainingQuantity);
        var totalValue = layers.Sum(l => l.TotalCost);
        var wac = totalQuantity > 0 ? totalValue / totalQuantity : 0;

        return new PaginatedCostLayersDto
        {
            Items = layers,
            TotalCount = totalCount,
            PageNumber = filter.PageNumber,
            PageSize = filter.PageSize,
            TotalPages = (int)Math.Ceiling(totalCount / (double)filter.PageSize),
            HasNextPage = filter.PageNumber * filter.PageSize < totalCount,
            HasPreviousPage = filter.PageNumber > 1,
            TotalQuantity = totalQuantity,
            TotalValue = totalValue,
            WeightedAverageCost = wac
        };
    }

    public async Task<List<CostLayerDto>> GetProductCostLayersAsync(
        int productId,
        int? warehouseId = null,
        bool includeFullyConsumed = false,
        CancellationToken cancellationToken = default)
    {
        var query = _context.StockMovements
            .Include(m => m.Product)
            .Include(m => m.Warehouse)
            .Where(m => m.ProductId == productId &&
                       (m.MovementType == StockMovementType.Purchase ||
                        m.MovementType == StockMovementType.Opening ||
                        m.MovementType == StockMovementType.Production))
            .OrderBy(m => m.MovementDate)
            .AsQueryable();

        if (warehouseId.HasValue)
            query = query.Where(m => m.WarehouseId == warehouseId.Value);

        var movements = await query.ToListAsync(cancellationToken);

        return movements.Select((m, index) => new CostLayerDto
        {
            Id = m.Id,
            ProductId = m.ProductId,
            ProductCode = m.Product?.Code ?? "",
            ProductName = m.Product?.Name ?? "",
            WarehouseId = m.WarehouseId,
            WarehouseName = m.Warehouse?.Name,
            LayerDate = m.MovementDate,
            ReferenceNumber = m.ReferenceDocumentNumber,
            ReferenceType = m.MovementType.ToString(),
            OriginalQuantity = m.Quantity,
            RemainingQuantity = m.Quantity,
            UnitCost = m.UnitCost,
            TotalCost = m.Quantity * m.UnitCost,
            Currency = "TRY",
            IsFullyConsumed = false,
            LayerOrder = index + 1,
            CreatedAt = m.MovementDate
        }).ToList();
    }

    public Task<CostLayerDto> CreateCostLayerAsync(
        CreateCostLayerDto dto,
        CancellationToken cancellationToken = default)
    {
        // In real implementation, create a cost layer record
        return Task.FromResult(new CostLayerDto
        {
            Id = 1,
            ProductId = dto.ProductId,
            WarehouseId = dto.WarehouseId,
            LayerDate = dto.LayerDate ?? DateTime.UtcNow,
            ReferenceNumber = dto.ReferenceNumber,
            ReferenceType = dto.ReferenceType,
            OriginalQuantity = dto.Quantity,
            RemainingQuantity = dto.Quantity,
            UnitCost = dto.UnitCost,
            TotalCost = dto.Quantity * dto.UnitCost,
            Currency = "TRY",
            IsFullyConsumed = false,
            LayerOrder = 1,
            CreatedAt = DateTime.UtcNow
        });
    }

    public async Task<CostCalculationResultDto> ConsumeFromCostLayersAsync(
        CostCalculationRequestDto request,
        CancellationToken cancellationToken = default)
    {
        return await CalculateCOGSAsync(request, cancellationToken);
    }

    // =====================================
    // PRODUCT COSTING
    // =====================================

    public async Task<ProductCostingSummaryDto?> GetProductCostingSummaryAsync(
        int productId,
        int? warehouseId = null,
        CancellationToken cancellationToken = default)
    {
        var product = await _context.Products
            .Include(p => p.Category)
            .FirstOrDefaultAsync(p => p.Id == productId, cancellationToken);

        if (product == null)
            return null;

        var layers = await GetProductCostLayersAsync(productId, warehouseId, false, cancellationToken);
        var activeLayers = layers.Where(l => l.RemainingQuantity > 0).ToList();

        var totalQuantity = activeLayers.Sum(l => l.RemainingQuantity);
        var totalValue = activeLayers.Sum(l => l.TotalCost);
        var wac = totalQuantity > 0 ? totalValue / totalQuantity : 0;

        var oldestLayer = activeLayers.OrderBy(l => l.LayerDate).FirstOrDefault();
        var newestLayer = activeLayers.OrderByDescending(l => l.LayerDate).FirstOrDefault();

        return new ProductCostingSummaryDto
        {
            ProductId = product.Id,
            ProductCode = product.Code,
            ProductName = product.Name,
            CategoryName = product.Category?.Name,
            CostingMethod = CostingMethod.WeightedAverageCost, // Default
            TotalQuantity = totalQuantity,
            TotalValue = totalValue,
            WeightedAverageCost = wac,
            FIFOUnitCost = oldestLayer?.UnitCost,
            LIFOUnitCost = newestLayer?.UnitCost,
            StandardCost = product.CostPrice?.Amount,
            ActiveLayerCount = activeLayers.Count,
            OldestLayerDate = oldestLayer?.LayerDate,
            NewestLayerDate = newestLayer?.LayerDate,
            Currency = "TRY",
            LastCalculatedAt = DateTime.UtcNow
        };
    }

    public async Task<List<ProductCostingSummaryDto>> GetProductCostingSummariesAsync(
        int? categoryId = null,
        int? warehouseId = null,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Products
            .Include(p => p.Category)
            .AsQueryable();

        if (categoryId.HasValue)
            query = query.Where(p => p.CategoryId == categoryId.Value);

        var products = await query.Take(100).ToListAsync(cancellationToken);
        var summaries = new List<ProductCostingSummaryDto>();

        foreach (var product in products)
        {
            var summary = await GetProductCostingSummaryAsync(product.Id, warehouseId, cancellationToken);
            if (summary != null && summary.TotalQuantity > 0)
                summaries.Add(summary);
        }

        return summaries;
    }

    public async Task<CostCalculationResultDto> CalculateCOGSAsync(
        CostCalculationRequestDto request,
        CancellationToken cancellationToken = default)
    {
        var product = await _context.Products
            .FirstOrDefaultAsync(p => p.Id == request.ProductId, cancellationToken);

        if (product == null)
            throw new InvalidOperationException($"Product with ID {request.ProductId} not found");

        var layers = await GetProductCostLayersAsync(request.ProductId, request.WarehouseId, false, cancellationToken);
        var activeLayers = layers.Where(l => l.RemainingQuantity > 0).ToList();

        var result = new CostCalculationResultDto
        {
            ProductId = product.Id,
            ProductCode = product.Code,
            ProductName = product.Name,
            RequestedQuantity = request.Quantity,
            MethodUsed = request.Method,
            Currency = "TRY"
        };

        decimal remainingToConsume = request.Quantity;
        decimal totalCOGS = 0;

        // Sort layers based on method
        var orderedLayers = request.Method switch
        {
            CostingMethod.FIFO => activeLayers.OrderBy(l => l.LayerDate).ToList(),
            CostingMethod.LIFO => activeLayers.OrderByDescending(l => l.LayerDate).ToList(),
            _ => activeLayers // WAC doesn't need ordering
        };

        if (request.Method == CostingMethod.WeightedAverageCost)
        {
            var totalQty = activeLayers.Sum(l => l.RemainingQuantity);
            var totalVal = activeLayers.Sum(l => l.TotalCost);
            var wac = totalQty > 0 ? totalVal / totalQty : 0;

            totalCOGS = request.Quantity * wac;
            result.LayersConsumed.Add(new CostLayerConsumptionDto
            {
                LayerId = 0,
                LayerDate = DateTime.UtcNow,
                ReferenceNumber = "WAC",
                UnitCost = wac,
                QuantityConsumed = request.Quantity,
                TotalCost = totalCOGS,
                RemainingAfterConsumption = totalQty - request.Quantity
            });
        }
        else
        {
            foreach (var layer in orderedLayers)
            {
                if (remainingToConsume <= 0)
                    break;

                var consumeFromLayer = Math.Min(layer.RemainingQuantity, remainingToConsume);
                var layerCost = consumeFromLayer * layer.UnitCost;

                result.LayersConsumed.Add(new CostLayerConsumptionDto
                {
                    LayerId = layer.Id,
                    LayerDate = layer.LayerDate,
                    ReferenceNumber = layer.ReferenceNumber,
                    UnitCost = layer.UnitCost,
                    QuantityConsumed = consumeFromLayer,
                    TotalCost = layerCost,
                    RemainingAfterConsumption = layer.RemainingQuantity - consumeFromLayer
                });

                totalCOGS += layerCost;
                remainingToConsume -= consumeFromLayer;
            }

            if (remainingToConsume > 0)
            {
                result.Notes.Add($"Uyarı: Talep edilen miktar ({request.Quantity}) mevcut stoktan ({request.Quantity - remainingToConsume}) fazla.");
            }
        }

        result.TotalCOGS = totalCOGS;
        result.AverageUnitCost = request.Quantity > 0 ? totalCOGS / request.Quantity : 0;

        var totalRemainingQty = activeLayers.Sum(l => l.RemainingQuantity) - request.Quantity;
        var totalRemainingVal = activeLayers.Sum(l => l.TotalCost) - totalCOGS;
        result.RemainingInventoryQuantity = Math.Max(0, totalRemainingQty);
        result.RemainingInventoryValue = Math.Max(0, totalRemainingVal);

        return result;
    }

    public async Task<CostMethodComparisonDto> CompareCostMethodsAsync(
        int productId,
        decimal quantity,
        int? warehouseId = null,
        CancellationToken cancellationToken = default)
    {
        var product = await _context.Products
            .FirstOrDefaultAsync(p => p.Id == productId, cancellationToken);

        if (product == null)
            throw new InvalidOperationException($"Product with ID {productId} not found");

        var fifoResult = await CalculateCOGSAsync(new CostCalculationRequestDto
        {
            ProductId = productId,
            WarehouseId = warehouseId,
            Quantity = quantity,
            Method = CostingMethod.FIFO
        }, cancellationToken);

        var lifoResult = await CalculateCOGSAsync(new CostCalculationRequestDto
        {
            ProductId = productId,
            WarehouseId = warehouseId,
            Quantity = quantity,
            Method = CostingMethod.LIFO
        }, cancellationToken);

        var wacResult = await CalculateCOGSAsync(new CostCalculationRequestDto
        {
            ProductId = productId,
            WarehouseId = warehouseId,
            Quantity = quantity,
            Method = CostingMethod.WeightedAverageCost
        }, cancellationToken);

        var cogsValues = new[] { fifoResult.TotalCOGS, lifoResult.TotalCOGS, wacResult.TotalCOGS };
        var variance = cogsValues.Max() - cogsValues.Min();

        var comparison = new CostMethodComparisonDto
        {
            ProductId = productId,
            ProductCode = product.Code,
            ProductName = product.Name,
            Quantity = quantity,
            FIFO = new CostMethodResultDto
            {
                Method = CostingMethod.FIFO,
                TotalCOGS = fifoResult.TotalCOGS,
                AverageUnitCost = fifoResult.AverageUnitCost,
                RemainingInventoryValue = fifoResult.RemainingInventoryValue
            },
            LIFO = new CostMethodResultDto
            {
                Method = CostingMethod.LIFO,
                TotalCOGS = lifoResult.TotalCOGS,
                AverageUnitCost = lifoResult.AverageUnitCost,
                RemainingInventoryValue = lifoResult.RemainingInventoryValue
            },
            WeightedAverage = new CostMethodResultDto
            {
                Method = CostingMethod.WeightedAverageCost,
                TotalCOGS = wacResult.TotalCOGS,
                AverageUnitCost = wacResult.AverageUnitCost,
                RemainingInventoryValue = wacResult.RemainingInventoryValue
            },
            COGSVariance = variance,
            Currency = "TRY"
        };

        // Add standard cost if available
        if (product.CostPrice != null && product.CostPrice.Amount > 0)
        {
            comparison.StandardCost = new CostMethodResultDto
            {
                Method = CostingMethod.StandardCost,
                TotalCOGS = quantity * product.CostPrice.Amount,
                AverageUnitCost = product.CostPrice.Amount,
                RemainingInventoryValue = 0 // Not applicable for standard cost
            };
        }

        return comparison;
    }

    // =====================================
    // INVENTORY VALUATION
    // =====================================

    public async Task<InventoryValuationReportDto> GetInventoryValuationAsync(
        InventoryValuationFilterDto filter,
        CancellationToken cancellationToken = default)
    {
        var summaries = await GetProductCostingSummariesAsync(filter.CategoryId, filter.WarehouseId, cancellationToken);

        if (!filter.IncludeZeroQuantity)
            summaries = summaries.Where(s => s.TotalQuantity > 0).ToList();

        var totalValue = summaries.Sum(s => s.TotalValue);

        // Group by category
        var byCategory = summaries
            .Where(s => s.CategoryName != null)
            .GroupBy(s => s.CategoryName)
            .Select(g => new CategoryValuationDto
            {
                CategoryId = 0,
                CategoryName = g.Key!,
                ProductCount = g.Count(),
                TotalQuantity = g.Sum(s => s.TotalQuantity),
                TotalValue = g.Sum(s => s.TotalValue),
                PercentageOfTotal = totalValue > 0 ? (g.Sum(s => s.TotalValue) / totalValue) * 100 : 0
            })
            .OrderByDescending(c => c.TotalValue)
            .ToList();

        // Products list
        var products = summaries.Select(s => new ProductValuationDto
        {
            ProductId = s.ProductId,
            ProductCode = s.ProductCode,
            ProductName = s.ProductName,
            CategoryName = s.CategoryName,
            Quantity = s.TotalQuantity,
            UnitCost = s.WeightedAverageCost,
            TotalValue = s.TotalValue,
            LayerCount = s.ActiveLayerCount
        }).OrderByDescending(p => p.TotalValue).ToList();

        return new InventoryValuationReportDto
        {
            ReportDate = filter.AsOfDate ?? DateTime.UtcNow,
            Method = filter.Method,
            Currency = "TRY",
            TotalInventoryValue = totalValue,
            TotalQuantity = summaries.Sum(s => s.TotalQuantity),
            ProductCount = summaries.Count,
            ByCategory = byCategory,
            ByWarehouse = new List<WarehouseValuationDto>(), // Simplified
            Products = products
        };
    }

    public async Task<decimal> GetTotalInventoryValueAsync(
        CostingMethod method = CostingMethod.WeightedAverageCost,
        int? warehouseId = null,
        CancellationToken cancellationToken = default)
    {
        var filter = new InventoryValuationFilterDto
        {
            WarehouseId = warehouseId,
            Method = method,
            IncludeZeroQuantity = false
        };

        var report = await GetInventoryValuationAsync(filter, cancellationToken);
        return report.TotalInventoryValue;
    }

    // =====================================
    // COGS REPORTING
    // =====================================

    public async Task<COGSReportDto> GetCOGSReportAsync(
        COGSReportFilterDto filter,
        CancellationToken cancellationToken = default)
    {
        // Get outbound movements (sales, consumption, etc.)
        var outboundQuery = _context.StockMovements
            .Include(m => m.Product)
            .ThenInclude(p => p.Category)
            .Where(m => m.MovementDate >= filter.StartDate &&
                       m.MovementDate <= filter.EndDate &&
                       (m.MovementType == StockMovementType.Sales ||
                        m.MovementType == StockMovementType.Consumption ||
                        m.MovementType == StockMovementType.AdjustmentDecrease))
            .AsQueryable();

        if (filter.CategoryId.HasValue)
            outboundQuery = outboundQuery.Where(m => m.Product.CategoryId == filter.CategoryId.Value);

        if (filter.WarehouseId.HasValue)
            outboundQuery = outboundQuery.Where(m => m.WarehouseId == filter.WarehouseId.Value);

        var outboundMovements = await outboundQuery.ToListAsync(cancellationToken);

        var totalCOGS = outboundMovements.Sum(m => Math.Abs(m.Quantity) * m.UnitCost);
        var totalQuantitySold = outboundMovements.Sum(m => Math.Abs(m.Quantity));

        // Group by category
        var byCategory = outboundMovements
            .Where(m => m.Product?.Category != null)
            .GroupBy(m => new { m.Product.CategoryId, m.Product.Category.Name })
            .Select(g => new CategoryCOGSDto
            {
                CategoryId = g.Key.CategoryId,
                CategoryName = g.Key.Name,
                COGS = g.Sum(m => Math.Abs(m.Quantity) * m.UnitCost),
                QuantitySold = g.Sum(m => Math.Abs(m.Quantity)),
                PercentageOfTotal = totalCOGS > 0
                    ? (g.Sum(m => Math.Abs(m.Quantity) * m.UnitCost) / totalCOGS) * 100
                    : 0
            })
            .OrderByDescending(c => c.COGS)
            .ToList();

        // Monthly breakdown
        var monthlyBreakdown = outboundMovements
            .GroupBy(m => new { m.MovementDate.Year, m.MovementDate.Month })
            .Select(g => new MonthlyCOGSDto
            {
                Year = g.Key.Year,
                Month = g.Key.Month,
                MonthName = new DateTime(g.Key.Year, g.Key.Month, 1).ToString("MMMM yyyy"),
                COGS = g.Sum(m => Math.Abs(m.Quantity) * m.UnitCost),
                QuantitySold = g.Sum(m => Math.Abs(m.Quantity)),
                AverageUnitCost = g.Sum(m => Math.Abs(m.Quantity)) > 0
                    ? g.Sum(m => Math.Abs(m.Quantity) * m.UnitCost) / g.Sum(m => Math.Abs(m.Quantity))
                    : 0
            })
            .OrderBy(m => m.Year)
            .ThenBy(m => m.Month)
            .ToList();

        return new COGSReportDto
        {
            StartDate = filter.StartDate,
            EndDate = filter.EndDate,
            Method = filter.Method,
            Currency = "TRY",
            TotalCOGS = totalCOGS,
            TotalQuantitySold = totalQuantitySold,
            BeginningInventoryValue = 0, // Would need historical data
            PurchasesDuringPeriod = 0, // Would need to calculate
            EndingInventoryValue = 0, // Current inventory value
            CalculatedCOGS = totalCOGS,
            COGSVariance = 0,
            ByCategory = byCategory,
            MonthlyBreakdown = monthlyBreakdown
        };
    }

    // =====================================
    // STANDARD COST MANAGEMENT
    // =====================================

    public async Task<bool> SetStandardCostAsync(
        SetStandardCostDto dto,
        CancellationToken cancellationToken = default)
    {
        var product = await _context.Products
            .FirstOrDefaultAsync(p => p.Id == dto.ProductId, cancellationToken);

        if (product == null)
            return false;

        // Note: Product uses CostPrice (Money type) as the cost reference
        // Standard cost management would typically require a dedicated property
        // For now, we're using CostPrice as the standard cost reference
        // In production, you'd add a dedicated StandardCost property to Product
        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }

    public async Task<List<CostVarianceAnalysisDto>> GetCostVarianceAnalysisAsync(
        int? categoryId = null,
        CancellationToken cancellationToken = default)
    {
        // Using CostPrice as the standard cost reference
        var query = _context.Products
            .Include(p => p.Stocks)
            .Where(p => p.CostPrice != null && p.CostPrice.Amount > 0)
            .AsQueryable();

        if (categoryId.HasValue)
            query = query.Where(p => p.CategoryId == categoryId.Value);

        var products = await query.ToListAsync(cancellationToken);
        var results = new List<CostVarianceAnalysisDto>();

        foreach (var product in products)
        {
            var summary = await GetProductCostingSummaryAsync(product.Id, null, cancellationToken);
            if (summary == null || summary.TotalQuantity == 0)
                continue;

            var standardCost = product.CostPrice?.Amount ?? 0;
            var actualCost = summary.WeightedAverageCost;
            var varianceAmount = actualCost - standardCost;
            var variancePercent = standardCost > 0 ? (varianceAmount / standardCost) * 100 : 0;

            results.Add(new CostVarianceAnalysisDto
            {
                ProductId = product.Id,
                ProductCode = product.Code,
                ProductName = product.Name,
                StandardCost = standardCost,
                ActualCost = actualCost,
                VarianceAmount = varianceAmount,
                VariancePercentage = variancePercent,
                VarianceType = varianceAmount < 0 ? "Favorable" : (varianceAmount > 0 ? "Unfavorable" : "None"),
                TotalQuantity = summary.TotalQuantity,
                TotalVarianceImpact = varianceAmount * summary.TotalQuantity,
                Currency = "TRY"
            });
        }

        return results.OrderByDescending(r => Math.Abs(r.TotalVarianceImpact)).ToList();
    }

    // =====================================
    // COST ADJUSTMENTS
    // =====================================

    public Task<bool> AdjustCostAsync(
        CostAdjustmentDto dto,
        CancellationToken cancellationToken = default)
    {
        // In real implementation, adjust cost layers
        return Task.FromResult(true);
    }

    public async Task<decimal> RecalculateWACAsync(
        int productId,
        int? warehouseId = null,
        CancellationToken cancellationToken = default)
    {
        var summary = await GetProductCostingSummaryAsync(productId, warehouseId, cancellationToken);
        return summary?.WeightedAverageCost ?? 0;
    }

    // =====================================
    // COSTING METHOD CONFIGURATION
    // =====================================

    public Task<CostingMethod> GetProductCostingMethodAsync(
        int productId,
        CancellationToken cancellationToken = default)
    {
        // In real implementation, this would read from product or system settings
        return Task.FromResult(CostingMethod.WeightedAverageCost);
    }

    public Task<bool> SetProductCostingMethodAsync(
        int productId,
        CostingMethod method,
        CancellationToken cancellationToken = default)
    {
        // In real implementation, save to database
        return Task.FromResult(true);
    }

    public Dictionary<string, string> GetCostingMethods()
    {
        return new Dictionary<string, string>
        {
            { CostingMethod.FIFO.ToString(), "İlk Giren İlk Çıkar (FIFO)" },
            { CostingMethod.LIFO.ToString(), "Son Giren İlk Çıkar (LIFO)" },
            { CostingMethod.WeightedAverageCost.ToString(), "Ağırlıklı Ortalama Maliyet" },
            { CostingMethod.SpecificIdentification.ToString(), "Özel Tanımlama" },
            { CostingMethod.StandardCost.ToString(), "Standart Maliyet" }
        };
    }
}
