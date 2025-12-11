using Stocker.SharedKernel.Common;

namespace Stocker.Modules.HR.Domain.Entities;

/// <summary>
/// Maaş bordrosu entity'si - Maaş makbuzu/bordro özeti
/// Payslip entity - Salary slip/payroll summary
/// </summary>
public class Payslip : BaseEntity
{
    private readonly List<PayslipItem> _items = new();

    #region Temel Bilgiler (Basic Information)

    /// <summary>
    /// Çalışan ID / Employee ID
    /// </summary>
    public int EmployeeId { get; private set; }

    /// <summary>
    /// Bordro ID / Payroll ID
    /// </summary>
    public int PayrollId { get; private set; }

    /// <summary>
    /// Bordro numarası / Payslip number
    /// </summary>
    public string PayslipNumber { get; private set; } = string.Empty;

    /// <summary>
    /// Durum / Status
    /// </summary>
    public PayslipStatus Status { get; private set; }

    #endregion

    #region Dönem Bilgileri (Period Information)

    /// <summary>
    /// Dönem / Period
    /// </summary>
    public string Period { get; private set; } = string.Empty;

    /// <summary>
    /// Yıl / Year
    /// </summary>
    public int Year { get; private set; }

    /// <summary>
    /// Ay / Month
    /// </summary>
    public int Month { get; private set; }

    /// <summary>
    /// Dönem başlangıç / Period start
    /// </summary>
    public DateOnly PeriodStart { get; private set; }

    /// <summary>
    /// Dönem bitiş / Period end
    /// </summary>
    public DateOnly PeriodEnd { get; private set; }

    /// <summary>
    /// Ödeme tarihi / Payment date
    /// </summary>
    public DateOnly PaymentDate { get; private set; }

    #endregion

    #region Kazançlar (Earnings)

    /// <summary>
    /// Brüt maaş / Gross salary
    /// </summary>
    public decimal GrossSalary { get; private set; }

    /// <summary>
    /// Temel maaş / Base salary
    /// </summary>
    public decimal BaseSalary { get; private set; }

    /// <summary>
    /// Fazla mesai ücreti / Overtime pay
    /// </summary>
    public decimal OvertimePay { get; private set; }

    /// <summary>
    /// Prim/Bonus / Bonus
    /// </summary>
    public decimal Bonus { get; private set; }

    /// <summary>
    /// İkramiye / Gratuity
    /// </summary>
    public decimal Gratuity { get; private set; }

    /// <summary>
    /// Komisyon / Commission
    /// </summary>
    public decimal Commission { get; private set; }

    /// <summary>
    /// Diğer kazançlar / Other earnings
    /// </summary>
    public decimal OtherEarnings { get; private set; }

    /// <summary>
    /// Toplam kazanç / Total earnings
    /// </summary>
    public decimal TotalEarnings { get; private set; }

    #endregion

    #region Ödenekler (Allowances)

    /// <summary>
    /// Yol yardımı / Transportation allowance
    /// </summary>
    public decimal TransportationAllowance { get; private set; }

    /// <summary>
    /// Yemek yardımı / Meal allowance
    /// </summary>
    public decimal MealAllowance { get; private set; }

    /// <summary>
    /// Konut yardımı / Housing allowance
    /// </summary>
    public decimal HousingAllowance { get; private set; }

    /// <summary>
    /// Telefon yardımı / Phone allowance
    /// </summary>
    public decimal PhoneAllowance { get; private set; }

    /// <summary>
    /// Diğer ödenekler / Other allowances
    /// </summary>
    public decimal OtherAllowances { get; private set; }

    /// <summary>
    /// Toplam ödenekler / Total allowances
    /// </summary>
    public decimal TotalAllowances { get; private set; }

    #endregion

    #region Kesintiler (Deductions)

    /// <summary>
    /// Gelir vergisi / Income tax
    /// </summary>
    public decimal IncomeTax { get; private set; }

    /// <summary>
    /// Damga vergisi / Stamp tax
    /// </summary>
    public decimal StampTax { get; private set; }

    /// <summary>
    /// SGK işçi payı / SSI employee share
    /// </summary>
    public decimal SsiEmployeeShare { get; private set; }

