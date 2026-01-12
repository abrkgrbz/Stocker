using Microsoft.Extensions.Logging;
using Stocker.Modules.Manufacturing.Domain.Entities;
using Stocker.Modules.Manufacturing.Domain.Enums;
using Stocker.Modules.Manufacturing.Domain.Services;
using Stocker.Modules.Manufacturing.Interfaces;
using Stocker.Shared.Contracts.Manufacturing;

namespace Stocker.Modules.Manufacturing.Application.Services;

/// <summary>
/// Cross-module manufacturing service implementation
/// Provides manufacturing capabilities for Sales, Inventory and other modules
/// </summary>
public class ManufacturingService : IManufacturingService
{
    private readonly IManufacturingUnitOfWork _unitOfWork;
    private readonly IProductionPlanningService _planningService;
    private readonly IProductionCostingService _costingService;
    private readonly ILogger<ManufacturingService> _logger;

    public ManufacturingService(
        IManufacturingUnitOfWork unitOfWork,
        IProductionPlanningService planningService,
        IProductionCostingService costingService,
        ILogger<ManufacturingService> logger)
    {
        _unitOfWork = unitOfWork;
        _planningService = planningService;
        _costingService = costingService;
        _logger = logger;
    }

    public async Task<BomDto?> GetBomByProductIdAsync(int productId, Guid tenantId, CancellationToken cancellationToken = default)
    {
        try
        {
            var boms = await _unitOfWork.BillOfMaterials.GetVersionsAsync(tenantId, productId, cancellationToken);
            var activeBom = boms.FirstOrDefault(b => b.Status == BomStatus.Aktif);

            if (activeBom == null)
            {
                _logger.LogWarning("No active BOM found for product {ProductId}", productId);
                return null;
            }

            // Get BOM with lines
            var bomWithLines = await _unitOfWork.BillOfMaterials.GetByIdWithLinesAsync(activeBom.Id, cancellationToken);
            if (bomWithLines == null) return null;

            return new BomDto
            {
                Id = bomWithLines.Id,
                ProductId = bomWithLines.ProductId,
                Code = bomWithLines.Code,
                Name = bomWithLines.Name,
                BaseQuantity = bomWithLines.BaseQuantity,
                BaseUnit = bomWithLines.BaseUnit,
                Status = bomWithLines.Status.ToString(),
                TotalEstimatedCost = bomWithLines.TotalEstimatedCost ?? 0,
                Lines = bomWithLines.Lines.Where(l => l.IsActive).Select(l => new BomLineDto
                {
                    ComponentProductId = l.ComponentProductId,
                    ComponentCode = "", // Would need product service integration
                    ComponentName = "",
                    Quantity = l.Quantity,
                    Unit = l.Unit,
                    ScrapRate = l.ScrapRate,
                    UnitCost = l.UnitCost
                }).ToList()
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting BOM for product {ProductId}", productId);
            return null;
        }
    }

    public async Task<MaterialRequirementDto> CalculateMaterialRequirementsAsync(
        int productId,
        decimal quantity,
        Guid tenantId,
        CancellationToken cancellationToken = default)
    {
        var result = new MaterialRequirementDto
        {
            ProductId = productId,
            ProductionQuantity = quantity
        };

        try
        {
            var bomDto = await GetBomByProductIdAsync(productId, tenantId, cancellationToken);
            if (bomDto == null)
            {
                result.Shortages.Add("Ürün için aktif BOM bulunamadı.");
                return result;
            }

            decimal totalCost = 0;

            foreach (var line in bomDto.Lines)
            {
                var requiredQty = (line.Quantity / bomDto.BaseQuantity) * quantity;
                var scrapAllowance = requiredQty * (line.ScrapRate / 100);
                var totalRequired = requiredQty + scrapAllowance;

                var lineCost = totalRequired * (line.UnitCost ?? 0);
                totalCost += lineCost;

                result.Requirements.Add(new MaterialRequirementLineDto
                {
                    ComponentProductId = line.ComponentProductId,
                    ComponentCode = line.ComponentCode,
                    ComponentName = line.ComponentName,
                    RequiredQuantity = totalRequired,
                    Unit = line.Unit,
                    AvailableStock = 0, // Would need inventory service integration
                    ShortageQuantity = totalRequired, // Placeholder - needs stock check
                    EstimatedCost = lineCost
                });
            }

            result.TotalEstimatedCost = totalCost;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calculating material requirements for product {ProductId}", productId);
            result.Shortages.Add($"Hesaplama hatası: {ex.Message}");
        }

        return result;
    }

    public async Task<bool> HasAvailableCapacityAsync(
        int productId,
        decimal quantity,
        DateTime requiredDate,
        Guid tenantId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            // Get active routing for the product
            var routings = await _unitOfWork.Routings.GetVersionsAsync(tenantId, productId, cancellationToken);
            var activeRouting = routings.FirstOrDefault(r => r.Status == RoutingStatus.Aktif);

            if (activeRouting == null)
            {
                _logger.LogWarning("No active routing found for product {ProductId}", productId);
                return false;
            }

            // Get work centers used in routing
            var routingWithOperations = await _unitOfWork.Routings.GetByIdWithOperationsAsync(activeRouting.Id, cancellationToken);
            if (routingWithOperations == null) return false;

            var workCenterIds = routingWithOperations.Operations
                .Where(o => o.IsActive)
                .Select(o => o.WorkCenterId)
                .Distinct()
                .ToList();

            // Check each work center's capacity
            var workCenters = await _unitOfWork.WorkCenters.GetActiveAsync(tenantId, cancellationToken);
            var relevantWorkCenters = workCenters.Where(wc => workCenterIds.Contains(wc.Id)).ToList();

            if (!relevantWorkCenters.Any())
            {
                _logger.LogWarning("No active work centers found for routing operations");
                return false;
            }

            // Get existing production orders for capacity check
            var existingOrders = await _unitOfWork.ProductionOrders.GetActiveAsync(tenantId, cancellationToken);

            // Calculate total production time needed
            var totalTime = _planningService.CalculateTotalProductionTime(routingWithOperations, quantity);

            // Check each work center's load
            foreach (var workCenter in relevantWorkCenters)
            {
                var load = _planningService.CalculateWorkCenterLoad(
                    workCenter,
                    DateTime.UtcNow,
                    requiredDate,
                    existingOrders);

                // If utilization is already above 90%, capacity is not available
                if (load.UtilizationRate > 90)
                {
                    _logger.LogInformation(
                        "Work center {WorkCenterId} has insufficient capacity. Utilization: {Utilization}%",
                        workCenter.Id, load.UtilizationRate);
                    return false;
                }
            }

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking capacity for product {ProductId}", productId);
            return false;
        }
    }

