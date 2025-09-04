using Stocker.SharedKernel.Common;

namespace Stocker.Modules.HR.Domain.Entities;

public class Leave : BaseEntity
{
    public int EmployeeId { get; private set; }
    public int LeaveTypeId { get; private set; }
    public DateTime StartDate { get; private set; }
    public DateTime EndDate { get; private set; }
    public int TotalDays { get; private set; }
    public string Reason { get; private set; }
    public string Status { get; private set; }
    public int? ApprovedBy { get; private set; }
    public DateTime? ApprovedDate { get; private set; }
    public string? ApprovalNotes { get; private set; }
    public string? RejectionReason { get; private set; }
    public DateTime RequestDate { get; private set; }
    
    public virtual Employee Employee { get; private set; }
    public virtual LeaveType LeaveType { get; private set; }
    
    protected Leave() { }
    
    public Leave(
        int employeeId,
        int leaveTypeId,
        DateTime startDate,
        DateTime endDate,
        string reason)
    {
        EmployeeId = employeeId;
        LeaveTypeId = leaveTypeId;
        StartDate = startDate;
        EndDate = endDate;
        TotalDays = CalculateLeaveDays(startDate, endDate);
        Reason = reason;
        Status = "Pending";
        RequestDate = DateTime.UtcNow;
    }
    
    public void Approve(int approvedBy, string? notes = null)
    {
        if (Status != "Pending")
            throw new InvalidOperationException("Only pending leave requests can be approved");
            
        Status = "Approved";
        ApprovedBy = approvedBy;
        ApprovedDate = DateTime.UtcNow;
        ApprovalNotes = notes;
    }
    
    public void Reject(int rejectedBy, string reason)
    {
        if (Status != "Pending")
            throw new InvalidOperationException("Only pending leave requests can be rejected");
            
        Status = "Rejected";
        ApprovedBy = rejectedBy;
        ApprovedDate = DateTime.UtcNow;
        RejectionReason = reason;
    }
    
    public void Cancel()
    {
        if (Status == "Cancelled")
            throw new InvalidOperationException("Leave request is already cancelled");
            
        if (StartDate <= DateTime.UtcNow)
            throw new InvalidOperationException("Cannot cancel leave that has already started");
            
        Status = "Cancelled";
    }
    
    private int CalculateLeaveDays(DateTime startDate, DateTime endDate)
    {
        return (int)(endDate - startDate).TotalDays + 1;
    }
}