namespace Stocker.SharedKernel.Exceptions;

public class TenantNotFoundException : Exception
{
    public TenantNotFoundException(string identifier)
        : base($"Tenant with identifier '{identifier}' was not found.")
    {
        Identifier = identifier;
    }

    public TenantNotFoundException(Guid tenantId)
        : base($"Tenant with id '{tenantId}' was not found.")
    {
        TenantId = tenantId;
    }

    public string? Identifier { get; }
    public Guid? TenantId { get; }
}