using Stocker.Domain.Common.ValueObjects;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Primitives;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Domain.Entities;

/// <summary>
/// Satış Hedefi - Satış temsilcisi kota ve hedef takibi
/// Sales Target - Sales representative quota and target tracking
/// </summary>
public class SalesTarget : TenantAggregateRoot
{
    private readonly List<SalesTargetPeriod> _periods = new();
    private readonly List<SalesTargetProduct> _productTargets = new();
    private readonly List<SalesTargetAchievement> _achievements = new();

    public string TargetCode { get; private set; } = string.Empty;
    public string Name { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public SalesTargetType TargetType { get; private set; }
    public TargetPeriodType PeriodType { get; private set; }
    public int Year { get; private set; }
    public Guid? SalesRepresentativeId { get; private set; }
    public string? SalesRepresentativeName { get; private set; }
    public Guid? SalesTeamId { get; private set; }
    public string? SalesTeamName { get; private set; }
    public Guid? SalesTerritoryId { get; private set; }
    public string? SalesTerritoryName { get; private set; }
    public Money TotalTargetAmount { get; private set; } = null!;
    public Money TotalActualAmount { get; private set; } = null!;
    public TargetMetricType MetricType { get; private set; }
    public decimal? TargetQuantity { get; private set; }
    public decimal? ActualQuantity { get; private set; }
    public decimal MinimumAchievementPercentage { get; private set; }
    public SalesTargetStatus Status { get; private set; }
    public Guid? ParentTargetId { get; private set; }
    public string? Notes { get; private set; }

    public IReadOnlyCollection<SalesTargetPeriod> Periods => _periods.AsReadOnly();
    public IReadOnlyCollection<SalesTargetProduct> ProductTargets => _productTargets.AsReadOnly();
    public IReadOnlyCollection<SalesTargetAchievement> Achievements => _achievements.AsReadOnly();

    private SalesTarget() { }

    public static Result<SalesTarget> Create(
        Guid tenantId,
        string targetCode,
        string name,
        SalesTargetType targetType,
        TargetPeriodType periodType,
        int year,
        Money totalTargetAmount,
        TargetMetricType metricType = TargetMetricType.Revenue,
        decimal minimumAchievementPercentage = 70,
        string? description = null)
    {
        if (string.IsNullOrWhiteSpace(targetCode))
            return Result<SalesTarget>.Failure(Error.Validation("SalesTarget.Code", "Hedef kodu boş olamaz."));

        if (string.IsNullOrWhiteSpace(name))
            return Result<SalesTarget>.Failure(Error.Validation("SalesTarget.Name", "Hedef adı boş olamaz."));

        if (totalTargetAmount.Amount <= 0)
            return Result<SalesTarget>.Failure(Error.Validation("SalesTarget.Amount", "Hedef tutarı pozitif olmalıdır."));

        var target = new SalesTarget();
        target.Id = Guid.NewGuid();
        target.SetTenantId(tenantId);
        target.TargetCode = targetCode.ToUpperInvariant();
        target.Name = name;
        target.Description = description;
        target.TargetType = targetType;
        target.PeriodType = periodType;
        target.Year = year;
        target.TotalTargetAmount = totalTargetAmount;
        target.TotalActualAmount = Money.Zero(totalTargetAmount.Currency);
        target.MetricType = metricType;
        target.MinimumAchievementPercentage = minimumAchievementPercentage;
        target.Status = SalesTargetStatus.Draft;

        return Result<SalesTarget>.Success(target);
    }

    public Result AssignToSalesRepresentative(Guid salesRepId, string salesRepName)
    {
        if (TargetType != SalesTargetType.Individual)
            return Result.Failure(Error.Conflict("SalesTarget.Type", "Bu hedef türü bireysel değil."));

        SalesRepresentativeId = salesRepId;
        SalesRepresentativeName = salesRepName;
        return Result.Success();
    }

    public Result AssignToSalesTeam(Guid teamId, string teamName)
    {
        if (TargetType != SalesTargetType.Team)
            return Result.Failure(Error.Conflict("SalesTarget.Type", "Bu hedef türü takım değil."));

        SalesTeamId = teamId;
        SalesTeamName = teamName;
        return Result.Success();
    }

    public Result AssignToTerritory(Guid territoryId, string territoryName)
    {
        if (TargetType != SalesTargetType.Territory)
            return Result.Failure(Error.Conflict("SalesTarget.Type", "Bu hedef türü bölge değil."));

        SalesTerritoryId = territoryId;
        SalesTerritoryName = territoryName;
        return Result.Success();
    }

    public Result<SalesTargetPeriod> AddPeriod(int periodNumber, DateTime startDate, DateTime endDate, Money targetAmount, decimal? targetQuantity = null)
    {
        if (_periods.Any(p => p.PeriodNumber == periodNumber))
            return Result<SalesTargetPeriod>.Failure(Error.Conflict("SalesTarget.Period", $"Dönem {periodNumber} zaten mevcut."));

        var period = SalesTargetPeriod.Create(Id, periodNumber, startDate, endDate, targetAmount, targetQuantity);
        if (!period.IsSuccess)
            return period;

        _periods.Add(period.Value!);
        return period;
    }

    public Result GeneratePeriods()
    {
        if (_periods.Any())
            return Result.Failure(Error.Conflict("SalesTarget.Periods", "Dönemler zaten oluşturulmuş."));

        var periodsToCreate = PeriodType switch
        {
            TargetPeriodType.Monthly => 12,
            TargetPeriodType.Quarterly => 4,
            TargetPeriodType.SemiAnnual => 2,
            TargetPeriodType.Annual => 1,
            _ => 0
        };

        if (periodsToCreate == 0)
            return Result.Failure(Error.Validation("SalesTarget.PeriodType", "Geçersiz dönem türü."));

        var periodAmount = Money.Create(Math.Round(TotalTargetAmount.Amount / periodsToCreate, 2), TotalTargetAmount.Currency);
        var periodQuantity = TargetQuantity.HasValue ? Math.Round(TargetQuantity.Value / periodsToCreate, 2) : (decimal?)null;

        for (int i = 1; i <= periodsToCreate; i++)
        {
            var (startDate, endDate) = GetPeriodDates(i);
            var result = AddPeriod(i, startDate, endDate, periodAmount, periodQuantity);
            if (!result.IsSuccess)
                return Result.Failure(result.Error);
        }

        return Result.Success();
    }

    private (DateTime startDate, DateTime endDate) GetPeriodDates(int periodNumber)
    {
        return PeriodType switch
        {
            TargetPeriodType.Monthly => (
                new DateTime(Year, periodNumber, 1),
                new DateTime(Year, periodNumber, DateTime.DaysInMonth(Year, periodNumber))),
            TargetPeriodType.Quarterly => (
                new DateTime(Year, (periodNumber - 1) * 3 + 1, 1),
                new DateTime(Year, periodNumber * 3, DateTime.DaysInMonth(Year, periodNumber * 3))),
            TargetPeriodType.SemiAnnual => (
                new DateTime(Year, (periodNumber - 1) * 6 + 1, 1),
                new DateTime(Year, periodNumber * 6, DateTime.DaysInMonth(Year, periodNumber * 6))),
            TargetPeriodType.Annual => (
                new DateTime(Year, 1, 1),
                new DateTime(Year, 12, 31)),
            _ => throw new InvalidOperationException()
        };
    }

    public Result<SalesTargetProduct> AddProductTarget(Guid productId, string productCode, string productName, Money targetAmount, decimal? targetQuantity = null, decimal weight = 1)
    {
        if (_productTargets.Any(p => p.ProductId == productId))
            return Result<SalesTargetProduct>.Failure(Error.Conflict("SalesTarget.Product", "Bu ürün için hedef zaten mevcut."));

        var productTarget = SalesTargetProduct.Create(Id, productId, productCode, productName, targetAmount, targetQuantity, weight);
        if (!productTarget.IsSuccess)
            return productTarget;

        _productTargets.Add(productTarget.Value!);
        return productTarget;
    }

    public Result<SalesTargetAchievement> RecordAchievement(
        DateTime achievementDate, Money amount, decimal? quantity = null,
        Guid? salesOrderId = null, Guid? invoiceId = null, Guid? productId = null, Guid? customerId = null)
    {
        var achievement = SalesTargetAchievement.Create(Id, achievementDate, amount, quantity, salesOrderId, invoiceId, productId, customerId);
        if (!achievement.IsSuccess)
            return achievement;

        _achievements.Add(achievement.Value!);
        TotalActualAmount = TotalActualAmount.Add(amount);
        if (quantity.HasValue && ActualQuantity.HasValue)
            ActualQuantity += quantity.Value;

        var period = _periods.FirstOrDefault(p => achievementDate >= p.StartDate && achievementDate <= p.EndDate);
        period?.RecordAchievement(amount, quantity);

        if (productId.HasValue)
        {
            var productTarget = _productTargets.FirstOrDefault(p => p.ProductId == productId);
            productTarget?.RecordAchievement(amount, quantity);
        }

        return achievement;
    }

    public Result Activate()
    {
        if (Status != SalesTargetStatus.Draft)
            return Result.Failure(Error.Conflict("SalesTarget.Status", "Sadece taslak hedefler aktifleştirilebilir."));

        if (!_periods.Any())
            return Result.Failure(Error.Validation("SalesTarget.Periods", "Dönemler oluşturulmadan hedef aktifleştirilemez."));

        Status = SalesTargetStatus.Active;
        return Result.Success();
    }

    public Result Close()
    {
        if (Status != SalesTargetStatus.Active)
            return Result.Failure(Error.Conflict("SalesTarget.Status", "Sadece aktif hedefler kapatılabilir."));

        Status = GetAchievementPercentage() >= MinimumAchievementPercentage
            ? SalesTargetStatus.Achieved
            : SalesTargetStatus.NotAchieved;

        return Result.Success();
    }

    public Result Cancel(string reason)
    {
        if (Status == SalesTargetStatus.Cancelled)
            return Result.Failure(Error.Conflict("SalesTarget.Status", "Hedef zaten iptal edilmiş."));

        Status = SalesTargetStatus.Cancelled;
        Notes = $"{Notes}\n[{DateTime.UtcNow:yyyy-MM-dd}] İptal nedeni: {reason}";
        return Result.Success();
    }

    public decimal GetAchievementPercentage()
    {
        if (TotalTargetAmount.Amount == 0) return 0;
        return Math.Round(TotalActualAmount.Amount / TotalTargetAmount.Amount * 100, 2);
    }

    public Money GetRemainingAmount()
    {
        var remaining = TotalTargetAmount.Amount - TotalActualAmount.Amount;
        return Money.Create(Math.Max(0, remaining), TotalTargetAmount.Currency);
    }

    public TargetForecast GetForecast()
    {
        var currentDate = DateTime.UtcNow;
        var yearStart = new DateTime(Year, 1, 1);
        var yearEnd = new DateTime(Year, 12, 31);

        if (currentDate > yearEnd)
            return GetAchievementPercentage() >= 100 ? TargetForecast.Achieved : TargetForecast.NotAchieved;

        var daysElapsed = (currentDate - yearStart).Days;
        var totalDays = (yearEnd - yearStart).Days;
        var expectedPercentage = (decimal)daysElapsed / totalDays * 100;
        var actualPercentage = GetAchievementPercentage();

        if (actualPercentage >= 100) return TargetForecast.Achieved;
        if (actualPercentage >= expectedPercentage * 1.1m) return TargetForecast.OnTrack;
        if (actualPercentage >= expectedPercentage * 0.9m) return TargetForecast.AtRisk;
        return TargetForecast.BehindTarget;
    }
}

public class SalesTargetPeriod : Entity<Guid>
{
    public Guid SalesTargetId { get; private set; }
    public int PeriodNumber { get; private set; }
    public DateTime StartDate { get; private set; }
    public DateTime EndDate { get; private set; }
    public Money TargetAmount { get; private set; } = null!;
    public Money ActualAmount { get; private set; } = null!;
    public decimal? TargetQuantity { get; private set; }
    public decimal? ActualQuantity { get; private set; }

