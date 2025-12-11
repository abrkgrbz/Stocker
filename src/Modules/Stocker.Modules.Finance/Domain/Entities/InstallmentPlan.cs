using Stocker.SharedKernel.Common;
using Stocker.Domain.Common.ValueObjects;

namespace Stocker.Modules.Finance.Domain.Entities;

/// <summary>
/// Taksit Planı entity'si - Satış/alış taksitlerinin takibi
/// Installment Plan entity - Tracking of sales/purchase installments
/// Türkiye'de yaygın kullanılan vadeli satış ve taksitli ödeme sistemleri için
/// For Turkey's common deferred sales and installment payment systems
/// </summary>
public class InstallmentPlan : BaseEntity
{
    /// <summary>
    /// Plan numarası / Plan number
    /// </summary>
    public string PlanNumber { get; private set; } = string.Empty;

    /// <summary>
    /// Plan türü / Plan type
    /// </summary>
    public InstallmentPlanType PlanType { get; private set; }

    /// <summary>
    /// Plan yönü (Alacak/Borç) / Plan direction (Receivable/Payable)
    /// </summary>
    public InstallmentPlanDirection Direction { get; private set; }

    /// <summary>
    /// İlişkili cari hesap ID / Related current account ID
    /// </summary>
    public int CurrentAccountId { get; private set; }

    /// <summary>
    /// Cari hesap adı / Current account name
    /// </summary>
    public string CurrentAccountName { get; private set; } = string.Empty;

    /// <summary>
    /// İlişkili fatura ID / Related invoice ID
    /// </summary>
    public int? InvoiceId { get; private set; }

    /// <summary>
    /// İlişkili fatura numarası / Related invoice number
    /// </summary>
    public string? InvoiceNumber { get; private set; }

    /// <summary>
    /// Başlangıç tarihi / Start date
    /// </summary>
    public DateTime StartDate { get; private set; }

    /// <summary>
    /// Bitiş tarihi / End date
    /// </summary>
    public DateTime EndDate { get; private set; }

    /// <summary>
    /// Toplam tutar / Total amount
    /// </summary>
    public Money TotalAmount { get; private set; } = null!;

    /// <summary>
    /// Peşinat tutarı / Down payment amount
    /// </summary>
    public Money DownPayment { get; private set; } = null!;

    /// <summary>
    /// Finansman tutarı (taksitlendirilecek) / Financed amount
    /// </summary>
    public Money FinancedAmount { get; private set; } = null!;

    /// <summary>
    /// Toplam faiz tutarı / Total interest amount
    /// </summary>
    public Money TotalInterest { get; private set; } = null!;

    /// <summary>
    /// Toplam ödenecek tutar / Total payable amount
    /// </summary>
    public Money TotalPayable { get; private set; } = null!;

    /// <summary>
    /// Ödenen tutar / Paid amount
    /// </summary>
    public Money PaidAmount { get; private set; } = null!;

    /// <summary>
    /// Kalan bakiye / Remaining balance
    /// </summary>
    public Money RemainingBalance { get; private set; } = null!;

    /// <summary>
    /// Taksit sayısı / Number of installments
    /// </summary>
    public int NumberOfInstallments { get; private set; }

    /// <summary>
    /// Ödenen taksit sayısı / Number of paid installments
    /// </summary>
    public int PaidInstallments { get; private set; }

    /// <summary>
    /// Taksit tutarı / Installment amount
    /// </summary>
    public Money InstallmentAmount { get; private set; } = null!;

    /// <summary>
    /// Ödeme sıklığı / Payment frequency
    /// </summary>
    public InstallmentFrequency Frequency { get; private set; }

    /// <summary>
    /// Faiz oranı (yıllık %) / Interest rate (annual %)
    /// </summary>
    public decimal AnnualInterestRate { get; private set; }

    /// <summary>
    /// Faiz türü / Interest type
    /// </summary>
    public InstallmentInterestType InterestType { get; private set; }

    /// <summary>
    /// Vade farkı dahil mi? / Is maturity difference included?
    /// </summary>
    public bool IncludesMaturityDifference { get; private set; }

