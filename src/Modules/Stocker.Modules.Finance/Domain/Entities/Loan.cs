using Stocker.SharedKernel.Common;
using Stocker.Domain.Common.ValueObjects;

namespace Stocker.Modules.Finance.Domain.Entities;

/// <summary>
/// Kredi/Finansman entity'si - Banka kredileri, leasing, factoring vb. finansman işlemleri
/// Loan/Financing entity - Bank loans, leasing, factoring and other financing operations
/// </summary>
public class Loan : BaseEntity
{
    /// <summary>
    /// Kredi numarası / Loan number
    /// </summary>
    public string LoanNumber { get; private set; } = string.Empty;

    /// <summary>
    /// Harici referans (banka kredi numarası) / External reference (bank loan number)
    /// </summary>
    public string? ExternalReference { get; private set; }

    /// <summary>
    /// Kredi türü / Loan type
    /// </summary>
    public LoanType LoanType { get; private set; }

    /// <summary>
    /// Kredi alt türü / Loan subtype
    /// </summary>
    public LoanSubType SubType { get; private set; }

    /// <summary>
    /// Kredi veren kurum ID (banka/finans kurumu) / Lender institution ID
    /// </summary>
    public int? LenderId { get; private set; }

    /// <summary>
    /// Kredi veren kurum adı / Lender institution name
    /// </summary>
    public string LenderName { get; private set; } = string.Empty;

    /// <summary>
    /// İlişkili banka hesabı ID / Related bank account ID
    /// </summary>
    public int? BankAccountId { get; private set; }

    /// <summary>
    /// Kredi tutarı (anapara) / Loan amount (principal)
    /// </summary>
    public Money PrincipalAmount { get; private set; } = null!;

    /// <summary>
    /// Kalan anapara / Remaining principal
    /// </summary>
    public Money RemainingPrincipal { get; private set; } = null!;

    /// <summary>
    /// Toplam faiz tutarı / Total interest amount
    /// </summary>
    public Money TotalInterest { get; private set; } = null!;

    /// <summary>
    /// Ödenen faiz / Paid interest
    /// </summary>
    public Money PaidInterest { get; private set; } = null!;

    /// <summary>
    /// BSMV tutarı (Banka ve Sigorta Muameleleri Vergisi) / BSMV amount
    /// </summary>
    public Money BsmvAmount { get; private set; } = null!;

    /// <summary>
    /// KKDF tutarı (Kaynak Kullanımı Destekleme Fonu) / KKDF amount
    /// </summary>
    public Money KkdfAmount { get; private set; } = null!;

    /// <summary>
    /// Dosya masrafı / File/processing fee
    /// </summary>
    public Money ProcessingFee { get; private set; } = null!;

    /// <summary>
    /// Diğer masraflar / Other fees
    /// </summary>
    public Money OtherFees { get; private set; } = null!;

    /// <summary>
    /// Yıllık faiz oranı (%) / Annual interest rate (%)
    /// </summary>
    public decimal AnnualInterestRate { get; private set; }

    /// <summary>
    /// Faiz türü / Interest type
    /// </summary>
    public InterestType InterestType { get; private set; }

    /// <summary>
    /// Referans faiz oranı (değişken faizli krediler için) / Reference rate for variable loans
    /// </summary>
    public ReferenceRateType? ReferenceRateType { get; private set; }

    /// <summary>
    /// Spread (değişken faizli krediler için) / Spread for variable loans
    /// </summary>
    public decimal? Spread { get; private set; }

    /// <summary>
    /// Başlangıç tarihi / Start date
    /// </summary>
    public DateTime StartDate { get; private set; }

    /// <summary>
    /// Bitiş tarihi / End date
    /// </summary>
    public DateTime EndDate { get; private set; }

    /// <summary>
    /// İlk ödeme tarihi / First payment date
    /// </summary>
    public DateTime FirstPaymentDate { get; private set; }

    /// <summary>
    /// Vade (ay) / Term (months)
    /// </summary>
    public int TermMonths { get; private set; }

