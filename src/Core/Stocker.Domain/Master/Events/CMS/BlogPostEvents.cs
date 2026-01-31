using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Master.Events.CMS;

/// <summary>
/// Blog yazısı oluşturuldu event'i
/// </summary>
public sealed record BlogPostCreatedDomainEvent(Guid PostId, string Title, string Slug, Guid CategoryId) : DomainEvent;

/// <summary>
/// Blog yazısı güncellendi event'i
/// </summary>
public sealed record BlogPostUpdatedDomainEvent(Guid PostId, string Title, string Slug) : DomainEvent;

/// <summary>
/// Blog yazısı yayınlandı event'i
/// </summary>
public sealed record BlogPostPublishedDomainEvent(Guid PostId, string Title, string Slug) : DomainEvent;

/// <summary>
/// Blog yazısı yayından kaldırıldı event'i
/// </summary>
public sealed record BlogPostUnpublishedDomainEvent(Guid PostId, string Title) : DomainEvent;

/// <summary>
/// Blog yazısı zamanlandı event'i
/// </summary>
public sealed record BlogPostScheduledDomainEvent(Guid PostId, string Title, DateTime ScheduledDate) : DomainEvent;

/// <summary>
/// Blog yazısı arşivlendi event'i
/// </summary>
public sealed record BlogPostArchivedDomainEvent(Guid PostId, string Title) : DomainEvent;

/// <summary>
/// Blog yazısı silindi event'i
/// </summary>
public sealed record BlogPostDeletedDomainEvent(Guid PostId, string Title) : DomainEvent;

/// <summary>
/// Blog kategorisi oluşturuldu event'i
/// </summary>
public sealed record BlogCategoryCreatedDomainEvent(Guid CategoryId, string Name, string Slug) : DomainEvent;

/// <summary>
/// Blog kategorisi güncellendi event'i
/// </summary>
public sealed record BlogCategoryUpdatedDomainEvent(Guid CategoryId, string Name, string Slug) : DomainEvent;

/// <summary>
/// Blog kategorisi silindi event'i
/// </summary>
public sealed record BlogCategoryDeletedDomainEvent(Guid CategoryId, string Name) : DomainEvent;
