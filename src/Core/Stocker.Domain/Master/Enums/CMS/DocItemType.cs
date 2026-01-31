namespace Stocker.Domain.Master.Enums.CMS;

/// <summary>
/// Dokümantasyon öğesi türleri
/// </summary>
public enum DocItemType
{
    /// <summary>
    /// Klasör - alt öğeler içerebilir
    /// </summary>
    Folder = 0,

    /// <summary>
    /// Dosya - içerik içerir
    /// </summary>
    File = 1
}
