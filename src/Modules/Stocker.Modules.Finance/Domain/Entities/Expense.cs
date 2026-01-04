using Stocker.SharedKernel.Common;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Modules.Finance.Domain.Enums;

namespace Stocker.Modules.Finance.Domain.Entities;

/// <summary>
/// Gider Kaydı (Expense Record)
/// İşletme giderlerini yönetir ve muhasebe entegrasyonu sağlar
/// </summary>
public class Expense : BaseEntity
{
    #region Temel Bilgiler (Basic Information)

    /// <summary>
    /// Gider Numarası (Expense Number)
    /// </summary>
    public string ExpenseNumber { get; private set; } = string.Empty;

    /// <summary>
    /// Gider Tarihi (Expense Date)
    /// </summary>
    public DateTime ExpenseDate { get; private set; }

    /// <summary>
    /// Kayıt Tarihi (Record Date)
    /// </summary>
    public DateTime RecordDate { get; private set; }

    /// <summary>
    /// Gider Kategorisi (Expense Category)
    /// </summary>
    public ExpenseMainCategory Category { get; private set; }

    /// <summary>
    /// Gider Alt Kategorisi (Expense Sub-Category)
    /// </summary>
    public ExpenseSubCategory? SubCategory { get; private set; }

    /// <summary>
    /// Açıklama (Description)
    /// </summary>
    public string Description { get; private set; } = string.Empty;

    /// <summary>
    /// Detaylı Açıklama (Detailed Description)
    /// </summary>
    public string? DetailedDescription { get; private set; }

    #endregion

    #region Tutar Bilgileri (Amount Information)

    /// <summary>
    /// Brüt Tutar (Gross Amount)
    /// </summary>
    public Money GrossAmount { get; private set; } = null!;

    /// <summary>
    /// KDV Tutarı (VAT Amount)
    /// </summary>
    public Money VatAmount { get; private set; } = null!;

    /// <summary>
    /// Stopaj Tutarı (Withholding Amount)
    /// </summary>
    public Money WithholdingAmount { get; private set; } = null!;

    /// <summary>
    /// Net Tutar (Net Amount)
    /// </summary>
    public Money NetAmount { get; private set; } = null!;

    /// <summary>
    /// Para Birimi (Currency)
    /// </summary>
    public string Currency { get; private set; } = "TRY";

    /// <summary>
    /// Döviz Kuru (Exchange Rate)
    /// </summary>
    public decimal ExchangeRate { get; private set; } = 1;

    /// <summary>
    /// TL Tutarı (Amount in TRY)
    /// </summary>
    public Money AmountTRY { get; private set; } = null!;

    #endregion

    #region Vergi Bilgileri (Tax Information)

    /// <summary>
    /// KDV Oranı (VAT Rate)
    /// </summary>
    public VatRate VatRate { get; private set; }

    /// <summary>
    /// KDV İndirilebilir mi? (Is VAT Deductible)
    /// </summary>
    public bool IsVatDeductible { get; private set; }

    /// <summary>
    /// İndirilemeyen KDV (Non-Deductible VAT)
    /// </summary>
    public Money? NonDeductibleVat { get; private set; }

    /// <summary>
    /// Stopaj Türü (Withholding Type)
    /// </summary>
    public WithholdingType? WithholdingType { get; private set; }

    /// <summary>
    /// Stopaj Oranı % (Withholding Rate)
    /// </summary>
    public decimal? WithholdingRate { get; private set; }

    /// <summary>
    /// KDV Tevkifatı Var mı? (Has VAT Withholding)
    /// </summary>
    public bool HasVatWithholding { get; private set; }

    /// <summary>
    /// KDV Tevkifat Tutarı (VAT Withholding Amount)
    /// </summary>
    public Money? VatWithholdingAmount { get; private set; }

    #endregion

    #region Tedarikçi Bilgileri (Supplier Information)

    /// <summary>
    /// Cari Hesap ID (Current Account ID)
    /// </summary>
    public int? CurrentAccountId { get; private set; }

    /// <summary>
    /// Tedarikçi Adı (Supplier Name - Denormalized)
    /// </summary>
    public string? SupplierName { get; private set; }

    /// <summary>
    /// Tedarikçi VKN/TCKN (Supplier Tax/ID Number)
    /// </summary>
    public string? SupplierTaxNumber { get; private set; }

