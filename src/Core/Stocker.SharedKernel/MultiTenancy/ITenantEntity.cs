namespace Stocker.SharedKernel.MultiTenancy;

public interface ITenantEntity
{
    Guid TenantId { get; }
}