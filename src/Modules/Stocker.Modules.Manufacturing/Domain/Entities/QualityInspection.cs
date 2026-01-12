using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Manufacturing.Domain.Entities;

/// <summary>
/// Kalite kontrol kaydı - Üretim kalite denetimleri
/// </summary>
public class QualityInspection : AggregateRoot<Guid>
{
    public Guid TenantId { get; private set; }
    public string InspectionNumber { get; private set; } = string.Empty;
    public string InspectionType { get; private set; } = string.Empty; // Girdi, Proses, Final, Rutin

    // İlişkili Kayıtlar
    public Guid? ProductionOrderId { get; private set; }
    public Guid? ProductionOperationId { get; private set; }
    public Guid? ProductionReceiptId { get; private set; }
    public Guid ProductId { get; private set; }
    public string? LotNumber { get; private set; }

    // Numune Bilgileri
    public decimal SampleSize { get; private set; }
    public decimal InspectedQuantity { get; private set; }
    public decimal AcceptedQuantity { get; private set; }
    public decimal RejectedQuantity { get; private set; }
    public string SamplingMethod { get; private set; } = "Rastgele"; // Rastgele, Sistematik, Tabakalı
    public string AcceptanceCriteria { get; private set; } = string.Empty; // AQL seviyesi vb.

    // Kalite Planı Referansı
    public Guid? QualityPlanId { get; private set; }
    public string? QualityPlanCode { get; private set; }

    // Sonuç Bilgileri
    public string Result { get; private set; } = "Beklemede"; // Beklemede, Geçti, Kaldı, Şartlı Geçti
    public decimal? DefectRate { get; private set; }
    public int TotalDefects { get; private set; }
    public int CriticalDefects { get; private set; }
    public int MajorDefects { get; private set; }
    public int MinorDefects { get; private set; }

    // Ölçüm Sonuçları (JSON formatında)
    public string? MeasurementResults { get; private set; }

    // Denetim Bilgileri
    public Guid InspectorId { get; private set; }
    public string? InspectorName { get; private set; }
    public DateTime InspectionDate { get; private set; }
    public DateTime? StartTime { get; private set; }
    public DateTime? EndTime { get; private set; }
    public decimal? InspectionDurationMinutes { get; private set; }

    // Ekipman Bilgileri
    public string? EquipmentUsed { get; private set; }
    public DateTime? EquipmentCalibrationDate { get; private set; }

    // Uygunsuzluk ve Düzeltici Faaliyet
    public bool HasNonConformance { get; private set; }
    public string? NonConformanceDescription { get; private set; }
    public string? CorrectiveAction { get; private set; }
    public string? PreventiveAction { get; private set; }
    public Guid? NonConformanceReportId { get; private set; }

    // Karar Bilgileri
    public string? DispositionDecision { get; private set; } // Kabul, Red, Yeniden İşleme, İmha, Şartlı Kabul
    public string? DispositionReason { get; private set; }
    public Guid? DispositionApprovedBy { get; private set; }
    public DateTime? DispositionDate { get; private set; }

    // Müşteri/Tedarikçi İlişkisi
    public Guid? CustomerId { get; private set; }
    public Guid? SupplierId { get; private set; }
    public bool RequiresCustomerApproval { get; private set; }
    public bool CustomerApproved { get; private set; }

    // Sertifikasyon
    public bool CertificateRequired { get; private set; }
    public string? CertificateNumber { get; private set; }
    public DateTime? CertificateDate { get; private set; }

    public string Status { get; private set; } = "Açık"; // Açık, Tamamlandı, İptal
    public string? Notes { get; private set; }
    public string? Attachments { get; private set; } // JSON array of file paths

