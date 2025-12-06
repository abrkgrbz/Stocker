namespace Stocker.Modules.HR.Domain.Enums;

/// <summary>
/// Masraf durumu
/// </summary>
public enum ExpenseStatus
{
    /// <summary>
    /// Taslak
    /// </summary>
    Draft = 1,

    /// <summary>
    /// Onay bekliyor
    /// </summary>
    Pending = 2,

    /// <summary>
    /// Onaylandı
    /// </summary>
    Approved = 3,

    /// <summary>
    /// Reddedildi
    /// </summary>
    Rejected = 4,

    /// <summary>
    /// Ödendi
    /// </summary>
    Paid = 5,

    /// <summary>
    /// İptal edildi
    /// </summary>
    Cancelled = 6
}
