using Stocker.Domain.Master.Enums.CMS;
using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Master.Events.CMS;

/// <summary>
/// Doküman öğesi oluşturuldu event'i
/// </summary>
public sealed record DocItemCreatedDomainEvent(Guid DocItemId, string Title, DocItemType Type, Guid? ParentId) : DomainEvent;

/// <summary>
/// Doküman öğesi güncellendi event'i
/// </summary>
public sealed record DocItemUpdatedDomainEvent(Guid DocItemId, string Title) : DomainEvent;

/// <summary>
/// Doküman öğesi taşındı event'i
/// </summary>
public sealed record DocItemMovedDomainEvent(Guid DocItemId, Guid? OldParentId, Guid? NewParentId) : DomainEvent;

/// <summary>
/// Doküman öğesi silindi event'i
/// </summary>
public sealed record DocItemDeletedDomainEvent(Guid DocItemId, string Title, DocItemType Type) : DomainEvent;
