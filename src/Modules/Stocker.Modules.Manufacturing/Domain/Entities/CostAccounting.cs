using Stocker.SharedKernel.Common;
using Stocker.Modules.Manufacturing.Domain.Enums;

namespace Stocker.Modules.Manufacturing.Domain.Entities;

/// <summary>
/// Üretim Maliyet Kaydı - 7/A ve 7/B hesap planı entegrasyonu
/// </summary>
public class ProductionCostRecord : BaseEntity
{
    public string RecordNumber { get; private set; } = null!;
    public CostAccountingMethod AccountingMethod { get; private set; } // 7A veya 7B
    public int ProductionOrderId { get; private set; }
    public string? ProductionOrderNumber { get; private set; }
    public int ProductId { get; private set; }
    public string? ProductCode { get; private set; }
    public string? ProductName { get; private set; }
    public decimal Quantity { get; private set; }
    public string Unit { get; private set; } = "Adet";

    // Dönem bilgisi
    public int Year { get; private set; }
    public int Month { get; private set; }
    public DateTime PeriodStart { get; private set; }
    public DateTime PeriodEnd { get; private set; }

    // Maliyet bileşenleri
    public decimal DirectMaterialCost { get; private set; }      // 710 - Direkt İlk Madde ve Malzeme Giderleri
    public decimal DirectLaborCost { get; private set; }         // 720 - Direkt İşçilik Giderleri
    public decimal ManufacturingOverhead { get; private set; }   // 730 - Genel Üretim Giderleri
    public decimal VariableOverhead { get; private set; }        // Değişken GÜG
    public decimal FixedOverhead { get; private set; }           // Sabit GÜG

    // 7/A - Fonksiyon esaslı (Toplam maliyet)
    public decimal TotalProductionCost { get; private set; }     // Toplam üretim maliyeti

    // 7/B - Çeşit esaslı detaylar
    public decimal MaterialVariance { get; private set; }        // Malzeme fark maliyeti
    public decimal LaborVariance { get; private set; }           // İşçilik fark maliyeti
    public decimal OverheadVariance { get; private set; }        // GÜG fark maliyeti

    // Birim maliyetler
    public decimal UnitDirectMaterialCost { get; private set; }
    public decimal UnitDirectLaborCost { get; private set; }
    public decimal UnitOverheadCost { get; private set; }
    public decimal UnitTotalCost { get; private set; }

    // Standart maliyet karşılaştırması
    public decimal StandardCost { get; private set; }
    public decimal ActualCost { get; private set; }
    public decimal CostVariance { get; private set; }
    public decimal VariancePercent { get; private set; }

    public string? CostCenterId { get; private set; }
    public string? Notes { get; private set; }
    public new string? CreatedBy { get; private set; }
    public bool IsFinalized { get; private set; }
    public DateTime? FinalizedDate { get; private set; }
    public string? FinalizedBy { get; private set; }

    // Navigation
    public virtual ProductionOrder? ProductionOrder { get; private set; }
    public virtual ICollection<ProductionCostAllocation> CostAllocations { get; private set; } = new List<ProductionCostAllocation>();
    public virtual ICollection<CostJournalEntry> JournalEntries { get; private set; } = new List<CostJournalEntry>();

    protected ProductionCostRecord() { }

    public ProductionCostRecord(
        string recordNumber,
        CostAccountingMethod accountingMethod,
        int productionOrderId,
        int productId,
        decimal quantity,
        int year,
        int month)
    {
        RecordNumber = recordNumber;
        AccountingMethod = accountingMethod;
        ProductionOrderId = productionOrderId;
        ProductId = productId;
        Quantity = quantity;
        Year = year;
        Month = month;
        PeriodStart = new DateTime(year, month, 1);
        PeriodEnd = PeriodStart.AddMonths(1).AddDays(-1);
        IsFinalized = false;
    }

    public void SetProductInfo(string? productCode, string? productName, string unit)
    {
        ProductCode = productCode;
        ProductName = productName;
        Unit = unit;
    }

