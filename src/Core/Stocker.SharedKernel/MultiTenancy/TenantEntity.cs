using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Primitives;

namespace Stocker.SharedKernel.MultiTenancy;

public abstract class TenantEntity : Entity, ITenantEntity, ISoftDeletable
{
    public Guid TenantId { get; private set; }

    /// <summary>
    /// Indicates whether the entity has been soft deleted
    /// </summary>
    public bool IsDeleted { get; private set; }

    /// <summary>
    /// The UTC date and time when the entity was deleted
    /// </summary>
    public DateTime? DeletedAt { get; private set; }

    /// <summary>
    /// The user who deleted the entity
    /// </summary>
    public string? DeletedBy { get; private set; }

    protected TenantEntity()
    {
        IsDeleted = false;
    }

    protected TenantEntity(Guid id, Guid tenantId) : base(id)
    {
        TenantId = tenantId;
        IsDeleted = false;
    }

    protected void SetTenantId(Guid tenantId)
    {
        TenantId = tenantId;
    }

    /// <summary>
    /// Marks the entity as soft deleted
    /// </summary>
    public void MarkAsDeleted(string? deletedBy = null)
    {
        IsDeleted = true;
        DeletedAt = DateTime.UtcNow;
        DeletedBy = deletedBy;
    }

    /// <summary>
    /// Restores a soft-deleted entity
    /// </summary>
    public void Restore()
    {
        IsDeleted = false;
        DeletedAt = null;
        DeletedBy = null;
    }
}

public abstract class TenantEntity<TId> : Entity<TId>, ITenantEntity, ISoftDeletable
    where TId : notnull
{
    public Guid TenantId { get; private set; }

    /// <summary>
    /// Indicates whether the entity has been soft deleted
    /// </summary>
    public bool IsDeleted { get; private set; }

    /// <summary>
    /// The UTC date and time when the entity was deleted
    /// </summary>
    public DateTime? DeletedAt { get; private set; }

    /// <summary>
    /// The user who deleted the entity
    /// </summary>
    public string? DeletedBy { get; private set; }

    protected TenantEntity()
    {
        IsDeleted = false;
    }

    protected TenantEntity(TId id, Guid tenantId) : base(id)
    {
        TenantId = tenantId;
        IsDeleted = false;
    }

    protected void SetTenantId(Guid tenantId)
    {
        TenantId = tenantId;
    }

    /// <summary>
    /// Marks the entity as soft deleted
    /// </summary>
    public void MarkAsDeleted(string? deletedBy = null)
    {
        IsDeleted = true;
        DeletedAt = DateTime.UtcNow;
        DeletedBy = deletedBy;
    }

    /// <summary>
    /// Restores a soft-deleted entity
    /// </summary>
    public void Restore()
    {
        IsDeleted = false;
        DeletedAt = null;
        DeletedBy = null;
    }
}
