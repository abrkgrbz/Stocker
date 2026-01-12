using Stocker.SharedKernel.Common;
using Stocker.Modules.Manufacturing.Domain.Enums;

namespace Stocker.Modules.Manufacturing.Domain.Entities;

/// <summary>
/// Uygunsuzluk Raporu (NCR) - Non-Conformance Report
/// Kalite uygunsuzluklarının takibi ve yönetimi
/// </summary>
public class NonConformanceReport : BaseEntity
{
    public string NcrNumber { get; private set; } = null!;
    public NcrStatus Status { get; private set; }
    public NcrSource Source { get; private set; }
    public NcrSeverity Severity { get; private set; }

    // İlişkili kayıtlar
    public int? ProductionOrderId { get; private set; }
    public int? ProductionOperationId { get; private set; }
    public int? QualityInspectionId { get; private set; }
    public int? PurchaseOrderId { get; private set; }
    public int? SalesOrderId { get; private set; }

    // Ürün bilgileri
    public int ProductId { get; private set; }
    public string? ProductCode { get; private set; }
    public string? ProductName { get; private set; }
    public string? LotNumber { get; private set; }
    public string? SerialNumber { get; private set; }
    public decimal AffectedQuantity { get; private set; }
    public string Unit { get; private set; } = "Adet";

    // Lokasyon
    public int? WorkCenterId { get; private set; }
    public int? WarehouseId { get; private set; }
    public string? DetectionLocation { get; private set; }

    // Uygunsuzluk detayları
    public string Title { get; private set; } = null!;
    public string Description { get; private set; } = null!;
    public string? DefectType { get; private set; }
    public string? DefectCode { get; private set; }
    public string? SpecificationReference { get; private set; }
    public string? ActualValue { get; private set; }
    public string? ExpectedValue { get; private set; }

    // Tespit bilgileri
    public DateTime DetectionDate { get; private set; }
    public string? DetectedBy { get; private set; }
    public int? DetectedByUserId { get; private set; }

    // Soruşturma
    public string? InvestigationNotes { get; private set; }
    public DateTime? InvestigationStartDate { get; private set; }
    public DateTime? InvestigationEndDate { get; private set; }
    public string? InvestigatedBy { get; private set; }

    // Kök neden analizi
    public RootCauseCategory? RootCauseCategory { get; private set; }
    public string? RootCauseDescription { get; private set; }
    public string? FiveWhyAnalysis { get; private set; } // JSON format
    public string? IshikawaDiagram { get; private set; } // JSON format

    // Karar (Disposition)
    public NcrDisposition? Disposition { get; private set; }
    public string? DispositionReason { get; private set; }
    public string? DispositionApprovedBy { get; private set; }
    public DateTime? DispositionDate { get; private set; }

    // Etkilenen taraflar
    public int? CustomerId { get; private set; }
    public string? CustomerName { get; private set; }
    public int? SupplierId { get; private set; }
    public string? SupplierName { get; private set; }
    public bool CustomerNotificationRequired { get; private set; }
    public bool CustomerNotified { get; private set; }
    public DateTime? CustomerNotificationDate { get; private set; }

    // Maliyet
    public decimal? EstimatedCost { get; private set; }
    public decimal? ActualCost { get; private set; }
    public string? CostBreakdown { get; private set; } // JSON format

    // Kapatma
    public DateTime? ClosedDate { get; private set; }
    public string? ClosedBy { get; private set; }
    public string? ClosureNotes { get; private set; }

    public string? Notes { get; private set; }
    public string? Attachments { get; private set; } // JSON array of file paths
    public new string? CreatedBy { get; private set; }
    public bool IsActive { get; private set; }

    // Navigation properties
    public virtual ProductionOrder? ProductionOrder { get; private set; }
    public virtual ProductionOperation? ProductionOperation { get; private set; }
    public virtual WorkCenter? WorkCenter { get; private set; }
    public virtual ICollection<CorrectivePreventiveAction> CapaActions { get; private set; } = new List<CorrectivePreventiveAction>();
    public virtual ICollection<NcrContainmentAction> ContainmentActions { get; private set; } = new List<NcrContainmentAction>();

    protected NonConformanceReport() { }

    public NonConformanceReport(
        string ncrNumber,
        int productId,
        string title,
        string description,
        NcrSource source,
        NcrSeverity severity,
        decimal affectedQuantity)
    {
        NcrNumber = ncrNumber;
        ProductId = productId;
        Title = title;
        Description = description;
        Source = source;
        Severity = severity;
        AffectedQuantity = affectedQuantity;
        Status = NcrStatus.Açık;
        DetectionDate = DateTime.UtcNow;
        IsActive = true;
    }

