using Stocker.Domain.Master.Enums.CMS;
using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Master.Entities.CMS;

/// <summary>
/// Blog yazısı entity'si
/// </summary>
public sealed class BlogPost : AggregateRoot
{
    private readonly List<string> _tags = new();

    /// <summary>
    /// Yazı başlığı
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
    /// Kısa özet
    /// </summary>
    public string? Excerpt { get; private set; }

    /// <summary>
    /// Kategori ID
    /// </summary>
    public Guid CategoryId { get; private set; }

    /// <summary>
    /// Etiketler (JSON array olarak saklanacak)
    /// </summary>
    public IReadOnlyList<string> Tags => _tags.AsReadOnly();

    /// <summary>
    /// Yazı durumu
    /// </summary>
    public PostStatus Status { get; private set; }

    /// <summary>
    /// Yayın tarihi (scheduled için ileri tarih olabilir)
    /// </summary>
    public DateTime? PublishDate { get; private set; }

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
    /// SEO meta başlık
    /// </summary>
    public string? MetaTitle { get; private set; }

    /// <summary>
    /// SEO meta açıklama
    /// </summary>
    public string? MetaDescription { get; private set; }

    /// <summary>
    /// Oluşturulma tarihi
    /// </summary>
    public DateTime CreatedAt { get; private set; }

    /// <summary>
    /// Son güncelleme tarihi
    /// </summary>
    public DateTime? UpdatedAt { get; private set; }

    // Navigation properties
    public BlogCategory? Category { get; private set; }
    public MasterUser? Author { get; private set; }

    private BlogPost() { } // EF Constructor

    private BlogPost(
        string title,
        string slug,
        string content,
        Guid categoryId,
        PostStatus status,
        Guid authorId,
        string? excerpt = null,
        IEnumerable<string>? tags = null,
        DateTime? publishDate = null,
        string? featuredImage = null,
        string? metaTitle = null,
        string? metaDescription = null)
    {
        Id = Guid.NewGuid();
        Title = title;
        Slug = slug.ToLowerInvariant();
        Content = content;
        CategoryId = categoryId;
        Status = status;
        AuthorId = authorId;
        Excerpt = excerpt;
        FeaturedImage = featuredImage;
        MetaTitle = metaTitle;
        MetaDescription = metaDescription;
        Views = 0;
        CreatedAt = DateTime.UtcNow;

        if (tags != null)
        {
            _tags.AddRange(tags.Where(t => !string.IsNullOrWhiteSpace(t)));
        }

        // Publish date ayarla
        if (status == PostStatus.Published)
        {
            PublishDate = DateTime.UtcNow;
        }
        else if (status == PostStatus.Scheduled && publishDate.HasValue)
        {
            PublishDate = publishDate.Value;
        }
    }

    /// <summary>
    /// Yeni blog yazısı oluşturur
    /// </summary>
    public static BlogPost Create(
        string title,
        string slug,
        string content,
        Guid categoryId,
        PostStatus status,
        Guid authorId,
        string? excerpt = null,
        IEnumerable<string>? tags = null,
        DateTime? publishDate = null,
        string? featuredImage = null,
        string? metaTitle = null,
        string? metaDescription = null)
    {
        ValidateTitle(title);
        ValidateSlug(slug);

        // Scheduled durumunda publishDate zorunlu
        if (status == PostStatus.Scheduled && !publishDate.HasValue)
        {
            throw new ArgumentException("Zamanlanmış yazılar için yayın tarihi zorunludur.", nameof(publishDate));
        }

        // Scheduled tarih gelecekte olmalı
        if (status == PostStatus.Scheduled && publishDate.HasValue && publishDate.Value <= DateTime.UtcNow)
        {
            throw new ArgumentException("Zamanlanmış yayın tarihi gelecekte olmalıdır.", nameof(publishDate));
        }

        return new BlogPost(
            title,
            slug,
            content,
            categoryId,
            status,
            authorId,
            excerpt,
            tags,
            publishDate,
            featuredImage,
            metaTitle,
            metaDescription);
    }