    /// <summary>
    /// Erken ödeme indirimi oranı (%) / Early payment discount rate (%)
    /// </summary>
    public decimal? EarlyPaymentDiscountRate { get; private set; }

    /// <summary>
    /// Gecikme faizi oranı (aylık %) / Late payment interest rate (monthly %)
    /// </summary>
    public decimal? LatePaymentInterestRate { get; private set; }

    /// <summary>
    /// Plan durumu / Plan status
    /// </summary>
    public InstallmentPlanStatus Status { get; private set; }

    /// <summary>
    /// İlk taksit tarihi / First installment date
    /// </summary>
    public DateTime FirstInstallmentDate { get; private set; }

    /// <summary>
    /// İlişkili sözleşme numarası / Related contract number
    /// </summary>
    public string? ContractNumber { get; private set; }

    /// <summary>
    /// Teminat bilgisi / Collateral information
    /// </summary>
    public string? CollateralInfo { get; private set; }

    /// <summary>
    /// Muhasebe hesabı ID (Alacak/Borç senetleri) / Accounting account ID
    /// </summary>
    public int? AccountId { get; private set; }

    /// <summary>
    /// Ertelenmiş gelir/gider hesabı ID / Deferred income/expense account ID
    /// </summary>
    public int? DeferredAccountId { get; private set; }

    /// <summary>
    /// Notlar / Notes
    /// </summary>
    public string? Notes { get; private set; }

    /// <summary>
    /// Onaylayan / Approved by
    /// </summary>
    public string? ApprovedBy { get; private set; }

    /// <summary>
    /// Onay tarihi / Approval date
    /// </summary>
    public DateTime? ApprovalDate { get; private set; }

    /// <summary>
    /// Kapatma tarihi / Closure date
    /// </summary>
    public DateTime? ClosureDate { get; private set; }

    // Navigation properties
    public virtual ICollection<Installment> Installments { get; private set; } = new List<Installment>();

    private InstallmentPlan() { }

    /// <summary>
    /// Satış taksit planı oluşturur / Creates sales installment plan
    /// </summary>
    public static InstallmentPlan CreateSalesPlan(
        string planNumber,
        int currentAccountId,
        string currentAccountName,
        Money totalAmount,
        Money downPayment,
        int numberOfInstallments,
        InstallmentFrequency frequency,
        DateTime firstInstallmentDate,
        decimal annualInterestRate = 0)
    {
        return Create(
            planNumber,
            InstallmentPlanType.Sales,
            InstallmentPlanDirection.Receivable,
            currentAccountId,
            currentAccountName,
            totalAmount,
            downPayment,
            numberOfInstallments,
            frequency,
            firstInstallmentDate,
            annualInterestRate);
    }

    /// <summary>
    /// Alış taksit planı oluşturur / Creates purchase installment plan
    /// </summary>
    public static InstallmentPlan CreatePurchasePlan(
        string planNumber,
        int currentAccountId,
        string currentAccountName,
        Money totalAmount,
        Money downPayment,
        int numberOfInstallments,
        InstallmentFrequency frequency,
        DateTime firstInstallmentDate,
        decimal annualInterestRate = 0)
    {
        return Create(
            planNumber,
            InstallmentPlanType.Purchase,
            InstallmentPlanDirection.Payable,
            currentAccountId,
            currentAccountName,
            totalAmount,
            downPayment,
            numberOfInstallments,
            frequency,
            firstInstallmentDate,
            annualInterestRate);
    }

    /// <summary>
    /// Kredi kartı taksit planı oluşturur / Creates credit card installment plan
    /// </summary>
    public static InstallmentPlan CreateCreditCardPlan(
        string planNumber,
        int currentAccountId,
        string bankName,
        Money totalAmount,
        int numberOfInstallments,
        DateTime firstInstallmentDate,
        decimal commissionRate = 0)
    {
        var plan = Create(
            planNumber,
            InstallmentPlanType.CreditCard,
            InstallmentPlanDirection.Receivable,
            currentAccountId,
            bankName,
            totalAmount,
            Money.Zero(totalAmount.Currency),
            numberOfInstallments,
            InstallmentFrequency.Monthly,
            firstInstallmentDate,
            commissionRate);

        plan.InterestType = InstallmentInterestType.CommissionBased;

        return plan;
    }