    /// <summary>
    /// İşsizlik sigortası işçi payı / Unemployment insurance employee share
    /// </summary>
    public decimal UnemploymentInsuranceEmployee { get; private set; }

    /// <summary>
    /// BES kesintisi / Private pension deduction
    /// </summary>
    public decimal PrivatePensionDeduction { get; private set; }

    /// <summary>
    /// Sendika aidatı / Union dues
    /// </summary>
    public decimal UnionDues { get; private set; }

    /// <summary>
    /// İcra kesintisi / Garnishment
    /// </summary>
    public decimal Garnishment { get; private set; }

    /// <summary>
    /// Avans kesintisi / Advance deduction
    /// </summary>
    public decimal AdvanceDeduction { get; private set; }

    /// <summary>
    /// Diğer kesintiler / Other deductions
    /// </summary>
    public decimal OtherDeductions { get; private set; }

    /// <summary>
    /// Toplam kesintiler / Total deductions
    /// </summary>
    public decimal TotalDeductions { get; private set; }

    #endregion

    #region İşveren Maliyeti (Employer Cost)

    /// <summary>
    /// SGK işveren payı / SSI employer share
    /// </summary>
    public decimal SsiEmployerShare { get; private set; }

    /// <summary>
    /// İşsizlik sigortası işveren payı / Unemployment insurance employer share
    /// </summary>
    public decimal UnemploymentInsuranceEmployer { get; private set; }

    /// <summary>
    /// BES işveren katkısı / Private pension employer contribution
    /// </summary>
    public decimal PrivatePensionEmployer { get; private set; }

    /// <summary>
    /// Toplam işveren maliyeti / Total employer cost
    /// </summary>
    public decimal TotalEmployerCost { get; private set; }

    #endregion

    #region Net Ödeme (Net Payment)

    /// <summary>
    /// Net maaş / Net salary
    /// </summary>
    public decimal NetSalary { get; private set; }

    /// <summary>
    /// Ödenen tutar / Paid amount
    /// </summary>
    public decimal PaidAmount { get; private set; }

    /// <summary>
    /// Para birimi / Currency
    /// </summary>
    public string Currency { get; private set; } = "TRY";

    #endregion

    #region Çalışma Bilgileri (Work Information)

    /// <summary>
    /// Çalışılan gün / Days worked
    /// </summary>
    public int DaysWorked { get; private set; }

    /// <summary>
    /// Çalışılan saat / Hours worked
    /// </summary>
    public decimal HoursWorked { get; private set; }

    /// <summary>
    /// Fazla mesai saati / Overtime hours
    /// </summary>
    public decimal OvertimeHours { get; private set; }

    /// <summary>
    /// İzinli gün / Leave days
    /// </summary>
    public int LeaveDays { get; private set; }

    /// <summary>
    /// Devamsızlık günü / Absence days
    /// </summary>
    public int AbsenceDays { get; private set; }

    /// <summary>
    /// Tatil günü / Holiday days
    /// </summary>
    public int HolidayDays { get; private set; }

    #endregion

    #region Kümülatif Bilgiler (Cumulative Information)

    /// <summary>
    /// Kümülatif brüt / Cumulative gross (YTD)
    /// </summary>
    public decimal CumulativeGross { get; private set; }

    /// <summary>
    /// Kümülatif gelir vergisi / Cumulative income tax (YTD)
    /// </summary>
    public decimal CumulativeIncomeTax { get; private set; }

    /// <summary>
    /// Kümülatif SGK matrahı / Cumulative SSI base (YTD)
    /// </summary>
    public decimal CumulativeSsiBase { get; private set; }

    #endregion

    #region Banka Bilgileri (Bank Information)

    /// <summary>
    /// Banka adı / Bank name
    /// </summary>
    public string? BankName { get; private set; }

    /// <summary>
    /// IBAN
    /// </summary>
    public string? Iban { get; private set; }

    /// <summary>
    /// Ödeme yöntemi / Payment method
    /// </summary>
    public PaymentMethod PaymentMethod { get; private set; }

    /// <summary>
    /// Ödeme referansı / Payment reference
    /// </summary>
    public string? PaymentReference { get; private set; }

    #endregion

    #region Belge Bilgileri (Document Information)

    /// <summary>
    /// PDF URL / PDF URL
    /// </summary>
    public string? PdfUrl { get; private set; }