    public Guid CreatedBy { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public Guid? ModifiedBy { get; private set; }
    public DateTime? ModifiedAt { get; private set; }

    // Navigation Properties
    public virtual ProductionOrder? ProductionOrder { get; private set; }
    public virtual ProductionOperation? ProductionOperation { get; private set; }
    public virtual ProductionReceipt? ProductionReceipt { get; private set; }
    public virtual ICollection<QualityInspectionDetail> Details { get; private set; } = new List<QualityInspectionDetail>();

    private QualityInspection() { }

    public QualityInspection(
        Guid id,
        Guid tenantId,
        string inspectionNumber,
        string inspectionType,
        Guid productId,
        Guid inspectorId,
        Guid createdBy)
    {
        Id = id;
        TenantId = tenantId;
        InspectionNumber = inspectionNumber;
        InspectionType = inspectionType;
        ProductId = productId;
        InspectorId = inspectorId;
        InspectionDate = DateTime.UtcNow;
        CreatedBy = createdBy;
        CreatedAt = DateTime.UtcNow;
    }

    public void SetProductionReference(Guid? productionOrderId, Guid? operationId = null, Guid? receiptId = null)
    {
        ProductionOrderId = productionOrderId;
        ProductionOperationId = operationId;
        ProductionReceiptId = receiptId;
        ModifiedAt = DateTime.UtcNow;
    }

    public void SetSampleInfo(decimal sampleSize, decimal inspectedQuantity, string samplingMethod, string acceptanceCriteria)
    {
        SampleSize = sampleSize;
        InspectedQuantity = inspectedQuantity;
        SamplingMethod = samplingMethod;
        AcceptanceCriteria = acceptanceCriteria;
        ModifiedAt = DateTime.UtcNow;
    }

    public void SetQualityPlan(Guid qualityPlanId, string qualityPlanCode)
    {
        QualityPlanId = qualityPlanId;
        QualityPlanCode = qualityPlanCode;
        ModifiedAt = DateTime.UtcNow;
    }

    public void StartInspection()
    {
        StartTime = DateTime.UtcNow;
        Status = "Devam Ediyor";
        ModifiedAt = DateTime.UtcNow;
    }

    public void RecordDefects(int critical, int major, int minor)
    {
        CriticalDefects = critical;
        MajorDefects = major;
        MinorDefects = minor;
        TotalDefects = critical + major + minor;

        if (InspectedQuantity > 0)
            DefectRate = (decimal)TotalDefects / InspectedQuantity * 100;

        ModifiedAt = DateTime.UtcNow;
    }

    public void RecordMeasurements(string measurementResultsJson)
    {
        MeasurementResults = measurementResultsJson;
        ModifiedAt = DateTime.UtcNow;
    }

    public void SetResult(string result, decimal acceptedQty, decimal rejectedQty)
    {
        Result = result;
        AcceptedQuantity = acceptedQty;
        RejectedQuantity = rejectedQty;
        EndTime = DateTime.UtcNow;

        if (StartTime.HasValue)
            InspectionDurationMinutes = (decimal)(EndTime.Value - StartTime.Value).TotalMinutes;

        ModifiedAt = DateTime.UtcNow;
    }

    public void RecordNonConformance(string description, string? correctiveAction = null, string? preventiveAction = null)
    {
        HasNonConformance = true;
        NonConformanceDescription = description;
        CorrectiveAction = correctiveAction;
        PreventiveAction = preventiveAction;
        ModifiedAt = DateTime.UtcNow;
    }

    public void SetDisposition(string decision, string reason, Guid approvedBy)
    {
        DispositionDecision = decision;
        DispositionReason = reason;
        DispositionApprovedBy = approvedBy;
        DispositionDate = DateTime.UtcNow;
        ModifiedAt = DateTime.UtcNow;
    }

    public void Complete(Guid modifiedBy)
    {
        if (string.IsNullOrEmpty(Result) || Result == "Beklemede")
            throw new InvalidOperationException("Sonuç belirlenmeden denetim tamamlanamaz.");

        Status = "Tamamlandı";
        EndTime ??= DateTime.UtcNow;
        ModifiedBy = modifiedBy;
        ModifiedAt = DateTime.UtcNow;
    }

    public void GenerateCertificate(string certificateNumber)
    {
        if (Result != "Geçti" && Result != "Şartlı Geçti")
            throw new InvalidOperationException("Sadece geçen ürünler için sertifika oluşturulabilir.");

        CertificateRequired = true;
        CertificateNumber = certificateNumber;
        CertificateDate = DateTime.UtcNow;
        ModifiedAt = DateTime.UtcNow;
    }
}

/// <summary>
/// Kalite kontrol detay satırı - Ölçüm parametreleri
/// </summary>
public class QualityInspectionDetail : Entity<Guid>
{
    public Guid QualityInspectionId { get; private set; }
    public int SequenceNumber { get; private set; }
    public string ParameterName { get; private set; } = string.Empty;
    public string ParameterCode { get; private set; } = string.Empty;
    public string ParameterType { get; private set; } = string.Empty; // Ölçümsel, Görsel, Fonksiyonel

