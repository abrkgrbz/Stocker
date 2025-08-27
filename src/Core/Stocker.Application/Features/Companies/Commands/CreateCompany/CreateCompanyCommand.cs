using MediatR;
using Stocker.Application.DTOs.Company;
using Stocker.SharedKernel.Results;
using System.Text.Json.Serialization;

namespace Stocker.Application.Features.Companies.Commands.CreateCompany;

public sealed record CreateCompanyCommand : IRequest<Result<CompanyDto>>
{
    [JsonIgnore]
    public Guid TenantId { get; set; }
    
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string? LegalName { get; set; }
    public string? IdentityType { get; set; }
    public string? IdentityNumber { get; set; }
    public string? TaxNumber { get; set; }
    public string? TaxOffice { get; set; }
    public string? TradeRegisterNumber { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? Fax { get; set; }
    public AddressCommand Address { get; set; } = new();
    public string? Website { get; set; }
    public string? Sector { get; set; }
    public int? EmployeeCount { get; set; }
    public int? FoundedYear { get; set; }
    public DateTime? FoundedDate { get; set; }
    public string Currency { get; set; } = "TRY";
    public string? Timezone { get; set; }
}

public class AddressCommand
{
    public string Country { get; set; } = "Türkiye";
    public string City { get; set; } = string.Empty;
    public string District { get; set; } = string.Empty;
    public string? PostalCode { get; set; }
    public string AddressLine { get; set; } = string.Empty;
}