    /// <summary>
    /// Ödeme sıklığı / Payment frequency
    /// </summary>
    public PaymentFrequency PaymentFrequency { get; private set; }

    /// <summary>
    /// Taksit sayısı / Number of installments
    /// </summary>
    public int TotalInstallments { get; private set; }

    /// <summary>
    /// Ödenen taksit sayısı / Number of paid installments
    /// </summary>
    public int PaidInstallments { get; private set; }

    /// <summary>
    /// Geri ödeme yöntemi / Repayment method
    /// </summary>
    public RepaymentMethod RepaymentMethod { get; private set; }

    /// <summary>
    /// Teminat türü / Collateral type
    /// </summary>
    public CollateralType? CollateralType { get; private set; }

    /// <summary>
    /// Teminat açıklaması / Collateral description
    /// </summary>
    public string? CollateralDescription { get; private set; }

    /// <summary>
    /// Teminat değeri / Collateral value
    /// </summary>
    public Money? CollateralValue { get; private set; }

    /// <summary>
    /// Kefil bilgisi / Guarantor information
    /// </summary>
    public string? GuarantorInfo { get; private set; }

    /// <summary>
    /// Amaç / Purpose
    /// </summary>
    public string? Purpose { get; private set; }

    /// <summary>
    /// Kredi durumu / Loan status
    /// </summary>
    public LoanStatus Status { get; private set; }

    /// <summary>
    /// Erken ödeme yapılabilir mi? / Can be prepaid?
    /// </summary>
    public bool AllowsPrepayment { get; private set; }

    /// <summary>
    /// Erken ödeme cezası oranı (%) / Prepayment penalty rate (%)
    /// </summary>
    public decimal? PrepaymentPenaltyRate { get; private set; }

    /// <summary>
    /// Ödemesiz dönem (ay) / Grace period (months)
    /// </summary>
    public int? GracePeriodMonths { get; private set; }

    /// <summary>
    /// Muhasebe hesabı (kredi borcu) / Accounting account (loan payable)
    /// </summary>
    public int? LoanPayableAccountId { get; private set; }

    /// <summary>
    /// Faiz gideri hesabı / Interest expense account
    /// </summary>
    public int? InterestExpenseAccountId { get; private set; }

    /// <summary>
    /// Notlar / Notes
    /// </summary>
    public string? Notes { get; private set; }

    /// <summary>
    /// Onay tarihi / Approval date
    /// </summary>
    public DateTime? ApprovalDate { get; private set; }

    /// <summary>
    /// Kullandırım tarihi / Disbursement date
    /// </summary>
    public DateTime? DisbursementDate { get; private set; }

    /// <summary>
    /// Kapanış tarihi / Closure date
    /// </summary>
    public DateTime? ClosureDate { get; private set; }

    // Navigation properties
    public virtual ICollection<LoanPayment> Payments { get; private set; } = new List<LoanPayment>();
    public virtual ICollection<LoanSchedule> Schedule { get; private set; } = new List<LoanSchedule>();

    private Loan() { }

