using Stocker.Domain.Master.Enums.CMS;
using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Master.Entities.CMS;

/// <summary>
/// Medya dosyası entity'si
/// </summary>
public sealed class CmsMedia : AggregateRoot
{
    /// <summary>
    /// Orijinal dosya adı
    /// </summary>
    public string FileName { get; private set; }

    /// <summary>
    /// Saklanan dosya adı (benzersiz)
    /// </summary>
    public string StoredFileName { get; private set; }

    /// <summary>
    /// Dosya yolu (storage path)
    /// </summary>
    public string FilePath { get; private set; }

    /// <summary>
    /// Tam URL
    /// </summary>
    public string Url { get; private set; }

    /// <summary>
    /// Dosya türü
    /// </summary>
    public MediaType Type { get; private set; }

    /// <summary>
    /// MIME türü
    /// </summary>
    public string MimeType { get; private set; }

    /// <summary>
    /// Dosya boyutu (bytes)
    /// </summary>
    public long Size { get; private set; }

    /// <summary>
    /// Genişlik (sadece görsel için)
    /// </summary>
    public int? Width { get; private set; }

    /// <summary>
    /// Yükseklik (sadece görsel için)
    /// </summary>
    public int? Height { get; private set; }

    /// <summary>
    /// Alt metin (accessibility)
    /// </summary>
    public string? AltText { get; private set; }

    /// <summary>
    /// Başlık/Açıklama
    /// </summary>
    public string? Title { get; private set; }

    /// <summary>
    /// Klasör/Kategori
    /// </summary>
    public string? Folder { get; private set; }

    /// <summary>
    /// Yükleyen kullanıcı ID
    /// </summary>
    public Guid UploadedById { get; private set; }

    /// <summary>
    /// Yüklenme tarihi
    /// </summary>
    public DateTime UploadedAt { get; private set; }

    /// <summary>
    /// Kullanım sayısı
    /// </summary>
    public int UsageCount { get; private set; }

    // Navigation property
    public MasterUser? UploadedBy { get; private set; }

    private CmsMedia() { } // EF Constructor

    private CmsMedia(
        string fileName,
        string storedFileName,
        string filePath,
        string url,
        MediaType type,
        string mimeType,
        long size,
        Guid uploadedById,
        int? width = null,
        int? height = null,
        string? altText = null,
        string? title = null,
        string? folder = null)
    {
        Id = Guid.NewGuid();
        FileName = fileName;
        StoredFileName = storedFileName;
        FilePath = filePath;
        Url = url;
        Type = type;
        MimeType = mimeType;
        Size = size;
        UploadedById = uploadedById;
        Width = width;
        Height = height;
        AltText = altText;
        Title = title;
        Folder = folder;
        UsageCount = 0;
        UploadedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Yeni medya dosyası oluşturur
    /// </summary>
    public static CmsMedia Create(
        string fileName,
        string storedFileName,
        string filePath,
        string url,
        string mimeType,
        long size,
        Guid uploadedById,
        int? width = null,
        int? height = null,
        string? altText = null,
        string? title = null,
        string? folder = null)
    {
        ValidateFileName(fileName);

        var type = DetermineMediaType(mimeType);

        return new CmsMedia(
            fileName,
            storedFileName,
            filePath,
            url,
            type,
            mimeType,
            size,
            uploadedById,
            width,
            height,
            altText,
            title,
            folder);
    }

    /// <summary>
    /// Meta bilgilerini günceller
    /// </summary>
    public void UpdateMetadata(string? altText, string? title, string? folder)
    {
        AltText = altText;
        Title = title;
        Folder = folder;
    }

    /// <summary>
    /// Kullanım sayısını artırır
    /// </summary>
    public void IncrementUsage()
    {
        UsageCount++;
    }

    /// <summary>
    /// Kullanım sayısını azaltır
    /// </summary>
    public void DecrementUsage()
    {
        if (UsageCount > 0)
            UsageCount--;
    }

    /// <summary>
    /// Görsel boyutlarını ayarlar
    /// </summary>
    public void SetDimensions(int width, int height)
    {
        if (Type != MediaType.Image)
            return;

        Width = width;
        Height = height;
    }

    /// <summary>
    /// MIME türünden medya türünü belirler
    /// </summary>
    private static MediaType DetermineMediaType(string mimeType)
    {
        if (string.IsNullOrWhiteSpace(mimeType))
            return MediaType.Other;

        var lower = mimeType.ToLowerInvariant();

        if (lower.StartsWith("image/"))
            return MediaType.Image;

        if (lower.StartsWith("video/"))
            return MediaType.Video;

        if (lower.StartsWith("application/pdf") ||
            lower.Contains("document") ||
            lower.Contains("spreadsheet") ||
            lower.Contains("word") ||
            lower.Contains("excel") ||
            lower.Contains("powerpoint"))
            return MediaType.Document;

        return MediaType.Other;
    }

    /// <summary>
    /// Dosya boyutunu okunabilir formata çevirir
    /// </summary>
    public string GetReadableSize()
    {
        string[] sizes = { "B", "KB", "MB", "GB", "TB" };
        double len = Size;
        int order = 0;
        while (len >= 1024 && order < sizes.Length - 1)
        {
            order++;
            len = len / 1024;
        }
        return $"{len:0.##} {sizes[order]}";
    }

    private static void ValidateFileName(string fileName)
    {
        if (string.IsNullOrWhiteSpace(fileName))
            throw new ArgumentException("Dosya adı boş olamaz.", nameof(fileName));

        if (fileName.Length > 255)
            throw new ArgumentException("Dosya adı 255 karakterden uzun olamaz.", nameof(fileName));
    }
}
