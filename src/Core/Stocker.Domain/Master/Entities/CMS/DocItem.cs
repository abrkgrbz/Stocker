using Stocker.Domain.Master.Enums.CMS;
using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Master.Entities.CMS;

/// <summary>
/// Dokümantasyon öğesi entity'si (klasör veya dosya)
/// </summary>
public sealed class DocItem : AggregateRoot
{
    private readonly List<DocItem> _children = new();

    /// <summary>
    /// Öğe başlığı
    /// </summary>
    public string Title { get; private set; }

    /// <summary>
    /// URL-friendly slug
    /// </summary>
    public string Slug { get; private set; }

    /// <summary>
    /// Öğe türü (klasör veya dosya)
    /// </summary>
    public DocItemType Type { get; private set; }

    /// <summary>
    /// Üst klasör ID (null = kök seviye)
    /// </summary>
    public Guid? ParentId { get; private set; }

    /// <summary>
    /// İçerik (sadece type='file' için)
    /// </summary>
    public string? Content { get; private set; }

    /// <summary>
    /// Sıralama
    /// </summary>
    public int Order { get; private set; }

    /// <summary>
    /// Ikon (opsiyonel)
    /// </summary>
    public string? Icon { get; private set; }

    /// <summary>
    /// Aktif mi?
    /// </summary>
    public bool IsActive { get; private set; }

    /// <summary>
    /// Oluşturulma tarihi
    /// </summary>
    public DateTime CreatedAt { get; private set; }

    /// <summary>
    /// Son güncelleme tarihi
    /// </summary>
    public DateTime? UpdatedAt { get; private set; }

    /// <summary>
    /// Yazar ID
    /// </summary>
    public Guid? AuthorId { get; private set; }

    // Navigation properties
    public DocItem? Parent { get; private set; }
    public IReadOnlyList<DocItem> Children => _children.AsReadOnly();
    public MasterUser? Author { get; private set; }

    private DocItem() { } // EF Constructor

    private DocItem(
        string title,
        string slug,
        DocItemType type,
        Guid? parentId = null,
        string? content = null,
        int order = 0,
        string? icon = null,
        Guid? authorId = null)
    {
        Id = Guid.NewGuid();
        Title = title;
        Slug = slug.ToLowerInvariant();
        Type = type;
        ParentId = parentId;
        Content = content;
        Order = order;
        Icon = icon;
        AuthorId = authorId;
        IsActive = true;
        CreatedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Yeni klasör oluşturur
    /// </summary>
    public static DocItem CreateFolder(
        string title,
        string slug,
        Guid? parentId = null,
        int order = 0,
        string? icon = null,
        Guid? authorId = null)
    {
        ValidateTitle(title);
        ValidateSlug(slug);

        return new DocItem(
            title,
            slug,
            DocItemType.Folder,
            parentId,
            content: null,
            order,
            icon,
            authorId);
    }

    /// <summary>
    /// Yeni dosya oluşturur
    /// </summary>
    public static DocItem CreateFile(
        string title,
        string slug,
        string content,
        Guid? parentId = null,
        int order = 0,
        string? icon = null,
        Guid? authorId = null)
    {
        ValidateTitle(title);
        ValidateSlug(slug);

        return new DocItem(
            title,
            slug,
            DocItemType.File,
            parentId,
            content,
            order,
            icon,
            authorId);
    }

    /// <summary>
    /// Öğeyi günceller
    /// </summary>
    public void Update(
        string title,
        string slug,
        string? content = null,
        int? order = null,
        string? icon = null)
    {
        ValidateTitle(title);
        ValidateSlug(slug);

        Title = title;
        Slug = slug.ToLowerInvariant();
        Icon = icon;
        UpdatedAt = DateTime.UtcNow;

        if (order.HasValue)
        {
            Order = order.Value;
        }

        // Sadece dosya ise içerik güncellenebilir
        if (Type == DocItemType.File && content != null)
        {
            Content = content;
        }
    }

    /// <summary>
    /// İçeriği günceller (sadece dosya için)
    /// </summary>
    public void UpdateContent(string content)
    {
        if (Type != DocItemType.File)
            throw new InvalidOperationException("Sadece dosya türündeki öğelerin içeriği güncellenebilir.");

        Content = content;
        UpdatedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Öğeyi taşır (parent değiştirir)
    /// </summary>
    public void MoveTo(Guid? newParentId)
    {
        // Kendi altına taşınamaz
        if (newParentId == Id)
            throw new InvalidOperationException("Öğe kendi altına taşınamaz.");

        ParentId = newParentId;
        UpdatedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Sıralamayı değiştirir
    /// </summary>
    public void SetOrder(int order)
    {
        Order = order;
        UpdatedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Öğeyi aktif eder
    /// </summary>
    public void Activate()
    {
        if (IsActive)
            return;

        IsActive = true;
        UpdatedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Öğeyi pasif eder
    /// </summary>
    public void Deactivate()
    {
        if (!IsActive)
            return;

        IsActive = false;
        UpdatedAt = DateTime.UtcNow;
    }

    private static void ValidateTitle(string title)
    {
        if (string.IsNullOrWhiteSpace(title))
            throw new ArgumentException("Öğe başlığı boş olamaz.", nameof(title));

        if (title.Length > 200)
            throw new ArgumentException("Öğe başlığı 200 karakterden uzun olamaz.", nameof(title));
    }

    private static void ValidateSlug(string slug)
    {
        if (string.IsNullOrWhiteSpace(slug))
            throw new ArgumentException("Öğe slug'ı boş olamaz.", nameof(slug));

        if (slug.Length > 200)
            throw new ArgumentException("Öğe slug'ı 200 karakterden uzun olamaz.", nameof(slug));
    }
}
