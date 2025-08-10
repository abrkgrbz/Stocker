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
    public string? City { get; set; }
    public string? State { get; set; }
    public string? Country { get; set; }
    public string? PostalCode { get; set; }
    public decimal? AnnualRevenue { get; set; }
    public int? NumberOfEmployees { get; set; }
    public string? Description { get; set; }
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
    public string? City { get; set; }
    public string? State { get; set; }
    public string? Country { get; set; }
    public string? PostalCode { get; set; }
    public decimal? AnnualRevenue { get; set; }
    public int? NumberOfEmployees { get; set; }
    public string? Description { get; set; }
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
    public string? City { get; set; }
    public string? State { get; set; }
    public string? Country { get; set; }
    public string? PostalCode { get; set; }
    public decimal? AnnualRevenue { get; set; }
    public int? NumberOfEmployees { get; set; }
    public string? Description { get; set; }
}