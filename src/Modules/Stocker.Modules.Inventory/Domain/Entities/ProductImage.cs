using Stocker.SharedKernel.Common;

namespace Stocker.Modules.Inventory.Domain.Entities;

/// <summary>
/// Multiple images for a product with ordering and metadata
/// Supports primary image designation and various image types
/// </summary>
public class ProductImage : BaseEntity
{
    public int ProductId { get; private set; }
    public string Url { get; private set; }
    public string? ThumbnailUrl { get; private set; }
    public string? AltText { get; private set; }
    public string? Title { get; private set; }
    public ImageType ImageType { get; private set; }
    public int DisplayOrder { get; private set; }
    public bool IsPrimary { get; private set; }
    public long? FileSize { get; private set; }
    public int? Width { get; private set; }
    public int? Height { get; private set; }
    public string? MimeType { get; private set; }
    public string? OriginalFileName { get; private set; }
    public bool IsActive { get; private set; }

    public virtual Product Product { get; private set; }

    protected ProductImage() { }

    public ProductImage(int productId, string url, ImageType imageType = ImageType.Gallery)
    {
        ProductId = productId;
        Url = url;
        ImageType = imageType;
        DisplayOrder = 0;
        IsPrimary = false;
        IsActive = true;
    }

    public void SetThumbnail(string thumbnailUrl)
    {
        ThumbnailUrl = thumbnailUrl;
    }

    public void SetMetadata(string? altText, string? title)
    {
        AltText = altText;
        Title = title;
    }

    public void SetFileInfo(long? fileSize, int? width, int? height, string? mimeType, string? originalFileName)
    {
        FileSize = fileSize;
        Width = width;
        Height = height;
        MimeType = mimeType;
        OriginalFileName = originalFileName;
    }

    public void SetDisplayOrder(int order)
    {
        DisplayOrder = order;
    }

    public void SetAsPrimary()
    {
        IsPrimary = true;
    }

    public void UnsetPrimary()
    {
        IsPrimary = false;
    }

    public void UpdateUrl(string url, string? thumbnailUrl = null)
    {
        Url = url;
        ThumbnailUrl = thumbnailUrl;
    }

    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;
}

/// <summary>
/// Type of product image
/// </summary>
public enum ImageType
{
    /// <summary>
    /// Main product image
    /// </summary>
    Primary = 1,

    /// <summary>
    /// Gallery/additional images
    /// </summary>
    Gallery = 2,

    /// <summary>
    /// Thumbnail image
    /// </summary>
    Thumbnail = 3,

    /// <summary>
    /// Zoom/high-resolution image
    /// </summary>
    Zoom = 4,

    /// <summary>
    /// Technical/specification image
    /// </summary>
    Technical = 5,

    /// <summary>
    /// Lifestyle/usage image
    /// </summary>
    Lifestyle = 6,

    /// <summary>
    /// Size chart image
    /// </summary>
    SizeChart = 7,

    /// <summary>
    /// Color swatch image
    /// </summary>
    Swatch = 8
}
