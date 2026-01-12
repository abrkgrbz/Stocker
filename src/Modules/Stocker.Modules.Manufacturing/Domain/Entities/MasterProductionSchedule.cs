using Stocker.SharedKernel.Common;
using Stocker.Modules.Manufacturing.Domain.Enums;

namespace Stocker.Modules.Manufacturing.Domain.Entities;

/// <summary>
/// Ana Üretim Planı (MPS - Master Production Schedule)
/// Bitmiş ürünler için dönemsel üretim planı
/// </summary>
public class MasterProductionSchedule : BaseEntity
{
    public string ScheduleNumber { get; private set; } = null!;
    public string Name { get; private set; } = null!;
    public MpsStatus Status { get; private set; }

    // Planlama dönemi
    public DateTime PeriodStart { get; private set; }
    public DateTime PeriodEnd { get; private set; }
    public MpsPeriodType PeriodType { get; private set; } // Günlük, Haftalık, Aylık

    // Planlama parametreleri
    public int FrozenPeriodDays { get; private set; } // Dondurulmuş dönem (değiştirilemez)
    public int SlushyPeriodDays { get; private set; } // Yarı esnek dönem
    public int FreePeriodDays { get; private set; } // Esnek dönem

    // Durum bilgileri
    public new string? CreatedBy { get; private set; }
    public string? ApprovedBy { get; private set; }
    public DateTime? ApprovalDate { get; private set; }

    public string? Notes { get; private set; }
    public bool IsActive { get; private set; }

    // Navigation properties
    public virtual ICollection<MpsLine> Lines { get; private set; } = new List<MpsLine>();

    protected MasterProductionSchedule() { }

    public MasterProductionSchedule(string scheduleNumber, string name, DateTime periodStart, DateTime periodEnd, MpsPeriodType periodType)
    {
        ScheduleNumber = scheduleNumber;
        Name = name;
        Status = MpsStatus.Taslak;
        PeriodStart = periodStart;
        PeriodEnd = periodEnd;
        PeriodType = periodType;
        FrozenPeriodDays = 7;
        SlushyPeriodDays = 14;
        FreePeriodDays = 30;
        IsActive = true;
    }

    public void SetPlanningFences(int frozenDays, int slushyDays, int freeDays)
    {
        FrozenPeriodDays = frozenDays;
        SlushyPeriodDays = slushyDays;
        FreePeriodDays = freeDays;
    }

    public void SetCreatedBy(string createdBy) => CreatedBy = createdBy;

    public MpsLine AddLine(int productId, DateTime periodDate, decimal forecastQuantity,
        decimal customerOrderQuantity, decimal plannedProductionQuantity)
    {
        var line = new MpsLine(Id, productId, periodDate, forecastQuantity,
            customerOrderQuantity, plannedProductionQuantity);
        Lines.Add(line);
        return line;
    }

    public void Submit()
    {
        if (Status != MpsStatus.Taslak)
            throw new InvalidOperationException("Sadece taslak planlar gönderilebilir.");

        Status = MpsStatus.Onay_Bekliyor;
    }

    public void Approve(string approvedBy)
    {
        if (Status != MpsStatus.Onay_Bekliyor)
            throw new InvalidOperationException("Sadece onay bekleyen planlar onaylanabilir.");

        Status = MpsStatus.Onaylandı;
        ApprovedBy = approvedBy;
        ApprovalDate = DateTime.UtcNow;
    }

    public void Activate()
    {
        if (Status != MpsStatus.Onaylandı)
            throw new InvalidOperationException("Sadece onaylanmış planlar aktif edilebilir.");

        Status = MpsStatus.Aktif;
        IsActive = true;
    }

    public void Complete()
    {
        if (Status != MpsStatus.Aktif)
            throw new InvalidOperationException("Sadece aktif planlar tamamlanabilir.");

        Status = MpsStatus.Tamamlandı;
    }

    public void Cancel()
    {
        if (Status == MpsStatus.Tamamlandı)
            throw new InvalidOperationException("Tamamlanmış plan iptal edilemez.");

        Status = MpsStatus.İptal;
        IsActive = false;
    }

