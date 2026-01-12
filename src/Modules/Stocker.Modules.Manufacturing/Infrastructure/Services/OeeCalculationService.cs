using Stocker.Modules.Manufacturing.Domain.Entities;
using Stocker.Modules.Manufacturing.Domain.Services;

namespace Stocker.Modules.Manufacturing.Infrastructure.Services;

/// <summary>
/// OEE hesaplama servisi implementasyonu
/// </summary>
public class OeeCalculationService : IOeeCalculationService
{
    public OeeResult CalculateMachineOee(
        Machine machine,
        DateTime startDate,
        DateTime endDate,
        IEnumerable<ProductionOperation> operations,
        IEnumerable<MachineDowntime>? downtimes = null)
    {
        var machineOperations = operations.Where(o => o.MachineId == machine.Id).ToList();
        // MachineDowntime.MachineId is Guid, use Machine navigation property for filtering
        var machineDowntimes = downtimes?.Where(d => d.Machine?.Id == machine.Id).ToList() ?? new List<MachineDowntime>();

        // Planlanan üretim süresi (dakika)
        var totalDays = (endDate - startDate).TotalDays;
        var plannedProductionTime = (decimal)(totalDays * 8 * 60); // 8 saat/gün

        // Toplam duruş süresi
        var totalDowntime = machineDowntimes.Sum(d => d.DurationMinutes);

        // Gerçek çalışma süresi
        var actualRunTime = plannedProductionTime - totalDowntime;

        // Toplam üretilen parça
        decimal totalPieces = machineOperations.Sum(o => o.CompletedQuantity);
        decimal scrapPieces = machineOperations.Sum(o => o.ScrapQuantity);
        decimal reworkPieces = machineOperations.Sum(o => o.ReworkQuantity);
        decimal goodPieces = totalPieces - scrapPieces - reworkPieces;
        decimal defectPieces = scrapPieces + reworkPieces;

        // İdeal çevrim süresi (dakika/parça)
        var idealCycleTime = machine.HourlyCapacity > 0 ? 60 / machine.HourlyCapacity : 1;

        // Gerçek çevrim süresi
        var actualCycleTime = totalPieces > 0 && actualRunTime > 0 ? actualRunTime / totalPieces : idealCycleTime;

        // OEE hesaplamaları
        var availability = CalculateAvailability(plannedProductionTime, actualRunTime, totalDowntime);
        var performance = CalculatePerformance(idealCycleTime, actualCycleTime, totalPieces);
        var quality = CalculateQuality(totalPieces, goodPieces);
        var oee = (availability / 100) * (performance / 100) * (quality / 100) * 100;

        var oeeClass = GetOeeClass(oee);
        var suggestions = GenerateImprovementSuggestions(availability, performance, quality);

        return new OeeResult(
            availability,
            performance,
            quality,
            oee,
            plannedProductionTime,
            actualRunTime,
            idealCycleTime,
            actualCycleTime,
            totalDowntime,
            totalPieces,
            goodPieces,
            defectPieces,
            scrapPieces,
            oeeClass,
            suggestions,
            startDate,
            endDate);
    }

    public OeeResult CalculateWorkCenterOee(
        WorkCenter workCenter,
        DateTime startDate,
        DateTime endDate,
        IEnumerable<ProductionOperation> operations)
    {
        var wcOperations = operations.Where(o => o.Operation?.WorkCenterId == workCenter.Id).ToList();

        var totalDays = (endDate - startDate).TotalDays;
        var plannedProductionTime = (decimal)(totalDays * 8 * 60);

        decimal actualRunTime = wcOperations.Sum(o =>
        {
            if (o.ActualEndDate.HasValue && o.ActualStartDate.HasValue)
                return (decimal)(o.ActualEndDate.Value - o.ActualStartDate.Value).TotalMinutes;
            return 0;
        });

        decimal totalPieces = wcOperations.Sum(o => o.CompletedQuantity);
        decimal scrapPieces = wcOperations.Sum(o => o.ScrapQuantity);
        decimal reworkPieces = wcOperations.Sum(o => o.ReworkQuantity);
        decimal goodPieces = totalPieces - scrapPieces - reworkPieces;
        decimal defectPieces = scrapPieces + reworkPieces;

        // Use DailyCapacityHours to calculate hourly capacity
        var hourlyCapacity = workCenter.DailyCapacityHours / 8; // Assuming 8 hour day, convert to hourly
        var idealCycleTime = hourlyCapacity > 0 ? 60 / hourlyCapacity : 1;
        var actualCycleTime = totalPieces > 0 && actualRunTime > 0 ? actualRunTime / totalPieces : idealCycleTime;

        var availability = CalculateAvailability(plannedProductionTime, actualRunTime, 0);
        var performance = CalculatePerformance(idealCycleTime, actualCycleTime, totalPieces);
        var quality = CalculateQuality(totalPieces, goodPieces);
        var oee = (availability / 100) * (performance / 100) * (quality / 100) * 100;

        return new OeeResult(
            availability,
            performance,
            quality,
            oee,
            plannedProductionTime,
            actualRunTime,
            idealCycleTime,
            actualCycleTime,
            0,
            totalPieces,
            goodPieces,
            defectPieces,
            scrapPieces,
            GetOeeClass(oee),
            GenerateImprovementSuggestions(availability, performance, quality),
            startDate,
            endDate);
    }