    public void SetProductionOrderInfo(string? orderNumber)
    {
        ProductionOrderNumber = orderNumber;
    }

    public void SetDirectCosts(decimal materialCost, decimal laborCost)
    {
        if (IsFinalized)
            throw new InvalidOperationException("Kesinleştirilmiş kayıt güncellenemez.");

        DirectMaterialCost = materialCost;
        DirectLaborCost = laborCost;
        UnitDirectMaterialCost = Quantity > 0 ? materialCost / Quantity : 0;
        UnitDirectLaborCost = Quantity > 0 ? laborCost / Quantity : 0;
        RecalculateTotals();
    }

    public void SetOverheadCosts(decimal variableOverhead, decimal fixedOverhead)
    {
        if (IsFinalized)
            throw new InvalidOperationException("Kesinleştirilmiş kayıt güncellenemez.");

        VariableOverhead = variableOverhead;
        FixedOverhead = fixedOverhead;
        ManufacturingOverhead = variableOverhead + fixedOverhead;
        UnitOverheadCost = Quantity > 0 ? ManufacturingOverhead / Quantity : 0;
        RecalculateTotals();
    }

    public void SetVariances(decimal materialVariance, decimal laborVariance, decimal overheadVariance)
    {
        if (IsFinalized)
            throw new InvalidOperationException("Kesinleştirilmiş kayıt güncellenemez.");

        MaterialVariance = materialVariance;
        LaborVariance = laborVariance;
        OverheadVariance = overheadVariance;
    }

    public void SetStandardCost(decimal standardCost)
    {
        StandardCost = standardCost;
        CalculateVariance();
    }

    public void SetCostCenter(string costCenterId)
    {
        CostCenterId = costCenterId;
    }

    public void SetNotes(string notes)
    {
        Notes = notes;
    }

    public void SetCreatedBy(string userName)
    {
        CreatedBy = userName;
    }

    private void RecalculateTotals()
    {
        TotalProductionCost = DirectMaterialCost + DirectLaborCost + ManufacturingOverhead;
        ActualCost = TotalProductionCost;
        UnitTotalCost = Quantity > 0 ? TotalProductionCost / Quantity : 0;
        CalculateVariance();
    }

    private void CalculateVariance()
    {
        if (StandardCost > 0)
        {
            var expectedCost = StandardCost * Quantity;
            CostVariance = ActualCost - expectedCost;
            VariancePercent = expectedCost > 0 ? (CostVariance / expectedCost) * 100 : 0;
        }
    }

    public void Finalize(string userName)
    {
        if (IsFinalized)
            throw new InvalidOperationException("Kayıt zaten kesinleştirilmiş.");

        IsFinalized = true;
        FinalizedDate = DateTime.UtcNow;
        FinalizedBy = userName;
    }

    public ProductionCostAllocation AddCostAllocation(
        string accountCode,
        string accountName,
        CostAllocationDirection direction,
        decimal amount)
    {
        var allocation = new ProductionCostAllocation(Id, accountCode, accountName, direction, amount);
        CostAllocations.Add(allocation);
        return allocation;
    }

    public CostJournalEntry AddJournalEntry(
        string accountCode,
        string accountName,
        decimal debitAmount,
        decimal creditAmount)
    {
        var entry = new CostJournalEntry(Id, accountCode, accountName, debitAmount, creditAmount);
        JournalEntries.Add(entry);
        return entry;
    }
}

/// <summary>
/// Üretim Maliyet Dağıtım Kaydı - GÜG dağıtımları (ProductionCostRecord için)
/// </summary>
public class ProductionCostAllocation : BaseEntity
{
    public int ProductionCostRecordId { get; private set; }
    public string AccountCode { get; private set; } = null!;
    public string AccountName { get; private set; } = null!;
    public CostAllocationDirection Direction { get; private set; }
    public decimal Amount { get; private set; }
    public string? AllocationBasis { get; private set; }  // Dağıtım anahtarı
    public decimal AllocationRate { get; private set; }
    public string? SourceCostCenter { get; private set; }
    public string? TargetCostCenter { get; private set; }
    public string? Notes { get; private set; }

