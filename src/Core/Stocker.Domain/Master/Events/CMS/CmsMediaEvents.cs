using Stocker.Domain.Master.Enums.CMS;
using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Master.Events.CMS;

/// <summary>
/// Medya dosyası yüklendi event'i
/// </summary>
public sealed record CmsMediaUploadedDomainEvent(Guid MediaId, string FileName, MediaType Type, long Size) : DomainEvent;

/// <summary>
/// Medya dosyası silindi event'i
/// </summary>
public sealed record CmsMediaDeletedDomainEvent(Guid MediaId, string FileName, string FilePath) : DomainEvent;

/// <summary>
/// Medya dosyası meta bilgisi güncellendi event'i
/// </summary>
public sealed record CmsMediaMetadataUpdatedDomainEvent(Guid MediaId, string? AltText, string? Title) : DomainEvent;
