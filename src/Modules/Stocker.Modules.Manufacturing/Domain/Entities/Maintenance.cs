using Stocker.SharedKernel.Common;
using Stocker.Modules.Manufacturing.Domain.Enums;

namespace Stocker.Modules.Manufacturing.Domain.Entities;

/// <summary>
/// Bakım planı - Önleyici ve kestirimci bakım planlaması
/// </summary>
public class MaintenancePlan : BaseEntity
{
    public string Code { get; private set; } = null!;
    public string Name { get; private set; } = null!;
    public string? Description { get; private set; }

    // Hedef ekipman
    public int? MachineId { get; private set; }
    public int? WorkCenterId { get; private set; }

    // Bakım parametreleri
    public MaintenanceType MaintenanceType { get; private set; }
    public MaintenancePriority Priority { get; private set; }
    public MaintenancePlanStatus Status { get; private set; }
    public MaintenanceTriggerType TriggerType { get; private set; }

    // Sıklık ayarları
    public int FrequencyValue { get; private set; }
    public MaintenanceFrequencyUnit FrequencyUnit { get; private set; }
    public decimal? TriggerMeterValue { get; private set; }  // Sayaç/saat değeri
    public decimal? WarningThreshold { get; private set; }   // Uyarı eşiği (%)

    // Tarih bilgileri
    public DateTime EffectiveFrom { get; private set; }
    public DateTime? EffectiveTo { get; private set; }
    public DateTime? LastExecutionDate { get; private set; }
    public DateTime? NextScheduledDate { get; private set; }

    // Tahmini süre ve maliyet
    public decimal EstimatedDurationHours { get; private set; }
    public decimal EstimatedLaborCost { get; private set; }
    public decimal EstimatedMaterialCost { get; private set; }

    // Talimat ve notlar
    public string? Instructions { get; private set; }
    public string? SafetyNotes { get; private set; }

    public bool IsActive { get; private set; }
    public string? CreatedByUser { get; private set; }
    public string? ApprovedByUser { get; private set; }
    public DateTime? ApprovedDate { get; private set; }

    // Navigation properties
    public virtual Machine? Machine { get; private set; }
    public virtual WorkCenter? WorkCenter { get; private set; }
    public virtual ICollection<MaintenanceTask> Tasks { get; private set; } = new List<MaintenanceTask>();
    public virtual ICollection<MaintenanceRecord> Records { get; private set; } = new List<MaintenanceRecord>();
    public virtual ICollection<MaintenancePlanSparePart> RequiredSpareParts { get; private set; } = new List<MaintenancePlanSparePart>();

    protected MaintenancePlan() { }

    public MaintenancePlan(string code, string name, MaintenanceType maintenanceType, MaintenanceTriggerType triggerType)
    {
        Code = code;
        Name = name;
        MaintenanceType = maintenanceType;
        TriggerType = triggerType;
        Priority = MaintenancePriority.Normal;
        Status = MaintenancePlanStatus.Taslak;
        FrequencyValue = 30;
        FrequencyUnit = MaintenanceFrequencyUnit.Gün;
        EffectiveFrom = DateTime.UtcNow;
        IsActive = true;
    }

    public void Update(string name, string? description)
    {
        Name = name;
        Description = description;
    }

    public void SetTarget(int? machineId, int? workCenterId)
    {
        MachineId = machineId;
        WorkCenterId = workCenterId;
    }

    public void SetFrequency(int frequencyValue, MaintenanceFrequencyUnit frequencyUnit, decimal? triggerMeterValue = null)
    {
        FrequencyValue = frequencyValue;
        FrequencyUnit = frequencyUnit;
        TriggerMeterValue = triggerMeterValue;
    }

    public void SetEffectiveDates(DateTime effectiveFrom, DateTime? effectiveTo)
    {
        EffectiveFrom = effectiveFrom;
        EffectiveTo = effectiveTo;
    }