    /// <summary>
    /// Blog yazısını günceller
    /// </summary>
    public void Update(
        string title,
        string slug,
        string content,
        Guid categoryId,
        PostStatus status,
        string? excerpt = null,
        IEnumerable<string>? tags = null,
        DateTime? publishDate = null,
        string? featuredImage = null,
        string? metaTitle = null,
        string? metaDescription = null)
    {
        ValidateTitle(title);
        ValidateSlug(slug);

        var wasPublished = Status == PostStatus.Published;
        var isNowPublished = status == PostStatus.Published;

        Title = title;
        Slug = slug.ToLowerInvariant();
        Content = content;
        CategoryId = categoryId;
        Status = status;
        Excerpt = excerpt;
        FeaturedImage = featuredImage;
        MetaTitle = metaTitle;
        MetaDescription = metaDescription;
        UpdatedAt = DateTime.UtcNow;

        // Tag'leri güncelle
        _tags.Clear();
        if (tags != null)
        {
            _tags.AddRange(tags.Where(t => !string.IsNullOrWhiteSpace(t)));
        }

        // Publish date mantığı
        if (status == PostStatus.Scheduled && publishDate.HasValue)
        {
            PublishDate = publishDate.Value;
        }
        else if (!wasPublished && isNowPublished)
        {
            PublishDate = DateTime.UtcNow;
        }
    }

    /// <summary>
    /// Yazıyı yayınlar
    /// </summary>
    public void Publish()
    {
        if (Status == PostStatus.Published)
            return;

        Status = PostStatus.Published;
        PublishDate = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Yazıyı taslak yapar
    /// </summary>
    public void Unpublish()
    {
        if (Status == PostStatus.Draft)
            return;

        Status = PostStatus.Draft;
        UpdatedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Yazıyı arşivler
    /// </summary>
    public void Archive()
    {
        if (Status == PostStatus.Archived)
            return;

        Status = PostStatus.Archived;
        UpdatedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Yazıyı zamanlama
    /// </summary>
    public void Schedule(DateTime publishDate)
    {
        if (publishDate <= DateTime.UtcNow)
            throw new ArgumentException("Zamanlanmış yayın tarihi gelecekte olmalıdır.", nameof(publishDate));

        Status = PostStatus.Scheduled;
        PublishDate = publishDate;
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
    /// Tag ekler
    /// </summary>
    public void AddTag(string tag)
    {
        if (string.IsNullOrWhiteSpace(tag))
            return;

        if (!_tags.Contains(tag, StringComparer.OrdinalIgnoreCase))
        {
            _tags.Add(tag);
            UpdatedAt = DateTime.UtcNow;
        }
    }

    /// <summary>
    /// Tag kaldırır
    /// </summary>
    public void RemoveTag(string tag)
    {
        var existingTag = _tags.FirstOrDefault(t => t.Equals(tag, StringComparison.OrdinalIgnoreCase));
        if (existingTag != null)
        {
            _tags.Remove(existingTag);
            UpdatedAt = DateTime.UtcNow;
        }
    }

    private static void ValidateTitle(string title)
    {
        if (string.IsNullOrWhiteSpace(title))
            throw new ArgumentException("Yazı başlığı boş olamaz.", nameof(title));

        if (title.Length > 300)
            throw new ArgumentException("Yazı başlığı 300 karakterden uzun olamaz.", nameof(title));
    }

    private static void ValidateSlug(string slug)
    {
        if (string.IsNullOrWhiteSpace(slug))
            throw new ArgumentException("Yazı slug'ı boş olamaz.", nameof(slug));

        if (slug.Length > 300)
            throw new ArgumentException("Yazı slug'ı 300 karakterden uzun olamaz.", nameof(slug));
    }
}
