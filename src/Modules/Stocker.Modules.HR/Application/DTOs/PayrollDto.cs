using Stocker.Modules.HR.Domain.Enums;

namespace Stocker.Modules.HR.Application.DTOs;

/// <summary>
/// Data transfer object for Payroll entity
/// </summary>
public class PayrollDto
{
    public int Id { get; set; }
    public int EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public string? EmployeeCode { get; set; }
    public string? DepartmentName { get; set; }
    public string PayrollNumber { get; set; } = string.Empty;
    public int Year { get; set; }
    public int Month { get; set; }
    public DateTime PeriodStartDate { get; set; }
    public DateTime PeriodEndDate { get; set; }
    public decimal BaseSalary { get; set; }
    public decimal TotalEarnings { get; set; }
    public decimal TotalDeductions { get; set; }
    public decimal TotalEmployerCost { get; set; }
    public decimal NetSalary { get; set; }
    public decimal GrossSalary { get; set; }
    public string Currency { get; set; } = "TRY";
    public PayrollStatus Status { get; set; }
    public DateTime? CalculatedDate { get; set; }
    public int? CalculatedById { get; set; }
    public string? CalculatedByName { get; set; }
    public DateTime? ApprovedDate { get; set; }
    public int? ApprovedById { get; set; }
    public string? ApprovedByName { get; set; }
    public DateTime? PaidDate { get; set; }
    public string? PaymentReference { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<PayrollItemDto> Items { get; set; } = new();

    // Detaylı Kesinti Alanları
    public decimal IncomeTax { get; set; }
    public decimal SocialSecurityEmployee { get; set; }
    public decimal UnemploymentInsuranceEmployee { get; set; }
    public decimal StampTax { get; set; }
    public decimal OtherDeductions { get; set; }

    // İşveren Maliyetleri
    public decimal SocialSecurityEmployer { get; set; }
    public decimal UnemploymentInsuranceEmployer { get; set; }

    // Türkiye Vergi Hesaplama Alanları
    public decimal CumulativeGrossEarnings { get; set; }
    public decimal MinWageExemption { get; set; }
    public decimal TaxBase { get; set; }
    public int TaxBracket { get; set; }
    public decimal TaxBracketRate { get; set; }
    public bool SgkCeilingApplied { get; set; }
    public decimal SgkBase { get; set; }
    public decimal EffectiveTaxRate { get; set; }

    // Kazanç Detayları
    public decimal OvertimePay { get; set; }
    public decimal Bonus { get; set; }
    public decimal Allowances { get; set; }
}

/// <summary>
/// Data transfer object for PayrollItem entity
/// </summary>
public class PayrollItemDto
{
    public int Id { get; set; }
    public int PayrollId { get; set; }
    public string ItemType { get; set; } = string.Empty;
    public string ItemCode { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public bool IsDeduction { get; set; }
    public bool IsEmployerContribution { get; set; }
    public bool IsTaxable { get; set; }
    public decimal? Quantity { get; set; }
    public decimal? Rate { get; set; }
}

/// <summary>
/// DTO for creating/calculating payroll
/// </summary>
public class CreatePayrollDto
{
    public int EmployeeId { get; set; }
    public int Year { get; set; }
    public int Month { get; set; }
    public string? Notes { get; set; }

    // Kazançlar
    public decimal BaseSalary { get; set; }
    public decimal OvertimePay { get; set; }
    public decimal Bonus { get; set; }
    public decimal Allowances { get; set; }

    // Otomatik Hesaplama
    public bool AutoCalculate { get; set; } = true;
    public decimal CumulativeGrossEarnings { get; set; }  // Önceki ayların toplamı
    public bool ApplyMinWageExemption { get; set; } = true;

    // Manuel Giriş (AutoCalculate = false ise)
    public decimal? IncomeTax { get; set; }
    public decimal? SocialSecurityEmployee { get; set; }
    public decimal? UnemploymentInsuranceEmployee { get; set; }
    public decimal? StampTax { get; set; }
    public decimal? OtherDeductions { get; set; }
}

/// <summary>
/// DTO for batch payroll creation
/// </summary>
public class BatchCreatePayrollDto
{
    public int Year { get; set; }
    public int Month { get; set; }
    public List<int>? EmployeeIds { get; set; }
    public int? DepartmentId { get; set; }
    public bool IncludeAllActiveEmployees { get; set; }
}

/// <summary>
/// DTO for adding a payroll item
/// </summary>
public class AddPayrollItemDto
{
    public string ItemType { get; set; } = string.Empty;
    public string ItemCode { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public bool IsDeduction { get; set; }
    public bool IsEmployerContribution { get; set; }
    public bool IsTaxable { get; set; }
    public decimal? Quantity { get; set; }
    public decimal? Rate { get; set; }
}

/// <summary>
/// DTO for payroll summary
/// </summary>
public class PayrollSummaryDto
{
    public int Year { get; set; }
    public int Month { get; set; }
    public int TotalEmployees { get; set; }
    public int DraftCount { get; set; }
    public int CalculatedCount { get; set; }
    public int PendingApprovalCount { get; set; }
    public int ApprovedCount { get; set; }
    public int PaidCount { get; set; }
    public decimal TotalBaseSalary { get; set; }
    public decimal TotalEarnings { get; set; }
    public decimal TotalDeductions { get; set; }
    public decimal TotalEmployerCost { get; set; }
    public decimal TotalNetSalary { get; set; }
    public decimal TotalGrossSalary { get; set; }
    public string Currency { get; set; } = "TRY";
}

/// <summary>
/// DTO for approving payroll
/// </summary>
public class ApprovePayrollDto
{
    public string? Notes { get; set; }
}

/// <summary>
/// DTO for marking payroll as paid
/// </summary>
public class MarkPayrollPaidDto
{
    public string? PaymentReference { get; set; }
    public DateTime? PaidDate { get; set; }
}

/// <summary>
/// DTO for department payroll summary
/// </summary>
public class DepartmentPayrollSummaryDto
{
    public int DepartmentId { get; set; }
    public string DepartmentName { get; set; } = string.Empty;
    public int EmployeeCount { get; set; }
    public decimal TotalBaseSalary { get; set; }
    public decimal TotalNetSalary { get; set; }
    public decimal TotalEmployerCost { get; set; }
}