    public void SetEstimates(decimal durationHours, decimal laborCost, decimal materialCost)
    {
        EstimatedDurationHours = durationHours;
        EstimatedLaborCost = laborCost;
        EstimatedMaterialCost = materialCost;
    }

    public void SetInstructions(string? instructions, string? safetyNotes)
    {
        Instructions = instructions;
        SafetyNotes = safetyNotes;
    }

    public void SetPriority(MaintenancePriority priority) => Priority = priority;
    public void SetWarningThreshold(decimal? threshold) => WarningThreshold = threshold;

    public void Activate()
    {
        Status = MaintenancePlanStatus.Aktif;
        IsActive = true;
        CalculateNextScheduledDate();
    }

    public void Suspend()
    {
        Status = MaintenancePlanStatus.Askıda;
    }

    public void Complete()
    {
        Status = MaintenancePlanStatus.Tamamlandı;
        IsActive = false;
    }

    public void Cancel()
    {
        Status = MaintenancePlanStatus.İptal;
        IsActive = false;
    }

    public void Approve(string approvedByUser)
    {
        ApprovedByUser = approvedByUser;
        ApprovedDate = DateTime.UtcNow;
    }

    public void RecordExecution(DateTime executionDate)
    {
        LastExecutionDate = executionDate;
        CalculateNextScheduledDate();
    }

    public void CalculateNextScheduledDate()
    {
        if (LastExecutionDate == null)
        {
            NextScheduledDate = EffectiveFrom;
            return;
        }

        NextScheduledDate = FrequencyUnit switch
        {
            MaintenanceFrequencyUnit.Saat => LastExecutionDate.Value.AddHours(FrequencyValue),
            MaintenanceFrequencyUnit.Gün => LastExecutionDate.Value.AddDays(FrequencyValue),
            MaintenanceFrequencyUnit.Hafta => LastExecutionDate.Value.AddDays(FrequencyValue * 7),
            MaintenanceFrequencyUnit.Ay => LastExecutionDate.Value.AddMonths(FrequencyValue),
            MaintenanceFrequencyUnit.Yıl => LastExecutionDate.Value.AddYears(FrequencyValue),
            _ => LastExecutionDate.Value.AddDays(FrequencyValue)
        };
    }

    public decimal GetTotalEstimatedCost() => EstimatedLaborCost + EstimatedMaterialCost;
}

/// <summary>
/// Bakım görevi - Plana bağlı yapılacak işler
/// </summary>
public class MaintenanceTask : BaseEntity
{
    public int MaintenancePlanId { get; private set; }
    public int SequenceNumber { get; private set; }
    public string TaskName { get; private set; } = null!;
    public string? Description { get; private set; }

    // Görev parametreleri
    public MaintenanceTaskStatus Status { get; private set; }
    public decimal EstimatedDurationMinutes { get; private set; }
    public string? RequiredSkills { get; private set; }
    public string? RequiredTools { get; private set; }

    // Kontrol listesi
    public bool IsChecklistItem { get; private set; }
    public string? ChecklistCriteria { get; private set; }
    public string? AcceptanceValue { get; private set; }

    public bool IsMandatory { get; private set; }
    public bool IsActive { get; private set; }

    // Navigation properties
    public virtual MaintenancePlan MaintenancePlan { get; private set; } = null!;

    protected MaintenanceTask() { }

    public MaintenanceTask(int maintenancePlanId, int sequenceNumber, string taskName)
    {
        MaintenancePlanId = maintenancePlanId;
        SequenceNumber = sequenceNumber;
        TaskName = taskName;
        Status = MaintenanceTaskStatus.Beklemede;
        IsMandatory = true;
        IsActive = true;
    }

    public void Update(string taskName, string? description)
    {
        TaskName = taskName;
        Description = description;
    }

    public void SetDuration(decimal estimatedDurationMinutes) => EstimatedDurationMinutes = estimatedDurationMinutes;
    public void SetRequirements(string? requiredSkills, string? requiredTools)
    {
        RequiredSkills = requiredSkills;
        RequiredTools = requiredTools;
    }