    public void SetProductInfo(string? productCode, string? productName, string unit)
    {
        ProductCode = productCode;
        ProductName = productName;
        Unit = unit;
    }

    public void SetLotSerialInfo(string? lotNumber, string? serialNumber)
    {
        LotNumber = lotNumber;
        SerialNumber = serialNumber;
    }

    public void SetProductionReference(int? productionOrderId, int? operationId)
    {
        ProductionOrderId = productionOrderId;
        ProductionOperationId = operationId;
    }

    public void SetQualityInspectionReference(int qualityInspectionId)
    {
        QualityInspectionId = qualityInspectionId;
    }

    public void SetLocation(int? workCenterId, int? warehouseId, string? detectionLocation)
    {
        WorkCenterId = workCenterId;
        WarehouseId = warehouseId;
        DetectionLocation = detectionLocation;
    }

    public void SetDefectDetails(string? defectType, string? defectCode, string? specReference)
    {
        DefectType = defectType;
        DefectCode = defectCode;
        SpecificationReference = specReference;
    }

    public void SetMeasurementDeviation(string? actualValue, string? expectedValue)
    {
        ActualValue = actualValue;
        ExpectedValue = expectedValue;
    }

    public void SetDetectedBy(string detectedBy, int? userId)
    {
        DetectedBy = detectedBy;
        DetectedByUserId = userId;
    }

    public void SetCreatedBy(string createdBy) => CreatedBy = createdBy;

    public void StartInvestigation(string investigatedBy)
    {
        if (Status != NcrStatus.Açık)
            throw new InvalidOperationException("Soruşturma sadece açık NCR'lar için başlatılabilir.");

        Status = NcrStatus.Araştırılıyor;
        InvestigationStartDate = DateTime.UtcNow;
        InvestigatedBy = investigatedBy;
    }

    public void RecordInvestigationNotes(string notes)
    {
        InvestigationNotes = notes;
    }

    public void CompleteInvestigation()
    {
        if (Status != NcrStatus.Araştırılıyor)
            throw new InvalidOperationException("Soruşturma tamamlanması için NCR araştırma aşamasında olmalıdır.");

        InvestigationEndDate = DateTime.UtcNow;
        Status = NcrStatus.KökNedenAnalizi;
    }

    public void SetRootCause(RootCauseCategory category, string description)
    {
        RootCauseCategory = category;
        RootCauseDescription = description;
    }

    public void SetFiveWhyAnalysis(string fiveWhyJson)
    {
        FiveWhyAnalysis = fiveWhyJson;
    }

    public void SetIshikawaDiagram(string ishikawaJson)
    {
        IshikawaDiagram = ishikawaJson;
    }

    public void SetDisposition(NcrDisposition disposition, string reason, string approvedBy)
    {
        Disposition = disposition;
        DispositionReason = reason;
        DispositionApprovedBy = approvedBy;
        DispositionDate = DateTime.UtcNow;

        Status = NcrStatus.DüzelticiAksiyonBekleniyor;
    }

    public void SetCustomerInfo(int? customerId, string? customerName, bool notificationRequired)
    {
        CustomerId = customerId;
        CustomerName = customerName;
        CustomerNotificationRequired = notificationRequired;
    }

    public void SetSupplierInfo(int? supplierId, string? supplierName)
    {
        SupplierId = supplierId;
        SupplierName = supplierName;
    }

    public void RecordCustomerNotification()
    {
        CustomerNotified = true;
        CustomerNotificationDate = DateTime.UtcNow;
    }

    public void SetCost(decimal? estimated, decimal? actual, string? breakdown)
    {
        EstimatedCost = estimated;
        ActualCost = actual;
        CostBreakdown = breakdown;
    }

    public NcrContainmentAction AddContainmentAction(string action, string responsiblePerson, DateTime dueDate)
    {
        var containment = new NcrContainmentAction(Id, action, responsiblePerson, dueDate);
        ContainmentActions.Add(containment);
        return containment;
    }

    public CorrectivePreventiveAction AddCapaAction(CapaType type, string description, string responsiblePerson, DateTime dueDate)
    {
        var capa = new CorrectivePreventiveAction(Id, type, description, responsiblePerson, dueDate);
        CapaActions.Add(capa);
        return capa;
    }