    #endregion

    #region Belge Bilgileri (Document Information)

    /// <summary>
    /// Belge Türü (Document Type)
    /// </summary>
    public ExpenseDocumentType DocumentType { get; private set; }

    /// <summary>
    /// Belge Numarası (Document Number)
    /// </summary>
    public string? DocumentNumber { get; private set; }

    /// <summary>
    /// Belge Tarihi (Document Date)
    /// </summary>
    public DateTime? DocumentDate { get; private set; }

    /// <summary>
    /// Fatura ID (Invoice ID - if from invoice)
    /// </summary>
    public int? InvoiceId { get; private set; }

    /// <summary>
    /// Fatura Numarası (Invoice Number)
    /// </summary>
    public string? InvoiceNumber { get; private set; }

    /// <summary>
    /// Ek Belge Yolu (Attachment Path)
    /// </summary>
    public string? AttachmentPath { get; private set; }

    #endregion

    #region Ödeme Bilgileri (Payment Information)

    /// <summary>
    /// Ödeme Yöntemi (Payment Method)
    /// </summary>
    public PaymentType PaymentMethod { get; private set; }

    /// <summary>
    /// Ödendi mi? (Is Paid)
    /// </summary>
    public bool IsPaid { get; private set; }

    /// <summary>
    /// Ödeme Tarihi (Payment Date)
    /// </summary>
    public DateTime? PaymentDate { get; private set; }

    /// <summary>
    /// Ödeme ID (Payment ID)
    /// </summary>
    public int? PaymentId { get; private set; }

    /// <summary>
    /// Banka Hesabı ID (Bank Account ID)
    /// </summary>
    public int? BankAccountId { get; private set; }

    /// <summary>
    /// Kasa ID (Cash Account ID)
    /// </summary>
    public int? CashAccountId { get; private set; }

    #endregion

    #region Muhasebe Bilgileri (Accounting Information)

    /// <summary>
    /// Gider Hesabı ID (Expense Account ID)
    /// </summary>
    public int? ExpenseAccountId { get; private set; }

    /// <summary>
    /// Gider Hesap Kodu (Expense Account Code)
    /// </summary>
    public string? ExpenseAccountCode { get; private set; }

    /// <summary>
    /// Muhasebe Fişi ID (Journal Entry ID)
    /// </summary>
    public int? JournalEntryId { get; private set; }

    /// <summary>
    /// Muhasebeye Aktarıldı mı? (Is Posted to Accounting)
    /// </summary>
    public bool IsPostedToAccounting { get; private set; }

    /// <summary>
    /// Muhasebe Aktarım Tarihi (Posting Date)
    /// </summary>
    public DateTime? PostingDate { get; private set; }

    #endregion

    #region Masraf Merkezi ve Proje (Cost Center and Project)

    /// <summary>
    /// Masraf Merkezi ID (Cost Center ID)
    /// </summary>
    public int? CostCenterId { get; private set; }

    /// <summary>
    /// Proje ID (Project ID)
    /// </summary>
    public int? ProjectId { get; private set; }

    /// <summary>
    /// Departman ID (Department ID)
    /// </summary>
    public int? DepartmentId { get; private set; }

    /// <summary>
    /// Araç ID (Vehicle ID - for vehicle expenses)
    /// </summary>
    public int? VehicleId { get; private set; }

    /// <summary>
    /// Çalışan ID (Employee ID - for employee expenses)
    /// </summary>
    public int? EmployeeId { get; private set; }

    #endregion

    #region Periyodik Gider Bilgileri (Recurring Expense Information)

    /// <summary>
    /// Periyodik Gider mi? (Is Recurring)
    /// </summary>
    public bool IsRecurring { get; private set; }

    /// <summary>
    /// Periyot (Recurrence Period)
    /// </summary>
    public RecurrencePeriod? RecurrencePeriod { get; private set; }

    /// <summary>
    /// Periyodik Gider Başlangıç (Recurrence Start)
    /// </summary>
    public DateTime? RecurrenceStart { get; private set; }

    /// <summary>
    /// Periyodik Gider Bitiş (Recurrence End)
    /// </summary>
    public DateTime? RecurrenceEnd { get; private set; }

