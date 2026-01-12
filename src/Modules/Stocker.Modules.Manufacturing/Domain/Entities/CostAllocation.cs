using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Manufacturing.Domain.Entities;

/// <summary>
/// Maliyet dağıtımı - Üretim maliyetlerinin dağıtımı (7/A-7/B maliyet muhasebesi)
/// </summary>
public class CostAllocation : AggregateRoot<Guid>
{
    public Guid TenantId { get; private set; }
    public string AllocationNumber { get; private set; } = string.Empty;
    public string CostingMethod { get; private set; } = string.Empty; // 7/A, 7/B, Standart, Fiili

    // İlişkili Kayıtlar
    public Guid? ProductionOrderId { get; private set; }
    public Guid? ProductId { get; private set; }
    public Guid? WorkCenterId { get; private set; }
    public string? CostCenterId { get; private set; }

    // Dönem Bilgisi
    public int Year { get; private set; }
    public int Month { get; private set; }
    public DateTime PeriodStart { get; private set; }
    public DateTime PeriodEnd { get; private set; }

    // Üretim Miktarları
    public decimal ProductionQuantity { get; private set; }
    public decimal GoodQuantity { get; private set; }
    public decimal ScrapQuantity { get; private set; }
    public decimal ReworkQuantity { get; private set; }
    public string UnitOfMeasure { get; private set; } = string.Empty;

    // Direkt Maliyetler
    public decimal DirectMaterialCost { get; private set; }
    public decimal DirectLaborCost { get; private set; }
    public decimal DirectExpenseCost { get; private set; }
    public decimal TotalDirectCost { get; private set; }

    // Endirekt Maliyetler (GÜG)
    public decimal IndirectMaterialCost { get; private set; }
    public decimal IndirectLaborCost { get; private set; }
    public decimal DepreciationCost { get; private set; }
    public decimal EnergyCost { get; private set; }
    public decimal MaintenanceCost { get; private set; }
    public decimal RentCost { get; private set; }
    public decimal InsuranceCost { get; private set; }
    public decimal OtherOverheadCost { get; private set; }
    public decimal TotalIndirectCost { get; private set; }

    // Toplam Maliyetler
    public decimal TotalManufacturingCost { get; private set; }
    public decimal UnitCost { get; private set; }

    // Dağıtım Anahtarları
    public string AllocationBasis { get; private set; } = string.Empty; // İşçilik Saati, Makine Saati, Üretim Miktarı, Direkt Maliyet
    public decimal AllocationRate { get; private set; }
    public decimal AllocationQuantity { get; private set; } // Dağıtım anahtarı miktarı

    // Standart Maliyet Karşılaştırması
    public decimal? StandardCost { get; private set; }
    public decimal? CostVariance { get; private set; }
    public decimal? VariancePercentage { get; private set; }
    public string? VarianceAnalysis { get; private set; }

    // 7/A Hesap Kodları
    public string? RawMaterialAccount { get; private set; } // 710
    public string? DirectLaborAccount { get; private set; } // 720
    public string? OverheadAccount { get; private set; } // 730
    public string? ProductionCostAccount { get; private set; } // 151/152

    // 7/B Hesap Kodları
    public string? CostTypeAccount { get; private set; } // 79x
    public string? FunctionAccount { get; private set; } // 630-632

    // Muhasebe Entegrasyonu
    public bool IsPosted { get; private set; }
    public string? JournalEntryId { get; private set; }
    public DateTime? PostedAt { get; private set; }

    public string Status { get; private set; } = "Taslak"; // Taslak, Hesaplandı, Onaylandı, İptal
    public string? Notes { get; private set; }