    public void SetNotes(string? notes) => Notes = notes;

    /// <summary>
    /// Belirli bir tarih için dönem tipini belirler (Frozen, Slushy, Free)
    /// </summary>
    public MpsFenceType GetFenceType(DateTime date)
    {
        var daysFromNow = (date - DateTime.UtcNow).Days;

        if (daysFromNow <= FrozenPeriodDays)
            return MpsFenceType.Frozen;
        if (daysFromNow <= FrozenPeriodDays + SlushyPeriodDays)
            return MpsFenceType.Slushy;
        return MpsFenceType.Free;
    }
}

/// <summary>
/// MPS Satırı - Ürün bazlı üretim planı detayı
/// </summary>
public class MpsLine : BaseEntity
{
    public int MpsId { get; private set; }
    public int ProductId { get; private set; }
    public DateTime PeriodDate { get; private set; }
    public int PeriodNumber { get; private set; }

    // Talep kaynakları
    public decimal ForecastQuantity { get; private set; } // Tahmin
    public decimal CustomerOrderQuantity { get; private set; } // Müşteri siparişleri
    public decimal DependentDemand { get; private set; } // Bağımlı talep (üst ürünlerden)

    // Planlanan değerler
    public decimal PlannedProductionQuantity { get; private set; }
    public decimal ProjectedAvailableBalance { get; private set; } // PAB
    public decimal AvailableToPromise { get; private set; } // ATP

    // Mevcut durum
    public decimal BeginningInventory { get; private set; }
    public decimal SafetyStock { get; private set; }

    // Gerçekleşen değerler
    public decimal ActualProductionQuantity { get; private set; }
    public decimal ActualSalesQuantity { get; private set; }

    public string? Notes { get; private set; }

    // Navigation
    public virtual MasterProductionSchedule Mps { get; private set; } = null!;

    protected MpsLine() { }

    public MpsLine(int mpsId, int productId, DateTime periodDate,
        decimal forecastQuantity, decimal customerOrderQuantity, decimal plannedProductionQuantity)
    {
        MpsId = mpsId;
        ProductId = productId;
        PeriodDate = periodDate;
        ForecastQuantity = forecastQuantity;
        CustomerOrderQuantity = customerOrderQuantity;
        PlannedProductionQuantity = plannedProductionQuantity;
    }

    public void SetPeriodNumber(int periodNumber) => PeriodNumber = periodNumber;

    public void SetDependentDemand(decimal dependentDemand) => DependentDemand = dependentDemand;

    public void SetInventoryLevels(decimal beginningInventory, decimal safetyStock)
    {
        BeginningInventory = beginningInventory;
        SafetyStock = safetyStock;
        CalculateProjectedBalance();
    }

    public void UpdatePlannedProduction(decimal quantity)
    {
        PlannedProductionQuantity = quantity;
        CalculateProjectedBalance();
    }

    public void RecordActuals(decimal productionQuantity, decimal salesQuantity)
    {
        ActualProductionQuantity = productionQuantity;
        ActualSalesQuantity = salesQuantity;
    }

    private void CalculateProjectedBalance()
    {
        // PAB = Başlangıç + Planlanan Üretim - Max(Tahmin, Sipariş)
        var grossRequirement = Math.Max(ForecastQuantity, CustomerOrderQuantity) + DependentDemand;
        ProjectedAvailableBalance = BeginningInventory + PlannedProductionQuantity - grossRequirement;

        // ATP = Başlangıç + Üretim - Sipariş (sonraki üretim planına kadar)
        AvailableToPromise = BeginningInventory + PlannedProductionQuantity - CustomerOrderQuantity;
    }

    public void SetNotes(string? notes) => Notes = notes;

    /// <summary>
    /// Gerçek talebi hesaplar (tahmin ve sipariş büyük olanı)
    /// </summary>
    public decimal GetGrossRequirement()
    {
        return Math.Max(ForecastQuantity, CustomerOrderQuantity) + DependentDemand;
    }
}
