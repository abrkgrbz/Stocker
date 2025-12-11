namespace Stocker.Modules.Finance.Domain.Enums;

/// <summary>
/// Ödeme/Tahsilat Türleri (Payment/Collection Types)
/// </summary>
public enum PaymentType
{
    /// <summary>
    /// Nakit (Cash)
    /// </summary>
    Cash = 1,

    /// <summary>
    /// Banka Havalesi (Bank Transfer)
    /// </summary>
    BankTransfer = 2,

    /// <summary>
    /// Çek (Check)
    /// </summary>
    Check = 3,

    /// <summary>
    /// Senet (Promissory Note)
    /// </summary>
    PromissoryNote = 4,

    /// <summary>
    /// Kredi Kartı (Credit Card)
    /// </summary>
    CreditCard = 5,

    /// <summary>
    /// Banka Kartı (Debit Card)
    /// </summary>
    DebitCard = 6,

    /// <summary>
    /// POS (Point of Sale)
    /// </summary>
    POS = 7,

    /// <summary>
    /// Mahsuplaşma (Offsetting)
    /// </summary>
    Offsetting = 8,

    /// <summary>
    /// Virman (Internal Transfer)
    /// </summary>
    InternalTransfer = 9,

    /// <summary>
    /// EFT (Electronic Funds Transfer)
    /// </summary>
    EFT = 10,

    /// <summary>
    /// Havale (Remittance)
    /// </summary>
    Remittance = 11,

    /// <summary>
    /// Açık Hesap (Open Account)
    /// </summary>
    OpenAccount = 12
}

/// <summary>
/// Ödeme Durumları (Payment Statuses)
/// </summary>
public enum PaymentStatus
{
    /// <summary>
    /// Beklemede (Pending)
    /// </summary>
    Pending = 1,

    /// <summary>
    /// Onaylandı (Approved)
    /// </summary>
    Approved = 2,

    /// <summary>
    /// İşleme Alındı (Processing)
    /// </summary>
    Processing = 3,

    /// <summary>
    /// Tamamlandı (Completed)
    /// </summary>
    Completed = 4,

    /// <summary>
    /// Başarısız (Failed)
    /// </summary>
    Failed = 5,

    /// <summary>
    /// İptal Edildi (Cancelled)
    /// </summary>
    Cancelled = 6,

    /// <summary>
    /// İade Edildi (Refunded)
    /// </summary>
    Refunded = 7,

    /// <summary>
    /// Karşılıksız (Bounced - for checks)
    /// </summary>
    Bounced = 8
}

/// <summary>
/// Çek/Senet Durumları (Check/Note Statuses)
/// </summary>
public enum NegotiableInstrumentStatus
{
    /// <summary>
    /// Portföyde (In Portfolio)
    /// </summary>
    InPortfolio = 1,

    /// <summary>
    /// Bankaya Tahsile Verilen (Given to Bank for Collection)
    /// </summary>
    GivenToBank = 2,

    /// <summary>
    /// Ciro Edilen (Endorsed)
    /// </summary>
    Endorsed = 3,

    /// <summary>
    /// Teminata Verilen (Given as Collateral)
    /// </summary>
    GivenAsCollateral = 4,

    /// <summary>
    /// Protestolu (Protested)
    /// </summary>
    Protested = 5,

    /// <summary>
    /// Tahsil Edilen (Collected)
    /// </summary>
    Collected = 6,

    /// <summary>
    /// Karşılıksız (Bounced)
    /// </summary>
    Bounced = 7,

    /// <summary>
    /// İade Edilen (Returned)
    /// </summary>
    Returned = 8
}

/// <summary>
/// Hareket Yönü (Movement Direction)
/// </summary>
public enum MovementDirection
{
    /// <summary>
    /// Giriş (Inbound)
    /// </summary>
    Inbound = 1,

    /// <summary>
    /// Çıkış (Outbound)
    /// </summary>
    Outbound = 2
}

/// <summary>
/// Banka İşlem Türleri (Bank Transaction Types)
/// </summary>
public enum BankTransactionType
{
    /// <summary>
    /// Yatırma (Deposit)
    /// </summary>
    Deposit = 1,

    /// <summary>
    /// Çekme (Withdrawal)
    /// </summary>
    Withdrawal = 2,

    /// <summary>
    /// Havale Gönderme (Outgoing Transfer)
    /// </summary>
    OutgoingTransfer = 3,

    /// <summary>
    /// Havale Alma (Incoming Transfer)
    /// </summary>
    IncomingTransfer = 4,

    /// <summary>
    /// EFT Gönderme (Outgoing EFT)
    /// </summary>
    OutgoingEFT = 5,

    /// <summary>
    /// EFT Alma (Incoming EFT)
    /// </summary>
    IncomingEFT = 6,

    /// <summary>
    /// Çek Tahsilatı (Check Collection)
    /// </summary>
    CheckCollection = 7,

    /// <summary>
    /// Çek Ödemesi (Check Payment)
    /// </summary>
    CheckPayment = 8,

    /// <summary>
    /// Kredi Kullanımı (Loan Drawdown)
    /// </summary>
    LoanDrawdown = 9,

    /// <summary>
    /// Kredi Ödemesi (Loan Payment)
    /// </summary>
    LoanPayment = 10,

    /// <summary>
    /// Faiz Geliri (Interest Income)
    /// </summary>
    InterestIncome = 11,

    /// <summary>
    /// Faiz Gideri (Interest Expense)
    /// </summary>
    InterestExpense = 12,

    /// <summary>
    /// Komisyon/Masraf (Commission/Fee)
    /// </summary>
    CommissionFee = 13,

    /// <summary>
    /// POS Tahsilatı (POS Collection)
    /// </summary>
    POSCollection = 14,

    /// <summary>
    /// Vergi Ödemesi (Tax Payment)
    /// </summary>
    TaxPayment = 15,

    /// <summary>
    /// SGK Ödemesi (Social Security Payment)
    /// </summary>
    SocialSecurityPayment = 16,

    /// <summary>
    /// Maaş Ödemesi (Salary Payment)
    /// </summary>
    SalaryPayment = 17,

    /// <summary>
    /// Diğer (Other)
    /// </summary>
    Other = 99
}

/// <summary>
/// Kasa İşlem Türleri (Cash Transaction Types)
/// </summary>
public enum CashTransactionType
{
    /// <summary>
    /// Tahsilat (Collection)
    /// </summary>
    Collection = 1,

    /// <summary>
    /// Tediye (Payment)
    /// </summary>
    Payment = 2,

    /// <summary>
    /// Bankaya Yatırma (Deposit to Bank)
    /// </summary>
    DepositToBank = 3,

    /// <summary>
    /// Bankadan Çekme (Withdrawal from Bank)
    /// </summary>
    WithdrawalFromBank = 4,

    /// <summary>
    /// Kasalar Arası Transfer (Inter-Cash Transfer)
    /// </summary>
    InterCashTransfer = 5,

    /// <summary>
    /// Gider Ödemesi (Expense Payment)
    /// </summary>
    ExpensePayment = 6,

    /// <summary>
    /// Avans Verme (Advance Payment)
    /// </summary>
    AdvancePayment = 7,

    /// <summary>
    /// Avans İadesi (Advance Return)
    /// </summary>
    AdvanceReturn = 8,

    /// <summary>
    /// Diğer (Other)
    /// </summary>
    Other = 99
}