    /// <summary>
    /// Ana Periyodik Gider ID (Parent Recurring Expense ID)
    /// </summary>
    public int? ParentRecurringExpenseId { get; private set; }

    #endregion

    #region Bütçe ve Onay Bilgileri (Budget and Approval)

    /// <summary>
    /// Bütçe Kalemi ID (Budget Item ID)
    /// </summary>
    public int? BudgetItemId { get; private set; }

    /// <summary>
    /// Bütçe Aşımı mı? (Is Over Budget)
    /// </summary>
    public bool IsOverBudget { get; private set; }

    /// <summary>
    /// Onay Gerekli mi? (Requires Approval)
    /// </summary>
    public bool RequiresApproval { get; private set; }

    /// <summary>
    /// Onay Durumu (Approval Status)
    /// </summary>
    public ExpenseApprovalStatus ApprovalStatus { get; private set; }

    /// <summary>
    /// Onaylayan Kullanıcı ID (Approved By User ID)
    /// </summary>
    public int? ApprovedByUserId { get; private set; }

    /// <summary>
    /// Onay Tarihi (Approval Date)
    /// </summary>
    public DateTime? ApprovalDate { get; private set; }

    /// <summary>
    /// Onay Notu (Approval Note)
    /// </summary>
    public string? ApprovalNote { get; private set; }

    #endregion

    #region Durum Bilgileri (Status Information)

    /// <summary>
    /// Durum (Status)
    /// </summary>
    public ExpenseStatus Status { get; private set; }

    /// <summary>
    /// Notlar (Notes)
    /// </summary>
    public string? Notes { get; private set; }

    /// <summary>
    /// Etiketler (Tags)
    /// </summary>
    public string? Tags { get; private set; }

    #endregion

    #region Navigation Properties

    public virtual CurrentAccount? CurrentAccount { get; private set; }
    public virtual Invoice? Invoice { get; private set; }
    public virtual Payment? Payment { get; private set; }
    public virtual BankAccount? BankAccount { get; private set; }
    public virtual CashAccount? CashAccount { get; private set; }
    public virtual Account? ExpenseAccount { get; private set; }
    public virtual JournalEntry? JournalEntry { get; private set; }
    public virtual CostCenter? CostCenter { get; private set; }
    public virtual Expense? ParentRecurringExpense { get; private set; }
    public virtual ICollection<Expense> RecurringInstances { get; private set; } = new List<Expense>();

    #endregion

    protected Expense() { }

    public Expense(
        string expenseNumber,
        DateTime expenseDate,
        ExpenseMainCategory category,
        string description,
        Money grossAmount,
        VatRate vatRate,
        ExpenseDocumentType documentType,
        string currency = "TRY")
    {
        ExpenseNumber = expenseNumber;
        ExpenseDate = expenseDate;
        RecordDate = DateTime.UtcNow;
        Category = category;
        Description = description;
        Currency = currency;
        DocumentType = documentType;
        VatRate = vatRate;
        ExchangeRate = 1;

        // Calculate amounts
        GrossAmount = grossAmount;
        var vatAmount = CalculateVat(grossAmount.Amount, vatRate);
        VatAmount = Money.Create(vatAmount, currency);
        WithholdingAmount = Money.Zero(currency);
        NetAmount = Money.Create(grossAmount.Amount + vatAmount, currency);
        AmountTRY = NetAmount;

        IsVatDeductible = true;
        IsPaid = false;
        IsPostedToAccounting = false;
        IsRecurring = false;
        IsOverBudget = false;
        RequiresApproval = false;
        HasVatWithholding = false;
        Status = ExpenseStatus.Draft;
        ApprovalStatus = ExpenseApprovalStatus.NotRequired;
    }

    private static decimal CalculateVat(decimal amount, VatRate rate)
    {
        return rate switch
        {
            VatRate.Zero => 0,
            VatRate.One => amount * 0.01m,
            VatRate.Ten => amount * 0.10m,
            VatRate.Twenty => amount * 0.20m,
            _ => 0
        };
    }

    public void SetSubCategory(ExpenseSubCategory subCategory)
    {
        SubCategory = subCategory;
    }

    public void SetDetailedDescription(string? detailedDescription)
    {
        DetailedDescription = detailedDescription;
    }

    public void SetExchangeRate(decimal rate)
    {
        ExchangeRate = rate;
        AmountTRY = Money.Create(NetAmount.Amount * rate, "TRY");
    }