    private static InstallmentPlan Create(
        string planNumber,
        InstallmentPlanType planType,
        InstallmentPlanDirection direction,
        int currentAccountId,
        string currentAccountName,
        Money totalAmount,
        Money downPayment,
        int numberOfInstallments,
        InstallmentFrequency frequency,
        DateTime firstInstallmentDate,
        decimal annualInterestRate)
    {
        if (string.IsNullOrWhiteSpace(planNumber))
            throw new ArgumentException("Plan numarası gereklidir", nameof(planNumber));

        if (numberOfInstallments <= 0)
            throw new ArgumentException("Taksit sayısı pozitif olmalıdır", nameof(numberOfInstallments));

        if (totalAmount.Amount <= 0)
            throw new ArgumentException("Toplam tutar pozitif olmalıdır", nameof(totalAmount));

        if (downPayment.Amount < 0)
            throw new ArgumentException("Peşinat negatif olamaz", nameof(downPayment));

        if (downPayment.Amount >= totalAmount.Amount)
            throw new ArgumentException("Peşinat toplam tutardan büyük veya eşit olamaz", nameof(downPayment));

        var currency = totalAmount.Currency;
        var financedAmount = totalAmount.Subtract(downPayment);

        // Faiz hesaplama
        decimal totalInterest = 0;
        if (annualInterestRate > 0)
        {
            var monthlyRate = annualInterestRate / 100 / 12;
            var months = GetMonthsFromFrequency(frequency, numberOfInstallments);

            // Basit faiz hesabı (Türkiye'de yaygın kullanılan yöntem)
            totalInterest = financedAmount.Amount * monthlyRate * months;
        }

        var totalPayable = financedAmount.Amount + totalInterest;
        var installmentAmount = totalPayable / numberOfInstallments;

        // Bitiş tarihi hesaplama
        var endDate = GetEndDate(firstInstallmentDate, frequency, numberOfInstallments);

        return new InstallmentPlan
        {
            PlanNumber = planNumber,
            PlanType = planType,
            Direction = direction,
            CurrentAccountId = currentAccountId,
            CurrentAccountName = currentAccountName,
            StartDate = firstInstallmentDate.AddDays(-1),
            EndDate = endDate,
            TotalAmount = totalAmount,
            DownPayment = downPayment,
            FinancedAmount = financedAmount,
            TotalInterest = Money.Create(totalInterest, currency),
            TotalPayable = Money.Create(totalPayable, currency),
            PaidAmount = downPayment, // Peşinat ödendi sayılır
            RemainingBalance = Money.Create(totalPayable, currency),
            NumberOfInstallments = numberOfInstallments,
            PaidInstallments = 0,
            InstallmentAmount = Money.Create(installmentAmount, currency),
            Frequency = frequency,
            AnnualInterestRate = annualInterestRate,
            InterestType = annualInterestRate > 0 ? InstallmentInterestType.SimpleInterest : InstallmentInterestType.NoInterest,
            FirstInstallmentDate = firstInstallmentDate,
            Status = InstallmentPlanStatus.Draft
        };
    }

    /// <summary>
    /// Taksit planı oluşturur / Generates installment schedule
    /// </summary>
    public void GenerateSchedule()
    {
        Installments.Clear();

        var currency = TotalAmount.Currency;
        var remainingPrincipal = FinancedAmount.Amount;
        var installmentDate = FirstInstallmentDate;

        for (int i = 1; i <= NumberOfInstallments; i++)
        {
            decimal principalPortion;
            decimal interestPortion;

            if (InterestType == InstallmentInterestType.NoInterest || AnnualInterestRate == 0)
            {
                // Faizsiz taksit
                principalPortion = FinancedAmount.Amount / NumberOfInstallments;
                interestPortion = 0;
            }
            else if (InterestType == InstallmentInterestType.SimpleInterest)
            {
                // Basit faiz - Türkiye'de yaygın
                principalPortion = FinancedAmount.Amount / NumberOfInstallments;
                interestPortion = (InstallmentAmount.Amount * NumberOfInstallments - FinancedAmount.Amount) / NumberOfInstallments;
            }
            else
            {
                // Anuity hesabı
                var monthlyRate = AnnualInterestRate / 100 / 12;
                interestPortion = remainingPrincipal * monthlyRate;
                principalPortion = InstallmentAmount.Amount - interestPortion;
            }

            // Son taksit ayarlaması (yuvarlama farkları için)
            if (i == NumberOfInstallments)
            {
                principalPortion = remainingPrincipal;
            }

            var installment = Installment.Create(
                this,
                i,
                installmentDate,
                Money.Create(principalPortion, currency),
                Money.Create(interestPortion, currency));

            Installments.Add(installment);

            remainingPrincipal -= principalPortion;
            installmentDate = GetNextInstallmentDate(installmentDate);
        }
    }

