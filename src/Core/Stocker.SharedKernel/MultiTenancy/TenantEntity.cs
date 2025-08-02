using Stocker.SharedKernel.Primitives;

namespace Stocker.SharedKernel.MultiTenancy;

public abstract class TenantEntity : Entity, ITenantEntity
{
    public Guid TenantId { get; private set; }

    protected TenantEntity()
    {
    }

    protected TenantEntity(Guid id, Guid tenantId) : base(id)
    {
        TenantId = tenantId;
    }

    protected void SetTenantId(Guid tenantId)
    {
        TenantId = tenantId;
    }
}

public abstract class TenantEntity<TId> : Entity<TId>, ITenantEntity
    where TId : notnull
{
    public Guid TenantId { get; private set; }

    protected TenantEntity()
    {
    }

    protected TenantEntity(TId id, Guid tenantId) : base(id)
    {
        TenantId = tenantId;
    }

    protected void SetTenantId(Guid tenantId)
    {
        TenantId = tenantId;
    }
}