    public void SetVatDeductible(bool isDeductible)
    {
        IsVatDeductible = isDeductible;
        if (!isDeductible)
        {
            NonDeductibleVat = VatAmount;
        }
        else
        {
            NonDeductibleVat = null;
        }
    }

    public void SetWithholding(WithholdingType type, decimal rate)
    {
        WithholdingType = type;
        WithholdingRate = rate;
        var withholdingAmount = GrossAmount.Amount * (rate / 100);
        WithholdingAmount = Money.Create(withholdingAmount, Currency);
        RecalculateNetAmount();
    }

    public void SetVatWithholding(decimal withholdingAmount)
    {
        HasVatWithholding = true;
        VatWithholdingAmount = Money.Create(withholdingAmount, Currency);
        RecalculateNetAmount();
    }

    private void RecalculateNetAmount()
    {
        var net = GrossAmount.Amount + VatAmount.Amount - WithholdingAmount.Amount;
        if (VatWithholdingAmount != null)
            net -= VatWithholdingAmount.Amount;
        NetAmount = Money.Create(net, Currency);
        AmountTRY = Money.Create(net * ExchangeRate, "TRY");
    }

    public void LinkToSupplier(int currentAccountId, string supplierName, string? supplierTaxNumber = null)
    {
        CurrentAccountId = currentAccountId;
        SupplierName = supplierName;
        SupplierTaxNumber = supplierTaxNumber;
    }

    public void SetDocument(string? documentNumber, DateTime? documentDate)
    {
        DocumentNumber = documentNumber;
        DocumentDate = documentDate;
    }

    public void LinkToInvoice(int invoiceId, string invoiceNumber)
    {
        InvoiceId = invoiceId;
        InvoiceNumber = invoiceNumber;
    }

    public void SetAttachment(string? attachmentPath)
    {
        AttachmentPath = attachmentPath;
    }

    public void SetPaymentMethod(PaymentType paymentMethod)
    {
        PaymentMethod = paymentMethod;
    }

    public void MarkAsPaid(DateTime paymentDate, int? paymentId = null)
    {
        IsPaid = true;
        PaymentDate = paymentDate;
        PaymentId = paymentId;
    }

    public void LinkToBankAccount(int bankAccountId)
    {
        BankAccountId = bankAccountId;
        CashAccountId = null;
    }

    public void LinkToCashAccount(int cashAccountId)
    {
        CashAccountId = cashAccountId;
        BankAccountId = null;
    }

    public void SetExpenseAccount(int accountId, string accountCode)
    {
        ExpenseAccountId = accountId;
        ExpenseAccountCode = accountCode;
    }

    public void PostToAccounting(int journalEntryId)
    {
        JournalEntryId = journalEntryId;
        IsPostedToAccounting = true;
        PostingDate = DateTime.UtcNow;
    }

    public void SetCostCenter(int costCenterId)
    {
        CostCenterId = costCenterId;
    }

    public void SetProject(int projectId)
    {
        ProjectId = projectId;
    }

    public void SetDepartment(int departmentId)
    {
        DepartmentId = departmentId;
    }

    public void SetVehicle(int vehicleId)
    {
        VehicleId = vehicleId;
    }

    public void SetEmployee(int employeeId)
    {
        EmployeeId = employeeId;
    }

    public void SetAsRecurring(RecurrencePeriod period, DateTime startDate, DateTime? endDate = null)
    {
        IsRecurring = true;
        RecurrencePeriod = period;
        RecurrenceStart = startDate;
        RecurrenceEnd = endDate;
    }

    public void LinkToParentRecurring(int parentId)
    {
        ParentRecurringExpenseId = parentId;
    }

    public void LinkToBudgetItem(int budgetItemId)
    {
        BudgetItemId = budgetItemId;
    }

    public void MarkAsOverBudget()
    {
        IsOverBudget = true;
    }

    public void SetApprovalRequired(bool required = true)
    {
        RequiresApproval = required;
        if (required)
            ApprovalStatus = ExpenseApprovalStatus.Pending;
        else
            ApprovalStatus = ExpenseApprovalStatus.NotRequired;
    }

    public void SetNotes(string? notes)
    {
        Notes = notes;
    }

