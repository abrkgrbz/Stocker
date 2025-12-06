namespace Stocker.Modules.HR.Domain.Enums;

/// <summary>
/// Bordro durumu
/// </summary>
public enum PayrollStatus
{
    /// <summary>
    /// Taslak
    /// </summary>
    Draft = 1,

    /// <summary>
    /// Hesaplandı
    /// </summary>
    Calculated = 2,

    /// <summary>
    /// Onay bekliyor
    /// </summary>
    PendingApproval = 3,

    /// <summary>
    /// Onaylandı
    /// </summary>
    Approved = 4,

    /// <summary>
    /// Ödendi
    /// </summary>
    Paid = 5,

    /// <summary>
    /// İptal edildi
    /// </summary>
    Cancelled = 6,

    /// <summary>
    /// Reddedildi
    /// </summary>
    Rejected = 7
}
