using Stocker.Domain.Common.ValueObjects;
using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Master.Entities;

/// <summary>
/// Tracks invited user emails in master database for efficient email lookup during login.
/// When a user is invited to a tenant, their email is registered here.
/// This allows check-email to find invited users without scanning all tenant databases.
/// </summary>
public sealed class TenantUserEmail : Entity
{
    public Email Email { get; private set; } = null!;
    public Guid TenantId { get; private set; }
    public Guid TenantUserId { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public bool IsActivated { get; private set; }
    public DateTime? ActivatedAt { get; private set; }

    // Navigation property
    public Tenant Tenant { get; private set; } = null!;

    private TenantUserEmail() { } // EF Core

    public static TenantUserEmail Create(
        Email email,
        Guid tenantId,
        Guid tenantUserId)
    {
        return new TenantUserEmail
        {
            Id = Guid.NewGuid(),
            Email = email,
            TenantId = tenantId,
            TenantUserId = tenantUserId,
            CreatedAt = DateTime.UtcNow,
            IsActivated = false
        };
    }

    public void MarkAsActivated()
    {
        IsActivated = true;
        ActivatedAt = DateTime.UtcNow;
    }
}