    public OeeResult CalculateProductionOrderOee(
        ProductionOrder order,
        IEnumerable<ProductionOperation> operations)
    {
        var orderOperations = operations.Where(o => o.ProductionOrderId == order.Id).ToList();

        decimal plannedTime = 0;
        if (order.Routing != null)
        {
            plannedTime = order.Routing.Operations.Sum(op =>
                op.SetupTime + (op.RunTime * order.PlannedQuantity));
        }

        decimal actualRunTime = orderOperations.Sum(o =>
        {
            if (o.ActualEndDate.HasValue && o.ActualStartDate.HasValue)
                return (decimal)(o.ActualEndDate.Value - o.ActualStartDate.Value).TotalMinutes;
            return 0;
        });

        decimal totalPieces = order.CompletedQuantity;
        decimal scrapPieces = order.ScrapQuantity;
        decimal reworkPieces = order.ReworkQuantity;
        decimal goodPieces = totalPieces - scrapPieces - reworkPieces;
        decimal defectPieces = scrapPieces + reworkPieces;

        var idealCycleTime = order.PlannedQuantity > 0 && plannedTime > 0 ? plannedTime / order.PlannedQuantity : 1;
        var actualCycleTime = totalPieces > 0 && actualRunTime > 0 ? actualRunTime / totalPieces : idealCycleTime;

        var availability = CalculateAvailability(plannedTime, actualRunTime, 0);
        var performance = CalculatePerformance(idealCycleTime, actualCycleTime, totalPieces);
        var quality = CalculateQuality(totalPieces, goodPieces);
        var oee = (availability / 100) * (performance / 100) * (quality / 100) * 100;

        return new OeeResult(
            availability,
            performance,
            quality,
            oee,
            plannedTime,
            actualRunTime,
            idealCycleTime,
            actualCycleTime,
            0,
            totalPieces,
            goodPieces,
            defectPieces,
            scrapPieces,
            GetOeeClass(oee),
            GenerateImprovementSuggestions(availability, performance, quality),
            order.ActualStartDate ?? order.PlannedStartDate,
            order.ActualEndDate ?? order.PlannedEndDate);
    }

    public decimal CalculateAvailability(decimal plannedProductionTime, decimal actualRunTime, decimal downtime)
    {
        if (plannedProductionTime <= 0) return 0;

        var availableTime = plannedProductionTime - downtime;
        return Math.Min(100, (availableTime / plannedProductionTime) * 100);
    }

    public decimal CalculatePerformance(decimal idealCycleTime, decimal actualCycleTime, decimal totalPieces)
    {
        if (actualCycleTime <= 0 || totalPieces <= 0) return 0;

        var idealTime = idealCycleTime * totalPieces;
        var actualTime = actualCycleTime * totalPieces;

        return Math.Min(100, (idealTime / actualTime) * 100);
    }

    public decimal CalculateQuality(decimal totalPieces, decimal goodPieces)
    {
        if (totalPieces <= 0) return 0;

        return Math.Min(100, (goodPieces / totalPieces) * 100);
    }

