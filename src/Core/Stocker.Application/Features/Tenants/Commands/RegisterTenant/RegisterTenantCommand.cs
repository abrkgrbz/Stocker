using MediatR;
using Stocker.Application.DTOs.Tenant;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Tenants.Commands.RegisterTenant;

public class RegisterTenantCommand : IRequest<Result<TenantDto>>
{
    // Company Info
    public string CompanyName { get; set; } = string.Empty;
    public string CompanyCode { get; set; } = string.Empty;
    public string? Domain { get; set; }
    
    // Contact Info
    public string ContactName { get; set; } = string.Empty;
    public string ContactEmail { get; set; } = string.Empty;
    public string ContactPhone { get; set; } = string.Empty;
    
    // Address
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? Country { get; set; }
    
    // Account
    public string Password { get; set; } = string.Empty;
    
    // Package
    public string PackageId { get; set; } = string.Empty;
    public string BillingPeriod { get; set; } = "Monthly";
}