using Stocker.Modules.Manufacturing.Domain.Entities;
using Stocker.Modules.Manufacturing.Domain.Services;

namespace Stocker.Modules.Manufacturing.Infrastructure.Services;

/// <summary>
/// Üretim planlama servisi implementasyonu
/// </summary>
public class ProductionPlanningService : IProductionPlanningService
{
    public async Task<ProductionScheduleResult> ScheduleProductionOrderAsync(
        ProductionOrder order,
        IEnumerable<Machine> availableMachines,
        IEnumerable<WorkCenter> workCenters,
        CancellationToken cancellationToken = default)
    {
        var routing = order.Routing;
        if (routing == null)
            throw new InvalidOperationException("Üretim emri için rota tanımlı değil.");

        var operationSchedules = new List<OperationSchedule>();
        var warnings = new List<string>();
        var currentDate = order.PlannedStartDate;
        decimal totalSetupTime = 0;
        decimal totalRunTime = 0;

        foreach (var operation in routing.Operations.OrderBy(o => o.Sequence))
        {
            var workCenter = workCenters.FirstOrDefault(w => w.Id == operation.WorkCenterId);
            if (workCenter == null)
            {
                warnings.Add($"Operasyon {operation.Sequence} için iş merkezi bulunamadı.");
                continue;
            }

            Machine? selectedMachine = null;
            if (operation.MachineId.HasValue)
            {
                selectedMachine = availableMachines.FirstOrDefault(m => m.Id == operation.MachineId.Value);
            }
            else
            {
                // İş merkezindeki uygun bir makine seç
                selectedMachine = availableMachines
                    .Where(m => m.WorkCenterId == workCenter.Id && m.IsActive)
                    .OrderByDescending(m => m.EfficiencyRate)
                    .FirstOrDefault();
            }

            var setupTime = operation.SetupTime;
            var runTime = operation.RunTime * order.PlannedQuantity;
            var queueTime = operation.QueueTime;
            var moveTime = operation.MoveTime;

            var operationDuration = setupTime + runTime + queueTime + moveTime;
            var plannedStart = currentDate;
            var plannedEnd = currentDate.AddMinutes((double)operationDuration);

            operationSchedules.Add(new OperationSchedule(
                operation.Sequence,
                operation.Name,
                workCenter.Id,
                workCenter.Name,
                selectedMachine?.Id,
                selectedMachine?.Name,
                plannedStart,
                plannedEnd,
                setupTime,
                runTime));

            totalSetupTime += setupTime;
            totalRunTime += runTime;
            currentDate = plannedEnd;
        }

        var totalLeadTime = (decimal)(currentDate - order.PlannedStartDate).TotalMinutes;

        return await Task.FromResult(new ProductionScheduleResult(
            order.PlannedStartDate,
            currentDate,
            totalSetupTime,
            totalRunTime,
            totalLeadTime,
            operationSchedules,
            warnings));
    }

    public DateTime CalculateStartDate(
        ProductionOrder order,
        Routing routing,
        IEnumerable<Machine> machines)
    {
        var totalTime = CalculateTotalProductionTime(routing, order.PlannedQuantity);

        // Geriye doğru hesapla
        return order.PlannedEndDate.AddMinutes(-(double)totalTime);
    }

    public decimal CalculateTotalProductionTime(Routing routing, decimal quantity)
    {
        decimal totalTime = 0;

        foreach (var operation in routing.Operations)
        {
            totalTime += operation.SetupTime;
            totalTime += operation.RunTime * quantity;
            totalTime += operation.QueueTime;
            totalTime += operation.MoveTime;
        }

        return totalTime;
    }

