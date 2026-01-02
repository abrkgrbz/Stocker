using Stocker.Modules.CRM.Domain.Enums;

namespace Stocker.Modules.CRM.Application.DTOs;

/// <summary>
/// Data transfer object for Customer entity
/// </summary>
public class CustomerDto
{
    public Guid Id { get; set; }
    public string CompanyName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Website { get; set; }
    public string? Industry { get; set; }
    public string? Address { get; set; }

    // GeoLocation IDs (FK to Master DB)
    public Guid? CountryId { get; set; }
    public Guid? CityId { get; set; }
    public Guid? DistrictId { get; set; }

    // Denormalized location names
    public string? Country { get; set; }
    public string? City { get; set; }
    public string? District { get; set; }
    public string? State { get; set; }
    public string? PostalCode { get; set; }
    public decimal? AnnualRevenue { get; set; }
    public int? NumberOfEmployees { get; set; }
    public string? Description { get; set; }
    public CustomerType CustomerType { get; set; }
    public CustomerStatus Status { get; set; }
    public decimal CreditLimit { get; set; }
    public string? TaxId { get; set; }
    public string? PaymentTerms { get; set; }
    public string? ContactPerson { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public List<ContactDto> Contacts { get; set; } = new();
}

/// <summary>
/// DTO for creating a customer
/// </summary>
public class CreateCustomerDto
{
    public string CompanyName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Website { get; set; }
    public string? Industry { get; set; }
    public string? Address { get; set; }

    // GeoLocation IDs (FK to Master DB)
    public Guid? CountryId { get; set; }
    public Guid? CityId { get; set; }
    public Guid? DistrictId { get; set; }

    // Denormalized location names
    public string? Country { get; set; }
    public string? City { get; set; }
    public string? District { get; set; }
    public string? State { get; set; }
    public string? PostalCode { get; set; }
    public decimal? AnnualRevenue { get; set; }
    public int? NumberOfEmployees { get; set; }
    public string? Description { get; set; }
    public CustomerType? CustomerType { get; set; }
    public CustomerStatus? Status { get; set; }
    public decimal? CreditLimit { get; set; }
    public string? TaxId { get; set; }
    public string? PaymentTerms { get; set; }
    public string? ContactPerson { get; set; }
}

/// <summary>
/// DTO for updating a customer
/// </summary>
public class UpdateCustomerDto
{
    public string CompanyName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Website { get; set; }
    public string? Industry { get; set; }
    public string? Address { get; set; }

    // GeoLocation IDs (FK to Master DB)
    public Guid? CountryId { get; set; }
    public Guid? CityId { get; set; }
    public Guid? DistrictId { get; set; }

    // Denormalized location names
    public string? Country { get; set; }
    public string? City { get; set; }
    public string? District { get; set; }
    public string? State { get; set; }
    public string? PostalCode { get; set; }
    public decimal? AnnualRevenue { get; set; }
    public int? NumberOfEmployees { get; set; }
    public string? Description { get; set; }
    public CustomerType? CustomerType { get; set; }
    public CustomerStatus? Status { get; set; }
    public decimal? CreditLimit { get; set; }
    public string? TaxId { get; set; }
    public string? PaymentTerms { get; set; }
    public string? ContactPerson { get; set; }
}