    /// <summary>
    /// Yeni kredi oluşturur / Creates a new loan
    /// </summary>
    public static Loan Create(
        string loanNumber,
        LoanType loanType,
        LoanSubType subType,
        string lenderName,
        Money principalAmount,
        decimal annualInterestRate,
        InterestType interestType,
        DateTime startDate,
        int termMonths,
        PaymentFrequency paymentFrequency,
        RepaymentMethod repaymentMethod)
    {
        if (string.IsNullOrWhiteSpace(loanNumber))
            throw new ArgumentException("Kredi numarası gereklidir", nameof(loanNumber));

        if (principalAmount.Amount <= 0)
            throw new ArgumentException("Kredi tutarı pozitif olmalıdır", nameof(principalAmount));

        if (termMonths <= 0)
            throw new ArgumentException("Vade pozitif olmalıdır", nameof(termMonths));

        var loan = new Loan
        {
            LoanNumber = loanNumber,
            LoanType = loanType,
            SubType = subType,
            LenderName = lenderName,
            PrincipalAmount = principalAmount,
            RemainingPrincipal = principalAmount,
            TotalInterest = Money.Zero(principalAmount.Currency),
            PaidInterest = Money.Zero(principalAmount.Currency),
            BsmvAmount = Money.Zero(principalAmount.Currency),
            KkdfAmount = Money.Zero(principalAmount.Currency),
            ProcessingFee = Money.Zero(principalAmount.Currency),
            OtherFees = Money.Zero(principalAmount.Currency),
            AnnualInterestRate = annualInterestRate,
            InterestType = interestType,
            StartDate = startDate,
            EndDate = startDate.AddMonths(termMonths),
            FirstPaymentDate = startDate.AddMonths(1),
            TermMonths = termMonths,
            PaymentFrequency = paymentFrequency,
            RepaymentMethod = repaymentMethod,
            Status = LoanStatus.Draft,
            AllowsPrepayment = true
        };

        loan.CalculateInstallmentCount();

        return loan;
    }

    /// <summary>
    /// Krediyi onaylar / Approves the loan
    /// </summary>
    public void Approve(DateTime approvalDate)
    {
        if (Status != LoanStatus.Draft && Status != LoanStatus.PendingApproval)
            throw new InvalidOperationException("Sadece taslak veya onay bekleyen krediler onaylanabilir");

        ApprovalDate = approvalDate;
        Status = LoanStatus.Approved;
    }

    /// <summary>
    /// Krediyi kullandırır / Disburses the loan
    /// </summary>
    public void Disburse(DateTime disbursementDate)
    {
        if (Status != LoanStatus.Approved)
            throw new InvalidOperationException("Sadece onaylı krediler kullandırılabilir");

        DisbursementDate = disbursementDate;
        Status = LoanStatus.Active;
    }

    /// <summary>
    /// Ödeme planı oluşturur / Generates payment schedule
    /// </summary>
    public void GenerateSchedule()
    {
        Schedule.Clear();

        var scheduleDate = FirstPaymentDate;
        var remainingPrincipal = PrincipalAmount.Amount;
        var monthlyRate = AnnualInterestRate / 100 / 12;

        for (int i = 1; i <= TotalInstallments; i++)
        {
            decimal principalPayment;
            decimal interestPayment;
            decimal installmentAmount;

            switch (RepaymentMethod)
            {
                case RepaymentMethod.EqualInstallments: // Eşit Taksit (Anuity)
                    installmentAmount = CalculateAnnuityPayment(PrincipalAmount.Amount, monthlyRate, TotalInstallments);
                    interestPayment = remainingPrincipal * monthlyRate;
                    principalPayment = installmentAmount - interestPayment;
                    break;

                case RepaymentMethod.EqualPrincipal: // Eşit Anapara
                    principalPayment = PrincipalAmount.Amount / TotalInstallments;
                    interestPayment = remainingPrincipal * monthlyRate;
                    installmentAmount = principalPayment + interestPayment;
                    break;

                case RepaymentMethod.BulletPayment: // Vade Sonunda Tek Ödeme
                    if (i < TotalInstallments)
                    {
                        principalPayment = 0;
                        interestPayment = remainingPrincipal * monthlyRate;
                        installmentAmount = interestPayment;
                    }
                    else
                    {
                        principalPayment = remainingPrincipal;
                        interestPayment = remainingPrincipal * monthlyRate;
                        installmentAmount = principalPayment + interestPayment;
                    }
                    break;

                case RepaymentMethod.InterestOnly: // Sadece Faiz
                    principalPayment = i == TotalInstallments ? remainingPrincipal : 0;
                    interestPayment = remainingPrincipal * monthlyRate;
                    installmentAmount = principalPayment + interestPayment;
                    break;

                default:
                    throw new InvalidOperationException("Geçersiz geri ödeme yöntemi");
            }

            var scheduleItem = LoanSchedule.Create(
                this,
                i,
                scheduleDate,
                Money.Create(principalPayment, PrincipalAmount.Currency),
                Money.Create(interestPayment, PrincipalAmount.Currency),
                Money.Create(installmentAmount, PrincipalAmount.Currency),
                Money.Create(remainingPrincipal - principalPayment, PrincipalAmount.Currency));

            Schedule.Add(scheduleItem);

            remainingPrincipal -= principalPayment;
            scheduleDate = GetNextPaymentDate(scheduleDate);
        }

        TotalInterest = Money.Create(Schedule.Sum(s => s.InterestAmount.Amount), PrincipalAmount.Currency);
    }

