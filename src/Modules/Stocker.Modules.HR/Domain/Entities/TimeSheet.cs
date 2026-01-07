using Stocker.SharedKernel.Common;

namespace Stocker.Modules.HR.Domain.Entities;

/// <summary>
/// Zaman çizelgesi entity'si - Proje bazlı çalışma saati takibi
/// TimeSheet entity - Project-based work hour tracking
/// </summary>
public class TimeSheet : BaseEntity
{
    private readonly List<TimeSheetEntry> _entries = new();

    #region Temel Bilgiler (Basic Information)

    /// <summary>
    /// Çalışan ID / Employee ID
    /// </summary>
    public int EmployeeId { get; private set; }

    /// <summary>
    /// Dönem başlangıcı / Period start
    /// </summary>
    public DateOnly PeriodStart { get; private set; }

    /// <summary>
    /// Dönem bitişi / Period end
    /// </summary>
    public DateOnly PeriodEnd { get; private set; }

    /// <summary>
    /// Durum / Status
    /// </summary>
    public TimeSheetStatus Status { get; private set; }

    #endregion

    #region Saat Özeti (Hours Summary)

    /// <summary>
    /// Toplam çalışma saati / Total work hours
    /// </summary>
    public decimal TotalWorkHours { get; private set; }

    /// <summary>
    /// Normal çalışma saati / Regular hours
    /// </summary>
    public decimal RegularHours { get; private set; }

    /// <summary>
    /// Fazla mesai saati / Overtime hours
    /// </summary>
    public decimal OvertimeHours { get; private set; }

    /// <summary>
    /// İzin saati / Leave hours
    /// </summary>
    public decimal LeaveHours { get; private set; }

    /// <summary>
    /// Tatil saati / Holiday hours
    /// </summary>
    public decimal HolidayHours { get; private set; }

    /// <summary>
    /// Faturalanabilir saat / Billable hours
    /// </summary>
    public decimal BillableHours { get; private set; }

    /// <summary>
    /// Faturalanmayan saat / Non-billable hours
    /// </summary>
    public decimal NonBillableHours { get; private set; }

    #endregion

    #region Onay Bilgileri (Approval Information)

    /// <summary>
    /// Gönderim tarihi / Submitted date
    /// </summary>
    public DateTime? SubmittedDate { get; private set; }

    /// <summary>
    /// Onaylayan ID / Approved by ID
    /// </summary>
    public int? ApprovedById { get; private set; }

    /// <summary>
    /// Onay tarihi / Approval date
    /// </summary>
    public DateTime? ApprovalDate { get; private set; }

    /// <summary>
    /// Onay notları / Approval notes
    /// </summary>
    public string? ApprovalNotes { get; private set; }

    /// <summary>
    /// Red nedeni / Rejection reason
    /// </summary>
    public string? RejectionReason { get; private set; }

    #endregion

    #region Ek Bilgiler (Additional Information)

    /// <summary>
    /// Notlar / Notes
    /// </summary>
    public string? Notes { get; private set; }

    /// <summary>
    /// Kilitli mi? / Is locked?
    /// </summary>
    public bool IsLocked { get; private set; }

    #endregion

    // Navigation Properties
    public virtual Employee Employee { get; private set; } = null!;
    public virtual Employee? ApprovedBy { get; private set; }
    public IReadOnlyList<TimeSheetEntry> Entries => _entries.AsReadOnly();

    protected TimeSheet() { }

    public TimeSheet(
        int employeeId,
        DateOnly periodStart,
        DateOnly periodEnd)
    {
        EmployeeId = employeeId;
        PeriodStart = periodStart;
        PeriodEnd = periodEnd;
        Status = TimeSheetStatus.Draft;
    }

    public TimeSheetEntry AddEntry(
        DateOnly date,
        decimal hours,
        int? projectId,
        string? projectName,
        string? taskDescription,
        bool isBillable = true)
    {
        if (IsLocked)
            throw new InvalidOperationException("Kilitli zaman çizelgesine giriş eklenemez.");

        var entry = new TimeSheetEntry(Id, date, hours, projectId, projectName, taskDescription, isBillable);
        _entries.Add(entry);
        RecalculateTotals();
        return entry;
    }

    public void UpdateEntry(int entryId, decimal hours, string? taskDescription, bool isBillable)
    {
        if (IsLocked)
            throw new InvalidOperationException("Kilitli zaman çizelgesi güncellenemez.");

        var entry = _entries.FirstOrDefault(e => e.Id == entryId);
        if (entry != null)
        {
            entry.Update(hours, taskDescription, isBillable);
            RecalculateTotals();
        }
    }

    public void RemoveEntry(int entryId)
    {
        if (IsLocked)
            throw new InvalidOperationException("Kilitli zaman çizelgesinden giriş kaldırılamaz.");

        var entry = _entries.FirstOrDefault(e => e.Id == entryId);
        if (entry != null)
        {
            _entries.Remove(entry);
            RecalculateTotals();
        }
    }