    public void SetAsChecklist(string? criteria, string? acceptanceValue)
    {
        IsChecklistItem = true;
        ChecklistCriteria = criteria;
        AcceptanceValue = acceptanceValue;
    }

    public void SetSequence(int sequenceNumber) => SequenceNumber = sequenceNumber;
    public void SetMandatory(bool isMandatory) => IsMandatory = isMandatory;
    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;

    public void Start() => Status = MaintenanceTaskStatus.DevamEdiyor;
    public void Complete() => Status = MaintenanceTaskStatus.Tamamlandı;
    public void Postpone() => Status = MaintenanceTaskStatus.Ertelendi;
    public void Cancel() => Status = MaintenanceTaskStatus.İptal;
}

/// <summary>
/// Bakım kaydı - Gerçekleştirilen bakımlar
/// </summary>
public class MaintenanceRecord : BaseEntity
{
    public string RecordNumber { get; private set; } = null!;
    public int? MaintenancePlanId { get; private set; }
    public int? MachineId { get; private set; }
    public int? WorkCenterId { get; private set; }

    // Bakım bilgileri
    public MaintenanceType MaintenanceType { get; private set; }
    public MaintenanceRecordStatus Status { get; private set; }
    public MaintenancePriority Priority { get; private set; }

    // Tarih/süre bilgileri
    public DateTime ScheduledDate { get; private set; }
    public DateTime? StartDate { get; private set; }
    public DateTime? EndDate { get; private set; }
    public decimal? ActualDurationHours { get; private set; }

    // Arıza bilgileri (Arıza bakımı için)
    public string? FailureCode { get; private set; }
    public string? FailureDescription { get; private set; }
    public string? RootCause { get; private set; }

    // Yapılan işler
    public string? WorkPerformed { get; private set; }
    public string? PartsReplaced { get; private set; }
    public string? TechnicianNotes { get; private set; }

    // Maliyet bilgileri
    public decimal LaborCost { get; private set; }
    public decimal MaterialCost { get; private set; }
    public decimal ExternalServiceCost { get; private set; }

    // Sayaç bilgileri
    public decimal? MeterReadingBefore { get; private set; }
    public decimal? MeterReadingAfter { get; private set; }

    // Personel bilgileri
    public string? AssignedTechnician { get; private set; }
    public string? PerformedBy { get; private set; }
    public string? ApprovedBy { get; private set; }
    public DateTime? ApprovedDate { get; private set; }

    // Sonraki bakım önerileri
    public string? NextActionRecommendation { get; private set; }
    public DateTime? RecommendedNextDate { get; private set; }

    // Navigation properties
    public virtual MaintenancePlan? MaintenancePlan { get; private set; }
    public virtual Machine? Machine { get; private set; }
    public virtual WorkCenter? WorkCenter { get; private set; }
    public virtual ICollection<MaintenanceRecordTask> RecordTasks { get; private set; } = new List<MaintenanceRecordTask>();
    public virtual ICollection<MaintenanceRecordSparePart> UsedSpareParts { get; private set; } = new List<MaintenanceRecordSparePart>();

    protected MaintenanceRecord() { }

    public MaintenanceRecord(string recordNumber, MaintenanceType maintenanceType, DateTime scheduledDate)
    {
        RecordNumber = recordNumber;
        MaintenanceType = maintenanceType;
        ScheduledDate = scheduledDate;
        Status = MaintenanceRecordStatus.Açık;
        Priority = MaintenancePriority.Normal;
    }

    public void SetPlan(int maintenancePlanId) => MaintenancePlanId = maintenancePlanId;
    public void SetMachine(int machineId) => MachineId = machineId;
    public void SetWorkCenter(int workCenterId) => WorkCenterId = workCenterId;
    public void SetPriority(MaintenancePriority priority) => Priority = priority;

