using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Master.Entities;

public sealed class TenantDomain : Entity
{
    public Guid TenantId { get; private set; }
    public string DomainName { get; private set; }
    public bool IsPrimary { get; private set; }
    public bool IsVerified { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? VerifiedAt { get; private set; }

    private TenantDomain() { } // EF Constructor

    private TenantDomain(Guid tenantId, string domainName, bool isPrimary = false)
    {
        Id = Guid.NewGuid();
        TenantId = tenantId;
        DomainName = domainName?.ToLowerInvariant() ?? throw new ArgumentNullException(nameof(domainName));
        IsPrimary = isPrimary;
        IsVerified = false;
        CreatedAt = DateTime.UtcNow;
    }

    public static TenantDomain Create(Guid tenantId, string domainName, bool isPrimary = false)
    {
        return new TenantDomain(tenantId, domainName, isPrimary);
    }

    public void Verify()
    {
        if (IsVerified)
        {
            throw new InvalidOperationException("Domain is already verified.");
        }

        IsVerified = true;
        VerifiedAt = DateTime.UtcNow;
    }

    public void SetAsPrimary(bool isPrimary)
    {
        IsPrimary = isPrimary;
    }
}