    /// <summary>
    /// Ödeme kaydeder / Records a payment
    /// </summary>
    public LoanPayment RecordPayment(
        DateTime paymentDate,
        Money principalPaid,
        Money interestPaid,
        string? reference = null)
    {
        if (Status != LoanStatus.Active)
            throw new InvalidOperationException("Sadece aktif kredilere ödeme yapılabilir");

        var totalPaid = principalPaid.Add(interestPaid);

        var payment = LoanPayment.Create(this, paymentDate, principalPaid, interestPaid, totalPaid, reference);
        Payments.Add(payment);

        RemainingPrincipal = RemainingPrincipal.Subtract(principalPaid);
        PaidInterest = PaidInterest.Add(interestPaid);
        PaidInstallments++;

        // İlgili taksiti ödenmiş olarak işaretle
        var scheduleItem = Schedule
            .Where(s => !s.IsPaid)
            .OrderBy(s => s.InstallmentNumber)
            .FirstOrDefault();

        scheduleItem?.MarkAsPaid(paymentDate, payment.Id);

        // Kredi tamamen ödendiyse kapat
        if (RemainingPrincipal.Amount <= 0)
        {
            Close(paymentDate);
        }

        return payment;
    }

    /// <summary>
    /// Erken ödeme yapar / Makes a prepayment
    /// </summary>
    public LoanPayment MakePrepayment(DateTime paymentDate, Money amount, bool closeIfPaidOff = true)
    {
        if (!AllowsPrepayment)
            throw new InvalidOperationException("Bu kredi erken ödemeye izin vermiyor");

        if (Status != LoanStatus.Active)
            throw new InvalidOperationException("Sadece aktif kredilere erken ödeme yapılabilir");

        var penaltyAmount = PrepaymentPenaltyRate.HasValue
            ? Money.Create(amount.Amount * PrepaymentPenaltyRate.Value / 100, amount.Currency)
            : Money.Zero(amount.Currency);

        var principalPaid = amount.Subtract(penaltyAmount);

        var payment = LoanPayment.CreatePrepayment(this, paymentDate, principalPaid, penaltyAmount, amount);
        Payments.Add(payment);

        RemainingPrincipal = RemainingPrincipal.Subtract(principalPaid);

        if (closeIfPaidOff && RemainingPrincipal.Amount <= 0)
        {
            Close(paymentDate);
        }

        return payment;
    }

    /// <summary>
    /// Krediyi kapatır / Closes the loan
    /// </summary>
    public void Close(DateTime closureDate)
    {
        if (Status != LoanStatus.Active)
            throw new InvalidOperationException("Sadece aktif krediler kapatılabilir");

        ClosureDate = closureDate;
        Status = LoanStatus.Closed;
    }

    /// <summary>
    /// Krediyi temerrüde düşürür / Marks the loan as defaulted
    /// </summary>
    public void MarkAsDefaulted()
    {
        if (Status != LoanStatus.Active)
            throw new InvalidOperationException("Sadece aktif krediler temerrüde düşürülebilir");

        Status = LoanStatus.Defaulted;
    }