    public void AwaitVerification()
    {
        if (Status != NcrStatus.DüzelticiAksiyonBekleniyor)
            throw new InvalidOperationException("Doğrulama bekleme sadece CAPA bekleme aşamasından geçilebilir.");

        // Check if all CAPA actions are completed
        var allCapaCompleted = CapaActions.All(c => c.Status == CapaStatus.Kapatıldı || c.Status == CapaStatus.İptal);
        if (!allCapaCompleted)
            throw new InvalidOperationException("Tüm CAPA aksiyonları tamamlanmadan doğrulama aşamasına geçilemez.");

        Status = NcrStatus.DoğrulamaBekleniyor;
    }

    public void Close(string closedBy, string closureNotes)
    {
        if (Status != NcrStatus.DoğrulamaBekleniyor)
            throw new InvalidOperationException("NCR sadece doğrulama aşamasındayken kapatılabilir.");

        Status = NcrStatus.Kapatıldı;
        ClosedDate = DateTime.UtcNow;
        ClosedBy = closedBy;
        ClosureNotes = closureNotes;
    }

    public void Cancel(string reason)
    {
        if (Status == NcrStatus.Kapatıldı)
            throw new InvalidOperationException("Kapatılmış NCR iptal edilemez.");

        Status = NcrStatus.İptal;
        Notes = $"İptal nedeni: {reason}. {Notes}";
    }

    public void SetNotes(string? notes) => Notes = notes;
    public void SetAttachments(string? attachments) => Attachments = attachments;
    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;

    /// <summary>
    /// NCR yaşını gün olarak hesaplar
    /// </summary>
    public int GetAgeDays()
    {
        var endDate = ClosedDate ?? DateTime.UtcNow;
        return (int)(endDate - DetectionDate).TotalDays;
    }
}

/// <summary>
/// NCR İvedi Önlem (Containment Action) - Acil müdahale aksiyonları
/// </summary>
public class NcrContainmentAction : BaseEntity
{
    public int NonConformanceReportId { get; private set; }
    public string Action { get; private set; } = null!;
    public string ResponsiblePerson { get; private set; } = null!;
    public DateTime DueDate { get; private set; }
    public DateTime? CompletedDate { get; private set; }
    public bool IsCompleted { get; private set; }
    public string? Result { get; private set; }
    public string? Notes { get; private set; }

    // Navigation
    public virtual NonConformanceReport NonConformanceReport { get; private set; } = null!;

    protected NcrContainmentAction() { }

    public NcrContainmentAction(int ncrId, string action, string responsiblePerson, DateTime dueDate)
    {
        NonConformanceReportId = ncrId;
        Action = action;
        ResponsiblePerson = responsiblePerson;
        DueDate = dueDate;
        IsCompleted = false;
    }

    public void Complete(string result)
    {
        IsCompleted = true;
        CompletedDate = DateTime.UtcNow;
        Result = result;
    }

    public void SetNotes(string? notes) => Notes = notes;
}

/// <summary>
/// Düzeltici/Önleyici Faaliyet (CAPA) - Corrective and Preventive Action
/// </summary>
public class CorrectivePreventiveAction : BaseEntity
{
    public string CapaNumber { get; private set; } = null!;
    public int? NonConformanceReportId { get; private set; }
    public CapaType Type { get; private set; }
    public CapaStatus Status { get; private set; }
    public CapaPriority Priority { get; private set; }

    // Aksiyon detayları
    public string Description { get; private set; } = null!;
    public string? ObjectiveStatement { get; private set; }
    public string? ScopeDefinition { get; private set; }

    // Sorumluluk
    public string ResponsiblePerson { get; private set; } = null!;
    public int? ResponsibleUserId { get; private set; }
    public string? ResponsibleDepartment { get; private set; }

    // Planlama
    public DateTime DueDate { get; private set; }
    public DateTime? PlannedStartDate { get; private set; }
    public DateTime? PlannedEndDate { get; private set; }

    // Gerçekleşen
    public DateTime? ActualStartDate { get; private set; }
    public DateTime? ActualEndDate { get; private set; }
    public decimal CompletionPercent { get; private set; }

    // Kök neden
    public RootCauseCategory? RootCauseCategory { get; private set; }
    public string? RootCauseDescription { get; private set; }

    // Uygulama detayları
    public string? ActionPlan { get; private set; }
    public string? ImplementationNotes { get; private set; }
    public string? ResourcesRequired { get; private set; }
    public decimal? EstimatedCost { get; private set; }
    public decimal? ActualCost { get; private set; }