    /// <summary>
    /// Taksit ödemesi kaydeder / Records installment payment
    /// </summary>
    public Installment RecordPayment(int installmentNumber, DateTime paymentDate, Money paidAmount, string? reference = null)
    {
        if (Status != InstallmentPlanStatus.Active)
            throw new InvalidOperationException("Sadece aktif planlara ödeme yapılabilir");

        var installment = Installments.FirstOrDefault(i => i.InstallmentNumber == installmentNumber);
        if (installment == null)
            throw new ArgumentException($"Taksit {installmentNumber} bulunamadı");

        if (installment.IsPaid)
            throw new InvalidOperationException($"Taksit {installmentNumber} zaten ödenmiş");

        installment.MarkAsPaid(paymentDate, paidAmount, reference);

        PaidAmount = PaidAmount.Add(paidAmount);
        RemainingBalance = RemainingBalance.Subtract(paidAmount);
        PaidInstallments++;

        // Plan tamamlandı mı kontrol et
        if (PaidInstallments >= NumberOfInstallments || RemainingBalance.Amount <= 0)
        {
            Close(paymentDate);
        }

        return installment;
    }

    /// <summary>
    /// Erken ödeme yapar / Makes early payment
    /// </summary>
    public void MakeEarlyPayment(DateTime paymentDate, Money amount, bool closeIfPaidOff = true)
    {
        if (Status != InstallmentPlanStatus.Active)
            throw new InvalidOperationException("Sadece aktif planlara erken ödeme yapılabilir");

        // Erken ödeme indirimi uygula
        var effectiveAmount = amount;
        if (EarlyPaymentDiscountRate.HasValue && EarlyPaymentDiscountRate > 0)
        {
            var remainingInterest = Installments
                .Where(i => !i.IsPaid)
                .Sum(i => i.InterestAmount.Amount);

            var discount = remainingInterest * EarlyPaymentDiscountRate.Value / 100;
            effectiveAmount = amount.Subtract(Money.Create(discount, amount.Currency));
        }

        PaidAmount = PaidAmount.Add(effectiveAmount);
        RemainingBalance = RemainingBalance.Subtract(effectiveAmount);

        // Ödenmemiş taksitleri ödenmiş olarak işaretle
        var unpaidInstallments = Installments
            .Where(i => !i.IsPaid)
            .OrderBy(i => i.InstallmentNumber)
            .ToList();

        var remainingPayment = effectiveAmount.Amount;
        foreach (var installment in unpaidInstallments)
        {
            if (remainingPayment <= 0) break;

            var installmentTotal = installment.TotalAmount.Amount;
            if (remainingPayment >= installmentTotal)
            {
                installment.MarkAsPaid(paymentDate, installment.TotalAmount);
                PaidInstallments++;
                remainingPayment -= installmentTotal;
            }
            else
            {
                installment.RecordPartialPayment(Money.Create(remainingPayment, amount.Currency));
                remainingPayment = 0;
            }
        }

        if (closeIfPaidOff && RemainingBalance.Amount <= 0)
        {
            Close(paymentDate);
        }
    }

    /// <summary>
    /// Planı aktifleştirir / Activates the plan
    /// </summary>
    public void Activate(string approvedBy)
    {
        if (Status != InstallmentPlanStatus.Draft)
            throw new InvalidOperationException("Sadece taslak planlar aktifleştirilebilir");

        if (!Installments.Any())
        {
            GenerateSchedule();
        }

        ApprovedBy = approvedBy;
        ApprovalDate = DateTime.UtcNow;
        Status = InstallmentPlanStatus.Active;
    }

