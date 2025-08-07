using Stocker.Application.DTOs.Tenant;

namespace Stocker.Application.DTOs;

public class TenantWithUrlDto : TenantDto
{
    public string SubdomainUrl { get; set; } = string.Empty;
    public string? CustomDomainUrl { get; set; }
    
    public static TenantWithUrlDto FromTenant(TenantDto tenant, string baseUrl = "stocker.local", int port = 5000)
    {
        var dto = new TenantWithUrlDto
        {
            Id = tenant.Id,
            Name = tenant.Name,
            Code = tenant.Code,
            Domain = tenant.Domain,
            IsActive = tenant.IsActive, 
            SubdomainUrl = $"http://{tenant.Code.ToLower()}.{baseUrl}:{port}"
        };

        if (!string.IsNullOrWhiteSpace(tenant.Domain))
        {
            dto.CustomDomainUrl = $"http://{tenant.Domain}";
        }

        return dto;
    }
}