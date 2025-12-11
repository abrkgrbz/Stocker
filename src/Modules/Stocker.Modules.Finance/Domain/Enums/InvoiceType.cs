namespace Stocker.Modules.Finance.Domain.Enums;

/// <summary>
/// Fatura Tipleri (Invoice Types in Turkish Tax System)
/// </summary>
public enum InvoiceType
{
    /// <summary>
    /// Satış Faturası (Sales Invoice)
    /// </summary>
    Sales = 1,

    /// <summary>
    /// Alış Faturası (Purchase Invoice)
    /// </summary>
    Purchase = 2,

    /// <summary>
    /// İade Faturası (Return Invoice)
    /// </summary>
    Return = 3,

    /// <summary>
    /// Tevkifatlı Fatura (Withholding Invoice)
    /// </summary>
    Withholding = 4,

    /// <summary>
    /// İstisna Faturası (Exemption Invoice)
    /// </summary>
    Exemption = 5,

    /// <summary>
    /// Özel Matrah Faturası (Special Base Invoice)
    /// </summary>
    SpecialBase = 6,

    /// <summary>
    /// İhraç Kayıtlı Fatura (Export Registered Invoice)
    /// </summary>
    ExportRegistered = 7,

    /// <summary>
    /// İhracat Faturası (Export Invoice)
    /// </summary>
    Export = 8
}

/// <summary>
/// e-Fatura/e-Arşiv Türleri (E-Invoice Types)
/// </summary>
public enum EInvoiceType
{
    /// <summary>
    /// e-Fatura (Registered e-Invoice users)
    /// </summary>
    EInvoice = 1,

    /// <summary>
    /// e-Arşiv Fatura (For non-registered recipients)
    /// </summary>
    EArchive = 2,

    /// <summary>
    /// e-İrsaliye (Electronic Waybill)
    /// </summary>
    EWaybill = 3,

    /// <summary>
    /// e-Müstahsil Makbuzu (Electronic Producer Receipt)
    /// </summary>
    EProducerReceipt = 4,

    /// <summary>
    /// e-Serbest Meslek Makbuzu (Electronic Freelance Receipt)
    /// </summary>
    EFreelanceReceipt = 5,

    /// <summary>
    /// Kağıt Fatura (Paper Invoice)
    /// </summary>
    Paper = 6
}

/// <summary>
/// Fatura Durumları (Invoice Statuses)
/// </summary>
public enum InvoiceStatus
{
    /// <summary>
    /// Taslak (Draft)
    /// </summary>
    Draft = 1,

    /// <summary>
    /// Onay Bekliyor (Pending Approval)
    /// </summary>
    PendingApproval = 2,

    /// <summary>
    /// Onaylandı (Approved)
    /// </summary>
    Approved = 3,

    /// <summary>
    /// GİB'e Gönderildi (Sent to Tax Authority)
    /// </summary>
    SentToTaxAuthority = 4,

    /// <summary>
    /// GİB Onayladı (Accepted by Tax Authority)
    /// </summary>
    AcceptedByTaxAuthority = 5,

    /// <summary>
    /// GİB Reddetti (Rejected by Tax Authority)
    /// </summary>
    RejectedByTaxAuthority = 6,

    /// <summary>
    /// Alıcı Onayladı (Accepted by Recipient)
    /// </summary>
    AcceptedByRecipient = 7,

    /// <summary>
    /// Alıcı Reddetti (Rejected by Recipient)
    /// </summary>
    RejectedByRecipient = 8,

    /// <summary>
    /// İptal Edildi (Cancelled)
    /// </summary>
    Cancelled = 9,

    /// <summary>
    /// Ödendi (Paid)
    /// </summary>
    Paid = 10,

    /// <summary>
    /// Kısmi Ödendi (Partially Paid)
    /// </summary>
    PartiallyPaid = 11
}

/// <summary>
/// Fatura Senaryosu (Invoice Scenario for e-Invoice)
/// </summary>
public enum InvoiceScenario
{
    /// <summary>
    /// Temel Fatura (Basic Invoice)
    /// </summary>
    Basic = 1,

    /// <summary>
    /// Ticari Fatura (Commercial Invoice)
    /// </summary>
    Commercial = 2,

    /// <summary>
    /// İhracat Faturası (Export Invoice)
    /// </summary>
    Export = 3,

    /// <summary>
    /// Yolcu Beraber (Passenger Accompanied)
    /// </summary>
    PassengerAccompanied = 4,

    /// <summary>
    /// Kamu (Public Sector)
    /// </summary>
    Public = 5
}