    public void Start(DateTime startDate, string? assignedTechnician)
    {
        StartDate = startDate;
        AssignedTechnician = assignedTechnician;
        Status = MaintenanceRecordStatus.DevamEdiyor;
    }

    public void SetFailureInfo(string? failureCode, string? failureDescription, string? rootCause)
    {
        FailureCode = failureCode;
        FailureDescription = failureDescription;
        RootCause = rootCause;
    }

    public void SetWorkDetails(string? workPerformed, string? partsReplaced, string? technicianNotes)
    {
        WorkPerformed = workPerformed;
        PartsReplaced = partsReplaced;
        TechnicianNotes = technicianNotes;
    }

    public void SetMeterReadings(decimal? before, decimal? after)
    {
        MeterReadingBefore = before;
        MeterReadingAfter = after;
    }

    public void SetCosts(decimal laborCost, decimal materialCost, decimal externalServiceCost)
    {
        LaborCost = laborCost;
        MaterialCost = materialCost;
        ExternalServiceCost = externalServiceCost;
    }

    public void Complete(DateTime endDate, string performedBy)
    {
        EndDate = endDate;
        PerformedBy = performedBy;
        Status = MaintenanceRecordStatus.Tamamlandı;

        if (StartDate.HasValue)
        {
            ActualDurationHours = (decimal)(endDate - StartDate.Value).TotalHours;
        }
    }

    public void Approve(string approvedBy)
    {
        ApprovedBy = approvedBy;
        ApprovedDate = DateTime.UtcNow;
        Status = MaintenanceRecordStatus.Onaylandı;
    }

    public void Cancel()
    {
        Status = MaintenanceRecordStatus.İptal;
    }

    public void SetNextActionRecommendation(string? recommendation, DateTime? recommendedNextDate)
    {
        NextActionRecommendation = recommendation;
        RecommendedNextDate = recommendedNextDate;
    }

    public decimal GetTotalCost() => LaborCost + MaterialCost + ExternalServiceCost;
}

/// <summary>
/// Bakım kaydı görev detayı
/// </summary>
public class MaintenanceRecordTask : BaseEntity
{
    public int MaintenanceRecordId { get; private set; }
    public int MaintenanceTaskId { get; private set; }
    public int SequenceNumber { get; private set; }

    public bool IsCompleted { get; private set; }
    public DateTime? CompletedDate { get; private set; }
    public string? CompletedBy { get; private set; }

    // Kontrol sonucu
    public string? MeasuredValue { get; private set; }
    public bool? PassedCheck { get; private set; }
    public string? Notes { get; private set; }

    // Navigation properties
    public virtual MaintenanceRecord MaintenanceRecord { get; private set; } = null!;
    public virtual MaintenanceTask MaintenanceTask { get; private set; } = null!;

    protected MaintenanceRecordTask() { }

    public MaintenanceRecordTask(int maintenanceRecordId, int maintenanceTaskId, int sequenceNumber)
    {
        MaintenanceRecordId = maintenanceRecordId;
        MaintenanceTaskId = maintenanceTaskId;
        SequenceNumber = sequenceNumber;
        IsCompleted = false;
    }

    public void Complete(string completedBy, string? measuredValue = null, bool? passedCheck = null, string? notes = null)
    {
        IsCompleted = true;
        CompletedDate = DateTime.UtcNow;
        CompletedBy = completedBy;
        MeasuredValue = measuredValue;
        PassedCheck = passedCheck;
        Notes = notes;
    }
}

/// <summary>
/// Yedek parça tanımı
/// </summary>
public class SparePart : BaseEntity
{
    public string Code { get; private set; } = null!;
    public string Name { get; private set; } = null!;
    public string? Description { get; private set; }

    // Kategorilendirme
    public string? Category { get; private set; }
    public string? SubCategory { get; private set; }
    public SparePartCriticality Criticality { get; private set; }
    public SparePartStatus Status { get; private set; }

