using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Modules.CRM.Domain.Entities;

public class CustomerTag : TenantEntity
{
    public Guid CustomerId { get; private set; }
    public string Tag { get; private set; }
    public string? Color { get; private set; }
    public Guid CreatedBy { get; private set; }

    public Customer? Customer { get; private set; }

    protected CustomerTag() : base() { }

    public CustomerTag(
        Guid tenantId,
        Guid customerId,
        string tag,
        Guid createdBy,
        string? color = null) : base(Guid.NewGuid(), tenantId)
    {
        if (string.IsNullOrWhiteSpace(tag))
            throw new ArgumentException("Tag cannot be empty", nameof(tag));

        CustomerId = customerId;
        Tag = tag.Trim();
        Color = color;
        CreatedBy = createdBy;
    }

    public void UpdateTag(string tag, string? color = null)
    {
        if (string.IsNullOrWhiteSpace(tag))
            throw new ArgumentException("Tag cannot be empty", nameof(tag));

        Tag = tag.Trim();
        if (color != null)
            Color = color;
    }
}
