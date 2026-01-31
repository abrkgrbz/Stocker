namespace Stocker.Domain.Master.Enums.CMS;

/// <summary>
/// Medya dosya türleri
/// </summary>
public enum MediaType
{
    /// <summary>
    /// Görsel dosya (jpg, png, gif, webp, svg)
    /// </summary>
    Image = 0,

    /// <summary>
    /// Video dosya (mp4, webm, avi)
    /// </summary>
    Video = 1,

    /// <summary>
    /// Doküman (pdf, doc, docx, xls, xlsx)
    /// </summary>
    Document = 2,

    /// <summary>
    /// Diğer dosya türleri
    /// </summary>
    Other = 3
}