    private SalesTargetPeriod() { }

    internal static Result<SalesTargetPeriod> Create(Guid salesTargetId, int periodNumber, DateTime startDate, DateTime endDate, Money targetAmount, decimal? targetQuantity)
    {
        if (endDate <= startDate)
            return Result<SalesTargetPeriod>.Failure(Error.Validation("SalesTargetPeriod.Dates", "Bitiş tarihi başlangıç tarihinden sonra olmalıdır."));

        var period = new SalesTargetPeriod
        {
            Id = Guid.NewGuid(),
            SalesTargetId = salesTargetId,
            PeriodNumber = periodNumber,
            StartDate = startDate,
            EndDate = endDate,
            TargetAmount = targetAmount,
            ActualAmount = Money.Zero(targetAmount.Currency),
            TargetQuantity = targetQuantity,
            ActualQuantity = targetQuantity.HasValue ? 0 : null
        };

        return Result<SalesTargetPeriod>.Success(period);
    }

    internal void RecordAchievement(Money amount, decimal? quantity)
    {
        ActualAmount = ActualAmount.Add(amount);
        if (quantity.HasValue && ActualQuantity.HasValue)
            ActualQuantity += quantity.Value;
    }

    public decimal GetAchievementPercentage()
    {
        if (TargetAmount.Amount == 0) return 0;
        return Math.Round(ActualAmount.Amount / TargetAmount.Amount * 100, 2);
    }
}

public class SalesTargetProduct : Entity<Guid>
{
    public Guid SalesTargetId { get; private set; }
    public Guid ProductId { get; private set; }
    public string ProductCode { get; private set; } = string.Empty;
    public string ProductName { get; private set; } = string.Empty;
    public Money TargetAmount { get; private set; } = null!;
    public Money ActualAmount { get; private set; } = null!;
    public decimal? TargetQuantity { get; private set; }
    public decimal? ActualQuantity { get; private set; }
    public decimal Weight { get; private set; }