    // Doğrulama
    public string? VerificationMethod { get; private set; }
    public string? VerificationResult { get; private set; }
    public string? VerifiedBy { get; private set; }
    public DateTime? VerificationDate { get; private set; }

    // Etkinlik değerlendirmesi
    public bool? IsEffective { get; private set; }
    public string? EffectivenessNotes { get; private set; }
    public DateTime? EffectivenessReviewDate { get; private set; }

    // Kapatma
    public DateTime? ClosedDate { get; private set; }
    public string? ClosedBy { get; private set; }
    public string? ClosureNotes { get; private set; }

    public string? Notes { get; private set; }
    public string? Attachments { get; private set; }
    public new string? CreatedBy { get; private set; }
    public bool IsActive { get; private set; }

    // Navigation
    public virtual NonConformanceReport? NonConformanceReport { get; private set; }
    public virtual ICollection<CapaTask> Tasks { get; private set; } = new List<CapaTask>();

    protected CorrectivePreventiveAction() { }

    public CorrectivePreventiveAction(
        int? ncrId,
        CapaType type,
        string description,
        string responsiblePerson,
        DateTime dueDate)
    {
        CapaNumber = GenerateCapaNumber();
        NonConformanceReportId = ncrId;
        Type = type;
        Description = description;
        ResponsiblePerson = responsiblePerson;
        DueDate = dueDate;
        Status = CapaStatus.Taslak;
        Priority = CapaPriority.Normal;
        CompletionPercent = 0;
        IsActive = true;
    }

    private static string GenerateCapaNumber()
    {
        return $"CAPA-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..6].ToUpper()}";
    }

    public void SetObjective(string objective, string scope)
    {
        ObjectiveStatement = objective;
        ScopeDefinition = scope;
    }

    public void SetResponsibility(int? userId, string? department)
    {
        ResponsibleUserId = userId;
        ResponsibleDepartment = department;
    }

    public void SetPriority(CapaPriority priority)
    {
        Priority = priority;
    }

    public void SetPlannedDates(DateTime startDate, DateTime endDate)
    {
        PlannedStartDate = startDate;
        PlannedEndDate = endDate;
    }

    public void SetRootCause(RootCauseCategory category, string description)
    {
        RootCauseCategory = category;
        RootCauseDescription = description;
    }

    public void SetActionPlan(string actionPlan, string? resources, decimal? estimatedCost)
    {
        ActionPlan = actionPlan;
        ResourcesRequired = resources;
        EstimatedCost = estimatedCost;
    }

    public void SetCreatedBy(string createdBy) => CreatedBy = createdBy;

    public void Open()
    {
        if (Status != CapaStatus.Taslak)
            throw new InvalidOperationException("Sadece taslak CAPA açılabilir.");

        Status = CapaStatus.Açık;
    }

    public void StartPlanning()
    {
        if (Status != CapaStatus.Açık)
            throw new InvalidOperationException("Planlama sadece açık CAPA'dan başlatılabilir.");

        Status = CapaStatus.Planlama;
    }

    public void StartImplementation()
    {
        if (Status != CapaStatus.Planlama)
            throw new InvalidOperationException("Uygulama sadece planlama aşamasından başlatılabilir.");

        Status = CapaStatus.Uygulama;
        ActualStartDate = DateTime.UtcNow;
    }

    public void UpdateProgress(decimal completionPercent, string? notes)
    {
        CompletionPercent = Math.Min(100, Math.Max(0, completionPercent));
        ImplementationNotes = notes;
    }

    public void CompleteImplementation()
    {
        if (Status != CapaStatus.Uygulama)
            throw new InvalidOperationException("Uygulama tamamlama sadece uygulama aşamasında yapılabilir.");

        Status = CapaStatus.Doğrulama;
        ActualEndDate = DateTime.UtcNow;
        CompletionPercent = 100;
    }

    public void SetVerificationMethod(string method)
    {
        VerificationMethod = method;
    }

    public void Verify(string result, string verifiedBy)
    {
        if (Status != CapaStatus.Doğrulama)
            throw new InvalidOperationException("Doğrulama sadece doğrulama aşamasında yapılabilir.");

        VerificationResult = result;
        VerifiedBy = verifiedBy;
        VerificationDate = DateTime.UtcNow;
        Status = CapaStatus.EtkinlikDeğerlendirme;
    }

