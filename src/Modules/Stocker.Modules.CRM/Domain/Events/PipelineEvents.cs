using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.CRM.Domain.Events;

#region Pipeline Events

/// <summary>
/// Raised when a pipeline is updated
/// </summary>
public sealed record PipelineUpdatedDomainEvent(
    Guid PipelineId,
    Guid TenantId,
    string Name,
    string? Description,
    int UpdatedById) : DomainEvent;

/// <summary>
/// Raised when a pipeline is set as default
/// </summary>
public sealed record PipelineSetAsDefaultDomainEvent(
    Guid PipelineId,
    Guid TenantId,
    string Name,
    Guid? PreviousDefaultPipelineId,
    int SetById) : DomainEvent;

/// <summary>
/// Raised when a pipeline is activated
/// </summary>
public sealed record PipelineActivatedDomainEvent(
    Guid PipelineId,
    Guid TenantId,
    string Name,
    int ActivatedById) : DomainEvent;

/// <summary>
/// Raised when a pipeline is deactivated
/// </summary>
public sealed record PipelineDeactivatedDomainEvent(
    Guid PipelineId,
    Guid TenantId,
    string Name,
    int DeactivatedById) : DomainEvent;

/// <summary>
/// Raised when a stage is updated
/// </summary>
public sealed record PipelineStageUpdatedDomainEvent(
    Guid PipelineId,
    Guid TenantId,
    Guid StageId,
    string StageName,
    decimal Probability,
    int UpdatedById) : DomainEvent;

/// <summary>
/// Raised when a stage is removed from pipeline
/// </summary>
public sealed record PipelineStageRemovedDomainEvent(
    Guid PipelineId,
    Guid TenantId,
    string PipelineName,
    Guid StageId,
    string StageName,
    int RemovedById) : DomainEvent;

/// <summary>
/// Raised when pipeline metrics are calculated
/// </summary>
public sealed record PipelineMetricsCalculatedDomainEvent(
    Guid PipelineId,
    Guid TenantId,
    string PipelineName,
    int TotalDeals,
    decimal TotalValue,
    decimal WeightedValue,
    decimal AverageAge) : DomainEvent;

#endregion