    // Navigation
    public virtual ProductionCostRecord? ProductionCostRecord { get; private set; }

    protected ProductionCostAllocation() { }

    public ProductionCostAllocation(
        int productionCostRecordId,
        string accountCode,
        string accountName,
        CostAllocationDirection direction,
        decimal amount)
    {
        ProductionCostRecordId = productionCostRecordId;
        AccountCode = accountCode;
        AccountName = accountName;
        Direction = direction;
        Amount = amount;
    }

    public void SetAllocationDetails(string basis, decimal rate)
    {
        AllocationBasis = basis;
        AllocationRate = rate;
    }

    public void SetCostCenters(string? source, string? target)
    {
        SourceCostCenter = source;
        TargetCostCenter = target;
    }

    public void SetNotes(string notes)
    {
        Notes = notes;
    }
}

/// <summary>
/// Maliyet Yevmiye Kaydı - Muhasebe entegrasyonu
/// </summary>
public class CostJournalEntry : BaseEntity
{
    public int ProductionCostRecordId { get; private set; }
    public DateTime EntryDate { get; private set; }
    public string AccountCode { get; private set; } = null!;
    public string AccountName { get; private set; } = null!;
    public decimal DebitAmount { get; private set; }
    public decimal CreditAmount { get; private set; }
    public string? Description { get; private set; }
    public string? DocumentNumber { get; private set; }
    public string? DocumentType { get; private set; }
    public bool IsPosted { get; private set; }
    public DateTime? PostedDate { get; private set; }
    public string? PostedBy { get; private set; }

    // Navigation
    public virtual ProductionCostRecord? ProductionCostRecord { get; private set; }

    protected CostJournalEntry() { }

    public CostJournalEntry(
        int productionCostRecordId,
        string accountCode,
        string accountName,
        decimal debitAmount,
        decimal creditAmount)
    {
        ProductionCostRecordId = productionCostRecordId;
        EntryDate = DateTime.UtcNow;
        AccountCode = accountCode;
        AccountName = accountName;
        DebitAmount = debitAmount;
        CreditAmount = creditAmount;
        IsPosted = false;
    }

    public void SetDescription(string description)
    {
        Description = description;
    }

    public void SetDocument(string documentNumber, string documentType)
    {
        DocumentNumber = documentNumber;
        DocumentType = documentType;
    }

    public void Post(string userName)
    {
        if (IsPosted)
            throw new InvalidOperationException("Kayıt zaten muhasebeleştirilmiş.");

        IsPosted = true;
        PostedDate = DateTime.UtcNow;
        PostedBy = userName;
    }

    public void Unpost()
    {
        IsPosted = false;
        PostedDate = null;
        PostedBy = null;
    }
}

/// <summary>
/// Maliyet Merkezi
/// </summary>
public class CostCenter : BaseEntity
{
    public string Code { get; private set; } = null!;
    public string Name { get; private set; } = null!;
    public string? Description { get; private set; }
    public CostCenterType Type { get; private set; }
    public int? ParentCostCenterId { get; private set; }
    public string? ResponsiblePerson { get; private set; }
    public int? WorkCenterId { get; private set; }
    public decimal BudgetAmount { get; private set; }
    public decimal ActualAmount { get; private set; }
    public decimal VarianceAmount { get; private set; }
    public bool IsActive { get; private set; }

    // Navigation
    public virtual CostCenter? ParentCostCenter { get; private set; }
    public virtual WorkCenter? WorkCenter { get; private set; }
    public virtual ICollection<CostCenter> ChildCostCenters { get; private set; } = new List<CostCenter>();

    protected CostCenter() { }

    public CostCenter(string code, string name, CostCenterType type)
    {
        Code = code;
        Name = name;
        Type = type;
        IsActive = true;
    }

    public void SetDescription(string description)
    {
        Description = description;
    }

