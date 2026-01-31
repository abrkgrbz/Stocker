using Stocker.Domain.Master.Enums.CMS;

namespace Stocker.Application.DTOs.CMS;

/// <summary>
/// Medya dosyası DTO'su
/// </summary>
public class CmsMediaDto
{
    public Guid Id { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public MediaType Type { get; set; }
    public string TypeText => Type.ToString().ToLowerInvariant();
    public string MimeType { get; set; } = string.Empty;
    public long Size { get; set; }
    public string SizeFormatted { get; set; } = string.Empty;
    public int? Width { get; set; }
    public int? Height { get; set; }
    public string? AltText { get; set; }
    public string? Title { get; set; }
    public string? Folder { get; set; }
    public Guid UploadedById { get; set; }
    public string? UploadedByName { get; set; }
    public DateTime UploadedAt { get; set; }
    public int UsageCount { get; set; }
}

/// <summary>
/// Medya dosyası liste DTO'su
/// </summary>
public class CmsMediaListDto
{
    public Guid Id { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public MediaType Type { get; set; }
    public string TypeText => Type.ToString().ToLowerInvariant();
    public string MimeType { get; set; } = string.Empty;
    public long Size { get; set; }
    public string SizeFormatted { get; set; } = string.Empty;
    public int? Width { get; set; }
    public int? Height { get; set; }
    public string? Folder { get; set; }
    public DateTime UploadedAt { get; set; }
}

/// <summary>
/// Medya yükleme sonucu DTO'su
/// </summary>
public class MediaUploadResultDto
{
    public Guid Id { get; set; }
    public string Url { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public MediaType Type { get; set; }
    public long Size { get; set; }
    public int? Width { get; set; }
    public int? Height { get; set; }
}
