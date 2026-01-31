using Stocker.Domain.Master.Enums.CMS;
using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Master.Entities.CMS;

/// <summary>
/// CMS statik sayfa entity'si (Hakkımızda, Gizlilik Politikası vb.)
/// </summary>
public sealed class CmsPage : AggregateRoot
{
    /// <summary>
    /// Sayfa başlığı
    /// </summary>
    public string Title { get; private set; }

    /// <summary>
    /// URL-friendly slug (benzersiz)
    /// </summary>
    public string Slug { get; private set; }

    /// <summary>
    /// HTML içerik
    /// </summary>
    public string Content { get; private set; }

    /// <summary>
    /// Sayfa durumu
    /// </summary>
    public PageStatus Status { get; private set; }

    /// <summary>
    /// SEO meta başlık
    /// </summary>
    public string? MetaTitle { get; private set; }

    /// <summary>
    /// SEO meta açıklama
    /// </summary>
    public string? MetaDescription { get; private set; }

    /// <summary>
    /// Öne çıkan görsel URL
    /// </summary>
    public string? FeaturedImage { get; private set; }

    /// <summary>
    /// Yazar ID (MasterUser)
    /// </summary>
    public Guid AuthorId { get; private set; }

    /// <summary>
    /// Görüntülenme sayısı
    /// </summary>
    public long Views { get; private set; }

    /// <summary>
    /// Oluşturulma tarihi
    /// </summary>
    public DateTime CreatedAt { get; private set; }

    /// <summary>
    /// Son güncelleme tarihi
    /// </summary>
    public DateTime? UpdatedAt { get; private set; }

    /// <summary>
    /// Yayınlanma tarihi
    /// </summary>
    public DateTime? PublishedAt { get; private set; }

    // Navigation property
    public MasterUser? Author { get; private set; }

    private CmsPage() { } // EF Constructor

    private CmsPage(
        string title,
        string slug,
        string content,
        PageStatus status,
        Guid authorId,
        string? metaTitle = null,
        string? metaDescription = null,
        string? featuredImage = null)
    {
        Id = Guid.NewGuid();
        Title = title;
        Slug = slug.ToLowerInvariant();
        Content = content;
        Status = status;
        AuthorId = authorId;
        MetaTitle = metaTitle;
        MetaDescription = metaDescription;
        FeaturedImage = featuredImage;
        Views = 0;
        CreatedAt = DateTime.UtcNow;

        if (status == PageStatus.Published)
        {
            PublishedAt = DateTime.UtcNow;
        }
    }

    /// <summary>
    /// Yeni sayfa oluşturur
    /// </summary>
    public static CmsPage Create(
        string title,
        string slug,
        string content,
        PageStatus status,
        Guid authorId,
        string? metaTitle = null,
        string? metaDescription = null,
        string? featuredImage = null)
    {
        ValidateTitle(title);
        ValidateSlug(slug);

        return new CmsPage(
            title,
            slug,
            content,
            status,
            authorId,
            metaTitle,
            metaDescription,
            featuredImage);
    }

    /// <summary>
    /// Sayfa içeriğini günceller
    /// </summary>
    public void Update(
        string title,
        string slug,
        string content,
        PageStatus status,
        string? metaTitle = null,
        string? metaDescription = null,
        string? featuredImage = null)
    {
        ValidateTitle(title);
        ValidateSlug(slug);

        var wasPublished = Status == PageStatus.Published;
        var isNowPublished = status == PageStatus.Published;

        Title = title;
        Slug = slug.ToLowerInvariant();
        Content = content;
        Status = status;
        MetaTitle = metaTitle;
        MetaDescription = metaDescription;
        FeaturedImage = featuredImage;
        UpdatedAt = DateTime.UtcNow;

        // İlk kez yayınlanıyorsa
        if (!wasPublished && isNowPublished && !PublishedAt.HasValue)
        {
            PublishedAt = DateTime.UtcNow;
        }
    }

    /// <summary>
    /// Sayfayı yayınlar
    /// </summary>
    public void Publish()
    {
        if (Status == PageStatus.Published)
            return;

        Status = PageStatus.Published;
        UpdatedAt = DateTime.UtcNow;

        if (!PublishedAt.HasValue)
        {
            PublishedAt = DateTime.UtcNow;
        }
    }

    /// <summary>
    /// Sayfayı taslak yapar
    /// </summary>
    public void Unpublish()
    {
        if (Status == PageStatus.Draft)
            return;

        Status = PageStatus.Draft;
        UpdatedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Sayfayı arşivler
    /// </summary>
    public void Archive()
    {
        if (Status == PageStatus.Archived)
            return;

        Status = PageStatus.Archived;
        UpdatedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Görüntülenme sayısını artırır
    /// </summary>
    public void IncrementViews()
    {
        Views++;
    }

    /// <summary>
    /// Öne çıkan görseli günceller
    /// </summary>
    public void SetFeaturedImage(string? imageUrl)
    {
        FeaturedImage = imageUrl;
        UpdatedAt = DateTime.UtcNow;
    }

    private static void ValidateTitle(string title)
    {
        if (string.IsNullOrWhiteSpace(title))
            throw new ArgumentException("Sayfa başlığı boş olamaz.", nameof(title));

        if (title.Length > 200)
            throw new ArgumentException("Sayfa başlığı 200 karakterden uzun olamaz.", nameof(title));
    }

    private static void ValidateSlug(string slug)
    {
        if (string.IsNullOrWhiteSpace(slug))
            throw new ArgumentException("Sayfa slug'ı boş olamaz.", nameof(slug));

        if (slug.Length > 200)
            throw new ArgumentException("Sayfa slug'ı 200 karakterden uzun olamaz.", nameof(slug));

        // Slug sadece küçük harf, rakam ve tire içerebilir
        if (!System.Text.RegularExpressions.Regex.IsMatch(slug, @"^[a-z0-9]+(?:-[a-z0-9]+)*$"))
            throw new ArgumentException("Slug sadece küçük harf, rakam ve tire içerebilir.", nameof(slug));
    }
}