    private SalesTargetProduct() { }

    internal static Result<SalesTargetProduct> Create(Guid salesTargetId, Guid productId, string productCode, string productName, Money targetAmount, decimal? targetQuantity, decimal weight)
    {
        if (targetAmount.Amount < 0)
            return Result<SalesTargetProduct>.Failure(Error.Validation("SalesTargetProduct.Amount", "Hedef tutarı negatif olamaz."));

        var productTarget = new SalesTargetProduct
        {
            Id = Guid.NewGuid(),
            SalesTargetId = salesTargetId,
            ProductId = productId,
            ProductCode = productCode,
            ProductName = productName,
            TargetAmount = targetAmount,
            ActualAmount = Money.Zero(targetAmount.Currency),
            TargetQuantity = targetQuantity,
            ActualQuantity = targetQuantity.HasValue ? 0 : null,
            Weight = weight
        };

        return Result<SalesTargetProduct>.Success(productTarget);
    }

    internal void RecordAchievement(Money amount, decimal? quantity)
    {
        ActualAmount = ActualAmount.Add(amount);
        if (quantity.HasValue && ActualQuantity.HasValue)
            ActualQuantity += quantity.Value;
    }

    public decimal GetAchievementPercentage()
    {
        if (TargetAmount.Amount == 0) return 0;
        return Math.Round(ActualAmount.Amount / TargetAmount.Amount * 100, 2);
    }
}

public class SalesTargetAchievement : Entity<Guid>
{
    public Guid SalesTargetId { get; private set; }
    public DateTime AchievementDate { get; private set; }
    public Money Amount { get; private set; } = null!;
    public decimal? Quantity { get; private set; }
    public Guid? SalesOrderId { get; private set; }
    public Guid? InvoiceId { get; private set; }
    public Guid? ProductId { get; private set; }
    public Guid? CustomerId { get; private set; }
    public DateTime RecordedAt { get; private set; }