    public async Task<ProductionCostDto> GetEstimatedProductionCostAsync(
        int productId,
        decimal quantity,
        Guid tenantId,
        CancellationToken cancellationToken = default)
    {
        var result = new ProductionCostDto
        {
            ProductId = productId,
            Quantity = quantity
        };

        try
        {
            // Get active BOM
            var boms = await _unitOfWork.BillOfMaterials.GetVersionsAsync(tenantId, productId, cancellationToken);
            var activeBom = boms.FirstOrDefault(b => b.Status == BomStatus.Aktif);

            if (activeBom != null)
            {
                var bomWithLines = await _unitOfWork.BillOfMaterials.GetByIdWithLinesAsync(activeBom.Id, cancellationToken);
                if (bomWithLines != null)
                {
                    var materialCost = _costingService.CalculateMaterialCost(bomWithLines, quantity);
                    result.MaterialCost = materialCost.TotalCost;
                }
            }

            // Get active routing
            var routings = await _unitOfWork.Routings.GetVersionsAsync(tenantId, productId, cancellationToken);
            var activeRouting = routings.FirstOrDefault(r => r.Status == RoutingStatus.Aktif);

            if (activeRouting != null)
            {
                var routingWithOperations = await _unitOfWork.Routings.GetByIdWithOperationsAsync(activeRouting.Id, cancellationToken);
                if (routingWithOperations != null)
                {
                    foreach (var operation in routingWithOperations.Operations.Where(o => o.IsActive))
                    {
                        var opCost = _costingService.CalculateOperationCost(operation, quantity);
                        result.LaborCost += opCost.LaborCost;
                        result.MachineCost += opCost.MachineCost;
                        result.OverheadCost += opCost.OverheadCost;
                    }
                }
            }

            result.TotalCost = result.MaterialCost + result.LaborCost + result.MachineCost + result.OverheadCost;
            result.UnitCost = quantity > 0 ? result.TotalCost / quantity : 0;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calculating production cost for product {ProductId}", productId);
        }

        return result;
    }

