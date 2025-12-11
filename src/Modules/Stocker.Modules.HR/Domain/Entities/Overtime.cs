using Stocker.SharedKernel.Common;

namespace Stocker.Modules.HR.Domain.Entities;

/// <summary>
/// Fazla mesai entity'si - Fazla mesai takibi ve onay
/// Overtime entity - Overtime tracking and approval
/// </summary>
public class Overtime : BaseEntity
{
    #region Temel Bilgiler (Basic Information)

    /// <summary>
    /// Çalışan ID / Employee ID
    /// </summary>
    public int EmployeeId { get; private set; }

    /// <summary>
    /// Fazla mesai türü / Overtime type
    /// </summary>
    public OvertimeType OvertimeType { get; private set; }

    /// <summary>
    /// Durum / Status
    /// </summary>
    public OvertimeStatus Status { get; private set; }

    #endregion

    #region Zaman Bilgileri (Time Information)

    /// <summary>
    /// Tarih / Date
    /// </summary>
    public DateOnly Date { get; private set; }

    /// <summary>
    /// Başlangıç saati / Start time
    /// </summary>
    public TimeOnly StartTime { get; private set; }

    /// <summary>
    /// Bitiş saati / End time
    /// </summary>
    public TimeOnly EndTime { get; private set; }

    /// <summary>
    /// Planlanan saat / Planned hours
    /// </summary>
    public decimal PlannedHours { get; private set; }

    /// <summary>
    /// Gerçekleşen saat / Actual hours
    /// </summary>
    public decimal? ActualHours { get; private set; }

    /// <summary>
    /// Mola süresi (dakika) / Break duration (minutes)
    /// </summary>
    public int BreakMinutes { get; private set; }

    #endregion

    #region Çarpan Bilgileri (Multiplier Information)

    /// <summary>
    /// Ödeme çarpanı / Pay multiplier
    /// </summary>
    public decimal PayMultiplier { get; private set; } = 1.5m;

    /// <summary>
    /// Hesaplanan tutar / Calculated amount
    /// </summary>
    public decimal? CalculatedAmount { get; private set; }

    /// <summary>
    /// Para birimi / Currency
    /// </summary>
    public string Currency { get; private set; } = "TRY";

    #endregion

    #region İlişkiler (Relationships)

    /// <summary>
    /// Proje ID / Project ID
    /// </summary>
    public int? ProjectId { get; private set; }

    /// <summary>
    /// Proje adı / Project name
    /// </summary>
    public string? ProjectName { get; private set; }

    /// <summary>
    /// Görev ID / Task ID
    /// </summary>
    public string? TaskId { get; private set; }

    /// <summary>
    /// Maliyet merkezi / Cost center
    /// </summary>
    public string? CostCenter { get; private set; }

    #endregion

    #region Neden ve Açıklama (Reason & Description)

    /// <summary>
    /// Fazla mesai nedeni / Overtime reason
    /// </summary>
    public OvertimeReason Reason { get; private set; }

    /// <summary>
    /// Açıklama / Description
    /// </summary>
    public string? Description { get; private set; }

    /// <summary>
    /// İş detayı / Work details
    /// </summary>
    public string? WorkDetails { get; private set; }

    #endregion

    #region Onay Bilgileri (Approval Information)

    /// <summary>
    /// Talep tarihi / Request date
    /// </summary>
    public DateTime RequestDate { get; private set; }

    /// <summary>
    /// Onaylayan ID / Approved by ID
    /// </summary>
    public int? ApprovedById { get; private set; }

    /// <summary>
    /// Onay tarihi / Approval date
    /// </summary>
    public DateTime? ApprovalDate { get; private set; }

    /// <summary>
    /// Onay notu / Approval notes
    /// </summary>
    public string? ApprovalNotes { get; private set; }

    /// <summary>
    /// Red nedeni / Rejection reason
    /// </summary>
    public string? RejectionReason { get; private set; }

    #endregion

    #region Ödeme Bilgileri (Payment Information)

    /// <summary>
    /// Ödendi mi? / Is paid?
    /// </summary>
    public bool IsPaid { get; private set; }

    /// <summary>
    /// Ödeme tarihi / Payment date
    /// </summary>
    public DateTime? PaidDate { get; private set; }

    /// <summary>
    /// Bordro ID / Payroll ID
    /// </summary>
    public int? PayrollId { get; private set; }

    /// <summary>
    /// İzin yerine mi? / Compensatory time off?
    /// </summary>
    public bool IsCompensatoryTimeOff { get; private set; }

    /// <summary>
    /// Kullanılabilir izin saat / Available comp time hours
    /// </summary>
    public decimal? CompensatoryHoursEarned { get; private set; }

    /// <summary>
    /// Kullanılan izin saat / Used comp time hours
    /// </summary>
    public decimal? CompensatoryHoursUsed { get; private set; }

    #endregion

    #region Ek Bilgiler (Additional Information)

    /// <summary>
    /// Ön onaylı mı? / Pre-approved?
    /// </summary>
    public bool IsPreApproved { get; private set; }

    /// <summary>
    /// Acil mi? / Is emergency?
    /// </summary>
    public bool IsEmergency { get; private set; }

    /// <summary>
    /// Notlar / Notes
    /// </summary>
    public string? Notes { get; private set; }

    #endregion

    // Navigation Properties
    public virtual Employee Employee { get; private set; } = null!;
    public virtual Employee? ApprovedBy { get; private set; }
    public virtual Payroll? Payroll { get; private set; }

    protected Overtime() { }