    /// <summary>
    /// Yeniden yapılandırır / Restructures the loan
    /// </summary>
    public void Restructure(decimal newInterestRate, int newTermMonths, DateTime newStartDate)
    {
        AnnualInterestRate = newInterestRate;
        TermMonths = newTermMonths;
        StartDate = newStartDate;
        EndDate = newStartDate.AddMonths(newTermMonths);
        FirstPaymentDate = newStartDate.AddMonths(1);
        Status = LoanStatus.Restructured;

        CalculateInstallmentCount();
        GenerateSchedule();
    }

    private void CalculateInstallmentCount()
    {
        TotalInstallments = PaymentFrequency switch
        {
            PaymentFrequency.Monthly => TermMonths,
            PaymentFrequency.Quarterly => TermMonths / 3,
            PaymentFrequency.SemiAnnually => TermMonths / 6,
            PaymentFrequency.Annually => TermMonths / 12,
            PaymentFrequency.Weekly => TermMonths * 4,
            PaymentFrequency.BiWeekly => TermMonths * 2,
            _ => TermMonths
        };
    }

    private DateTime GetNextPaymentDate(DateTime currentDate)
    {
        return PaymentFrequency switch
        {
            PaymentFrequency.Monthly => currentDate.AddMonths(1),
            PaymentFrequency.Quarterly => currentDate.AddMonths(3),
            PaymentFrequency.SemiAnnually => currentDate.AddMonths(6),
            PaymentFrequency.Annually => currentDate.AddYears(1),
            PaymentFrequency.Weekly => currentDate.AddDays(7),
            PaymentFrequency.BiWeekly => currentDate.AddDays(14),
            _ => currentDate.AddMonths(1)
        };
    }

    private static decimal CalculateAnnuityPayment(decimal principal, decimal monthlyRate, int totalPayments)
    {
        if (monthlyRate == 0)
            return principal / totalPayments;

        var factor = (decimal)Math.Pow((double)(1 + monthlyRate), totalPayments);
        return principal * monthlyRate * factor / (factor - 1);
    }

    // Setter methods
    public void SetExternalReference(string? reference) => ExternalReference = reference;
    public void SetLender(int? lenderId, string lenderName)
    {
        LenderId = lenderId;
        LenderName = lenderName;
    }
    public void SetBankAccount(int? bankAccountId) => BankAccountId = bankAccountId;
    public void SetBsmvAmount(Money amount) => BsmvAmount = amount;
    public void SetKkdfAmount(Money amount) => KkdfAmount = amount;
    public void SetProcessingFee(Money fee) => ProcessingFee = fee;
    public void SetOtherFees(Money fees) => OtherFees = fees;
    public void SetVariableRateDetails(ReferenceRateType referenceRate, decimal spread)
    {
        if (InterestType != InterestType.Variable)
            throw new InvalidOperationException("Değişken faiz detayları sadece değişken faizli kredilerde ayarlanabilir");

        ReferenceRateType = referenceRate;
        Spread = spread;
    }
    public void SetCollateral(CollateralType type, string? description, Money? value)
    {
        CollateralType = type;
        CollateralDescription = description;
        CollateralValue = value;
    }
    public void SetGuarantorInfo(string? info) => GuarantorInfo = info;
    public void SetPurpose(string? purpose) => Purpose = purpose;
    public void SetPrepaymentTerms(bool allowed, decimal? penaltyRate = null)
    {
        AllowsPrepayment = allowed;
        PrepaymentPenaltyRate = penaltyRate;
    }
    public void SetGracePeriod(int? months) => GracePeriodMonths = months;
    public void SetAccountingAccounts(int? loanPayableAccountId, int? interestExpenseAccountId)
    {
        LoanPayableAccountId = loanPayableAccountId;
        InterestExpenseAccountId = interestExpenseAccountId;
    }
    public void SetNotes(string? notes) => Notes = notes;
    public void SetFirstPaymentDate(DateTime date) => FirstPaymentDate = date;
}

/// <summary>
/// Kredi ödeme planı kalemi / Loan payment schedule item
/// </summary>
public class LoanSchedule : BaseEntity
{
    /// <summary>
    /// Kredi ID / Loan ID
    /// </summary>
    public int LoanId { get; private set; }

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
    /// Kalan bakiye / Remaining balance
    /// </summary>
    public Money RemainingBalance { get; private set; } = null!;

