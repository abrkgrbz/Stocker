using Stocker.SharedKernel.Primitives;

namespace Stocker.SharedKernel.MultiTenancy;

public abstract class TenantAggregateRoot : AggregateRoot, ITenantEntity
{
    public Guid TenantId { get; private set; }

    protected TenantAggregateRoot()
    {
    }

    protected TenantAggregateRoot(Guid id, Guid tenantId) : base(id)
    {
        TenantId = tenantId;
    }

    protected void SetTenantId(Guid tenantId)
    {
        TenantId = tenantId;
    }
}

public abstract class TenantAggregateRoot<TId> : AggregateRoot<TId>, ITenantEntity
    where TId : notnull
{
    public Guid TenantId { get; private set; }

    protected TenantAggregateRoot()
    {
    }

    protected TenantAggregateRoot(TId id, Guid tenantId) : base(id)
    {
        TenantId = tenantId;
    }

    protected void SetTenantId(Guid tenantId)
    {
        TenantId = tenantId;
    }
}