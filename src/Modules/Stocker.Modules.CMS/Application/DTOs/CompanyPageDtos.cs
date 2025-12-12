namespace Stocker.Modules.CMS.Application.DTOs;

// ==================== TeamMember DTOs ====================
public record TeamMemberDto(
    Guid Id,
    string Name,
    string? Role,
    string? Department,
    string? Bio,
    string? Avatar,
    string? Email,
    string? LinkedIn,
    string? Twitter,
    int SortOrder,
    bool IsActive,
    bool IsLeadership,
    DateTime CreatedAt
);

public record CreateTeamMemberDto(
    string Name,
    string? Role = null,
    string? Department = null,
    string? Bio = null,
    string? Avatar = null,
    string? Email = null,
    string? LinkedIn = null,
    string? Twitter = null,
    int SortOrder = 0,
    bool IsActive = true,
    bool IsLeadership = false
);

public record UpdateTeamMemberDto(
    string Name,
    string? Role,
    string? Department,
    string? Bio,
    string? Avatar,
    string? Email,
    string? LinkedIn,
    string? Twitter,
    int SortOrder,
    bool IsActive,
    bool IsLeadership
);

// ==================== CompanyValue DTOs ====================
public record CompanyValueDto(
    Guid Id,
    string Title,
    string? Description,
    string? Icon,
    string? IconColor,
    int SortOrder,
    bool IsActive,
    DateTime CreatedAt
);

public record CreateCompanyValueDto(
    string Title,
    string? Description = null,
    string? Icon = null,
    string? IconColor = null,
    int SortOrder = 0,
    bool IsActive = true
);

public record UpdateCompanyValueDto(
    string Title,
    string? Description,
    string? Icon,
    string? IconColor,
    int SortOrder,
    bool IsActive
);

// ==================== ContactInfo DTOs ====================
public record ContactInfoDto(
    Guid Id,
    string Type,
    string Title,
    string Value,
    string? Icon,
    string? IconColor,
    string? Href,
    string? AdditionalInfo,
    int SortOrder,
    bool IsActive,
    DateTime CreatedAt
);

public record CreateContactInfoDto(
    string Type,
    string Title,
    string Value,
    string? Icon = null,
    string? IconColor = null,
    string? Href = null,
    string? AdditionalInfo = null,
    int SortOrder = 0,
    bool IsActive = true
);

public record UpdateContactInfoDto(
    string Type,
    string Title,
    string Value,
    string? Icon,
    string? IconColor,
    string? Href,
    string? AdditionalInfo,
    int SortOrder,
    bool IsActive
);

// ==================== SocialLink DTOs ====================
public record SocialLinkDto(
    Guid Id,
    string Platform,
    string Url,
    string? Icon,
    string? Label,
    int SortOrder,
    bool IsActive,
    DateTime CreatedAt
);

public record CreateSocialLinkDto(
    string Platform,
    string Url,
    string? Icon = null,
    string? Label = null,
    int SortOrder = 0,
    bool IsActive = true
);

public record UpdateSocialLinkDto(
    string Platform,
    string Url,
    string? Icon,
    string? Label,
    int SortOrder,
    bool IsActive
);