    // Teknik bilgiler
    public string? PartNumber { get; private set; }         // Parça numarası
    public string? Manufacturer { get; private set; }       // Üretici
    public string? ManufacturerPartNo { get; private set; } // Üretici parça no
    public string? AlternativePartNo { get; private set; }  // Alternatif parça no

    // Stok ve tedarik
    public int? InventoryItemId { get; private set; }       // Stok modülü referansı
    public string? Unit { get; private set; }
    public decimal MinimumStock { get; private set; }
    public decimal ReorderPoint { get; private set; }
    public decimal ReorderQuantity { get; private set; }
    public int LeadTimeDays { get; private set; }

    // Maliyet
    public decimal UnitCost { get; private set; }
    public decimal? LastPurchasePrice { get; private set; }

    // Uyumluluk
    public string? CompatibleMachines { get; private set; }  // JSON list of machine IDs
    public string? CompatibleModels { get; private set; }    // Model uyumluluğu

    // Raf ömrü
    public int? ShelfLifeMonths { get; private set; }
    public string? StorageConditions { get; private set; }

    public bool IsActive { get; private set; }

    // Navigation properties
    public virtual ICollection<MaintenancePlanSparePart> MaintenancePlans { get; private set; } = new List<MaintenancePlanSparePart>();
    public virtual ICollection<MaintenanceRecordSparePart> MaintenanceRecords { get; private set; } = new List<MaintenanceRecordSparePart>();

    protected SparePart() { }

    public SparePart(string code, string name)
    {
        Code = code;
        Name = name;
        Criticality = SparePartCriticality.Normal;
        Status = SparePartStatus.Aktif;
        IsActive = true;
        Unit = "Adet";
    }

    public void Update(string name, string? description)
    {
        Name = name;
        Description = description;
    }

    public void SetCategory(string? category, string? subCategory)
    {
        Category = category;
        SubCategory = subCategory;
    }

    public void SetCriticality(SparePartCriticality criticality) => Criticality = criticality;
    public void SetStatus(SparePartStatus status) => Status = status;

    public void SetTechnicalInfo(string? partNumber, string? manufacturer, string? manufacturerPartNo, string? alternativePartNo)
    {
        PartNumber = partNumber;
        Manufacturer = manufacturer;
        ManufacturerPartNo = manufacturerPartNo;
        AlternativePartNo = alternativePartNo;
    }

    public void SetStockParameters(string? unit, decimal minimumStock, decimal reorderPoint, decimal reorderQuantity, int leadTimeDays)
    {
        Unit = unit;
        MinimumStock = minimumStock;
        ReorderPoint = reorderPoint;
        ReorderQuantity = reorderQuantity;
        LeadTimeDays = leadTimeDays;
    }

    public void SetCost(decimal unitCost, decimal? lastPurchasePrice = null)
    {
        UnitCost = unitCost;
        LastPurchasePrice = lastPurchasePrice;
    }

    public void SetCompatibility(string? compatibleMachines, string? compatibleModels)
    {
        CompatibleMachines = compatibleMachines;
        CompatibleModels = compatibleModels;
    }

    public void SetShelfLife(int? shelfLifeMonths, string? storageConditions)
    {
        ShelfLifeMonths = shelfLifeMonths;
        StorageConditions = storageConditions;
    }

    public void SetInventoryLink(int? inventoryItemId) => InventoryItemId = inventoryItemId;
    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;
}

/// <summary>
/// Bakım planı - Yedek parça ilişkisi
/// </summary>
public class MaintenancePlanSparePart : BaseEntity
{
    public int MaintenancePlanId { get; private set; }
    public int SparePartId { get; private set; }

    public decimal RequiredQuantity { get; private set; }
    public bool IsMandatory { get; private set; }
    public string? Notes { get; private set; }

    // Navigation properties
    public virtual MaintenancePlan MaintenancePlan { get; private set; } = null!;
    public virtual SparePart SparePart { get; private set; } = null!;

    protected MaintenancePlanSparePart() { }