    public void SetTags(string? tags)
    {
        Tags = tags;
    }

    #region Status Management

    public void Submit()
    {
        if (Status != ExpenseStatus.Draft)
            throw new InvalidOperationException("Only draft expenses can be submitted");

        Status = ExpenseStatus.Pending;
        if (RequiresApproval)
            ApprovalStatus = ExpenseApprovalStatus.Pending;
    }

    public void Approve(int approvedByUserId, string? note = null)
    {
        if (ApprovalStatus != ExpenseApprovalStatus.Pending)
            throw new InvalidOperationException("Only pending expenses can be approved");

        ApprovalStatus = ExpenseApprovalStatus.Approved;
        ApprovedByUserId = approvedByUserId;
        ApprovalDate = DateTime.UtcNow;
        ApprovalNote = note;
        Status = ExpenseStatus.Approved;
    }

    public void Reject(int rejectedByUserId, string reason)
    {
        if (ApprovalStatus != ExpenseApprovalStatus.Pending)
            throw new InvalidOperationException("Only pending expenses can be rejected");

        ApprovalStatus = ExpenseApprovalStatus.Rejected;
        ApprovedByUserId = rejectedByUserId;
        ApprovalDate = DateTime.UtcNow;
        ApprovalNote = reason;
        Status = ExpenseStatus.Rejected;
    }

    public void Process()
    {
        if (Status != ExpenseStatus.Approved && Status != ExpenseStatus.Pending)
            throw new InvalidOperationException("Only approved or pending expenses can be processed");

        Status = ExpenseStatus.Processing;
    }

    public void Complete()
    {
        if (Status != ExpenseStatus.Processing)
            throw new InvalidOperationException("Only processing expenses can be completed");

        Status = ExpenseStatus.Completed;
    }

    public void Cancel(string reason)
    {
        if (Status == ExpenseStatus.Cancelled)
            throw new InvalidOperationException("Expense is already cancelled");

        if (IsPostedToAccounting)
            throw new InvalidOperationException("Cannot cancel expense that is posted to accounting");

        Status = ExpenseStatus.Cancelled;
        Notes = string.IsNullOrEmpty(Notes) ? $"Cancelled: {reason}" : $"{Notes}\nCancelled: {reason}";
    }

    #endregion

    #region Factory Methods

    /// <summary>
    /// Genel gider oluştur (Create general expense)
    /// </summary>
    public static Expense CreateGeneralExpense(
        string expenseNumber,
        DateTime date,
        ExpenseMainCategory category,
        string description,
        Money amount,
        VatRate vatRate = VatRate.Twenty)
    {
        return new Expense(
            expenseNumber,
            date,
            category,
            description,
            amount,
            vatRate,
            ExpenseDocumentType.Invoice);
    }

    /// <summary>
    /// Personel gideri oluştur (Create personnel expense)
    /// </summary>
    public static Expense CreatePersonnelExpense(
        string expenseNumber,
        DateTime date,
        ExpenseSubCategory subCategory,
        string description,
        Money amount,
        int employeeId)
    {
        var expense = new Expense(
            expenseNumber,
            date,
            ExpenseMainCategory.Personnel,
            description,
            amount,
            VatRate.Zero,
            ExpenseDocumentType.Other);

        expense.SetSubCategory(subCategory);
        expense.SetEmployee(employeeId);
        expense.SetVatDeductible(false);

        return expense;
    }

    /// <summary>
    /// Araç gideri oluştur (Create vehicle expense)
    /// </summary>
    public static Expense CreateVehicleExpense(
        string expenseNumber,
        DateTime date,
        ExpenseSubCategory subCategory,
        string description,
        Money amount,
        int vehicleId,
        VatRate vatRate = VatRate.Twenty)
    {
        var expense = new Expense(
            expenseNumber,
            date,
            ExpenseMainCategory.Vehicle,
            description,
            amount,
            vatRate,
            ExpenseDocumentType.Invoice);

        expense.SetSubCategory(subCategory);
        expense.SetVehicle(vehicleId);

        return expense;
    }

