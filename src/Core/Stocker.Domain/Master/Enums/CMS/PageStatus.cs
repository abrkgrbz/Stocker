namespace Stocker.Domain.Master.Enums.CMS;

/// <summary>
/// CMS sayfa durumları
/// </summary>
public enum PageStatus
{
    /// <summary>
    /// Taslak - henüz yayınlanmamış
    /// </summary>
    Draft = 0,

    /// <summary>
    /// Yayında - aktif olarak görüntüleniyor
    /// </summary>
    Published = 1,

    /// <summary>
    /// Arşivlenmiş - artık aktif değil
    /// </summary>
    Archived = 2
}
