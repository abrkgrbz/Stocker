namespace Stocker.Application.Common.Enums;

/// <summary>
/// Defines the administrative levels in the system
/// </summary>
public enum AdminLevel
{
    /// <summary>
    /// Tenant-level administrator with access to their own tenant only
    /// </summary>
    TenantAdmin = 1,
    
    /// <summary>
    /// System-level administrator with access to all tenants and system features
    /// </summary>
    SystemAdmin = 2,
    
    /// <summary>
    /// Super administrator with full system access including critical operations
    /// </summary>
    SuperAdmin = 3
}