    /// <summary>
    /// Planı kapatır / Closes the plan
    /// </summary>
    public void Close(DateTime closureDate)
    {
        ClosureDate = closureDate;
        Status = InstallmentPlanStatus.Closed;
    }

    /// <summary>
    /// Planı iptal eder / Cancels the plan
    /// </summary>
    public void Cancel(string reason)
    {
        if (PaidInstallments > 0)
            throw new InvalidOperationException("Ödemesi yapılmış plan iptal edilemez");

        Notes = $"İptal nedeni: {reason}. {Notes}";
        Status = InstallmentPlanStatus.Cancelled;
    }

    /// <summary>
    /// Gecikmiş taksitleri kontrol eder / Checks overdue installments
    /// </summary>
    public IEnumerable<Installment> GetOverdueInstallments(DateTime asOfDate)
    {
        return Installments
            .Where(i => !i.IsPaid && i.DueDate < asOfDate)
            .OrderBy(i => i.DueDate);
    }

    /// <summary>
    /// Gecikme faizi hesaplar / Calculates late payment interest
    /// </summary>
    public Money CalculateLateInterest(DateTime asOfDate)
    {
        if (!LatePaymentInterestRate.HasValue || LatePaymentInterestRate <= 0)
            return Money.Zero(TotalAmount.Currency);

        var overdueInstallments = GetOverdueInstallments(asOfDate);
        var totalInterest = 0m;

        foreach (var installment in overdueInstallments)
        {
            var daysOverdue = (asOfDate - installment.DueDate).Days;
            var monthsOverdue = Math.Ceiling(daysOverdue / 30.0);
            var interest = installment.RemainingAmount.Amount * LatePaymentInterestRate.Value / 100 * (decimal)monthsOverdue;
            totalInterest += interest;
        }

        return Money.Create(totalInterest, TotalAmount.Currency);
    }

    private DateTime GetNextInstallmentDate(DateTime currentDate)
    {
        return Frequency switch
        {
            InstallmentFrequency.Weekly => currentDate.AddDays(7),
            InstallmentFrequency.BiWeekly => currentDate.AddDays(14),
            InstallmentFrequency.Monthly => currentDate.AddMonths(1),
            InstallmentFrequency.BiMonthly => currentDate.AddMonths(2),
            InstallmentFrequency.Quarterly => currentDate.AddMonths(3),
            InstallmentFrequency.SemiAnnually => currentDate.AddMonths(6),
            InstallmentFrequency.Annually => currentDate.AddYears(1),
            _ => currentDate.AddMonths(1)
        };
    }

    private static DateTime GetEndDate(DateTime startDate, InstallmentFrequency frequency, int numberOfInstallments)
    {
        return frequency switch
        {
            InstallmentFrequency.Weekly => startDate.AddDays(7 * numberOfInstallments),
            InstallmentFrequency.BiWeekly => startDate.AddDays(14 * numberOfInstallments),
            InstallmentFrequency.Monthly => startDate.AddMonths(numberOfInstallments),
            InstallmentFrequency.BiMonthly => startDate.AddMonths(2 * numberOfInstallments),
            InstallmentFrequency.Quarterly => startDate.AddMonths(3 * numberOfInstallments),
            InstallmentFrequency.SemiAnnually => startDate.AddMonths(6 * numberOfInstallments),
            InstallmentFrequency.Annually => startDate.AddYears(numberOfInstallments),
            _ => startDate.AddMonths(numberOfInstallments)
        };
    }

    private static int GetMonthsFromFrequency(InstallmentFrequency frequency, int installmentCount)
    {
        return frequency switch
        {
            InstallmentFrequency.Weekly => (int)Math.Ceiling(installmentCount * 7 / 30.0),
            InstallmentFrequency.BiWeekly => (int)Math.Ceiling(installmentCount * 14 / 30.0),
            InstallmentFrequency.Monthly => installmentCount,
            InstallmentFrequency.BiMonthly => installmentCount * 2,
            InstallmentFrequency.Quarterly => installmentCount * 3,
            InstallmentFrequency.SemiAnnually => installmentCount * 6,
            InstallmentFrequency.Annually => installmentCount * 12,
            _ => installmentCount
        };
    }

