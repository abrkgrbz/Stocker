using MediatR;
using Stocker.Application.DTOs.Company;
using Stocker.Application.Features.Companies.Commands.CreateCompany;
using Stocker.SharedKernel.Results;
using System.Text.Json.Serialization;

namespace Stocker.Application.Features.Companies.Commands.UpdateCompany;

public sealed record UpdateCompanyCommand : IRequest<Result<CompanyDto>>
{
    [JsonIgnore]
    public Guid Id { get; set; }
    
    [JsonIgnore]
    public Guid TenantId { get; set; }
    
    public string? Name { get; set; }
    public string? LegalName { get; set; }
    public string? TaxNumber { get; set; }
    public string? TaxOffice { get; set; }
    public string? TradeRegisterNumber { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Fax { get; set; }
    public AddressCommand? Address { get; set; }
    public string? Website { get; set; }
    public string? Sector { get; set; }
    public int? EmployeeCount { get; set; }
    public string? Currency { get; set; }
    public string? Timezone { get; set; }
}