namespace Stocker.Shared.Events.HR;

/// <summary>
/// Integration event published when a department is created in HR module.
/// Used for cross-module synchronization (HR → Tenant.Department)
/// </summary>
public sealed record HRDepartmentCreatedEvent : IntegrationEvent, ITenantEvent
{
    /// <summary>
    /// HR module department ID (int)
    /// </summary>
    public int HRDepartmentId { get; init; }

    /// <summary>
    /// Tenant ID for multi-tenancy
    /// </summary>
    public Guid TenantId { get; init; }

    /// <summary>
    /// Department code
    /// </summary>
    public string Code { get; init; } = string.Empty;

    /// <summary>
    /// Department name
    /// </summary>
    public string Name { get; init; } = string.Empty;

    /// <summary>
    /// Department description
    /// </summary>
    public string? Description { get; init; }
}

/// <summary>
/// Integration event published when a department is updated in HR module.
/// </summary>
public sealed record HRDepartmentUpdatedEvent : IntegrationEvent, ITenantEvent
{
    public int HRDepartmentId { get; init; }
    public Guid TenantId { get; init; }
    public Guid? TenantDepartmentId { get; init; }
    public string Code { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
}

/// <summary>
/// Integration event published when a department is deleted in HR module.
/// </summary>
public sealed record HRDepartmentDeletedEvent : IntegrationEvent, ITenantEvent
{
    public int HRDepartmentId { get; init; }
    public Guid TenantId { get; init; }
    public Guid? TenantDepartmentId { get; init; }
}
