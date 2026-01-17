using Stocker.Modules.CRM.Domain.Enums;

namespace Stocker.Modules.CRM.Application.DTOs;

/// <summary>
/// Data transfer object for Lead entity
/// </summary>
public class LeadDto
{
    public Guid Id { get; set; }
    public string? CompanyName { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? MobilePhone { get; set; }
    public string? JobTitle { get; set; }
    public string? Industry { get; set; }
    public string? Source { get; set; }
    public LeadStatus Status { get; set; }
    public LeadRating Rating { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? Country { get; set; }
    public string? PostalCode { get; set; }
    public string? Website { get; set; }
    public decimal? AnnualRevenue { get; set; }
    public int? NumberOfEmployees { get; set; }
    public string? Description { get; set; }
    public Guid? AssignedToUserId { get; set; }
    public string? AssignedToName { get; set; }
    public DateTime? ConvertedDate { get; set; }
    public Guid? ConvertedToCustomerId { get; set; }
    public bool IsConverted { get; set; }
    public int Score { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public List<ActivityDto>? Activities { get; set; }
    public List<NoteDto>? Notes { get; set; }
    // KVKK Consent Fields
    public bool KvkkDataProcessingConsent { get; set; }
    public bool KvkkMarketingConsent { get; set; }
    public bool KvkkCommunicationConsent { get; set; }
    public DateTime? KvkkConsentDate { get; set; }
}

/// <summary>
/// DTO for creating a lead
/// </summary>
public class CreateLeadDto
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? CompanyName { get; set; }
    public string? Phone { get; set; }
    public string? MobilePhone { get; set; }
    public string? JobTitle { get; set; }
    public string? Industry { get; set; }
    public string? Source { get; set; }
    public LeadStatus Status { get; set; } = LeadStatus.New;
    public LeadRating Rating { get; set; } = LeadRating.Unrated;
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? Country { get; set; }
    public string? PostalCode { get; set; }
    public string? Website { get; set; }
    public decimal? AnnualRevenue { get; set; }
    public int? NumberOfEmployees { get; set; }
    public string? Description { get; set; }
    public Guid? AssignedToUserId { get; set; }
    public int Score { get; set; } = 50;
    // KVKK Consent Fields
    public bool KvkkDataProcessingConsent { get; set; }
    public bool KvkkMarketingConsent { get; set; }
    public bool KvkkCommunicationConsent { get; set; }
}

/// <summary>
/// DTO for updating a lead
/// </summary>
public class UpdateLeadDto
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? CompanyName { get; set; }
    public string? Phone { get; set; }
    public string? MobilePhone { get; set; }
    public string? JobTitle { get; set; }
    public string? Industry { get; set; }
    public string? Source { get; set; }
    public LeadStatus Status { get; set; }
    public LeadRating Rating { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? Country { get; set; }
    public string? PostalCode { get; set; }
    public string? Website { get; set; }
    public decimal? AnnualRevenue { get; set; }
    public int? NumberOfEmployees { get; set; }
    public string? Description { get; set; }
    public Guid? AssignedToUserId { get; set; }
    public int Score { get; set; }
    // KVKK Consent Fields
    public bool KvkkDataProcessingConsent { get; set; }
    public bool KvkkMarketingConsent { get; set; }
    public bool KvkkCommunicationConsent { get; set; }
}