using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.CRM.Domain.Events;

#region Competitor Events

/// <summary>
/// Raised when a new competitor is created
/// </summary>
public sealed record CompetitorCreatedDomainEvent(
    Guid CompetitorId,
    Guid TenantId,
    string Name,
    string? Code,
    string ThreatLevel,
    int CreatedById) : DomainEvent;

/// <summary>
/// Raised when competitor information is updated
/// </summary>
public sealed record CompetitorUpdatedDomainEvent(
    Guid CompetitorId,
    Guid TenantId,
    string Name,
    string ThreatLevel,
    int UpdatedById) : DomainEvent;

/// <summary>
/// Raised when competitor threat level changes
/// </summary>
public sealed record CompetitorThreatLevelChangedDomainEvent(
    Guid CompetitorId,
    Guid TenantId,
    string Name,
    string OldThreatLevel,
    string NewThreatLevel,
    int ChangedById) : DomainEvent;

/// <summary>
/// Raised when a competitor product is added
/// </summary>
public sealed record CompetitorProductAddedDomainEvent(
    Guid CompetitorId,
    Guid TenantId,
    string CompetitorName,
    string ProductName,
    decimal? Price,
    int AddedById) : DomainEvent;

/// <summary>
/// Raised when a competitor strength is identified
/// </summary>
public sealed record CompetitorStrengthAddedDomainEvent(
    Guid CompetitorId,
    Guid TenantId,
    string CompetitorName,
    string Strength,
    string? Category,
    int AddedById) : DomainEvent;

/// <summary>
/// Raised when a competitor weakness is identified
/// </summary>
public sealed record CompetitorWeaknessAddedDomainEvent(
    Guid CompetitorId,
    Guid TenantId,
    string CompetitorName,
    string Weakness,
    string? Category,
    int AddedById) : DomainEvent;

/// <summary>
/// Raised when competitor market share is updated
/// </summary>
public sealed record CompetitorMarketShareUpdatedDomainEvent(
    Guid CompetitorId,
    Guid TenantId,
    string Name,
    decimal? OldMarketShare,
    decimal? NewMarketShare,
    int UpdatedById) : DomainEvent;

/// <summary>
/// Raised when competitor is linked to a deal/opportunity
/// </summary>
public sealed record CompetitorLinkedToDealDomainEvent(
    Guid CompetitorId,
    Guid TenantId,
    string CompetitorName,
    Guid DealId,
    string DealName,
    string Position,
    int LinkedById) : DomainEvent;

/// <summary>
/// Raised when competitor is deactivated
/// </summary>
public sealed record CompetitorDeactivatedDomainEvent(
    Guid CompetitorId,
    Guid TenantId,
    string Name,
    string? Reason,
    int DeactivatedById) : DomainEvent;

/// <summary>
/// Raised when competitor intelligence report is created
/// </summary>
public sealed record CompetitorIntelligenceReportCreatedDomainEvent(
    Guid CompetitorId,
    Guid TenantId,
    string CompetitorName,
    string ReportType,
    string? Summary,
    int CreatedById) : DomainEvent;

#endregion
