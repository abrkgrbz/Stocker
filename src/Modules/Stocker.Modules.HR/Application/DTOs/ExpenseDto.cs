using Stocker.Modules.HR.Domain.Enums;

namespace Stocker.Modules.HR.Application.DTOs;

/// <summary>
/// Data transfer object for Expense entity
/// </summary>
public class ExpenseDto
{
    public int Id { get; set; }
    public int EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public string? EmployeeCode { get; set; }
    public string? DepartmentName { get; set; }
    public string ExpenseNumber { get; set; } = string.Empty;
    public ExpenseType ExpenseType { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "TRY";
    public DateTime ExpenseDate { get; set; }
    public string? MerchantName { get; set; }
    public string? ReceiptNumber { get; set; }
    public string? ReceiptUrl { get; set; }
    public ExpenseStatus Status { get; set; }
    public int? ApprovedById { get; set; }
    public string? ApprovedByName { get; set; }
    public DateTime? ApprovedDate { get; set; }
    public string? ApprovalNotes { get; set; }
    public string? RejectionReason { get; set; }
    public DateTime? PaidDate { get; set; }
    public string? PaymentReference { get; set; }
    public int? PayrollId { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// DTO for creating an expense
/// </summary>
public class CreateExpenseDto
{
    public int EmployeeId { get; set; }
    public ExpenseType ExpenseType { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "TRY";
    public DateTime ExpenseDate { get; set; }
    public string? MerchantName { get; set; }
    public string? ReceiptNumber { get; set; }
    public string? Notes { get; set; }
}

/// <summary>
/// DTO for updating an expense
/// </summary>
public class UpdateExpenseDto
{
    public ExpenseType ExpenseType { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public DateTime ExpenseDate { get; set; }
    public string? MerchantName { get; set; }
    public string? ReceiptNumber { get; set; }
    public string? Notes { get; set; }
}

/// <summary>
/// DTO for approving an expense
/// </summary>
public class ApproveExpenseDto
{
    public string? Notes { get; set; }
}

/// <summary>
/// DTO for rejecting an expense
/// </summary>
public class RejectExpenseDto
{
    public string Reason { get; set; } = string.Empty;
}

/// <summary>
/// DTO for expense summary
/// </summary>
public class ExpenseSummaryDto
{
    public int EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public int Month { get; set; }
    public int Year { get; set; }
    public int TotalCount { get; set; }
    public int DraftCount { get; set; }
    public int PendingCount { get; set; }
    public int ApprovedCount { get; set; }
    public int RejectedCount { get; set; }
    public int PaidCount { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal ApprovedAmount { get; set; }
    public decimal PaidAmount { get; set; }
    public string Currency { get; set; } = "TRY";
}

/// <summary>
/// DTO for expense by type summary
/// </summary>
public class ExpenseByTypeSummaryDto
{
    public ExpenseType ExpenseType { get; set; }
    public string ExpenseTypeName { get; set; } = string.Empty;
    public int Count { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal Percentage { get; set; }
}
