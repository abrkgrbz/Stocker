namespace Stocker.SharedKernel.MultiTenancy;

public interface ITenantRequest
{
    Guid TenantId { get; set; }
}