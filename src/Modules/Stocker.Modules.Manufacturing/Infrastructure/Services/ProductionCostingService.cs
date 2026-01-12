using Stocker.Modules.Manufacturing.Domain.Entities;
using Stocker.Modules.Manufacturing.Domain.Services;

namespace Stocker.Modules.Manufacturing.Infrastructure.Services;

/// <summary>
/// Üretim maliyet hesaplama servisi implementasyonu
/// </summary>
public class ProductionCostingService : IProductionCostingService
{
    public async Task<ProductionCostEstimate> CalculateEstimatedCostAsync(
        ProductionOrder order,
        BillOfMaterial bom,
        Routing routing,
        CancellationToken cancellationToken = default)
    {
        var materialResult = CalculateMaterialCost(bom, order.PlannedQuantity);
        var operationDetails = new List<OperationCostDetail>();

        decimal totalLaborCost = 0;
        decimal totalMachineCost = 0;
        decimal totalOverheadCost = 0;
        decimal totalSetupCost = 0;

        foreach (var operation in routing.Operations.Where(o => o.IsActive))
        {
            var opCost = CalculateOperationCost(operation, order.PlannedQuantity);

            totalLaborCost += opCost.LaborCost;
            totalMachineCost += opCost.MachineCost;
            totalOverheadCost += opCost.OverheadCost;
            totalSetupCost += opCost.SetupCost;

            operationDetails.Add(new OperationCostDetail(
                operation.Sequence,
                operation.Name,
                operation.WorkCenter?.Name ?? "",
                operation.SetupTime + (operation.RunTime * order.PlannedQuantity),
                0, // Actual time - not available for estimate
                opCost.LaborCost,
                opCost.MachineCost,
                opCost.OverheadCost,
                opCost.TotalCost,
                0)); // No variance for estimate
        }

        var totalDirectCost = materialResult.TotalCost + totalLaborCost + totalMachineCost + totalSetupCost;
        var totalIndirectCost = totalOverheadCost;
        var totalCost = totalDirectCost + totalIndirectCost;
        var unitCost = order.PlannedQuantity > 0 ? totalCost / order.PlannedQuantity : 0;

        return await Task.FromResult(new ProductionCostEstimate(
            order.Id,
            order.OrderNumber,
            order.PlannedQuantity,
            materialResult.TotalCost,
            totalLaborCost,
            totalMachineCost,
            totalOverheadCost,
            0, // SubcontractCost
            totalSetupCost,
            totalDirectCost,
            totalIndirectCost,
            totalCost,
            unitCost,
            materialResult.Details,
            operationDetails,
            DateTime.UtcNow));
    }

    public async Task<ProductionCostActual> CalculateActualCostAsync(
        ProductionOrder order,
        IEnumerable<ProductionReceipt> receipts,
        CancellationToken cancellationToken = default)
    {
        var materialDetails = new List<MaterialCostDetail>();
        var operationDetails = new List<OperationCostDetail>();

        decimal materialCost = 0;
        decimal laborCost = 0;
        decimal machineCost = 0;
        decimal overheadCost = 0;
        decimal setupCost = 0;
        decimal scrapCost = 0;
        decimal reworkCost = 0;
        decimal completedQuantity = 0;

        foreach (var receipt in receipts)
        {
            completedQuantity += receipt.AcceptedQuantity;
            scrapCost += receipt.ScrapQuantity * (order.Routing?.TotalEstimatedCost ?? 0) / (order.PlannedQuantity > 0 ? order.PlannedQuantity : 1);

            // Operasyon maliyetlerini hesapla
            if (receipt.ProductionOperation != null)
            {
                var op = receipt.ProductionOperation;
                // Calculate actual time from operation's actual dates if available
                var actualTime = op.ActualStartDate.HasValue && op.ActualEndDate.HasValue
                    ? (decimal)(op.ActualEndDate.Value - op.ActualStartDate.Value).TotalMinutes
                    : 0;

                var opLaborCost = actualTime * (op.WorkCenter?.TotalHourlyCost ?? 0) / 60;
                var opMachineCost = actualTime * (op.Machine?.HourlyCost ?? 0) / 60;

                laborCost += opLaborCost;
                machineCost += opMachineCost;
            }
        }

        // Genel gider hesapla (toplam direkt maliyetin %20'si varsayımı)
        overheadCost = (laborCost + machineCost) * 0.20m;

        var totalDirectCost = materialCost + laborCost + machineCost + setupCost + scrapCost + reworkCost;
        var totalIndirectCost = overheadCost;
        var totalCost = totalDirectCost + totalIndirectCost;
        var unitCost = completedQuantity > 0 ? totalCost / completedQuantity : 0;

        return await Task.FromResult(new ProductionCostActual(
            order.Id,
            order.OrderNumber,
            completedQuantity,
            materialCost,
            laborCost,
            machineCost,
            overheadCost,
            0, // SubcontractCost
            setupCost,
            scrapCost,
            reworkCost,
            totalDirectCost,
            totalIndirectCost,
            totalCost,
            unitCost,
            materialDetails,
            operationDetails,
            DateTime.UtcNow));
    }