    public Guid CreatedBy { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public Guid? ModifiedBy { get; private set; }
    public DateTime? ModifiedAt { get; private set; }

    // Navigation
    public virtual ProductionOrder? ProductionOrder { get; private set; }
    public virtual WorkCenter? WorkCenter { get; private set; }
    public virtual ICollection<CostAllocationDetail> Details { get; private set; } = new List<CostAllocationDetail>();

    private CostAllocation() { }

    public CostAllocation(
        Guid id,
        Guid tenantId,
        string allocationNumber,
        string costingMethod,
        int year,
        int month,
        Guid createdBy)
    {
        Id = id;
        TenantId = tenantId;
        AllocationNumber = allocationNumber;
        CostingMethod = costingMethod;
        Year = year;
        Month = month;
        PeriodStart = new DateTime(year, month, 1);
        PeriodEnd = PeriodStart.AddMonths(1).AddDays(-1);
        CreatedBy = createdBy;
        CreatedAt = DateTime.UtcNow;
    }

    public void SetProductionOrder(Guid productionOrderId, Guid productId)
    {
        ProductionOrderId = productionOrderId;
        ProductId = productId;
        ModifiedAt = DateTime.UtcNow;
    }

    public void SetWorkCenter(Guid workCenterId, string? costCenterId = null)
    {
        WorkCenterId = workCenterId;
        CostCenterId = costCenterId;
        ModifiedAt = DateTime.UtcNow;
    }

    public void SetProductionQuantities(decimal total, decimal good, decimal scrap, decimal rework, string uom)
    {
        ProductionQuantity = total;
        GoodQuantity = good;
        ScrapQuantity = scrap;
        ReworkQuantity = rework;
        UnitOfMeasure = uom;
        CalculateUnitCost();
        ModifiedAt = DateTime.UtcNow;
    }

    public void SetDirectCosts(decimal material, decimal labor, decimal expense)
    {
        DirectMaterialCost = material;
        DirectLaborCost = labor;
        DirectExpenseCost = expense;
        TotalDirectCost = material + labor + expense;
        CalculateTotalCost();
        ModifiedAt = DateTime.UtcNow;
    }

    public void SetIndirectCosts(
        decimal indirectMaterial,
        decimal indirectLabor,
        decimal depreciation,
        decimal energy,
        decimal maintenance,
        decimal rent,
        decimal insurance,
        decimal other)
    {
        IndirectMaterialCost = indirectMaterial;
        IndirectLaborCost = indirectLabor;
        DepreciationCost = depreciation;
        EnergyCost = energy;
        MaintenanceCost = maintenance;
        RentCost = rent;
        InsuranceCost = insurance;
        OtherOverheadCost = other;

        TotalIndirectCost = indirectMaterial + indirectLabor + depreciation +
                           energy + maintenance + rent + insurance + other;

        CalculateTotalCost();
        ModifiedAt = DateTime.UtcNow;
    }

    private void CalculateTotalCost()
    {
        TotalManufacturingCost = TotalDirectCost + TotalIndirectCost;
        CalculateUnitCost();
    }

    private void CalculateUnitCost()
    {
        if (GoodQuantity > 0)
            UnitCost = TotalManufacturingCost / GoodQuantity;
    }

    public void SetAllocationBasis(string basis, decimal rate, decimal quantity)
    {
        AllocationBasis = basis;
        AllocationRate = rate;
        AllocationQuantity = quantity;
        ModifiedAt = DateTime.UtcNow;
    }

    public void SetStandardCost(decimal standardCost)
    {
        StandardCost = standardCost;
        CostVariance = UnitCost - standardCost;
        VariancePercentage = standardCost > 0 ? (CostVariance / standardCost) * 100 : 0;
        ModifiedAt = DateTime.UtcNow;
    }

    public void AnalyzeVariance(string analysis)
    {
        VarianceAnalysis = analysis;
        ModifiedAt = DateTime.UtcNow;
    }

    public void Set7AAccounts(string rawMaterial, string directLabor, string overhead, string production)
    {
        RawMaterialAccount = rawMaterial;
        DirectLaborAccount = directLabor;
        OverheadAccount = overhead;
        ProductionCostAccount = production;
        ModifiedAt = DateTime.UtcNow;
    }

    public void Set7BAccounts(string costType, string function)
    {
        CostTypeAccount = costType;
        FunctionAccount = function;
        ModifiedAt = DateTime.UtcNow;
    }

    public void Calculate()
    {
        CalculateTotalCost();
        Status = "Hesaplandı";
        ModifiedAt = DateTime.UtcNow;
    }

    public void Approve(Guid approvedBy)
    {
        if (Status != "Hesaplandı")
            throw new InvalidOperationException("Sadece hesaplanmış kayıtlar onaylanabilir.");

        Status = "Onaylandı";
        ModifiedBy = approvedBy;
        ModifiedAt = DateTime.UtcNow;
    }

    public void Post(string journalEntryId, Guid postedBy)
    {
        if (Status != "Onaylandı")
            throw new InvalidOperationException("Sadece onaylanmış kayıtlar muhasebeye aktarılabilir.");

        IsPosted = true;
        JournalEntryId = journalEntryId;
        PostedAt = DateTime.UtcNow;
        ModifiedBy = postedBy;
        ModifiedAt = DateTime.UtcNow;
    }
}

/// <summary>
/// Maliyet dağıtımı detay satırı
/// </summary>
public class CostAllocationDetail : Entity<Guid>
{
    public Guid CostAllocationId { get; private set; }
    public int SequenceNumber { get; private set; }

    public string CostElement { get; private set; } = string.Empty; // Maliyet unsuru
    public string CostType { get; private set; } = string.Empty; // Direkt, Endirekt
    public string CostCategory { get; private set; } = string.Empty; // Malzeme, İşçilik, GÜG

    public decimal Amount { get; private set; }
    public decimal AllocationRate { get; private set; }
    public decimal AllocatedAmount { get; private set; }

    public string? AccountCode { get; private set; }
    public string? CostCenterId { get; private set; }

    public string? Description { get; private set; }

    // Navigation
    public virtual CostAllocation? CostAllocation { get; private set; }

    private CostAllocationDetail() { }

    public CostAllocationDetail(
        Guid id,
        Guid costAllocationId,
        int sequenceNumber,
        string costElement,
        string costType,
        string costCategory,
        decimal amount)
    {
        Id = id;
        CostAllocationId = costAllocationId;
        SequenceNumber = sequenceNumber;
        CostElement = costElement;
        CostType = costType;
        CostCategory = costCategory;
        Amount = amount;
        AllocatedAmount = amount;
    }

    public void SetAllocation(decimal rate)
    {
        AllocationRate = rate;
        AllocatedAmount = Amount * rate;
    }

    public void SetAccount(string accountCode, string? costCenterId = null)
    {
        AccountCode = accountCode;
        CostCenterId = costCenterId;
    }
}