    public Overtime(
        int employeeId,
        DateOnly date,
        TimeOnly startTime,
        TimeOnly endTime,
        OvertimeType overtimeType,
        OvertimeReason reason,
        string? description = null)
    {
        EmployeeId = employeeId;
        Date = date;
        StartTime = startTime;
        EndTime = endTime;
        OvertimeType = overtimeType;
        Reason = reason;
        Description = description;
        Status = OvertimeStatus.Pending;
        RequestDate = DateTime.UtcNow;
        Currency = "TRY";

        // Calculate planned hours
        var duration = endTime.ToTimeSpan() - startTime.ToTimeSpan();
        if (duration < TimeSpan.Zero) duration += TimeSpan.FromHours(24); // overnight
        PlannedHours = (decimal)duration.TotalHours;

        // Set default multiplier based on type
        PayMultiplier = overtimeType switch
        {
            OvertimeType.Weekday => 1.5m,
            OvertimeType.Weekend => 2.0m,
            OvertimeType.Holiday => 2.5m,
            OvertimeType.Night => 1.75m,
            _ => 1.5m
        };
    }

    public void Submit()
    {
        Status = OvertimeStatus.Pending;
        RequestDate = DateTime.UtcNow;
    }

    public void Approve(int approvedById, string? notes = null)
    {
        Status = OvertimeStatus.Approved;
        ApprovedById = approvedById;
        ApprovalDate = DateTime.UtcNow;
        ApprovalNotes = notes;
    }

    public void Reject(int rejectedById, string reason)
    {
        Status = OvertimeStatus.Rejected;
        ApprovedById = rejectedById;
        ApprovalDate = DateTime.UtcNow;
        RejectionReason = reason;
    }

    public void Cancel()
    {
        Status = OvertimeStatus.Cancelled;
    }

    public void RecordActualHours(decimal actualHours, int? breakMinutes = null)
    {
        ActualHours = actualHours;
        if (breakMinutes.HasValue) BreakMinutes = breakMinutes.Value;
        Status = OvertimeStatus.Completed;
    }

    public void CalculatePayment(decimal hourlyRate)
    {
        var hours = ActualHours ?? PlannedHours;
        var netHours = hours - (BreakMinutes / 60m);
        CalculatedAmount = netHours * hourlyRate * PayMultiplier;
    }

    public void MarkAsPaid(int payrollId)
    {
        IsPaid = true;
        PaidDate = DateTime.UtcNow;
        PayrollId = payrollId;
    }

    public void ConvertToCompensatoryTime(decimal hoursEarned)
    {
        IsCompensatoryTimeOff = true;
        CompensatoryHoursEarned = hoursEarned;
        CompensatoryHoursUsed = 0;
    }

    public void UseCompensatoryTime(decimal hours)
    {
        CompensatoryHoursUsed = (CompensatoryHoursUsed ?? 0) + hours;
    }

    public decimal GetRemainingCompensatoryHours()
    {
        return (CompensatoryHoursEarned ?? 0) - (CompensatoryHoursUsed ?? 0);
    }

    public void SetPayMultiplier(decimal multiplier) => PayMultiplier = multiplier;
    public void SetProject(int? projectId, string? projectName) { ProjectId = projectId; ProjectName = projectName; }
    public void SetTaskId(string? taskId) => TaskId = taskId;
    public void SetCostCenter(string? costCenter) => CostCenter = costCenter;
    public void SetWorkDetails(string? details) => WorkDetails = details;
    public void SetPreApproved(bool isPreApproved) => IsPreApproved = isPreApproved;
    public void SetEmergency(bool isEmergency) => IsEmergency = isEmergency;
    public void SetNotes(string? notes) => Notes = notes;
    public void SetBreakMinutes(int minutes) => BreakMinutes = minutes;
}

#region Enums

public enum OvertimeType
{
    /// <summary>Hafta içi / Weekday</summary>
    Weekday = 1,

    /// <summary>Hafta sonu / Weekend</summary>
    Weekend = 2,

    /// <summary>Resmi tatil / Holiday</summary>
    Holiday = 3,

    /// <summary>Gece mesaisi / Night shift</summary>
    Night = 4,

    /// <summary>Nöbet / On-call</summary>
    OnCall = 5
}

public enum OvertimeStatus
{
    /// <summary>Taslak / Draft</summary>
    Draft = 1,

    /// <summary>Beklemede / Pending</summary>
    Pending = 2,

    /// <summary>Onaylandı / Approved</summary>
    Approved = 3,

    /// <summary>Reddedildi / Rejected</summary>
    Rejected = 4,

    /// <summary>Tamamlandı / Completed</summary>
    Completed = 5,

    /// <summary>İptal edildi / Cancelled</summary>
    Cancelled = 6
}

public enum OvertimeReason
{
    /// <summary>Proje teslimi / Project deadline</summary>
    ProjectDeadline = 1,

    /// <summary>Müşteri talebi / Client request</summary>
    ClientRequest = 2,

    /// <summary>Bakım / Maintenance</summary>
    Maintenance = 3,

    /// <summary>Acil durum / Emergency</summary>
    Emergency = 4,

    /// <summary>Envanter sayımı / Inventory count</summary>
    InventoryCount = 5,

    /// <summary>Dönem sonu / Period end</summary>
    PeriodEnd = 6,

    /// <summary>Sistem güncelleme / System update</summary>
    SystemUpdate = 7,

    /// <summary>Eğitim / Training</summary>
    Training = 8,

    /// <summary>Seyahat / Travel</summary>
    Travel = 9,

    /// <summary>Diğer / Other</summary>
    Other = 99
}

#endregion