    public OeeTrendAnalysis AnalyzeTrend(IEnumerable<OeeResult> historicalData, int periodDays = 30)
    {
        var dataList = historicalData.OrderBy(d => d.PeriodStart).ToList();

        if (!dataList.Any())
        {
            return new OeeTrendAnalysis(
                0, 0, 0, 0, "Veri Yok", 0,
                new List<PeriodOee>(),
                new List<string> { "Yeterli veri yok" },
                new List<string>());
        }

        var oeeValues = dataList.Select(d => d.Oee).ToList();
        var average = oeeValues.Average();
        var min = oeeValues.Min();
        var max = oeeValues.Max();

        // Standart sapma
        var variance = oeeValues.Sum(v => Math.Pow((double)(v - average), 2)) / oeeValues.Count;
        var stdDev = (decimal)Math.Sqrt(variance);

        // Trend analizi (basit lineer regresyon eğimi)
        var slope = CalculateTrendSlope(oeeValues);
        var trendDirection = slope > 0.5m ? "Yükselen" : slope < -0.5m ? "Düşen" : "Stabil";

        var periodData = dataList.Select(d => new PeriodOee(
            d.PeriodStart,
            d.Oee,
            d.Availability,
            d.Performance,
            d.Quality)).ToList();

        var insights = new List<string>();
        var recommendations = new List<string>();

        if (average < 60)
        {
            insights.Add("OEE ortalaması dünya sınıfı seviyenin (%85) altında.");
            recommendations.Add("Temel kayıp kategorilerini analiz edin.");
        }

        if (stdDev > 10)
        {
            insights.Add("OEE değerlerinde yüksek değişkenlik mevcut.");
            recommendations.Add("Tutarlılığı artırmak için süreç standardizasyonu yapın.");
        }

        if (trendDirection == "Düşen")
        {
            insights.Add("OEE trendi düşüş eğiliminde.");
            recommendations.Add("Son değişiklikleri gözden geçirin ve iyileştirme planı oluşturun.");
        }

        return new OeeTrendAnalysis(
            average,
            min,
            max,
            stdDev,
            trendDirection,
            slope,
            periodData,
            insights,
            recommendations);
    }

    public LossAnalysis AnalyzeLosses(
        Machine machine,
        DateTime startDate,
        DateTime endDate,
        IEnumerable<ProductionOperation> operations,
        IEnumerable<MachineDowntime>? downtimes = null)
    {
        // MachineDowntime.MachineId is Guid, use Machine navigation property for filtering
        var machineDowntimes = downtimes?.Where(d => d.Machine?.Id == machine.Id).ToList() ?? new List<MachineDowntime>();
        var machineOperations = operations.Where(o => o.MachineId == machine.Id).ToList();

        // Altı büyük kayıp hesaplaması
        decimal equipmentFailure = machineDowntimes
            .Where(d => d.DowntimeReason == "Arıza")
            .Sum(d => d.DurationMinutes);

        decimal setupAndAdjustment = machineDowntimes
            .Where(d => d.DowntimeReason == "Kurulum" || d.DowntimeReason == "Ayar")
            .Sum(d => d.DurationMinutes);

        decimal idlingAndMinorStops = machineDowntimes
            .Where(d => d.DowntimeType == "Plansız" && d.DurationMinutes < 10)
            .Sum(d => d.DurationMinutes);

        // Hız kaybı (ideal vs gerçek)
        decimal reducedSpeed = 0;
        var idealCycleTime = machine.HourlyCapacity > 0 ? 60 / machine.HourlyCapacity : 1;
        foreach (var op in machineOperations)
        {
            if (op.ActualEndDate.HasValue && op.ActualStartDate.HasValue && op.CompletedQuantity > 0)
            {
                var actualTime = (decimal)(op.ActualEndDate.Value - op.ActualStartDate.Value).TotalMinutes;
                var actualCycleTime = actualTime / op.CompletedQuantity;
                if (actualCycleTime > idealCycleTime)
                {
                    reducedSpeed += (actualCycleTime - idealCycleTime) * op.CompletedQuantity;
                }
            }
        }

        // Kalite kayıpları - use ReworkQuantity as defects since there's no RejectedQuantity
        decimal processDefects = machineOperations.Sum(o => o.ReworkQuantity) * idealCycleTime;
        decimal reducedYield = machineOperations.Sum(o => o.ScrapQuantity) * idealCycleTime;

        var totalLossTime = equipmentFailure + setupAndAdjustment + idlingAndMinorStops +
                           reducedSpeed + processDefects + reducedYield;

        var totalDays = (endDate - startDate).TotalDays;
        var plannedTime = (decimal)(totalDays * 8 * 60);
        var totalLossPercent = plannedTime > 0 ? (totalLossTime / plannedTime) * 100 : 0;

        // Pareto sıralaması
        var losses = new List<LossItem>
        {
            new("Ekipman Arızası", "Plansız makine duruşları", equipmentFailure, totalLossTime > 0 ? (equipmentFailure / totalLossTime) * 100 : 0, 0, "Yüksek"),
            new("Kurulum ve Ayar", "Kalıp değişimi, ayar süreleri", setupAndAdjustment, totalLossTime > 0 ? (setupAndAdjustment / totalLossTime) * 100 : 0, 0, "Orta"),
            new("Boşta Kalma", "Küçük duruşlar ve bekleme", idlingAndMinorStops, totalLossTime > 0 ? (idlingAndMinorStops / totalLossTime) * 100 : 0, 0, "Düşük"),
            new("Hız Düşüşü", "İdeal hızın altında çalışma", reducedSpeed, totalLossTime > 0 ? (reducedSpeed / totalLossTime) * 100 : 0, 0, "Orta"),
            new("Proses Hataları", "Kalite hataları ve reddedilen ürünler", processDefects, totalLossTime > 0 ? (processDefects / totalLossTime) * 100 : 0, 0, "Yüksek"),
            new("Başlangıç Kayıpları", "İlk parça hataları ve fire", reducedYield, totalLossTime > 0 ? (reducedYield / totalLossTime) * 100 : 0, 0, "Düşük")
        };

        // Kümülatif yüzde hesapla
        losses = losses.OrderByDescending(l => l.LossTime).ToList();
        decimal cumulative = 0;
        for (int i = 0; i < losses.Count; i++)
        {
            cumulative += losses[i].LossPercent;
            losses[i] = losses[i] with { CumulativePercent = cumulative };
        }

        // İyileştirme fırsatları
        var reductionOpportunities = new List<LossReduction>();
        if (equipmentFailure > 60)
        {
            reductionOpportunities.Add(new LossReduction(
                "Ekipman Arızası",
                "Önleyici bakım programı uygulayın",
                equipmentFailure * 0.3m,
                (equipmentFailure * 0.3m / plannedTime) * 100,
                "Orta",
                "Orta vadeli"));
        }

        if (setupAndAdjustment > 30)
        {
            reductionOpportunities.Add(new LossReduction(
                "Kurulum ve Ayar",
                "SMED (Tek Dakikada Kalıp Değişimi) uygulayın",
                setupAndAdjustment * 0.5m,
                (setupAndAdjustment * 0.5m / plannedTime) * 100,
                "Kolay",
                "Kısa vadeli"));
        }

        return new LossAnalysis(
            equipmentFailure,
            setupAndAdjustment,
            idlingAndMinorStops,
            reducedSpeed,
            processDefects,
            reducedYield,
            totalLossTime,
            totalLossPercent,
            losses,
            reductionOpportunities);
    }