    // Setter methods
    public void SetInvoice(int? invoiceId, string? invoiceNumber)
    {
        InvoiceId = invoiceId;
        InvoiceNumber = invoiceNumber;
    }
    public void SetContractNumber(string? contractNumber) => ContractNumber = contractNumber;
    public void SetCollateralInfo(string? info) => CollateralInfo = info;
    public void SetAccountId(int? accountId) => AccountId = accountId;
    public void SetDeferredAccountId(int? accountId) => DeferredAccountId = accountId;
    public void SetEarlyPaymentDiscountRate(decimal? rate) => EarlyPaymentDiscountRate = rate;
    public void SetLatePaymentInterestRate(decimal? rate) => LatePaymentInterestRate = rate;
    public void SetMaturityDifferenceFlag(bool includes) => IncludesMaturityDifference = includes;
    public void SetNotes(string? notes) => Notes = notes;
}

/// <summary>
/// Taksit entity'si / Installment entity
/// </summary>
public class Installment : BaseEntity
{
    /// <summary>
    /// Taksit planı ID / Installment plan ID
    /// </summary>
    public int InstallmentPlanId { get; private set; }

    /// <summary>
    /// Taksit numarası / Installment number
    /// </summary>
    public int InstallmentNumber { get; private set; }

    /// <summary>
    /// Vade tarihi / Due date
    /// </summary>
    public DateTime DueDate { get; private set; }

    /// <summary>
    /// Anapara tutarı / Principal amount
    /// </summary>
    public Money PrincipalAmount { get; private set; } = null!;

    /// <summary>
    /// Faiz tutarı / Interest amount
    /// </summary>
    public Money InterestAmount { get; private set; } = null!;

    /// <summary>
    /// Toplam taksit tutarı / Total installment amount
    /// </summary>
    public Money TotalAmount { get; private set; } = null!;

    /// <summary>
    /// Ödenen tutar / Paid amount
    /// </summary>
    public Money PaidAmount { get; private set; } = null!;

    /// <summary>
    /// Kalan tutar / Remaining amount
    /// </summary>
    public Money RemainingAmount { get; private set; } = null!;

    /// <summary>
    /// Ödendi mi? / Is paid?
    /// </summary>
    public bool IsPaid { get; private set; }

    /// <summary>
    /// Kısmi ödeme yapıldı mı? / Is partially paid?
    /// </summary>
    public bool IsPartiallyPaid { get; private set; }

    /// <summary>
    /// Ödeme tarihi / Payment date
    /// </summary>
    public DateTime? PaymentDate { get; private set; }

    /// <summary>
    /// Ödeme referansı / Payment reference
    /// </summary>
    public string? PaymentReference { get; private set; }

    /// <summary>
    /// Gecikme faizi / Late interest
    /// </summary>
    public Money? LateInterest { get; private set; }

    /// <summary>
    /// İlişkili ödeme ID / Related payment ID
    /// </summary>
    public int? PaymentId { get; private set; }

    /// <summary>
    /// İlişkili banka işlemi ID / Related bank transaction ID
    /// </summary>
    public int? BankTransactionId { get; private set; }

    /// <summary>
    /// Notlar / Notes
    /// </summary>
    public string? Notes { get; private set; }

    // Navigation
    public virtual InstallmentPlan InstallmentPlan { get; private set; } = null!;

    private Installment() { }

    public static Installment Create(
        InstallmentPlan plan,
        int installmentNumber,
        DateTime dueDate,
        Money principalAmount,
        Money interestAmount)
    {
        var totalAmount = principalAmount.Add(interestAmount);

        return new Installment
        {
            InstallmentPlanId = plan.Id,
            InstallmentPlan = plan,
            InstallmentNumber = installmentNumber,
            DueDate = dueDate,
            PrincipalAmount = principalAmount,
            InterestAmount = interestAmount,
            TotalAmount = totalAmount,
            PaidAmount = Money.Zero(principalAmount.Currency),
            RemainingAmount = totalAmount,
            IsPaid = false,
            IsPartiallyPaid = false
        };
    }

