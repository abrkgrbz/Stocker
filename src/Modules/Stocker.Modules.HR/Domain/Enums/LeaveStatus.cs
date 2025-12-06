namespace Stocker.Modules.HR.Domain.Enums;

/// <summary>
/// İzin talebi durumu
/// </summary>
public enum LeaveStatus
{
    /// <summary>
    /// Beklemede
    /// </summary>
    Pending = 1,

    /// <summary>
    /// Onaylandı
    /// </summary>
    Approved = 2,

    /// <summary>
    /// Reddedildi
    /// </summary>
    Rejected = 3,

    /// <summary>
    /// İptal edildi
    /// </summary>
    Cancelled = 4,

    /// <summary>
    /// Kullanıldı
    /// </summary>
    Taken = 5,

    /// <summary>
    /// Kısmen kullanıldı
    /// </summary>
    PartiallyTaken = 6
}
