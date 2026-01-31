namespace Stocker.Domain.Master.Enums.CMS;

/// <summary>
/// Blog yazısı durumları
/// </summary>
public enum PostStatus
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
    /// Zamanlanmış - ileri tarihte yayınlanacak
    /// </summary>
    Scheduled = 2,

    /// <summary>
    /// Arşivlenmiş - artık aktif değil
    /// </summary>
    Archived = 3
}