    public void SetParent(int parentId)
    {
        ParentCostCenterId = parentId;
    }

    public void SetResponsiblePerson(string person)
    {
        ResponsiblePerson = person;
    }

    public void LinkToWorkCenter(int workCenterId)
    {
        WorkCenterId = workCenterId;
    }

    public void SetBudget(decimal amount)
    {
        BudgetAmount = amount;
        CalculateVariance();
    }

    public void UpdateActual(decimal amount)
    {
        ActualAmount = amount;
        CalculateVariance();
    }

    public void AddToActual(decimal amount)
    {
        ActualAmount += amount;
        CalculateVariance();
    }

    private void CalculateVariance()
    {
        VarianceAmount = ActualAmount - BudgetAmount;
    }

    public void Activate()
    {
        IsActive = true;
    }

    public void Deactivate()
    {
        IsActive = false;
    }
}

/// <summary>
/// Standart Maliyet Kartı
/// </summary>
public class StandardCostCard : BaseEntity
{
    public int ProductId { get; private set; }
    public string? ProductCode { get; private set; }
    public string? ProductName { get; private set; }
    public int Year { get; private set; }
    public int Version { get; private set; }
    public bool IsCurrent { get; private set; }

    // Standart maliyetler
    public decimal StandardMaterialCost { get; private set; }
    public decimal StandardLaborCost { get; private set; }
    public decimal StandardOverheadCost { get; private set; }
    public decimal StandardTotalCost { get; private set; }

    // Standart kullanımlar
    public decimal StandardMaterialQuantity { get; private set; }
    public decimal StandardLaborHours { get; private set; }
    public decimal StandardMachineHours { get; private set; }

    // Fiyatlar
    public decimal MaterialUnitPrice { get; private set; }
    public decimal LaborHourlyRate { get; private set; }
    public decimal OverheadRate { get; private set; }

    public DateTime EffectiveDate { get; private set; }
    public DateTime? ExpiryDate { get; private set; }
    public string? Notes { get; private set; }
    public new string? CreatedBy { get; private set; }
    public string? ApprovedBy { get; private set; }
    public DateTime? ApprovedDate { get; private set; }

    protected StandardCostCard() { }

    public StandardCostCard(int productId, int year, int version)
    {
        ProductId = productId;
        Year = year;
        Version = version;
        IsCurrent = false;
        EffectiveDate = new DateTime(year, 1, 1);
    }

    public void SetProductInfo(string? productCode, string? productName)
    {
        ProductCode = productCode;
        ProductName = productName;
    }

    public void SetStandardCosts(decimal materialCost, decimal laborCost, decimal overheadCost)
    {
        StandardMaterialCost = materialCost;
        StandardLaborCost = laborCost;
        StandardOverheadCost = overheadCost;
        StandardTotalCost = materialCost + laborCost + overheadCost;
    }

    public void SetStandardUsages(decimal materialQty, decimal laborHours, decimal machineHours)
    {
        StandardMaterialQuantity = materialQty;
        StandardLaborHours = laborHours;
        StandardMachineHours = machineHours;
    }

    public void SetRates(decimal materialPrice, decimal laborRate, decimal overheadRate)
    {
        MaterialUnitPrice = materialPrice;
        LaborHourlyRate = laborRate;
        OverheadRate = overheadRate;
    }

    public void SetEffectivePeriod(DateTime effectiveDate, DateTime? expiryDate)
    {
        EffectiveDate = effectiveDate;
        ExpiryDate = expiryDate;
    }

    public void SetNotes(string notes)
    {
        Notes = notes;
    }

    public void SetCreatedBy(string userName)
    {
        CreatedBy = userName;
    }

    public void SetAsCurrent()
    {
        IsCurrent = true;
    }

    public void SetAsHistorical()
    {
        IsCurrent = false;
    }

    public void Approve(string userName)
    {
        ApprovedBy = userName;
        ApprovedDate = DateTime.UtcNow;
    }
}