    /// <summary>
    /// Ödendi mi? / Is paid?
    /// </summary>
    public bool IsPaid { get; private set; }

    /// <summary>
    /// Ödeme tarihi / Payment date
    /// </summary>
    public DateTime? PaymentDate { get; private set; }

    /// <summary>
    /// Ödeme ID / Payment ID
    /// </summary>
    public int? PaymentId { get; private set; }

    // Navigation
    public virtual Loan Loan { get; private set; } = null!;

    private LoanSchedule() { }

    public static LoanSchedule Create(
        Loan loan,
        int installmentNumber,
        DateTime dueDate,
        Money principalAmount,
        Money interestAmount,
        Money totalAmount,
        Money remainingBalance)
    {
        return new LoanSchedule
        {
            LoanId = loan.Id,
            Loan = loan,
            InstallmentNumber = installmentNumber,
            DueDate = dueDate,
            PrincipalAmount = principalAmount,
            InterestAmount = interestAmount,
            TotalAmount = totalAmount,
            RemainingBalance = remainingBalance,
            IsPaid = false
        };
    }

    public void MarkAsPaid(DateTime paymentDate, int paymentId)
    {
        IsPaid = true;
        PaymentDate = paymentDate;
        PaymentId = paymentId;
    }
}

/// <summary>
/// Kredi ödemesi / Loan payment
/// </summary>
public class LoanPayment : BaseEntity
{
    /// <summary>
    /// Kredi ID / Loan ID
    /// </summary>
    public int LoanId { get; private set; }

    /// <summary>
    /// Ödeme tarihi / Payment date
    /// </summary>
    public DateTime PaymentDate { get; private set; }

    /// <summary>
    /// Ödeme türü / Payment type
    /// </summary>
    public LoanPaymentType PaymentType { get; private set; }

    /// <summary>
    /// Anapara ödemesi / Principal payment
    /// </summary>
    public Money PrincipalPaid { get; private set; } = null!;

    /// <summary>
    /// Faiz ödemesi / Interest payment
    /// </summary>
    public Money InterestPaid { get; private set; } = null!;

    /// <summary>
    /// Ceza/masraf ödemesi / Penalty/fee payment
    /// </summary>
    public Money PenaltyPaid { get; private set; } = null!;

    /// <summary>
    /// Toplam ödeme / Total payment
    /// </summary>
    public Money TotalPaid { get; private set; } = null!;

    /// <summary>
    /// Referans (dekont no vb.) / Reference (receipt no etc.)
    /// </summary>
    public string? Reference { get; private set; }

    /// <summary>
    /// İlişkili banka işlemi ID / Related bank transaction ID
    /// </summary>
    public int? BankTransactionId { get; private set; }

    /// <summary>
    /// Notlar / Notes
    /// </summary>
    public string? Notes { get; private set; }

    // Navigation
    public virtual Loan Loan { get; private set; } = null!;

    private LoanPayment() { }

    public static LoanPayment Create(
        Loan loan,
        DateTime paymentDate,
        Money principalPaid,
        Money interestPaid,
        Money totalPaid,
        string? reference = null)
    {
        return new LoanPayment
        {
            LoanId = loan.Id,
            Loan = loan,
            PaymentDate = paymentDate,
            PaymentType = LoanPaymentType.Regular,
            PrincipalPaid = principalPaid,
            InterestPaid = interestPaid,
            PenaltyPaid = Money.Zero(principalPaid.Currency),
            TotalPaid = totalPaid,
            Reference = reference
        };
    }

