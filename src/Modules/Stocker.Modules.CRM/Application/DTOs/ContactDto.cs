namespace Stocker.Modules.CRM.Application.DTOs;

/// <summary>
/// Data transfer object for Contact entity
/// </summary>
public class ContactDto
{
    public Guid Id { get; set; }
    public Guid CustomerId { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? MobilePhone { get; set; }
    public string? JobTitle { get; set; }
    public string? Department { get; set; }
    public bool IsPrimary { get; set; }
    public bool IsActive { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

/// <summary>
/// DTO for creating a contact
/// </summary>
public class CreateContactDto
{
    public Guid CustomerId { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? MobilePhone { get; set; }
    public string? JobTitle { get; set; }
    public string? Department { get; set; }
    public bool IsPrimary { get; set; }
    public string? Notes { get; set; }
}

/// <summary>
/// DTO for updating a contact
/// </summary>
public class UpdateContactDto
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? MobilePhone { get; set; }
    public string? JobTitle { get; set; }
    public string? Department { get; set; }
    public bool IsPrimary { get; set; }
    public string? Notes { get; set; }
}