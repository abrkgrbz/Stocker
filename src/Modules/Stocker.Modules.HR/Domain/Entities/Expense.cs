using Stocker.SharedKernel.Common;
using Stocker.Modules.HR.Domain.Enums;

namespace Stocker.Modules.HR.Domain.Entities;

/// <summary>
/// Masraf/Harcama entity'si
/// </summary>
public class Expense : BaseEntity
{
    public int EmployeeId { get; private set; }
    public string ExpenseNumber { get; private set; }
    public ExpenseType ExpenseType { get; private set; }
    public string Description { get; private set; }
    public decimal Amount { get; private set; }
    public string Currency { get; private set; }
    public DateTime ExpenseDate { get; private set; }
    public string? MerchantName { get; private set; }
    public string? ReceiptNumber { get; private set; }
    public string? ReceiptUrl { get; private set; }
    public ExpenseStatus Status { get; private set; }
    public int? ApprovedById { get; private set; }
    public DateTime? ApprovedDate { get; private set; }
    public string? ApprovalNotes { get; private set; }
    public string? RejectionReason { get; private set; }
    public DateTime? PaidDate { get; private set; }
    public string? PaymentReference { get; private set; }
    public int? PayrollId { get; private set; }
    public string? Notes { get; private set; }

    // Navigation Properties
    public virtual Employee Employee { get; private set; } = null!;
    public virtual Employee? ApprovedBy { get; private set; }
    public virtual Payroll? Payroll { get; private set; }

    protected Expense()
    {
        ExpenseNumber = string.Empty;
        Description = string.Empty;
        Currency = "TRY";
    }

    public Expense(
        int employeeId,
        string expenseNumber,
        ExpenseType expenseType,
        string description,
        decimal amount,
        DateTime expenseDate,
        string currency = "TRY")
    {
        EmployeeId = employeeId;
        ExpenseNumber = expenseNumber;
        ExpenseType = expenseType;
        Description = description;
        Amount = amount;
        ExpenseDate = expenseDate;
        Currency = currency;
        Status = ExpenseStatus.Draft;
    }

    public void Update(
        ExpenseType expenseType,
        string description,
        decimal amount,
        DateTime expenseDate,
        string? merchantName,
        string? receiptNumber)
    {
        if (Status != ExpenseStatus.Draft && Status != ExpenseStatus.Rejected)
            throw new InvalidOperationException("Only draft or rejected expenses can be updated");

        ExpenseType = expenseType;
        Description = description;
        Amount = amount;
        ExpenseDate = expenseDate;
        MerchantName = merchantName;
        ReceiptNumber = receiptNumber;
    }

    public void SetReceipt(string? receiptUrl, string? receiptNumber = null)
    {
        ReceiptUrl = receiptUrl;
        if (!string.IsNullOrEmpty(receiptNumber))
            ReceiptNumber = receiptNumber;
    }

    public void Submit()
    {
        if (Status != ExpenseStatus.Draft)
            throw new InvalidOperationException("Only draft expenses can be submitted");

        Status = ExpenseStatus.Pending;
    }

    public void Approve(int approvedById, string? notes = null)
    {
        if (Status != ExpenseStatus.Pending)
            throw new InvalidOperationException("Only pending expenses can be approved");

        ApprovedById = approvedById;
        ApprovedDate = DateTime.UtcNow;
        ApprovalNotes = notes;
        Status = ExpenseStatus.Approved;
    }

    public void Reject(int rejectedById, string reason)
    {
        if (Status != ExpenseStatus.Pending)
            throw new InvalidOperationException("Only pending expenses can be rejected");

        ApprovedById = rejectedById;
        ApprovedDate = DateTime.UtcNow;
        RejectionReason = reason;
        Status = ExpenseStatus.Rejected;
    }

    public void MarkAsPaid(string? paymentReference = null, int? payrollId = null)
    {
        if (Status != ExpenseStatus.Approved)
            throw new InvalidOperationException("Only approved expenses can be marked as paid");

        PaidDate = DateTime.UtcNow;
        PaymentReference = paymentReference;
        PayrollId = payrollId;
        Status = ExpenseStatus.Paid;
    }

    public void Cancel()
    {
        if (Status == ExpenseStatus.Paid)
            throw new InvalidOperationException("Paid expenses cannot be cancelled");

        Status = ExpenseStatus.Cancelled;
    }

    public void SetNotes(string? notes)
    {
        Notes = notes;
    }
}