    public static LoanPayment CreatePrepayment(
        Loan loan,
        DateTime paymentDate,
        Money principalPaid,
        Money penaltyPaid,
        Money totalPaid)
    {
        return new LoanPayment
        {
            LoanId = loan.Id,
            Loan = loan,
            PaymentDate = paymentDate,
            PaymentType = LoanPaymentType.Prepayment,
            PrincipalPaid = principalPaid,
            InterestPaid = Money.Zero(principalPaid.Currency),
            PenaltyPaid = penaltyPaid,
            TotalPaid = totalPaid
        };
    }

    public void SetBankTransaction(int transactionId) => BankTransactionId = transactionId;
    public void SetNotes(string? notes) => Notes = notes;
}

#region Enums

/// <summary>
/// Kredi türü / Loan type
/// </summary>
public enum LoanType
{
    /// <summary>İşletme Kredisi / Business Loan</summary>
    BusinessLoan = 1,

    /// <summary>Yatırım Kredisi / Investment Loan</summary>
    InvestmentLoan = 2,

    /// <summary>Spot Kredi / Spot Credit</summary>
    SpotCredit = 3,

    /// <summary>Rotatif Kredi / Revolving Credit</summary>
    RevolvingCredit = 4,

    /// <summary>Leasing / Financial Leasing</summary>
    Leasing = 5,

    /// <summary>Factoring</summary>
    Factoring = 6,

    /// <summary>Forfaiting</summary>
    Forfaiting = 7,

    /// <summary>Akreditif / Letter of Credit</summary>
    LetterOfCredit = 8,

    /// <summary>Teminat Mektubu / Letter of Guarantee</summary>
    LetterOfGuarantee = 9,

    /// <summary>Eximbank Kredisi / Eximbank Credit</summary>
    EximbankCredit = 10,

    /// <summary>KOSGEB Kredisi / KOSGEB Credit</summary>
    KosgebCredit = 11,

    /// <summary>Taşıt Kredisi / Vehicle Loan</summary>
    VehicleLoan = 12,

    /// <summary>Gayrimenkul Kredisi / Real Estate Loan</summary>
    RealEstateLoan = 13,

    /// <summary>Diğer / Other</summary>
    Other = 99
}

/// <summary>
/// Kredi alt türü / Loan subtype
/// </summary>
public enum LoanSubType
{
    /// <summary>TL Kredi / TRY Loan</summary>
    TryLoan = 1,

    /// <summary>Döviz Kredisi / Foreign Currency Loan</summary>
    ForeignCurrencyLoan = 2,

    /// <summary>Dövize Endeksli / FX Indexed</summary>
    FxIndexed = 3,

    /// <summary>Taksitli / Installment</summary>
    Installment = 4,

    /// <summary>Taksitsiz / Non-Installment</summary>
    NonInstallment = 5,

    /// <summary>Kısa Vadeli / Short Term</summary>
    ShortTerm = 6,

    /// <summary>Uzun Vadeli / Long Term</summary>
    LongTerm = 7
}

/// <summary>
/// Faiz türü / Interest type
/// </summary>
public enum InterestType
{
    /// <summary>Sabit / Fixed</summary>
    Fixed = 1,

    /// <summary>Değişken / Variable</summary>
    Variable = 2,

    /// <summary>Karma / Mixed</summary>
    Mixed = 3
}

/// <summary>
/// Referans faiz oranı türü / Reference rate type
/// </summary>
public enum ReferenceRateType
{
    /// <summary>TCMB Politika Faizi / CBRT Policy Rate</summary>
    CbrtPolicyRate = 1,

    /// <summary>TRLibor</summary>
    TrLibor = 2,

    /// <summary>TLREF</summary>
    TlRef = 3,

    /// <summary>Euribor</summary>
    Euribor = 4,

    /// <summary>Libor</summary>
    Libor = 5,

    /// <summary>SOFR</summary>
    Sofr = 6,

    /// <summary>Diğer / Other</summary>
    Other = 99
}

/// <summary>
/// Ödeme sıklığı / Payment frequency
/// </summary>
public enum PaymentFrequency
{
    /// <summary>Haftalık / Weekly</summary>
    Weekly = 1,

    /// <summary>İki Haftalık / Bi-Weekly</summary>
    BiWeekly = 2,