    public void EvaluateEffectiveness(bool isEffective, string notes)
    {
        if (Status != CapaStatus.EtkinlikDeğerlendirme)
            throw new InvalidOperationException("Etkinlik değerlendirmesi sadece ilgili aşamada yapılabilir.");

        IsEffective = isEffective;
        EffectivenessNotes = notes;
        EffectivenessReviewDate = DateTime.UtcNow;
    }

    public void Close(string closedBy, string closureNotes)
    {
        if (Status != CapaStatus.EtkinlikDeğerlendirme)
            throw new InvalidOperationException("CAPA sadece etkinlik değerlendirmesi aşamasında kapatılabilir.");

        if (!IsEffective.HasValue)
            throw new InvalidOperationException("Etkinlik değerlendirmesi yapılmadan CAPA kapatılamaz.");

        Status = CapaStatus.Kapatıldı;
        ClosedDate = DateTime.UtcNow;
        ClosedBy = closedBy;
        ClosureNotes = closureNotes;
        ActualCost = CalculateTotalCost();
    }

    public void Cancel(string reason)
    {
        if (Status == CapaStatus.Kapatıldı)
            throw new InvalidOperationException("Kapatılmış CAPA iptal edilemez.");

        Status = CapaStatus.İptal;
        Notes = $"İptal nedeni: {reason}. {Notes}";
    }

    public CapaTask AddTask(string taskDescription, string assignedTo, DateTime dueDate)
    {
        var task = new CapaTask(Id, taskDescription, assignedTo, dueDate);
        Tasks.Add(task);
        return task;
    }

    public void SetNotes(string? notes) => Notes = notes;
    public void SetAttachments(string? attachments) => Attachments = attachments;
    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;

    private decimal CalculateTotalCost()
    {
        return Tasks.Sum(t => t.ActualCost ?? 0) + (ActualCost ?? 0);
    }

    /// <summary>
    /// CAPA yaşını gün olarak hesaplar
    /// </summary>
    public int GetAgeDays()
    {
        var endDate = ClosedDate ?? DateTime.UtcNow;
        return (int)(endDate - CreatedDate).TotalDays;
    }

    /// <summary>
    /// Hedef tarihe kaç gün kaldığını hesaplar
    /// </summary>
    public int GetDaysUntilDue()
    {
        return (int)(DueDate - DateTime.UtcNow).TotalDays;
    }

    /// <summary>
    /// Gecikme durumunu kontrol eder
    /// </summary>
    public bool IsOverdue()
    {
        return Status != CapaStatus.Kapatıldı && Status != CapaStatus.İptal && DateTime.UtcNow > DueDate;
    }
}

/// <summary>
/// CAPA Alt Görevi - CAPA kapsamındaki spesifik görevler
/// </summary>
public class CapaTask : BaseEntity
{
    public int CorrectivePreventiveActionId { get; private set; }
    public int SequenceNumber { get; private set; }
    public string Description { get; private set; } = null!;
    public string AssignedTo { get; private set; } = null!;
    public int? AssignedUserId { get; private set; }

    public DateTime DueDate { get; private set; }
    public DateTime? CompletedDate { get; private set; }
    public bool IsCompleted { get; private set; }

    public string? Result { get; private set; }
    public string? Notes { get; private set; }
    public decimal? EstimatedCost { get; private set; }
    public decimal? ActualCost { get; private set; }

    // Navigation
    public virtual CorrectivePreventiveAction CorrectivePreventiveAction { get; private set; } = null!;

    protected CapaTask() { }

    public CapaTask(int capaId, string description, string assignedTo, DateTime dueDate)
    {
        CorrectivePreventiveActionId = capaId;
        Description = description;
        AssignedTo = assignedTo;
        DueDate = dueDate;
        IsCompleted = false;
    }

    public void SetSequenceNumber(int sequenceNumber)
    {
        SequenceNumber = sequenceNumber;
    }

    public void SetAssignedUser(int? userId)
    {
        AssignedUserId = userId;
    }

    public void SetCost(decimal? estimated, decimal? actual)
    {
        EstimatedCost = estimated;
        ActualCost = actual;
    }

    public void Complete(string result, decimal? actualCost = null)
    {
        IsCompleted = true;
        CompletedDate = DateTime.UtcNow;
        Result = result;
        if (actualCost.HasValue)
            ActualCost = actualCost;
    }

    public void SetNotes(string? notes) => Notes = notes;
}
