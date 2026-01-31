using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Master.Events.CMS;

/// <summary>
/// CMS sayfa oluşturuldu event'i
/// </summary>
public sealed record CmsPageCreatedDomainEvent(Guid PageId, string Title, string Slug) : DomainEvent;

/// <summary>
/// CMS sayfa güncellendi event'i
/// </summary>
public sealed record CmsPageUpdatedDomainEvent(Guid PageId, string Title, string Slug) : DomainEvent;

/// <summary>
/// CMS sayfa yayınlandı event'i
/// </summary>
public sealed record CmsPagePublishedDomainEvent(Guid PageId, string Title, string Slug) : DomainEvent;

/// <summary>
/// CMS sayfa yayından kaldırıldı event'i
/// </summary>
public sealed record CmsPageUnpublishedDomainEvent(Guid PageId, string Title) : DomainEvent;

/// <summary>
/// CMS sayfa arşivlendi event'i
/// </summary>
public sealed record CmsPageArchivedDomainEvent(Guid PageId, string Title) : DomainEvent;

/// <summary>
/// CMS sayfa silindi event'i
/// </summary>
public sealed record CmsPageDeletedDomainEvent(Guid PageId, string Title) : DomainEvent;