    /// <summary>
    /// Oluşturulma tarihi / Generated date
    /// </summary>
    public DateTime GeneratedDate { get; private set; }

    /// <summary>
    /// Gönderilme tarihi / Sent date
    /// </summary>
    public DateTime? SentDate { get; private set; }

    /// <summary>
    /// Görüntülenme tarihi / Viewed date
    /// </summary>
    public DateTime? ViewedDate { get; private set; }

    #endregion

    #region Ek Bilgiler (Additional Information)

    /// <summary>
    /// Notlar / Notes
    /// </summary>
    public string? Notes { get; private set; }

    /// <summary>
    /// İç notlar / Internal notes
    /// </summary>
    public string? InternalNotes { get; private set; }

    #endregion

    // Navigation Properties
    public virtual Employee Employee { get; private set; } = null!;
    public virtual Payroll Payroll { get; private set; } = null!;
    public IReadOnlyList<PayslipItem> Items => _items.AsReadOnly();

    protected Payslip() { }

    public Payslip(
        int employeeId,
        int payrollId,
        string payslipNumber,
        int year,
        int month,
        DateOnly periodStart,
        DateOnly periodEnd,
        DateOnly paymentDate)
    {
        EmployeeId = employeeId;
        PayrollId = payrollId;
        PayslipNumber = payslipNumber;
        Year = year;
        Month = month;
        Period = $"{year}-{month:D2}";
        PeriodStart = periodStart;
        PeriodEnd = periodEnd;
        PaymentDate = paymentDate;
        Status = PayslipStatus.Draft;
        Currency = "TRY";
        GeneratedDate = DateTime.UtcNow;
        PaymentMethod = PaymentMethod.BankTransfer;
    }

    public PayslipItem AddItem(string itemName, PayslipItemType itemType, decimal amount, string? description = null)
    {
        var item = new PayslipItem(Id, itemName, itemType, amount, description);
        _items.Add(item);
        RecalculateTotals();
        return item;
    }

    public void RecalculateTotals()
    {
        // Calculate totals from items
        TotalEarnings = BaseSalary + OvertimePay + Bonus + Gratuity + Commission + OtherEarnings;
        TotalAllowances = TransportationAllowance + MealAllowance + HousingAllowance + PhoneAllowance + OtherAllowances;
        TotalDeductions = IncomeTax + StampTax + SsiEmployeeShare + UnemploymentInsuranceEmployee +
                         PrivatePensionDeduction + UnionDues + Garnishment + AdvanceDeduction + OtherDeductions;
        TotalEmployerCost = SsiEmployerShare + UnemploymentInsuranceEmployer + PrivatePensionEmployer;

        GrossSalary = TotalEarnings + TotalAllowances;
        NetSalary = GrossSalary - TotalDeductions;
    }

    public void SetEarnings(decimal baseSalary, decimal overtime, decimal bonus, decimal gratuity, decimal commission, decimal other)
    {
        BaseSalary = baseSalary;
        OvertimePay = overtime;
        Bonus = bonus;
        Gratuity = gratuity;
        Commission = commission;
        OtherEarnings = other;
        RecalculateTotals();
    }

    public void SetAllowances(decimal transportation, decimal meal, decimal housing, decimal phone, decimal other)
    {
        TransportationAllowance = transportation;
        MealAllowance = meal;
        HousingAllowance = housing;
        PhoneAllowance = phone;
        OtherAllowances = other;
        RecalculateTotals();
    }

    public void SetDeductions(decimal incomeTax, decimal stampTax, decimal ssiEmployee, decimal unemploymentEmployee,
        decimal privatePension, decimal unionDues, decimal garnishment, decimal advance, decimal other)
    {
        IncomeTax = incomeTax;
        StampTax = stampTax;
        SsiEmployeeShare = ssiEmployee;
        UnemploymentInsuranceEmployee = unemploymentEmployee;
        PrivatePensionDeduction = privatePension;
        UnionDues = unionDues;
        Garnishment = garnishment;
        AdvanceDeduction = advance;
        OtherDeductions = other;
        RecalculateTotals();
    }

