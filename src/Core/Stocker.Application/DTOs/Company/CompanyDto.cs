namespace Stocker.Application.DTOs.Company;

public class CompanyDto
{
    public Guid Id { get; set; }
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
    public AddressDto Address { get; set; } = new();
    public string? Website { get; set; }
    public string? LogoUrl { get; set; }
    public string? Sector { get; set; }
    public int? EmployeeCount { get; set; }
    public DateTime FoundedDate { get; set; }
    public string Currency { get; set; } = "TRY";
    public string? Timezone { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class AddressDto
{
    public string Country { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string District { get; set; } = string.Empty;
    public string? PostalCode { get; set; }
    public string AddressLine { get; set; } = string.Empty;
}