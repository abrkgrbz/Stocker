using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Master.Entities.CMS;

/// <summary>
/// Blog kategori entity'si
/// </summary>
public sealed class BlogCategory : AggregateRoot
{
    private readonly List<BlogPost> _posts = new();

    /// <summary>
    /// Kategori adı
    /// </summary>
    public string Name { get; private set; }

    /// <summary>
    /// URL-friendly slug
    /// </summary>
    public string Slug { get; private set; }

    /// <summary>
    /// Kategori açıklaması
    /// </summary>
    public string? Description { get; private set; }

    /// <summary>
    /// Kategori rengi (hex)
    /// </summary>
    public string? Color { get; private set; }

    /// <summary>
    /// Kategori ikonu
    /// </summary>
    public string? Icon { get; private set; }

    /// <summary>
    /// Sıralama
    /// </summary>
    public int DisplayOrder { get; private set; }

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

    // Navigation property
    public IReadOnlyList<BlogPost> Posts => _posts.AsReadOnly();

    private BlogCategory() { } // EF Constructor

    private BlogCategory(
        string name,
        string slug,
        string? description = null,
        string? color = null,
        string? icon = null,
        int displayOrder = 0)
    {
        Id = Guid.NewGuid();
        Name = name;
        Slug = slug.ToLowerInvariant();
        Description = description;
        Color = color;
        Icon = icon;
        DisplayOrder = displayOrder;
        IsActive = true;
        CreatedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Yeni kategori oluşturur
    /// </summary>
    public static BlogCategory Create(
        string name,
        string slug,
        string? description = null,
        string? color = null,
        string? icon = null,
        int displayOrder = 0)
    {
        ValidateName(name);
        ValidateSlug(slug);

        return new BlogCategory(name, slug, description, color, icon, displayOrder);
    }

    /// <summary>
    /// Kategoriyi günceller
    /// </summary>
    public void Update(
        string name,
        string slug,
        string? description = null,
        string? color = null,
        string? icon = null,
        int displayOrder = 0)
    {
        ValidateName(name);
        ValidateSlug(slug);

        Name = name;
        Slug = slug.ToLowerInvariant();
        Description = description;
        Color = color;
        Icon = icon;
        DisplayOrder = displayOrder;
        UpdatedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Kategoriyi aktif eder
    /// </summary>
    public void Activate()
    {
        if (IsActive)
            return;

        IsActive = true;
        UpdatedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Kategoriyi pasif eder
    /// </summary>
    public void Deactivate()
    {
        if (!IsActive)
            return;

        IsActive = false;
        UpdatedAt = DateTime.UtcNow;
    }

    private static void ValidateName(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Kategori adı boş olamaz.", nameof(name));

        if (name.Length > 100)
            throw new ArgumentException("Kategori adı 100 karakterden uzun olamaz.", nameof(name));
    }

    private static void ValidateSlug(string slug)
    {
        if (string.IsNullOrWhiteSpace(slug))
            throw new ArgumentException("Kategori slug'ı boş olamaz.", nameof(slug));

        if (slug.Length > 100)
            throw new ArgumentException("Kategori slug'ı 100 karakterden uzun olamaz.", nameof(slug));
    }
}