    public async Task<int?> CreateProductionOrderFromSalesOrderAsync(
        CreateProductionOrderFromSalesDto request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation(
                "Creating production order for product {ProductId}, quantity {Quantity} from sales order {SalesOrderId}",
                request.ProductId, request.Quantity, request.SalesOrderId);

            // Generate order number
            var orderNumber = await _unitOfWork.ProductionOrders.GenerateOrderNumberAsync(request.TenantId, cancellationToken);

            // Create production order
            var productionOrder = new ProductionOrder(
                orderNumber,
                request.ProductId,
                request.Quantity,
                request.Unit,
                ProductionOrderType.Normal);

            // Set sales order reference if provided
            if (request.SalesOrderId.HasValue)
            {
                productionOrder.SetSalesOrderReference(request.SalesOrderId, request.SalesOrderLineId);
            }

            // Set planned dates
            var plannedStartDate = DateTime.UtcNow;
            var leadTimeDays = 7; // Default lead time

            // Try to get routing for more accurate lead time
            var routings = await _unitOfWork.Routings.GetVersionsAsync(request.TenantId, request.ProductId, cancellationToken);
            var activeRouting = routings.FirstOrDefault(r => r.Status == RoutingStatus.Aktif);

            if (activeRouting != null)
            {
                productionOrder.SetRouting(activeRouting.Id);

                var routingWithOps = await _unitOfWork.Routings.GetByIdWithOperationsAsync(activeRouting.Id, cancellationToken);
                if (routingWithOps != null)
                {
                    var totalMinutes = _planningService.CalculateTotalProductionTime(routingWithOps, request.Quantity);
                    leadTimeDays = Math.Max(1, (int)Math.Ceiling((double)totalMinutes / (8 * 60))); // 8 hour days
                }
            }

            // Set BOM if available
            var boms = await _unitOfWork.BillOfMaterials.GetVersionsAsync(request.TenantId, request.ProductId, cancellationToken);
            var activeBom = boms.FirstOrDefault(b => b.Status == BomStatus.Aktif);
            if (activeBom != null)
            {
                productionOrder.SetBom(activeBom.Id);
            }

            var plannedEndDate = request.RequiredDate != default
                ? request.RequiredDate
                : plannedStartDate.AddDays(leadTimeDays);

            productionOrder.SetDates(plannedStartDate, plannedEndDate, request.RequiredDate != default ? request.RequiredDate : null);

            if (!string.IsNullOrEmpty(request.Notes))
            {
                productionOrder.SetNotes(request.Notes);
            }

            // Save
            await _unitOfWork.ProductionOrders.AddAsync(productionOrder, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            _logger.LogInformation(
                "Created production order {OrderNumber} (ID: {OrderId}) for product {ProductId}",
                orderNumber, productionOrder.Id, request.ProductId);

            return productionOrder.Id;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating production order from sales order");
            return null;
        }
    }

    public async Task<IEnumerable<ProductionOrderSummaryDto>> GetActiveProductionOrdersAsync(
        int productId,
        Guid tenantId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var orders = await _unitOfWork.ProductionOrders.GetByProductAsync(tenantId, productId, cancellationToken);

            var activeStatuses = new[]
            {
                ProductionOrderStatus.Taslak,
                ProductionOrderStatus.Planlandı,
                ProductionOrderStatus.Serbest,
                ProductionOrderStatus.Başladı,
                ProductionOrderStatus.Beklemede
            };

            return orders
                .Where(o => activeStatuses.Contains(o.Status))
                .Select(o => new ProductionOrderSummaryDto
                {
                    Id = o.Id,
                    OrderNumber = o.OrderNumber,
                    ProductId = o.ProductId,
                    PlannedQuantity = o.PlannedQuantity,
                    CompletedQuantity = o.CompletedQuantity,
                    Status = o.Status.ToString(),
                    PlannedStartDate = o.PlannedStartDate,
                    PlannedEndDate = o.PlannedEndDate,
                    CompletionPercent = o.CompletionPercent
                })
                .ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting active production orders for product {ProductId}", productId);
            return Enumerable.Empty<ProductionOrderSummaryDto>();
        }
    }

    public async Task<ProductionOrderStatusDto?> GetProductionOrderStatusAsync(
        int productionOrderId,
        Guid tenantId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var order = await _unitOfWork.ProductionOrders.GetByIdAsync(productionOrderId, cancellationToken);

            if (order == null || order.TenantId != tenantId)
            {
                return null;
            }

            // Get current operation name if available
            string? currentOperationName = null;
            if (order.RoutingId.HasValue && order.CurrentOperationSequence > 0)
            {
                var routing = await _unitOfWork.Routings.GetByIdWithOperationsAsync(order.RoutingId.Value, cancellationToken);
                currentOperationName = routing?.Operations
                    .FirstOrDefault(o => o.Sequence == order.CurrentOperationSequence)?.Name;
            }

            return new ProductionOrderStatusDto
            {
                Id = order.Id,
                OrderNumber = order.OrderNumber,
                Status = order.Status.ToString(),
                PlannedQuantity = order.PlannedQuantity,
                CompletedQuantity = order.CompletedQuantity,
                ScrapQuantity = order.ScrapQuantity,
                CompletionPercent = order.CompletionPercent,
                PlannedStartDate = order.PlannedStartDate,
                PlannedEndDate = order.PlannedEndDate,
                ActualStartDate = order.ActualStartDate,
                ActualEndDate = order.ActualEndDate,
                CurrentOperationSequence = order.CurrentOperationSequence,
                CurrentOperationName = currentOperationName
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting production order status for order {OrderId}", productionOrderId);
            return null;
        }
    }
}
