namespace Stocker.Domain.Master.Enums;

public enum UserType
{
    SystemAdmin = 0,    // Can manage all tenants and system settings
    TenantOwner = 1,    // Owns one or more tenants
    Support = 2,         // Support staff with limited access
    Regular=3,
    TenantAdmin = 4, // Admin for a specific tenant
}