    /// <summary>
    /// Faturadan gider oluştur (Create expense from invoice)
    /// </summary>
    public static Expense CreateFromInvoice(
        string expenseNumber,
        Invoice invoice,
        ExpenseMainCategory category)
    {
        var expense = new Expense(
            expenseNumber,
            invoice.InvoiceDate,
            category,
            $"Fatura: {invoice.InvoiceNumber}",
            invoice.NetAmountBeforeTax,
            VatRate.Twenty, // Will be overridden
            ExpenseDocumentType.Invoice,
            invoice.Currency);

        expense.VatAmount = invoice.TotalVat;
        expense.NetAmount = invoice.GrandTotal;
        expense.AmountTRY = Money.Create(invoice.GrandTotal.Amount * invoice.ExchangeRate, "TRY");
        expense.LinkToInvoice(invoice.Id, invoice.InvoiceNumber);

        if (invoice.CurrentAccountId > 0)
        {
            expense.LinkToSupplier(invoice.CurrentAccountId, invoice.CurrentAccountName ?? "");
        }

        return expense;
    }

    /// <summary>
    /// Periyodik gider oluştur (Create recurring expense)
    /// </summary>
    public static Expense CreateRecurringExpense(
        string expenseNumber,
        DateTime startDate,
        ExpenseMainCategory category,
        string description,
        Money amount,
        RecurrencePeriod period,
        DateTime? endDate = null)
    {
        var expense = new Expense(
            expenseNumber,
            startDate,
            category,
            description,
            amount,
            VatRate.Twenty,
            ExpenseDocumentType.Invoice);

        expense.SetAsRecurring(period, startDate, endDate);

        return expense;
    }

    #endregion
}

/// <summary>
/// Gider Onay Durumları (Expense Approval Statuses)
/// </summary>
public enum ExpenseApprovalStatus
{
    /// <summary>
    /// Onay Gerekmiyor (Not Required)
    /// </summary>
    NotRequired = 0,

    /// <summary>
    /// Onay Bekliyor (Pending)
    /// </summary>
    Pending = 1,

    /// <summary>
    /// Onaylandı (Approved)
    /// </summary>
    Approved = 2,

    /// <summary>
    /// Reddedildi (Rejected)
    /// </summary>
    Rejected = 3
}

/// <summary>
/// Gider Belge Türleri (Expense Document Types)
/// </summary>
public enum ExpenseDocumentType
{
    /// <summary>
    /// Fatura (Invoice)
    /// </summary>
    Invoice = 1,

    /// <summary>
    /// e-Fatura (e-Invoice)
    /// </summary>
    EInvoice = 2,

    /// <summary>
    /// Fiş (Receipt)
    /// </summary>
    Receipt = 3,

    /// <summary>
    /// Perakende Satış Fişi (Retail Sales Receipt)
    /// </summary>
    RetailReceipt = 4,

    /// <summary>
    /// Gider Pusulası (Expense Voucher)
    /// </summary>
    ExpenseVoucher = 5,

    /// <summary>
    /// Serbest Meslek Makbuzu (Self-Employment Receipt)
    /// </summary>
    SelfEmploymentReceipt = 6,

    /// <summary>
    /// Müstahsil Makbuzu (Producer Receipt)
    /// </summary>
    ProducerReceipt = 7,

    /// <summary>
    /// Dekont (Bank Statement)
    /// </summary>
    BankStatement = 8,

    /// <summary>
    /// Diğer (Other)
    /// </summary>
    Other = 99
}

/// <summary>
/// Periyot Türleri (Recurrence Periods)
/// </summary>
public enum RecurrencePeriod
{
    /// <summary>
    /// Günlük (Daily)
    /// </summary>
    Daily = 1,

    /// <summary>
    /// Haftalık (Weekly)
    /// </summary>
    Weekly = 2,

    /// <summary>
    /// İki Haftalık (Biweekly)
    /// </summary>
    Biweekly = 3,

    /// <summary>
    /// Aylık (Monthly)
    /// </summary>
    Monthly = 4,

    /// <summary>
    /// Üç Aylık (Quarterly)
    /// </summary>
    Quarterly = 5,

    /// <summary>
    /// Altı Aylık (Semiannually)
    /// </summary>
    Semiannually = 6,

    /// <summary>
    /// Yıllık (Annually)
    /// </summary>
    Annually = 7
}

/// <summary>
/// Gider Ana Kategorileri (Expense Main Categories)
/// Tekdüzen Hesap Planı 63x gruplarına uygun
/// </summary>
public enum ExpenseMainCategory
{
    /// <summary>
    /// Ar-Ge Giderleri (630) / R&D Expenses
    /// </summary>
    ResearchDevelopment = 630,

