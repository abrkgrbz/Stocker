using MediatR;
using Stocker.SharedKernel.Results;
using Stocker.Application.DTOs.TenantRegistration;

namespace Stocker.Application.Features.TenantRegistration.Commands.CreateTenantRegistration;

public sealed class CreateTenantRegistrationCommand : IRequest<Result<TenantRegistrationDto>>
{
    // Company Information
    public string CompanyName { get; set; } = string.Empty;
    public string CompanyCode { get; set; } = string.Empty;
    public string? TaxNumber { get; set; }
    public string? TaxOffice { get; set; }
    public string? TradeRegistryNumber { get; set; }
    public string? MersisNumber { get; set; }
    
    // Contact Information
    public string ContactEmail { get; set; } = string.Empty;
    public string ContactPhone { get; set; } = string.Empty;
    public string? ContactFax { get; set; }
    public string? Website { get; set; }
    
    // Address
    public string? AddressLine1 { get; set; }
    public string? AddressLine2 { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? Country { get; set; }
    public string? PostalCode { get; set; }
    
    // Business Information
    public string? IndustryType { get; set; }
    public string? BusinessType { get; set; }
    public string? EmployeeCountRange { get; set; }
    public string? Currency { get; set; }
    
    // Admin User Information
    public string AdminEmail { get; set; } = string.Empty;
    public string AdminUsername { get; set; } = string.Empty;
    public string AdminFirstName { get; set; } = string.Empty;
    public string AdminLastName { get; set; } = string.Empty;
    public string? AdminPhone { get; set; }
    public string? AdminTitle { get; set; }
    public string AdminPassword { get; set; } = string.Empty;
    
    // Package & Subscription
    public Guid? PackageId { get; set; }
    public string BillingCycle { get; set; } = "Monthly";
    
    // Preferences
    public string PreferredLanguage { get; set; } = "tr-TR";
    public string PreferredTimeZone { get; set; } = "Turkey Standard Time";
    public bool AcceptTerms { get; set; }
    public bool AcceptPrivacyPolicy { get; set; }
    public bool AllowMarketing { get; set; }
    
    // Security
    public string? CaptchaToken { get; set; }
}