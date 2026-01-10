namespace Stocker.Modules.Finance.Domain.Enums;

/// <summary>
/// Cari Hesap Türleri (Current Account Types)
/// </summary>
public enum CurrentAccountType
{
    /// <summary>
    /// Müşteri (Customer)
    /// </summary>
    Customer = 1,

    /// <summary>
    /// Tedarikçi (Supplier)
    /// </summary>
    Supplier = 2,

    /// <summary>
    /// Hem Müşteri Hem Tedarikçi (Both Customer and Supplier)
    /// </summary>
    Both = 3,

    /// <summary>
    /// Personel (Employee)
    /// </summary>
    Employee = 4,

    /// <summary>
    /// Ortaklar (Partners/Shareholders)
    /// </summary>
    Partner = 5,

    /// <summary>
    /// Diğer (Other)
    /// </summary>
    Other = 6
}

/// <summary>
/// Cari Hesap Durumları (Current Account Statuses)
/// </summary>
public enum CurrentAccountStatus
{
    /// <summary>
    /// Aktif (Active)
    /// </summary>
    Active = 1,

    /// <summary>
    /// Pasif (Inactive)
    /// </summary>
    Inactive = 2,

    /// <summary>
    /// Kara Listede (Blacklisted)
    /// </summary>
    Blacklisted = 3,

    /// <summary>
    /// Askıda (Suspended)
    /// </summary>
    Suspended = 4
}

/// <summary>
/// Cari Hesap Hareket Türleri (Current Account Transaction Types)
/// </summary>
public enum CurrentAccountTransactionType
{
    /// <summary>
    /// Satış Faturası (Sales Invoice)
    /// </summary>
    SalesInvoice = 1,

    /// <summary>
    /// Alış Faturası (Purchase Invoice)
    /// </summary>
    PurchaseInvoice = 2,

    /// <summary>
    /// Satış İade Faturası (Sales Return Invoice)
    /// </summary>
    SalesReturnInvoice = 3,

    /// <summary>
    /// Alış İade Faturası (Purchase Return Invoice)
    /// </summary>
    PurchaseReturnInvoice = 4,

    /// <summary>
    /// Tahsilat (Collection)
    /// </summary>
    Collection = 5,

    /// <summary>
    /// Ödeme (Payment)
    /// </summary>
    Payment = 6,

    /// <summary>
    /// Çek Alındı (Check Received)
    /// </summary>
    CheckReceived = 7,

    /// <summary>
    /// Çek Verildi (Check Given)
    /// </summary>
    CheckGiven = 8,

    /// <summary>
    /// Senet Alındı (Note Received)
    /// </summary>
    NoteReceived = 9,

    /// <summary>
    /// Senet Verildi (Note Given)
    /// </summary>
    NoteGiven = 10,

    /// <summary>
    /// Virman (Transfer)
    /// </summary>
    Transfer = 11,

    /// <summary>
    /// Açılış Fişi (Opening Entry)
    /// </summary>
    OpeningEntry = 12,

    /// <summary>
    /// Alacak Dekontu (Credit Memo)
    /// </summary>
    CreditMemo = 13,

    /// <summary>
    /// Borç Dekontu (Debit Memo)
    /// </summary>
    DebitMemo = 14,

    /// <summary>
    /// Masraf Yansıtma (Expense Reflection)
    /// </summary>
    ExpenseReflection = 15,

    /// <summary>
    /// Kur Farkı (Exchange Rate Difference)
    /// </summary>
    ExchangeRateDifference = 16,

    /// <summary>
    /// Vade Farkı (Maturity Difference)
    /// </summary>
    MaturityDifference = 17,

    /// <summary>
    /// Faiz (Interest)
    /// </summary>
    Interest = 18,

    /// <summary>
    /// Fatura İptali (Invoice Cancellation)
    /// </summary>
    InvoiceCancellation = 19,

    /// <summary>
    /// Ödeme İptali (Payment Cancellation)
    /// </summary>
    PaymentCancellation = 20,

    /// <summary>
    /// Diğer (Other)
    /// </summary>
    Other = 99
}

/// <summary>
/// Vergi Mükellefiyet Türü (Tax Liability Type)
/// </summary>
public enum TaxLiabilityType
{
    /// <summary>
    /// Gerçek Kişi (Individual)
    /// </summary>
    Individual = 1,

    /// <summary>
    /// Tüzel Kişi (Legal Entity)
    /// </summary>
    LegalEntity = 2,

    /// <summary>
    /// Yabancı Gerçek Kişi (Foreign Individual)
    /// </summary>
    ForeignIndividual = 3,

    /// <summary>
    /// Yabancı Tüzel Kişi (Foreign Legal Entity)
    /// </summary>
    ForeignLegalEntity = 4
}

/// <summary>
/// Ödeme Vadesi Türleri (Payment Term Types)
/// </summary>
public enum PaymentTermType
{
    /// <summary>
    /// Peşin (Cash/Immediate)
    /// </summary>
    Cash = 1,

    /// <summary>
    /// Vadeli (Term)
    /// </summary>
    Term = 2,

    /// <summary>
    /// Çekle (By Check)
    /// </summary>
    ByCheck = 3,

    /// <summary>
    /// Senetle (By Note)
    /// </summary>
    ByNote = 4,

    /// <summary>
    /// Taksitli (Installment)
    /// </summary>
    Installment = 5,

    /// <summary>
    /// Kapıda Ödeme (Cash on Delivery)
    /// </summary>
    CashOnDelivery = 6
}

/// <summary>
/// Risk Durumu (Risk Status)
/// </summary>
public enum RiskStatus
{
    /// <summary>
    /// Düşük Risk (Low Risk)
    /// </summary>
    LowRisk = 1,

    /// <summary>
    /// Normal Risk (Normal Risk)
    /// </summary>
    NormalRisk = 2,

    /// <summary>
    /// Yüksek Risk (High Risk)
    /// </summary>
    HighRisk = 3,

    /// <summary>
    /// Çok Yüksek Risk (Very High Risk)
    /// </summary>
    VeryHighRisk = 4,

    /// <summary>
    /// Kara Liste (Blacklisted)
    /// </summary>
    Blacklisted = 5
}