    /// <summary>
    /// Pazarlama, Satış ve Dağıtım Giderleri (631) / Marketing, Sales and Distribution
    /// </summary>
    MarketingSalesDistribution = 631,

    /// <summary>
    /// Genel Yönetim Giderleri (632) / General Administrative Expenses
    /// </summary>
    GeneralAdministrative = 632,

    /// <summary>
    /// Personel Giderleri / Personnel Expenses
    /// </summary>
    Personnel = 100,

    /// <summary>
    /// Araç Giderleri / Vehicle Expenses
    /// </summary>
    Vehicle = 101,

    /// <summary>
    /// Ofis Giderleri / Office Expenses
    /// </summary>
    Office = 102,

    /// <summary>
    /// Seyahat Giderleri / Travel Expenses
    /// </summary>
    Travel = 103,

    /// <summary>
    /// Diğer / Other
    /// </summary>
    Other = 999
}

/// <summary>
/// Gider Alt Kategorileri (Expense Sub Categories)
/// </summary>
public enum ExpenseSubCategory
{
    // Personel Alt Kategorileri
    /// <summary>Maaş / Salary</summary>
    Salary = 1,
    /// <summary>SGK Primi / Social Security Premium</summary>
    SocialSecurityPremium = 2,
    /// <summary>İşsizlik Sigortası / Unemployment Insurance</summary>
    UnemploymentInsurance = 3,
    /// <summary>Yemek / Meal Allowance</summary>
    MealAllowance = 4,
    /// <summary>Ulaşım / Transportation Allowance</summary>
    TransportationAllowance = 5,
    /// <summary>Kıdem Tazminatı / Severance Pay</summary>
    SeverancePay = 6,

    // Araç Alt Kategorileri
    /// <summary>Yakıt / Fuel</summary>
    Fuel = 10,
    /// <summary>Bakım / Maintenance</summary>
    VehicleMaintenance = 11,
    /// <summary>Sigorta / Insurance</summary>
    VehicleInsurance = 12,
    /// <summary>MTV / Motor Vehicle Tax</summary>
    MotorVehicleTax = 13,
    /// <summary>HGS/OGS / Highway Tolls</summary>
    HighwayTolls = 14,

    // Ofis Alt Kategorileri
    /// <summary>Kira / Rent</summary>
    Rent = 20,
    /// <summary>Elektrik / Electricity</summary>
    Electricity = 21,
    /// <summary>Su / Water</summary>
    Water = 22,
    /// <summary>Doğalgaz / Natural Gas</summary>
    NaturalGas = 23,
    /// <summary>İletişim / Communication</summary>
    Communication = 24,
    /// <summary>Kırtasiye / Stationery</summary>
    Stationery = 25,

    // Seyahat Alt Kategorileri
    /// <summary>Konaklama / Accommodation</summary>
    Accommodation = 30,
    /// <summary>Uçak Bileti / Flight Ticket</summary>
    FlightTicket = 31,
    /// <summary>Araç Kiralama / Car Rental</summary>
    CarRental = 32,
    /// <summary>Yemek Masrafı / Meal Expense</summary>
    MealExpense = 33,

    /// <summary>Diğer / Other</summary>
    Other = 99
}

/// <summary>
/// Stopaj Türleri (Withholding Types)
/// Gelir Vergisi Kanunu'na uygun
/// </summary>
public enum WithholdingType
{
    /// <summary>Stopaj Yok / No Withholding</summary>
    None = 0,

    /// <summary>Serbest Meslek Stopajı %20 / Professional Service 20%</summary>
    ProfessionalService20 = 1,

    /// <summary>Kira Stopajı %20 / Rent 20%</summary>
    Rent20 = 2,

    /// <summary>Faiz Stopajı %15 / Interest 15%</summary>
    Interest15 = 3,

    /// <summary>Telif Hakkı Stopajı %20 / Royalty 20%</summary>
    Royalty20 = 4,

    /// <summary>Yapı Denetim Stopajı %3 / Building Inspection 3%</summary>
    BuildingInspection3 = 5,

    /// <summary>Diğer / Other</summary>
    Other = 99
}