    public WorkCenterLoadResult CalculateWorkCenterLoad(
        WorkCenter workCenter,
        DateTime startDate,
        DateTime endDate,
        IEnumerable<ProductionOrder> orders)
    {
        var totalDays = (endDate - startDate).TotalDays;
        var totalCapacity = (decimal)(totalDays * 8 * 60); // 8 saat/gün, dakika cinsinden

        decimal plannedLoad = 0;
        var dailyLoads = new List<DailyLoad>();

        // Günlük yük hesapla
        for (var date = startDate.Date; date <= endDate.Date; date = date.AddDays(1))
        {
            var dayOrders = orders.Where(o =>
                o.PlannedStartDate.Date <= date &&
                o.PlannedEndDate.Date >= date);

            decimal dayLoad = 0;
            foreach (var order in dayOrders)
            {
                if (order.Routing != null)
                {
                    var wcOperations = order.Routing.Operations
                        .Where(op => op.WorkCenterId == workCenter.Id);

                    foreach (var op in wcOperations)
                    {
                        dayLoad += op.SetupTime + (op.RunTime * order.PlannedQuantity);
                    }
                }
            }

            var dayCapacity = 8m * 60; // 8 saat = 480 dakika
            var utilization = dayCapacity > 0 ? (dayLoad / dayCapacity) * 100 : 0;

            dailyLoads.Add(new DailyLoad(date, dayLoad, dayCapacity, utilization));
            plannedLoad += dayLoad;
        }

        var overallUtilization = totalCapacity > 0 ? (plannedLoad / totalCapacity) * 100 : 0;
        var availableCapacity = totalCapacity - plannedLoad;

        return new WorkCenterLoadResult(
            workCenter.Id,
            workCenter.Name,
            totalCapacity,
            plannedLoad,
            overallUtilization,
            availableCapacity,
            dailyLoads);
    }

    public IEnumerable<BottleneckInfo> AnalyzeBottlenecks(
        IEnumerable<WorkCenter> workCenters,
        IEnumerable<ProductionOrder> orders,
        DateTime analysisDate)
    {
        var bottlenecks = new List<BottleneckInfo>();
        var endDate = analysisDate.AddDays(30);

        foreach (var workCenter in workCenters)
        {
            var load = CalculateWorkCenterLoad(workCenter, analysisDate, endDate, orders);

            if (load.UtilizationRate > 80) // 80% üzerinde yük var
            {
                var severity = load.UtilizationRate switch
                {
                    > 100 => "Kritik",
                    > 95 => "Yüksek",
                    > 90 => "Orta",
                    _ => "Düşük"
                };

                var overload = load.UtilizationRate > 100
                    ? load.PlannedLoadMinutes - load.TotalCapacityMinutes
                    : 0;

                var affectedOrders = orders
                    .Where(o => o.Routing?.Operations.Any(op => op.WorkCenterId == workCenter.Id) == true)
                    .Select(o => o.Id)
                    .ToList();

                bottlenecks.Add(new BottleneckInfo(
                    workCenter.Id,
                    workCenter.Name,
                    load.UtilizationRate,
                    overload,
                    severity,
                    affectedOrders));
            }
        }

        return bottlenecks.OrderByDescending(b => b.UtilizationRate);
    }

    public async Task<MrpResult> CalculateMaterialRequirementsAsync(
        ProductionOrder order,
        BillOfMaterial bom,
        CancellationToken cancellationToken = default)
    {
        var requirements = new List<MaterialRequirement>();
        var shortages = new List<MaterialShortage>();
        decimal totalCost = 0;

        foreach (var line in bom.Lines.Where(l => l.IsActive))
        {
            var requiredQty = line.Quantity * order.PlannedQuantity;
            var scrapAllowance = requiredQty * (line.ScrapRate / 100);
            var totalRequired = requiredQty + scrapAllowance;

            // Not: Gerçek stok bilgisi Inventory modülünden alınmalı
            var currentStock = 0m; // Placeholder
            var availableStock = 0m; // Placeholder
            var shortage = Math.Max(0, totalRequired - availableStock);

            var unitCost = line.UnitCost ?? 0;
            var lineCost = totalRequired * unitCost;
            totalCost += lineCost;

            requirements.Add(new MaterialRequirement(
                line.ComponentProductId,
                "", // MaterialCode - needs product service
                "", // MaterialName - needs product service
                totalRequired,
                line.Unit,
                order.PlannedStartDate,
                currentStock,
                availableStock,
                shortage,
                unitCost,
                lineCost));

            if (shortage > 0)
            {
                shortages.Add(new MaterialShortage(
                    line.ComponentProductId,
                    "", // MaterialCode - needs product service
                    "",
                    shortage,
                    line.Unit,
                    order.PlannedStartDate,
                    "Satınalma")); // Default suggestion
            }
        }

        return await Task.FromResult(new MrpResult(requirements, shortages, totalCost));
    }
}
