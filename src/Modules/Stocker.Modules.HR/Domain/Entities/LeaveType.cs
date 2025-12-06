using Stocker.SharedKernel.Common;

namespace Stocker.Modules.HR.Domain.Entities;

/// <summary>
/// İzin türü entity'si
/// </summary>
public class LeaveType : BaseEntity
{
    public string Code { get; private set; }
    public string Name { get; private set; }
    public string? Description { get; private set; }
    public decimal DefaultDays { get; private set; }
    public decimal? MaxDays { get; private set; }
    public bool IsPaid { get; private set; }
    public bool RequiresApproval { get; private set; }
    public bool RequiresDocument { get; private set; }
    public int MinNoticeDays { get; private set; }
    public bool AllowHalfDay { get; private set; }
    public bool AllowNegativeBalance { get; private set; }
    public bool IsCarryForward { get; private set; }
    public decimal? MaxCarryForwardDays { get; private set; }
    public int? CarryForwardExpiryMonths { get; private set; }
    public string? Color { get; private set; }
    public int DisplayOrder { get; private set; }
    public bool IsActive { get; private set; }

    // Navigation Properties
    public virtual ICollection<Leave> Leaves { get; private set; }
    public virtual ICollection<LeaveBalance> LeaveBalances { get; private set; }

    protected LeaveType()
    {
        Code = string.Empty;
        Name = string.Empty;
        Leaves = new List<Leave>();
        LeaveBalances = new List<LeaveBalance>();
    }

    public LeaveType(
        string code,
        string name,
        decimal defaultDays,
        bool isPaid = true,
        bool requiresApproval = true,
        string? description = null,
        int minNoticeDays = 0)
    {
        Code = code;
        Name = name;
        DefaultDays = defaultDays;
        IsPaid = isPaid;
        RequiresApproval = requiresApproval;
        Description = description;
        MinNoticeDays = minNoticeDays;
        AllowHalfDay = true;
        IsActive = true;
        Leaves = new List<Leave>();
        LeaveBalances = new List<LeaveBalance>();
    }

    public void Update(
        string name,
        string? description,
        decimal defaultDays,
        decimal? maxDays,
        bool isPaid,
        bool requiresApproval,
        bool requiresDocument,
        int minNoticeDays,
        bool allowHalfDay,
        bool allowNegativeBalance)
    {
        Name = name;
        Description = description;
        DefaultDays = defaultDays;
        MaxDays = maxDays;
        IsPaid = isPaid;
        RequiresApproval = requiresApproval;
        RequiresDocument = requiresDocument;
        MinNoticeDays = minNoticeDays;
        AllowHalfDay = allowHalfDay;
        AllowNegativeBalance = allowNegativeBalance;
    }

    public void SetCarryForwardPolicy(bool isCarryForward, decimal? maxDays = null, int? expiryMonths = null)
    {
        IsCarryForward = isCarryForward;
        MaxCarryForwardDays = maxDays;
        CarryForwardExpiryMonths = expiryMonths;
    }

    public void SetColor(string? color)
    {
        Color = color;
    }

    public void SetDisplayOrder(int order)
    {
        DisplayOrder = order;
    }

    public void Activate() => IsActive = true;

    public void Deactivate() => IsActive = false;
}