    public MaintenancePlanSparePart(int maintenancePlanId, int sparePartId, decimal requiredQuantity)
    {
        MaintenancePlanId = maintenancePlanId;
        SparePartId = sparePartId;
        RequiredQuantity = requiredQuantity;
        IsMandatory = true;
    }

    public void SetQuantity(decimal quantity) => RequiredQuantity = quantity;
    public void SetMandatory(bool isMandatory) => IsMandatory = isMandatory;
    public void SetNotes(string? notes) => Notes = notes;
}

/// <summary>
/// Bakım kaydı - Kullanılan yedek parça
/// </summary>
public class MaintenanceRecordSparePart : BaseEntity
{
    public int MaintenanceRecordId { get; private set; }
    public int SparePartId { get; private set; }

    public decimal UsedQuantity { get; private set; }
    public decimal UnitCost { get; private set; }
    public decimal TotalCost { get; private set; }

    public string? LotNumber { get; private set; }
    public string? SerialNumber { get; private set; }
    public string? Notes { get; private set; }

    // Navigation properties
    public virtual MaintenanceRecord MaintenanceRecord { get; private set; } = null!;
    public virtual SparePart SparePart { get; private set; } = null!;

    protected MaintenanceRecordSparePart() { }

    public MaintenanceRecordSparePart(int maintenanceRecordId, int sparePartId, decimal usedQuantity, decimal unitCost)
    {
        MaintenanceRecordId = maintenanceRecordId;
        SparePartId = sparePartId;
        UsedQuantity = usedQuantity;
        UnitCost = unitCost;
        TotalCost = usedQuantity * unitCost;
    }

    public void SetTracking(string? lotNumber, string? serialNumber)
    {
        LotNumber = lotNumber;
        SerialNumber = serialNumber;
    }

    public void SetNotes(string? notes) => Notes = notes;

    public void UpdateQuantity(decimal quantity)
    {
        UsedQuantity = quantity;
        TotalCost = UsedQuantity * UnitCost;
    }
}

/// <summary>
/// Makine sayaç kaydı - Kestirimci bakım için
/// </summary>
public class MachineCounter : BaseEntity
{
    public int MachineId { get; private set; }
    public string CounterName { get; private set; } = null!;  // Çalışma saati, Çevrim, vb.
    public string? CounterUnit { get; private set; }

    public decimal CurrentValue { get; private set; }
    public decimal? PreviousValue { get; private set; }
    public DateTime LastUpdated { get; private set; }

    public decimal? ResetValue { get; private set; }          // Bakım sonrası reset değeri
    public DateTime? LastResetDate { get; private set; }

    // Eşik değerleri
    public decimal? WarningThreshold { get; private set; }
    public decimal? CriticalThreshold { get; private set; }

    // Navigation properties
    public virtual Machine Machine { get; private set; } = null!;

    protected MachineCounter() { }

    public MachineCounter(int machineId, string counterName, string? counterUnit)
    {
        MachineId = machineId;
        CounterName = counterName;
        CounterUnit = counterUnit;
        CurrentValue = 0;
        LastUpdated = DateTime.UtcNow;
    }

    public void UpdateValue(decimal newValue)
    {
        PreviousValue = CurrentValue;
        CurrentValue = newValue;
        LastUpdated = DateTime.UtcNow;
    }

    public void Reset(decimal resetValue)
    {
        PreviousValue = CurrentValue;
        CurrentValue = resetValue;
        ResetValue = resetValue;
        LastResetDate = DateTime.UtcNow;
        LastUpdated = DateTime.UtcNow;
    }

    public void SetThresholds(decimal? warningThreshold, decimal? criticalThreshold)
    {
        WarningThreshold = warningThreshold;
        CriticalThreshold = criticalThreshold;
    }

    public bool IsWarning() => WarningThreshold.HasValue && CurrentValue >= WarningThreshold.Value;
    public bool IsCritical() => CriticalThreshold.HasValue && CurrentValue >= CriticalThreshold.Value;
}