    public void SetEmployerCosts(decimal ssiEmployer, decimal unemploymentEmployer, decimal privatePensionEmployer)
    {
        SsiEmployerShare = ssiEmployer;
        UnemploymentInsuranceEmployer = unemploymentEmployer;
        PrivatePensionEmployer = privatePensionEmployer;
        RecalculateTotals();
    }

    public void SetWorkInfo(int daysWorked, decimal hoursWorked, decimal overtimeHours, int leaveDays, int absenceDays, int holidayDays)
    {
        DaysWorked = daysWorked;
        HoursWorked = hoursWorked;
        OvertimeHours = overtimeHours;
        LeaveDays = leaveDays;
        AbsenceDays = absenceDays;
        HolidayDays = holidayDays;
    }

    public void SetCumulativeInfo(decimal gross, decimal incomeTax, decimal ssiBase)
    {
        CumulativeGross = gross;
        CumulativeIncomeTax = incomeTax;
        CumulativeSsiBase = ssiBase;
    }

    public void SetBankInfo(string? bankName, string? iban, PaymentMethod method, string? reference)
    {
        BankName = bankName;
        Iban = iban;
        PaymentMethod = method;
        PaymentReference = reference;
    }

    public void Finalize()
    {
        Status = PayslipStatus.Finalized;
        RecalculateTotals();
    }

    public void Send()
    {
        Status = PayslipStatus.Sent;
        SentDate = DateTime.UtcNow;
    }

    public void MarkAsViewed()
    {
        ViewedDate = DateTime.UtcNow;
    }

    public void MarkAsPaid(decimal amount, string? reference = null)
    {
        Status = PayslipStatus.Paid;
        PaidAmount = amount;
        if (!string.IsNullOrEmpty(reference))
            PaymentReference = reference;
    }

    public void Cancel()
    {
        Status = PayslipStatus.Cancelled;
    }

    public void SetPdfUrl(string? url) => PdfUrl = url;
    public void SetNotes(string? notes) => Notes = notes;
    public void SetInternalNotes(string? notes) => InternalNotes = notes;
}

/// <summary>
/// Bordro kalemi / Payslip item
/// </summary>
public class PayslipItem : BaseEntity
{
    public int PayslipId { get; private set; }
    public string ItemName { get; private set; } = string.Empty;
    public PayslipItemType ItemType { get; private set; }
    public decimal Amount { get; private set; }
    public decimal? Quantity { get; private set; }
    public decimal? Rate { get; private set; }
    public string? Description { get; private set; }
    public int SortOrder { get; private set; }

    public virtual Payslip Payslip { get; private set; } = null!;

    protected PayslipItem() { }

    public PayslipItem(
        int payslipId,
        string itemName,
        PayslipItemType itemType,
        decimal amount,
        string? description = null)
    {
        PayslipId = payslipId;
        ItemName = itemName;
        ItemType = itemType;
        Amount = amount;
        Description = description;
    }

    public void SetQuantityAndRate(decimal? quantity, decimal? rate)
    {
        Quantity = quantity;
        Rate = rate;
        if (quantity.HasValue && rate.HasValue)
            Amount = quantity.Value * rate.Value;
    }

    public void SetSortOrder(int order) => SortOrder = order;
}

#region Enums

public enum PayslipStatus
{
    /// <summary>Taslak / Draft</summary>
    Draft = 1,

    /// <summary>Kesinleştirildi / Finalized</summary>
    Finalized = 2,

    /// <summary>Gönderildi / Sent</summary>
    Sent = 3,

    /// <summary>Ödendi / Paid</summary>
    Paid = 4,

    /// <summary>İptal edildi / Cancelled</summary>
    Cancelled = 5
}

public enum PaymentMethod
{
    /// <summary>Banka transferi / Bank transfer</summary>
    BankTransfer = 1,

    /// <summary>Nakit / Cash</summary>
    Cash = 2,

    /// <summary>Çek / Check</summary>
    Check = 3,

    /// <summary>Diğer / Other</summary>
    Other = 99
}

public enum PayslipItemType
{
    /// <summary>Kazanç / Earning</summary>
    Earning = 1,

    /// <summary>Ödenek / Allowance</summary>
    Allowance = 2,

    /// <summary>Kesinti / Deduction</summary>
    Deduction = 3,

    /// <summary>İşveren maliyeti / Employer cost</summary>
    EmployerCost = 4
}

#endregion