    public CostVarianceAnalysis AnalyzeCostVariance(
        ProductionCostEstimate estimated,
        ProductionCostActual actual)
    {
        var materialVariance = actual.MaterialCost - estimated.MaterialCost;
        var laborVariance = actual.LaborCost - estimated.LaborCost;
        var machineVariance = actual.MachineCost - estimated.MachineCost;
        var overheadVariance = actual.OverheadCost - estimated.OverheadCost;
        var totalVariance = actual.TotalCost - estimated.TotalCost;

        var materialVariancePercent = estimated.MaterialCost > 0 ? (materialVariance / estimated.MaterialCost) * 100 : 0;
        var laborVariancePercent = estimated.LaborCost > 0 ? (laborVariance / estimated.LaborCost) * 100 : 0;
        var machineVariancePercent = estimated.MachineCost > 0 ? (machineVariance / estimated.MachineCost) * 100 : 0;
        var overheadVariancePercent = estimated.OverheadCost > 0 ? (overheadVariance / estimated.OverheadCost) * 100 : 0;
        var totalVariancePercent = estimated.TotalCost > 0 ? (totalVariance / estimated.TotalCost) * 100 : 0;

        var reasons = new List<VarianceReason>();
        var recommendations = new List<string>();

        // Sapma analizi
        if (Math.Abs(materialVariancePercent) > 10)
        {
            reasons.Add(new VarianceReason(
                "Malzeme",
                materialVariance > 0 ? "Malzeme maliyeti beklenenin üzerinde" : "Malzeme maliyeti beklenenin altında",
                materialVariance,
                Math.Abs(materialVariancePercent) > 20 ? "Yüksek" : "Orta"));
        }

        if (Math.Abs(laborVariancePercent) > 10)
        {
            reasons.Add(new VarianceReason(
                "İşçilik",
                laborVariance > 0 ? "İşçilik süresi/maliyeti beklenenin üzerinde" : "İşçilik verimliliği yüksek",
                laborVariance,
                Math.Abs(laborVariancePercent) > 20 ? "Yüksek" : "Orta"));
        }

        // Genel değerlendirme
        var assessment = Math.Abs(totalVariancePercent) switch
        {
            < 5 => "İyi",
            < 10 => "Kabul Edilebilir",
            < 20 => "Dikkat Gerekli",
            _ => "Kritik"
        };

        if (totalVariance > 0)
        {
            recommendations.Add("Maliyet aşımının kök nedenlerini araştırın.");
            recommendations.Add("Gelecek üretimler için standart süreleri gözden geçirin.");
        }

        return new CostVarianceAnalysis(
            estimated.ProductionOrderId,
            materialVariance,
            laborVariance,
            machineVariance,
            overheadVariance,
            totalVariance,
            materialVariancePercent,
            laborVariancePercent,
            machineVariancePercent,
            overheadVariancePercent,
            totalVariancePercent,
            reasons,
            assessment,
            recommendations);
    }

    public decimal CalculateUnitCost(decimal totalCost, decimal completedQuantity)
    {
        return completedQuantity > 0 ? totalCost / completedQuantity : 0;
    }

    public OperationCostResult CalculateOperationCost(
        Operation operation,
        decimal quantity,
        Machine? machine = null)
    {
        var actualMachine = machine ?? operation.Machine;

        var setupCost = operation.SetupCost ?? 0;
        var runTime = operation.RunTime * quantity;
        var runCost = (operation.RunCost ?? 0) * quantity;

        var machineCost = actualMachine != null
            ? (operation.SetupTime + runTime) * (actualMachine.HourlyCost / 60)
            : (operation.MachineCost ?? 0) * quantity;

        var laborCost = operation.WorkCenter != null
            ? (operation.SetupTime + runTime) * (operation.WorkCenter.TotalHourlyCost / 60)
            : 0;

        var overheadCost = (operation.OverheadCost ?? 0) * quantity;

        var totalCost = setupCost + runCost + machineCost + laborCost + overheadCost;

        return new OperationCostResult(
            setupCost,
            runCost,
            machineCost,
            laborCost,
            overheadCost,
            totalCost);
    }

    public MaterialCostResult CalculateMaterialCost(BillOfMaterial bom, decimal quantity)
    {
        var details = new List<MaterialCostDetail>();
        decimal totalCost = 0;

        foreach (var line in bom.Lines.Where(l => l.IsActive))
        {
            var requiredQty = line.Quantity * quantity;
            var scrapAllowance = requiredQty * (line.ScrapRate / 100);
            var totalRequired = requiredQty + scrapAllowance;

            var unitCost = line.UnitCost ?? 0;
            var lineCost = totalRequired * unitCost;
            totalCost += lineCost;

            details.Add(new MaterialCostDetail(
                line.ComponentProductId,
                "", // MaterialCode - needs product service
                "", // MaterialName - needs product service
                totalRequired,
                0, // Actual quantity - not available
                unitCost,
                lineCost,
                0, // Actual cost - not available
                0)); // No variance
        }

        return new MaterialCostResult(totalCost, details);
    }
}