    /// <summary>Aylık / Monthly</summary>
    Monthly = 3,

    /// <summary>Üç Aylık / Quarterly</summary>
    Quarterly = 4,

    /// <summary>Altı Aylık / Semi-Annually</summary>
    SemiAnnually = 5,

    /// <summary>Yıllık / Annually</summary>
    Annually = 6,

    /// <summary>Vade Sonunda / At Maturity</summary>
    AtMaturity = 7
}

/// <summary>
/// Geri ödeme yöntemi / Repayment method
/// </summary>
public enum RepaymentMethod
{
    /// <summary>Eşit Taksit (Anuity) / Equal Installments (Annuity)</summary>
    EqualInstallments = 1,

    /// <summary>Eşit Anapara / Equal Principal</summary>
    EqualPrincipal = 2,

    /// <summary>Vade Sonunda Tek Ödeme / Bullet Payment</summary>
    BulletPayment = 3,

    /// <summary>Sadece Faiz / Interest Only</summary>
    InterestOnly = 4,

    /// <summary>Balon Ödeme / Balloon Payment</summary>
    BalloonPayment = 5,

    /// <summary>Özel Plan / Custom Schedule</summary>
    Custom = 6
}

/// <summary>
/// Teminat türü / Collateral type
/// </summary>
public enum CollateralType
{
    /// <summary>Teminatsız / Unsecured</summary>
    Unsecured = 0,

    /// <summary>Gayrimenkul İpoteği / Real Estate Mortgage</summary>
    RealEstateMortgage = 1,

    /// <summary>Taşıt Rehni / Vehicle Pledge</summary>
    VehiclePledge = 2,

    /// <summary>Makine-Teçhizat Rehni / Equipment Pledge</summary>
    EquipmentPledge = 3,

    /// <summary>Menkul Kıymet Rehni / Securities Pledge</summary>
    SecuritiesPledge = 4,

    /// <summary>Emtia Rehni / Commodity Pledge</summary>
    CommodityPledge = 5,

    /// <summary>Alacak Temliki / Assignment of Receivables</summary>
    AssignmentOfReceivables = 6,

    /// <summary>Kefalet / Personal Guarantee</summary>
    PersonalGuarantee = 7,

    /// <summary>Banka Teminat Mektubu / Bank Guarantee</summary>
    BankGuarantee = 8,

    /// <summary>Çek/Senet / Check/Promissory Note</summary>
    CheckPromissoryNote = 9,

    /// <summary>Diğer / Other</summary>
    Other = 99
}

/// <summary>
/// Kredi durumu / Loan status
/// </summary>
public enum LoanStatus
{
    /// <summary>Taslak / Draft</summary>
    Draft = 0,

    /// <summary>Onay Bekliyor / Pending Approval</summary>
    PendingApproval = 1,

    /// <summary>Onaylandı / Approved</summary>
    Approved = 2,

    /// <summary>Aktif / Active</summary>
    Active = 3,

    /// <summary>Kapalı / Closed</summary>
    Closed = 4,

    /// <summary>Temerrüt / Defaulted</summary>
    Defaulted = 5,

    /// <summary>Yeniden Yapılandırıldı / Restructured</summary>
    Restructured = 6,

    /// <summary>İptal Edildi / Cancelled</summary>
    Cancelled = 7
}

/// <summary>
/// Kredi ödeme türü / Loan payment type
/// </summary>
public enum LoanPaymentType
{
    /// <summary>Normal Ödeme / Regular Payment</summary>
    Regular = 1,

    /// <summary>Erken Ödeme / Prepayment</summary>
    Prepayment = 2,

    /// <summary>Gecikmiş Ödeme / Late Payment</summary>
    LatePayment = 3,

    /// <summary>Kısmi Ödeme / Partial Payment</summary>
    PartialPayment = 4,

    /// <summary>Kapanış Ödemesi / Payoff Payment</summary>
    Payoff = 5
}

#endregion
