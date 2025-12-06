using Stocker.SharedKernel.Common;

namespace Stocker.Modules.HR.Domain.Entities;

/// <summary>
/// İzin bakiyesi entity'si
/// </summary>
public class LeaveBalance : BaseEntity
{
    public int EmployeeId { get; private set; }
    public int LeaveTypeId { get; private set; }
    public int Year { get; private set; }
    public decimal Entitled { get; private set; }
    public decimal Used { get; private set; }
    public decimal Pending { get; private set; }
    public decimal CarriedForward { get; private set; }
    public decimal Adjustment { get; private set; }
    public string? AdjustmentReason { get; private set; }
    public decimal Available => Entitled + CarriedForward + Adjustment - Used - Pending;

    // Navigation Properties
    public virtual Employee Employee { get; private set; } = null!;
    public virtual LeaveType LeaveType { get; private set; } = null!;

    protected LeaveBalance() { }

    public LeaveBalance(
        int employeeId,
        int leaveTypeId,
        int year,
        decimal entitled,
        decimal carriedForward = 0)
    {
        EmployeeId = employeeId;
        LeaveTypeId = leaveTypeId;
        Year = year;
        Entitled = entitled;
        CarriedForward = carriedForward;
        Used = 0;
        Pending = 0;
        Adjustment = 0;
    }

    public void AddUsed(decimal days)
    {
        Used += days;
    }

    public void RemoveUsed(decimal days)
    {
        Used = Math.Max(0, Used - days);
    }

    public void AddPending(decimal days)
    {
        Pending += days;
    }

    public void RemovePending(decimal days)
    {
        Pending = Math.Max(0, Pending - days);
    }

    public void ConvertPendingToUsed(decimal days)
    {
        RemovePending(days);
        AddUsed(days);
    }

    public void Adjust(decimal days, string reason)
    {
        Adjustment += days;
        AdjustmentReason = string.IsNullOrEmpty(AdjustmentReason)
            ? reason
            : $"{AdjustmentReason}; {reason}";
    }

    public void SetEntitled(decimal entitled)
    {
        Entitled = entitled;
    }

    public void SetCarriedForward(decimal days)
    {
        CarriedForward = days;
    }

    public bool HasSufficientBalance(decimal days)
    {
        return Available >= days;
    }

    public void Reset()
    {
        Used = 0;
        Pending = 0;
        Adjustment = 0;
        AdjustmentReason = null;
    }
}
