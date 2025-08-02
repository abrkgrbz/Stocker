namespace Stocker.SharedKernel.MultiTenancy;

public interface ITenantResolver
{
    Task<TenantInfo?> ResolveAsync(string identifier);
    Task<TenantInfo?> ResolveByIdAsync(Guid tenantId);
    Task<TenantInfo?> ResolveByDomainAsync(string domain);
    Task<TenantInfo?> ResolveByHeaderAsync(string headerValue);
}

public class TenantInfo
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Identifier { get; set; } = string.Empty;
    public string ConnectionString { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public Dictionary<string, string> Properties { get; set; } = new();
}