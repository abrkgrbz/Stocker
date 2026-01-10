using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.CRM.Domain.Events;

#region Contact Events

/// <summary>
/// Raised when a contact is created
/// </summary>
public sealed record ContactCreatedDomainEvent(
    Guid ContactId,
    Guid TenantId,
    Guid CustomerId,
    string FullName,
    string Email,
    bool IsPrimary) : DomainEvent;

/// <summary>
/// Raised when contact information is updated
/// </summary>
public sealed record ContactUpdatedDomainEvent(
    Guid ContactId,
    Guid TenantId,
    string FullName,
    string Email) : DomainEvent;

/// <summary>
/// Raised when a contact is marked as primary
/// </summary>
public sealed record ContactMarkedAsPrimaryDomainEvent(
    Guid ContactId,
    Guid TenantId,
    Guid CustomerId) : DomainEvent;

/// <summary>
/// Raised when a contact is deactivated
/// </summary>
public sealed record ContactDeactivatedDomainEvent(
    Guid ContactId,
    Guid TenantId,
    string FullName) : DomainEvent;

#endregion

#region Pipeline Events

/// <summary>
/// Raised when a pipeline is created
/// </summary>
public sealed record PipelineCreatedDomainEvent(
    Guid PipelineId,
    Guid TenantId,
    string Name,
    int StageCount) : DomainEvent;

/// <summary>
/// Raised when a pipeline stage is added
/// </summary>
public sealed record PipelineStageAddedDomainEvent(
    Guid PipelineId,
    Guid TenantId,
    Guid StageId,
    string StageName,
    int Order) : DomainEvent;

/// <summary>
/// Raised when pipeline stages are reordered
/// </summary>
public sealed record PipelineStagesReorderedDomainEvent(
    Guid PipelineId,
    Guid TenantId) : DomainEvent;

#endregion
