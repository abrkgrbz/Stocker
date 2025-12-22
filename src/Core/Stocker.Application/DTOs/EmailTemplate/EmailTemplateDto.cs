namespace Stocker.Application.DTOs.EmailTemplate;

/// <summary>
/// DTO for EmailTemplate entity
/// </summary>
public class EmailTemplateDto
{
    public Guid Id { get; set; }
    public Guid? TenantId { get; set; }
    public string TemplateKey { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Subject { get; set; } = string.Empty;
    public string HtmlBody { get; set; } = string.Empty;
    public string? PlainTextBody { get; set; }
    public string Language { get; set; } = "tr";
    public string Category { get; set; } = string.Empty;
    public List<string> Variables { get; set; } = new();
    public string? SampleData { get; set; }
    public bool IsActive { get; set; }
    public bool IsSystem { get; set; }
    public int Version { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? CreatedBy { get; set; }
    public string? UpdatedBy { get; set; }
}

/// <summary>
/// DTO for creating a new email template
/// </summary>
public class CreateEmailTemplateDto
{
    public string TemplateKey { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Subject { get; set; } = string.Empty;
    public string HtmlBody { get; set; } = string.Empty;
    public string? PlainTextBody { get; set; }
    public string Language { get; set; } = "tr";
    public string Category { get; set; } = "Authentication";
    public List<string> Variables { get; set; } = new();
    public string? SampleData { get; set; }
}

/// <summary>
/// DTO for updating an email template
/// </summary>
public class UpdateEmailTemplateDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Subject { get; set; } = string.Empty;
    public string HtmlBody { get; set; } = string.Empty;
    public string? PlainTextBody { get; set; }
    public List<string>? Variables { get; set; }
    public string? SampleData { get; set; }
}

/// <summary>
/// DTO for email template list with pagination
/// </summary>
public class EmailTemplateListDto
{
    public List<EmailTemplateDto> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
}

/// <summary>
/// DTO for template preview
/// </summary>
public class EmailTemplatePreviewDto
{
    public string Subject { get; set; } = string.Empty;
    public string HtmlBody { get; set; } = string.Empty;
    public string? PlainTextBody { get; set; }
    public bool IsSuccess { get; set; }
    public string? ErrorMessage { get; set; }
}

/// <summary>
/// DTO for template validation result
/// </summary>
public class EmailTemplateValidationDto
{
    public bool IsValid { get; set; }
    public List<string> Errors { get; set; } = new();
    public List<string> ExtractedVariables { get; set; } = new();
}