    public void MarkAsPaid(DateTime paymentDate, Money paidAmount, string? reference = null)
    {
        PaymentDate = paymentDate;
        PaidAmount = paidAmount;
        RemainingAmount = TotalAmount.Subtract(paidAmount);
        PaymentReference = reference;
        IsPaid = true;
        IsPartiallyPaid = false;
    }

    public void RecordPartialPayment(Money amount)
    {
        PaidAmount = PaidAmount.Add(amount);
        RemainingAmount = TotalAmount.Subtract(PaidAmount);
        IsPartiallyPaid = true;

        if (RemainingAmount.Amount <= 0)
        {
            IsPaid = true;
            IsPartiallyPaid = false;
        }
    }

    public void SetLateInterest(Money amount) => LateInterest = amount;
    public void SetPaymentId(int paymentId) => PaymentId = paymentId;
    public void SetBankTransactionId(int transactionId) => BankTransactionId = transactionId;
    public void SetNotes(string? notes) => Notes = notes;
}

#region Enums

/// <summary>
/// Taksit planı türü / Installment plan type
/// </summary>
public enum InstallmentPlanType
{
    /// <summary>Satış Taksiti / Sales Installment</summary>
    Sales = 1,

    /// <summary>Alış Taksiti / Purchase Installment</summary>
    Purchase = 2,

    /// <summary>Kredi Kartı Taksiti / Credit Card Installment</summary>
    CreditCard = 3,

    /// <summary>Senetli Satış / Sales with Promissory Notes</summary>
    PromissoryNoteSales = 4,

    /// <summary>Çekli Satış / Sales with Checks</summary>
    CheckSales = 5,

    /// <summary>Diğer / Other</summary>
    Other = 99
}

/// <summary>
/// Taksit planı yönü / Installment plan direction
/// </summary>
public enum InstallmentPlanDirection
{
    /// <summary>Alacak (Müşteriden alınacak) / Receivable (From customer)</summary>
    Receivable = 1,

    /// <summary>Borç (Tedarikçiye ödenecek) / Payable (To supplier)</summary>
    Payable = 2
}

/// <summary>
/// Taksit sıklığı / Installment frequency
/// </summary>
public enum InstallmentFrequency
{
    /// <summary>Haftalık / Weekly</summary>
    Weekly = 1,

    /// <summary>İki Haftalık / Bi-Weekly</summary>
    BiWeekly = 2,

    /// <summary>Aylık / Monthly</summary>
    Monthly = 3,

    /// <summary>İki Aylık / Bi-Monthly</summary>
    BiMonthly = 4,

    /// <summary>Üç Aylık / Quarterly</summary>
    Quarterly = 5,

    /// <summary>Altı Aylık / Semi-Annually</summary>
    SemiAnnually = 6,

    /// <summary>Yıllık / Annually</summary>
    Annually = 7
}

/// <summary>
/// Taksit faiz türü / Installment interest type
/// </summary>
public enum InstallmentInterestType
{
    /// <summary>Faizsiz / No Interest</summary>
    NoInterest = 0,

    /// <summary>Basit Faiz / Simple Interest</summary>
    SimpleInterest = 1,

    /// <summary>Bileşik Faiz / Compound Interest</summary>
    CompoundInterest = 2,

    /// <summary>Komisyon Bazlı / Commission Based</summary>
    CommissionBased = 3,

    /// <summary>Vade Farkı / Maturity Difference</summary>
    MaturityDifference = 4
}

/// <summary>
/// Taksit planı durumu / Installment plan status
/// </summary>
public enum InstallmentPlanStatus
{
    /// <summary>Taslak / Draft</summary>
    Draft = 0,

    /// <summary>Aktif / Active</summary>
    Active = 1,

    /// <summary>Kapalı / Closed</summary>
    Closed = 2,

    /// <summary>Gecikmiş / Overdue</summary>
    Overdue = 3,

    /// <summary>İptal Edildi / Cancelled</summary>
    Cancelled = 4,

    /// <summary>Yeniden Yapılandırıldı / Restructured</summary>
    Restructured = 5
}

#endregion