    // Spesifikasyon
    public string? SpecificationValue { get; private set; }
    public decimal? NominalValue { get; private set; }
    public decimal? UpperLimit { get; private set; }
    public decimal? LowerLimit { get; private set; }
    public decimal? UpperTolerance { get; private set; }
    public decimal? LowerTolerance { get; private set; }
    public string UnitOfMeasure { get; private set; } = string.Empty;

    // Ölçüm Sonuçları
    public string? MeasuredValue { get; private set; }
    public decimal? NumericValue { get; private set; }
    public decimal? Deviation { get; private set; }
    public bool IsWithinSpec { get; private set; }
    public string Result { get; private set; } = "Beklemede"; // Geçti, Kaldı, Beklemede

    // Ölçüm Detayları
    public string? MeasurementMethod { get; private set; }
    public string? MeasurementEquipment { get; private set; }
    public DateTime? MeasurementDate { get; private set; }

    public string? Notes { get; private set; }

    // Navigation
    public virtual QualityInspection? QualityInspection { get; private set; }

    private QualityInspectionDetail() { }

    public QualityInspectionDetail(
        Guid id,
        Guid qualityInspectionId,
        int sequenceNumber,
        string parameterName,
        string parameterCode,
        string parameterType)
    {
        Id = id;
        QualityInspectionId = qualityInspectionId;
        SequenceNumber = sequenceNumber;
        ParameterName = parameterName;
        ParameterCode = parameterCode;
        ParameterType = parameterType;
    }

    public void SetSpecification(decimal? nominal, decimal? upper, decimal? lower, string unitOfMeasure)
    {
        NominalValue = nominal;
        UpperLimit = upper;
        LowerLimit = lower;
        UnitOfMeasure = unitOfMeasure;

        if (nominal.HasValue && upper.HasValue)
            UpperTolerance = upper - nominal;
        if (nominal.HasValue && lower.HasValue)
            LowerTolerance = nominal - lower;
    }

    public void RecordMeasurement(decimal numericValue, string? method = null, string? equipment = null)
    {
        NumericValue = numericValue;
        MeasuredValue = numericValue.ToString();
        MeasurementMethod = method;
        MeasurementEquipment = equipment;
        MeasurementDate = DateTime.UtcNow;

        // Sapma hesapla
        if (NominalValue.HasValue)
            Deviation = numericValue - NominalValue.Value;

        // Spesifikasyon kontrolü
        bool withinUpper = !UpperLimit.HasValue || numericValue <= UpperLimit.Value;
        bool withinLower = !LowerLimit.HasValue || numericValue >= LowerLimit.Value;
        IsWithinSpec = withinUpper && withinLower;
        Result = IsWithinSpec ? "Geçti" : "Kaldı";
    }

    public void RecordVisualResult(string result, string? notes = null)
    {
        MeasuredValue = result;
        Result = result;
        Notes = notes;
        MeasurementDate = DateTime.UtcNow;
        IsWithinSpec = result == "Geçti" || result == "Kabul";
    }
}
