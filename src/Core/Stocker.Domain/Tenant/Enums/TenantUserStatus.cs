namespace Stocker.Domain.Tenant.Enums;

public enum TenantUserStatus
{
    Active = 0,
    Inactive = 1,
    Suspended = 2,
    OnLeave = 3,
    Terminated = 4,
    /// <summary>
    /// User has been invited but hasn't set up their password yet.
    /// Account is created but not fully activated.
    /// </summary>
    PendingActivation = 5
}