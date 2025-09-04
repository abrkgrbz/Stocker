using Stocker.SharedKernel.Common;

namespace Stocker.Modules.HR.Domain.Entities;

public class LeaveType : BaseEntity
{
    public string Code { get; private set; }
    public string Name { get; private set; }
    public string? Description { get; private set; }
    public int DefaultDays { get; private set; }
    public bool IsPaid { get; private set; }
    public bool RequiresApproval { get; private set; }
    public bool IsActive { get; private set; }
    
    public virtual ICollection<Leave> Leaves { get; private set; }
    
    protected LeaveType() { }
    
    public LeaveType(
        string code,
        string name,
        int defaultDays,
        bool isPaid = true,
        bool requiresApproval = true)
    {
        Code = code;
        Name = name;
        DefaultDays = defaultDays;
        IsPaid = isPaid;
        RequiresApproval = requiresApproval;
        IsActive = true;
        Leaves = new List<Leave>();
    }
    
    public void UpdateLeaveType(
        string name,
        string? description,
        int defaultDays,
        bool isPaid,
        bool requiresApproval)
    {
        Name = name;
        Description = description;
        DefaultDays = defaultDays;
        IsPaid = isPaid;
        RequiresApproval = requiresApproval;
    }
    
    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;
}