    private static string GetOeeClass(decimal oee)
    {
        return oee switch
        {
            >= 85 => "World Class (Dünya Sınıfı)",
            >= 75 => "Good (İyi)",
            >= 60 => "Average (Orta)",
            _ => "Poor (Zayıf)"
        };
    }

    private static List<string> GenerateImprovementSuggestions(decimal availability, decimal performance, decimal quality)
    {
        var suggestions = new List<string>();

        if (availability < 90)
        {
            suggestions.Add("Kullanılabilirliği artırmak için duruş nedenlerini analiz edin.");
            suggestions.Add("Önleyici bakım programını gözden geçirin.");
        }

        if (performance < 95)
        {
            suggestions.Add("Performans düşüşünün nedenlerini araştırın.");
            suggestions.Add("Makine hızı optimizasyonu yapın.");
        }

        if (quality < 99)
        {
            suggestions.Add("Kalite hatalarının kök nedenlerini belirleyin.");
            suggestions.Add("Proses kontrol sistemini güçlendirin.");
        }

        if (!suggestions.Any())
        {
            suggestions.Add("OEE değerleri hedef seviyede, mevcut performansı koruyun.");
        }

        return suggestions;
    }

    private static decimal CalculateTrendSlope(List<decimal> values)
    {
        if (values.Count < 2) return 0;

        var n = values.Count;
        var sumX = (decimal)Enumerable.Range(0, n).Sum();
        var sumY = values.Sum();
        var sumXY = values.Select((v, i) => v * i).Sum();
        var sumX2 = (decimal)Enumerable.Range(0, n).Sum(i => i * i);

        var denominator = n * sumX2 - sumX * sumX;
        if (denominator == 0) return 0;

        return (n * sumXY - sumX * sumY) / denominator;
    }
}
