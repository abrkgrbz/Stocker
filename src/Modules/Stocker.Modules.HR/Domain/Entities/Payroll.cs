using Stocker.SharedKernel.Common;
using Stocker.Modules.HR.Domain.Enums;

namespace Stocker.Modules.HR.Domain.Entities;

/// <summary>
/// Bordro entity'si
/// </summary>
public class Payroll : BaseEntity
{
    public int EmployeeId { get; private set; }
    public int Year { get; private set; }
    public int Month { get; private set; }
    public DateTime PeriodStart { get; private set; }
    public DateTime PeriodEnd { get; private set; }

    // Kazançlar
    public decimal BaseSalary { get; private set; }
    public decimal OvertimePay { get; private set; }
    public decimal Bonus { get; private set; }
    public decimal Allowances { get; private set; }
    public decimal OtherEarnings { get; private set; }
    public decimal GrossEarnings => BaseSalary + OvertimePay + Bonus + Allowances + OtherEarnings;

    // Kesintiler
    public decimal IncomeTax { get; private set; }
    public decimal SocialSecurityEmployee { get; private set; }
    public decimal UnemploymentInsuranceEmployee { get; private set; }
    public decimal HealthInsurance { get; private set; }
    public decimal StampTax { get; private set; }
    public decimal OtherDeductions { get; private set; }
    public decimal TotalDeductions => IncomeTax + SocialSecurityEmployee + UnemploymentInsuranceEmployee +
                                      HealthInsurance + StampTax + OtherDeductions;

    // İşveren Maliyetleri
    public decimal SocialSecurityEmployer { get; private set; }
    public decimal UnemploymentInsuranceEmployer { get; private set; }

    // Net Maaş
    public decimal NetSalary => GrossEarnings - TotalDeductions;
    public decimal TotalEmployerCost => GrossEarnings + SocialSecurityEmployer + UnemploymentInsuranceEmployer;

    // Çalışma Bilgileri
    public int WorkDays { get; private set; }
    public int AbsentDays { get; private set; }
    public decimal OvertimeHours { get; private set; }
    public int LeaveDays { get; private set; }
    public int HolidayDays { get; private set; }

    // Durum
    public PayrollStatus Status { get; private set; }
    public string Currency { get; private set; }
    public DateTime? CalculatedDate { get; private set; }
    public int? CalculatedById { get; private set; }
    public DateTime? ApprovedDate { get; private set; }
    public int? ApprovedById { get; private set; }
    public DateTime? PaidDate { get; private set; }
    public string? PaymentReference { get; private set; }
    public string? Notes { get; private set; }

    // Navigation Properties
    public virtual Employee Employee { get; private set; } = null!;
    public virtual Employee? CalculatedBy { get; private set; }
    public virtual Employee? ApprovedBy { get; private set; }
    public virtual ICollection<PayrollItem> Items { get; private set; }

    protected Payroll()
    {
        Currency = "TRY";
        Items = new List<PayrollItem>();
    }

    public Payroll(
        int employeeId,
        int year,
        int month,
        DateTime periodStart,
        DateTime periodEnd,
        decimal baseSalary,
        string currency = "TRY")
    {
        EmployeeId = employeeId;
        Year = year;
        Month = month;
        PeriodStart = periodStart;
        PeriodEnd = periodEnd;
        BaseSalary = baseSalary;
        Currency = currency;
        Status = PayrollStatus.Draft;
        Items = new List<PayrollItem>();
    }

    public void SetEarnings(
        decimal overtime = 0,
        decimal bonus = 0,
        decimal allowances = 0,
        decimal otherEarnings = 0)
    {
        OvertimePay = overtime;
        Bonus = bonus;
        Allowances = allowances;
        OtherEarnings = otherEarnings;
    }

    public void SetDeductions(
        decimal incomeTax,
        decimal socialSecurityEmployee,
        decimal unemploymentInsuranceEmployee,
        decimal healthInsurance = 0,
        decimal stampTax = 0,
        decimal otherDeductions = 0)
    {
        IncomeTax = incomeTax;
        SocialSecurityEmployee = socialSecurityEmployee;
        UnemploymentInsuranceEmployee = unemploymentInsuranceEmployee;
        HealthInsurance = healthInsurance;
        StampTax = stampTax;
        OtherDeductions = otherDeductions;
    }

    public void SetEmployerContributions(
        decimal socialSecurityEmployer,
        decimal unemploymentInsuranceEmployer)
    {
        SocialSecurityEmployer = socialSecurityEmployer;
        UnemploymentInsuranceEmployer = unemploymentInsuranceEmployer;
    }

    public void SetWorkingDays(
        int workDays,
        int absentDays,
        decimal overtimeHours,
        int leaveDays,
        int holidayDays)
    {
        WorkDays = workDays;
        AbsentDays = absentDays;
        OvertimeHours = overtimeHours;
        LeaveDays = leaveDays;
        HolidayDays = holidayDays;
    }

    public void Calculate(int calculatedById)
    {
        CalculatedById = calculatedById;
        CalculatedDate = DateTime.UtcNow;
        Status = PayrollStatus.Calculated;
    }

    public void SubmitForApproval()
    {
        if (Status != PayrollStatus.Calculated)
            throw new InvalidOperationException("Payroll must be calculated before submitting for approval");

        Status = PayrollStatus.PendingApproval;
    }

    public void Approve(int approvedById)
    {
        if (Status != PayrollStatus.PendingApproval)
            throw new InvalidOperationException("Only pending payrolls can be approved");

        ApprovedById = approvedById;
        ApprovedDate = DateTime.UtcNow;
        Status = PayrollStatus.Approved;
    }

    public void Reject(string reason)
    {
        if (Status != PayrollStatus.PendingApproval)
            throw new InvalidOperationException("Only pending payrolls can be rejected");

        Status = PayrollStatus.Rejected;
        Notes = reason;
    }

    public void MarkAsPaid(string? paymentReference = null)
    {
        if (Status != PayrollStatus.Approved)
            throw new InvalidOperationException("Only approved payrolls can be marked as paid");

        PaidDate = DateTime.UtcNow;
        PaymentReference = paymentReference;
        Status = PayrollStatus.Paid;
    }

    public void Cancel(string reason)
    {
        if (Status == PayrollStatus.Paid)
            throw new InvalidOperationException("Paid payrolls cannot be cancelled");

        Status = PayrollStatus.Cancelled;
        Notes = reason;
    }

    public void SetNotes(string? notes)
    {
        Notes = notes;
    }

    public void AddItem(PayrollItem item)
    {
        Items.Add(item);
    }
}
