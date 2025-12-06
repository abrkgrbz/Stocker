using Stocker.SharedKernel.Common;

namespace Stocker.Modules.HR.Domain.Entities;

/// <summary>
/// Bordro kalemi entity'si (detaylı kazanç/kesinti satırları)
/// </summary>
public class PayrollItem : BaseEntity
{
    public int PayrollId { get; private set; }
    public string Code { get; private set; }
    public string Description { get; private set; }
    public PayrollItemType ItemType { get; private set; }
    public decimal Amount { get; private set; }
    public decimal? Quantity { get; private set; }
    public decimal? Rate { get; private set; }
    public bool IsRecurring { get; private set; }
    public bool IsTaxable { get; private set; }
    public int DisplayOrder { get; private set; }
    public string? Notes { get; private set; }

    // Navigation Properties
    public virtual Payroll Payroll { get; private set; } = null!;

    protected PayrollItem()
    {
        Code = string.Empty;
        Description = string.Empty;
    }

    public PayrollItem(
        int payrollId,
        string code,
        string description,
        PayrollItemType itemType,
        decimal amount,
        decimal? quantity = null,
        decimal? rate = null,
        bool isRecurring = false,
        bool isTaxable = true,
        int displayOrder = 0)
    {
        PayrollId = payrollId;
        Code = code;
        Description = description;
        ItemType = itemType;
        Amount = amount;
        Quantity = quantity;
        Rate = rate;
        IsRecurring = isRecurring;
        IsTaxable = isTaxable;
        DisplayOrder = displayOrder;
    }

    public void Update(
        string description,
        decimal amount,
        decimal? quantity,
        decimal? rate,
        bool isTaxable)
    {
        Description = description;
        Amount = amount;
        Quantity = quantity;
        Rate = rate;
        IsTaxable = isTaxable;
    }

    public void SetNotes(string? notes)
    {
        Notes = notes;
    }
}

/// <summary>
/// Bordro kalemi türü
/// </summary>
public enum PayrollItemType
{
    /// <summary>
    /// Kazanç
    /// </summary>
    Earning = 1,

    /// <summary>
    /// Kesinti
    /// </summary>
    Deduction = 2,

    /// <summary>
    /// İşveren katkısı
    /// </summary>
    EmployerContribution = 3
}
