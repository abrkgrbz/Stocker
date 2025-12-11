namespace Stocker.Modules.HR.Application.DTOs;

/// <summary>
/// Data transfer object for Payslip entity
/// </summary>
public record PayslipDto
{
    public int Id { get; init; }
    public int EmployeeId { get; init; }
    public string? EmployeeName { get; init; }
    public int PayrollId { get; init; }
    public string PayslipNumber { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public string Period { get; init; } = string.Empty;
    public int Year { get; init; }
    public int Month { get; init; }
    public DateOnly PeriodStart { get; init; }
    public DateOnly PeriodEnd { get; init; }
    public DateOnly PaymentDate { get; init; }
    public decimal GrossSalary { get; init; }
    public decimal BaseSalary { get; init; }
    public decimal OvertimePay { get; init; }
    public decimal Bonus { get; init; }
    public decimal Gratuity { get; init; }
    public decimal Commission { get; init; }
    public decimal OtherEarnings { get; init; }
    public decimal TotalEarnings { get; init; }
    public decimal TransportationAllowance { get; init; }
    public decimal MealAllowance { get; init; }
    public decimal HousingAllowance { get; init; }
    public decimal PhoneAllowance { get; init; }
    public decimal OtherAllowances { get; init; }
    public decimal TotalAllowances { get; init; }
    public decimal IncomeTax { get; init; }
    public decimal StampTax { get; init; }
    public decimal SsiEmployeeShare { get; init; }
    public decimal UnemploymentInsuranceEmployee { get; init; }
    public decimal PrivatePensionDeduction { get; init; }
    public decimal UnionDues { get; init; }
    public decimal Garnishment { get; init; }
    public decimal AdvanceDeduction { get; init; }
    public decimal OtherDeductions { get; init; }
    public decimal TotalDeductions { get; init; }
    public decimal SsiEmployerShare { get; init; }
    public decimal UnemploymentInsuranceEmployer { get; init; }
    public decimal PrivatePensionEmployer { get; init; }
    public decimal TotalEmployerCost { get; init; }
    public decimal NetSalary { get; init; }
    public decimal PaidAmount { get; init; }
    public string Currency { get; init; } = "TRY";
    public int DaysWorked { get; init; }
    public decimal HoursWorked { get; init; }
    public decimal OvertimeHours { get; init; }
    public int LeaveDays { get; init; }
    public int AbsenceDays { get; init; }
    public int HolidayDays { get; init; }
    public decimal CumulativeGross { get; init; }
    public decimal CumulativeIncomeTax { get; init; }
    public decimal CumulativeSsiBase { get; init; }
    public string? BankName { get; init; }
    public string? Iban { get; init; }
    public string PaymentMethod { get; init; } = string.Empty;
    public string? PaymentReference { get; init; }
    public string? PdfUrl { get; init; }
    public DateTime GeneratedDate { get; init; }
    public DateTime? SentDate { get; init; }
    public DateTime? ViewedDate { get; init; }
    public string? Notes { get; init; }
    public string? InternalNotes { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
}