    private void RecalculateTotals()
    {
        TotalWorkHours = _entries.Sum(e => e.Hours);
        BillableHours = _entries.Where(e => e.IsBillable).Sum(e => e.Hours);
        NonBillableHours = _entries.Where(e => !e.IsBillable).Sum(e => e.Hours);
        OvertimeHours = _entries.Where(e => e.IsOvertime).Sum(e => e.Hours);
        RegularHours = TotalWorkHours - OvertimeHours - LeaveHours - HolidayHours;
    }

    public void Submit()
    {
        if (_entries.Count == 0)
            throw new InvalidOperationException("Boş zaman çizelgesi gönderilemez.");

        Status = TimeSheetStatus.Submitted;
        SubmittedDate = DateTime.UtcNow;
    }

    public void Approve(int approvedById, string? notes = null)
    {
        Status = TimeSheetStatus.Approved;
        ApprovedById = approvedById;
        ApprovalDate = DateTime.UtcNow;
        ApprovalNotes = notes;
        IsLocked = true;
    }

    public void Reject(int rejectedById, string reason)
    {
        Status = TimeSheetStatus.Rejected;
        ApprovedById = rejectedById;
        ApprovalDate = DateTime.UtcNow;
        RejectionReason = reason;
    }

    public void Reopen()
    {
        Status = TimeSheetStatus.Draft;
        SubmittedDate = null;
        ApprovedById = null;
        ApprovalDate = null;
        ApprovalNotes = null;
        RejectionReason = null;
        IsLocked = false;
    }

    public void Lock()
    {
        IsLocked = true;
    }

    public void Unlock()
    {
        IsLocked = false;
    }

    public void SetLeaveHours(decimal hours) => LeaveHours = hours;
    public void SetHolidayHours(decimal hours) => HolidayHours = hours;
    public void SetNotes(string? notes) => Notes = notes;
    public void SetWorkHours(decimal totalWorkHours, decimal regularHours) { TotalWorkHours = totalWorkHours; RegularHours = regularHours; }
    public void SetOvertimeHours(decimal hours) => OvertimeHours = hours;
    public void SetBillableHours(decimal billableHours, decimal nonBillableHours) { BillableHours = billableHours; NonBillableHours = nonBillableHours; }
}

/// <summary>
/// Zaman çizelgesi girişi / TimeSheet entry
/// </summary>
public class TimeSheetEntry : BaseEntity
{
    public int TimeSheetId { get; private set; }
    public DateOnly Date { get; private set; }
    public decimal Hours { get; private set; }

    public int? ProjectId { get; private set; }
    public string? ProjectName { get; private set; }
    public string? ProjectCode { get; private set; }

    public int? TaskId { get; private set; }
    public string? TaskDescription { get; private set; }

    public string? ActivityType { get; private set; }
    public string? CostCenter { get; private set; }

    public bool IsBillable { get; private set; }
    public bool IsOvertime { get; private set; }
    public decimal? BillingRate { get; private set; }

    public TimeOnly? StartTime { get; private set; }
    public TimeOnly? EndTime { get; private set; }
    public int? BreakMinutes { get; private set; }

    public string? Notes { get; private set; }

    public virtual TimeSheet TimeSheet { get; private set; } = null!;

    protected TimeSheetEntry() { }

    public TimeSheetEntry(
        int timeSheetId,
        DateOnly date,
        decimal hours,
        int? projectId,
        string? projectName,
        string? taskDescription,
        bool isBillable = true)
    {
        TimeSheetId = timeSheetId;
        Date = date;
        Hours = hours;
        ProjectId = projectId;
        ProjectName = projectName;
        TaskDescription = taskDescription;
        IsBillable = isBillable;
    }

    public void Update(decimal hours, string? taskDescription, bool isBillable)
    {
        Hours = hours;
        TaskDescription = taskDescription;
        IsBillable = isBillable;
    }

    public void SetTimeRange(TimeOnly startTime, TimeOnly endTime, int? breakMinutes = null)
    {
        StartTime = startTime;
        EndTime = endTime;
        BreakMinutes = breakMinutes;

        // Recalculate hours
        var duration = endTime.ToTimeSpan() - startTime.ToTimeSpan();
        if (duration < TimeSpan.Zero) duration += TimeSpan.FromHours(24);
        Hours = (decimal)duration.TotalHours - (breakMinutes ?? 0) / 60m;
    }

    public void SetProject(int? projectId, string? projectName, string? projectCode)
    {
        ProjectId = projectId;
        ProjectName = projectName;
        ProjectCode = projectCode;
    }

    public void SetTask(int? taskId, string? taskDescription)
    {
        TaskId = taskId;
        TaskDescription = taskDescription;
    }

    public void SetActivityType(string? activityType) => ActivityType = activityType;
    public void SetCostCenter(string? costCenter) => CostCenter = costCenter;
    public void SetOvertime(bool isOvertime) => IsOvertime = isOvertime;
    public void SetBillingRate(decimal? rate) => BillingRate = rate;
    public void SetNotes(string? notes) => Notes = notes;
}

#region Enums

public enum TimeSheetStatus
{
    /// <summary>Taslak / Draft</summary>
    Draft = 1,

    /// <summary>Gönderildi / Submitted</summary>
    Submitted = 2,

    /// <summary>Onaylandı / Approved</summary>
    Approved = 3,

    /// <summary>Reddedildi / Rejected</summary>
    Rejected = 4
}

#endregion
