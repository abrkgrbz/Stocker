namespace Stocker.Modules.CMS.Domain.Entities;

/// <summary>
/// Media file entity for CMS
/// </summary>
public class CMSMedia : CMSBaseEntity
{
    public string FileName { get; set; } = string.Empty;
    public string OriginalName { get; set; } = string.Empty;
    public string MimeType { get; set; } = string.Empty;
    public long Size { get; set; }
    public string Url { get; set; } = string.Empty;
    public string Folder { get; set; } = "general";
    public string? Alt { get; set; }
    public string? Caption { get; set; }
}
