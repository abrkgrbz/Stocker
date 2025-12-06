using Stocker.SharedKernel.Common;
using Stocker.Modules.HR.Domain.Enums;

namespace Stocker.Modules.HR.Domain.Entities;

/// <summary>
/// İzin talebi entity'si
/// </summary>
public class Leave : BaseEntity
{
    public int EmployeeId { get; private set; }
    public int LeaveTypeId { get; private set; }
    public DateTime StartDate { get; private set; }
    public DateTime EndDate { get; private set; }
    public decimal TotalDays { get; private set; }
    public bool IsHalfDay { get; private set; }
    public bool IsHalfDayMorning { get; private set; }
    public string? Reason { get; private set; }
    public LeaveStatus Status { get; private set; }
    public int? ApprovedById { get; private set; }
    public DateTime? ApprovedDate { get; private set; }
    public string? ApprovalNotes { get; private set; }
    public string? RejectionReason { get; private set; }
    public DateTime RequestDate { get; private set; }
    public string? AttachmentUrl { get; private set; }
    public string? ContactDuringLeave { get; private set; }
    public string? HandoverNotes { get; private set; }
    public int? SubstituteEmployeeId { get; private set; }

    // Navigation Properties
    public virtual Employee Employee { get; private set; } = null!;
    public virtual LeaveType LeaveType { get; private set; } = null!;
    public virtual Employee? ApprovedBy { get; private set; }
    public virtual Employee? SubstituteEmployee { get; private set; }

    protected Leave() { }

    public Leave(
        int employeeId,
        int leaveTypeId,
        DateTime startDate,
        DateTime endDate,
        string? reason = null,
        bool isHalfDay = false,
        bool isHalfDayMorning = false)
    {
        EmployeeId = employeeId;
        LeaveTypeId = leaveTypeId;
        StartDate = startDate.Date;
        EndDate = endDate.Date;
        Reason = reason;
        IsHalfDay = isHalfDay;
        IsHalfDayMorning = isHalfDayMorning;
        TotalDays = CalculateLeaveDays();
        Status = LeaveStatus.Pending;
        RequestDate = DateTime.UtcNow;
    }

    public void Update(
        DateTime startDate,
        DateTime endDate,
        string? reason,
        bool isHalfDay,
        bool isHalfDayMorning)
    {
        if (Status != LeaveStatus.Pending)
            throw new InvalidOperationException("Only pending leave requests can be updated");

        StartDate = startDate.Date;
        EndDate = endDate.Date;
        Reason = reason;
        IsHalfDay = isHalfDay;
        IsHalfDayMorning = isHalfDayMorning;
        TotalDays = CalculateLeaveDays();
    }

    public void Approve(int approvedById, string? notes = null)
    {
        if (Status != LeaveStatus.Pending)
            throw new InvalidOperationException("Only pending leave requests can be approved");

        Status = LeaveStatus.Approved;
        ApprovedById = approvedById;
        ApprovedDate = DateTime.UtcNow;
        ApprovalNotes = notes;
    }

    public void Reject(int rejectedById, string reason)
    {
        if (Status != LeaveStatus.Pending)
            throw new InvalidOperationException("Only pending leave requests can be rejected");

        Status = LeaveStatus.Rejected;
        ApprovedById = rejectedById;
        ApprovedDate = DateTime.UtcNow;
        RejectionReason = reason;
    }

    public void Cancel(string? reason = null)
    {
        if (Status == LeaveStatus.Cancelled)
            throw new InvalidOperationException("Leave request is already cancelled");

        if (Status == LeaveStatus.Taken)
            throw new InvalidOperationException("Cannot cancel leave that has already been taken");

        if (StartDate <= DateTime.UtcNow && Status == LeaveStatus.Approved)
            throw new InvalidOperationException("Cannot cancel leave that has already started");

        Status = LeaveStatus.Cancelled;
        if (!string.IsNullOrWhiteSpace(reason))
            ApprovalNotes = reason;
    }

    public void MarkAsTaken()
    {
        if (Status != LeaveStatus.Approved)
            throw new InvalidOperationException("Only approved leave can be marked as taken");

        Status = LeaveStatus.Taken;
    }

    public void SetAttachment(string? attachmentUrl)
    {
        AttachmentUrl = attachmentUrl;
    }

    public void SetSubstitute(int? substituteEmployeeId, string? handoverNotes = null)
    {
        SubstituteEmployeeId = substituteEmployeeId;
        HandoverNotes = handoverNotes;
    }

    public void SetContactDuringLeave(string? contact)
    {
        ContactDuringLeave = contact;
    }

    private decimal CalculateLeaveDays()
    {
        if (IsHalfDay)
            return 0.5m;

        var days = (EndDate - StartDate).Days + 1;
        // TODO: Exclude weekends and holidays if needed
        return days;
    }

    public bool IsActive()
    {
        var today = DateTime.UtcNow.Date;
        return Status == LeaveStatus.Approved && StartDate <= today && EndDate >= today;
    }
}