    private SalesTargetAchievement() { }

    internal static Result<SalesTargetAchievement> Create(
        Guid salesTargetId, DateTime achievementDate, Money amount, decimal? quantity,
        Guid? salesOrderId, Guid? invoiceId, Guid? productId, Guid? customerId)
    {
        if (amount.Amount < 0)
            return Result<SalesTargetAchievement>.Failure(Error.Validation("SalesTargetAchievement.Amount", "Tutar negatif olamaz."));

        var achievement = new SalesTargetAchievement
        {
            Id = Guid.NewGuid(),
            SalesTargetId = salesTargetId,
            AchievementDate = achievementDate,
            Amount = amount,
            Quantity = quantity,
            SalesOrderId = salesOrderId,
            InvoiceId = invoiceId,
            ProductId = productId,
            CustomerId = customerId,
            RecordedAt = DateTime.UtcNow
        };

        return Result<SalesTargetAchievement>.Success(achievement);
    }
}

public enum SalesTargetType { Individual = 1, Team = 2, Territory = 3, Company = 4, ProductGroup = 5, CustomerSegment = 6 }
public enum TargetPeriodType { Monthly = 1, Quarterly = 2, SemiAnnual = 3, Annual = 4 }
public enum TargetMetricType { Revenue = 1, GrossProfit = 2, Quantity = 3, NewCustomers = 4, OrderCount = 5, AverageOrderValue = 6 }
public enum SalesTargetStatus { Draft = 1, Active = 2, Achieved = 3, NotAchieved = 4, Cancelled = 5 }
public enum TargetForecast { Achieved = 1, OnTrack = 2, AtRisk = 3, BehindTarget = 4, NotAchieved = 5 }
