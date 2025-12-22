using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Master.Entities;

/// <summary>
/// Email template entity with Liquid template support.
/// System templates (TenantId = null) are stored in Master DB.
/// Tenant-specific templates are stored in Tenant DB.
/// </summary>
public sealed class EmailTemplate : AggregateRoot
{
    /// <summary>
    /// Tenant ID - null for system-wide templates
    /// </summary>
    public Guid? TenantId { get; private set; }

    /// <summary>
    /// Unique key for the template (e.g., "user-invitation", "email-verification")
    /// </summary>
    public string TemplateKey { get; private set; }

    /// <summary>
    /// Template name for display
    /// </summary>
    public string Name { get; private set; }

    /// <summary>
    /// Template description
    /// </summary>
    public string? Description { get; private set; }

    /// <summary>
    /// Email subject line (supports Liquid variables)
    /// </summary>
    public string Subject { get; private set; }

    /// <summary>
    /// HTML body with Liquid template syntax
    /// </summary>
    public string HtmlBody { get; private set; }

    /// <summary>
    /// Plain text body (optional, for email clients that don't support HTML)
    /// </summary>
    public string? PlainTextBody { get; private set; }

    /// <summary>
    /// Language code (e.g., "tr", "en")
    /// </summary>
    public string Language { get; private set; }

    /// <summary>
    /// Template category for organization
    /// </summary>
    public EmailTemplateCategory Category { get; private set; }

    /// <summary>
    /// Available variables in this template (JSON array)
    /// Example: ["userName", "companyName", "activationUrl"]
    /// </summary>
    public string Variables { get; private set; }

    /// <summary>
    /// Sample data for preview (JSON object)
    /// </summary>
    public string? SampleData { get; private set; }

    /// <summary>
    /// Whether this template is active
    /// </summary>
    public bool IsActive { get; private set; }

    /// <summary>
    /// Whether this is a system template (cannot be deleted)
    /// </summary>
    public bool IsSystem { get; private set; }

    /// <summary>
    /// Template version for tracking changes
    /// </summary>
    public int Version { get; private set; }

    /// <summary>
    /// Created timestamp
    /// </summary>
    public DateTime CreatedAt { get; private set; }

    /// <summary>
    /// Last updated timestamp
    /// </summary>
    public DateTime? UpdatedAt { get; private set; }

    /// <summary>
    /// Created by user
    /// </summary>
    public string? CreatedBy { get; private set; }

    /// <summary>
    /// Updated by user
    /// </summary>
    public string? UpdatedBy { get; private set; }

    private EmailTemplate() { } // EF Constructor

    private EmailTemplate(
        Guid? tenantId,
        string templateKey,
        string name,
        string subject,
        string htmlBody,
        string language,
        EmailTemplateCategory category,
        string variables,
        bool isSystem,
        string? description = null,
        string? plainTextBody = null,
        string? sampleData = null)
    {
        Id = Guid.NewGuid();
        TenantId = tenantId;
        TemplateKey = templateKey;
        Name = name;
        Subject = subject;
        HtmlBody = htmlBody;
        Language = language;
        Category = category;
        Variables = variables;
        IsSystem = isSystem;
        Description = description;
        PlainTextBody = plainTextBody;
        SampleData = sampleData;
        IsActive = true;
        Version = 1;
        CreatedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Creates a new system email template (available to all tenants)
    /// </summary>
    public static EmailTemplate CreateSystem(
        string templateKey,
        string name,
        string subject,
        string htmlBody,
        string language,
        EmailTemplateCategory category,
        string variables,
        string? description = null,
        string? plainTextBody = null,
        string? sampleData = null)
    {
        ValidateTemplateKey(templateKey);
        ValidateName(name);
        ValidateSubject(subject);
        ValidateHtmlBody(htmlBody);
        ValidateLanguage(language);

        return new EmailTemplate(
            tenantId: null,
            templateKey: templateKey,
            name: name,
            subject: subject,
            htmlBody: htmlBody,
            language: language,
            category: category,
            variables: variables,
            isSystem: true,
            description: description,
            plainTextBody: plainTextBody,
            sampleData: sampleData);
    }

    /// <summary>
    /// Creates a tenant-specific email template (overrides system template)
    /// </summary>
    public static EmailTemplate CreateForTenant(
        Guid tenantId,
        string templateKey,
        string name,
        string subject,
        string htmlBody,
        string language,
        EmailTemplateCategory category,
        string variables,
        string? description = null,
        string? plainTextBody = null,
        string? sampleData = null)
    {
        ValidateTemplateKey(templateKey);
        ValidateName(name);
        ValidateSubject(subject);
        ValidateHtmlBody(htmlBody);
        ValidateLanguage(language);

        return new EmailTemplate(
            tenantId: tenantId,
            templateKey: templateKey,
            name: name,
            subject: subject,
            htmlBody: htmlBody,
            language: language,
            category: category,
            variables: variables,
            isSystem: false,
            description: description,
            plainTextBody: plainTextBody,
            sampleData: sampleData);
    }

    /// <summary>
    /// Updates the template content
    /// </summary>
    public void UpdateContent(
        string name,
        string subject,
        string htmlBody,
        string? description = null,
        string? plainTextBody = null,
        string? updatedBy = null)
    {
        ValidateName(name);
        ValidateSubject(subject);
        ValidateHtmlBody(htmlBody);

        Name = name;
        Subject = subject;
        HtmlBody = htmlBody;
        Description = description;
        PlainTextBody = plainTextBody;
        UpdatedBy = updatedBy;
        UpdatedAt = DateTime.UtcNow;
        Version++;
    }

    /// <summary>
    /// Updates the template variables
    /// </summary>
    public void UpdateVariables(string variables, string? sampleData = null)
    {
        Variables = variables ?? "[]";
        SampleData = sampleData;
        UpdatedAt = DateTime.UtcNow;
        Version++;
    }

    /// <summary>
    /// Activates the template
    /// </summary>
    public void Activate()
    {
        if (IsActive)
            return;

        IsActive = true;
        UpdatedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Deactivates the template
    /// </summary>
    public void Deactivate()
    {
        if (!IsActive)
            return;

        if (IsSystem)
            throw new InvalidOperationException("System templates cannot be deactivated.");

        IsActive = false;
        UpdatedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Changes the template language
    /// </summary>
    public void ChangeLanguage(string language)
    {
        ValidateLanguage(language);
        Language = language;
        UpdatedAt = DateTime.UtcNow;
    }

    private static void ValidateTemplateKey(string templateKey)
    {
        if (string.IsNullOrWhiteSpace(templateKey))
            throw new ArgumentException("Template key cannot be empty.", nameof(templateKey));

        if (templateKey.Length > 100)
            throw new ArgumentException("Template key cannot exceed 100 characters.", nameof(templateKey));
    }

    private static void ValidateName(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Template name cannot be empty.", nameof(name));

        if (name.Length > 200)
            throw new ArgumentException("Template name cannot exceed 200 characters.", nameof(name));
    }

    private static void ValidateSubject(string subject)
    {
        if (string.IsNullOrWhiteSpace(subject))
            throw new ArgumentException("Email subject cannot be empty.", nameof(subject));

        if (subject.Length > 500)
            throw new ArgumentException("Email subject cannot exceed 500 characters.", nameof(subject));
    }

    private static void ValidateHtmlBody(string htmlBody)
    {
        if (string.IsNullOrWhiteSpace(htmlBody))
            throw new ArgumentException("HTML body cannot be empty.", nameof(htmlBody));
    }

    private static void ValidateLanguage(string language)
    {
        if (string.IsNullOrWhiteSpace(language))
            throw new ArgumentException("Language cannot be empty.", nameof(language));

        if (language.Length > 10)
            throw new ArgumentException("Language code cannot exceed 10 characters.", nameof(language));
    }
}

/// <summary>
/// Email template categories for organization
/// </summary>
public enum EmailTemplateCategory
{
    /// <summary>
    /// Authentication related emails (login, password reset, etc.)
    /// </summary>
    Authentication = 0,

    /// <summary>
    /// User management emails (invitation, welcome, etc.)
    /// </summary>
    UserManagement = 1,

    /// <summary>
    /// Notification emails (alerts, reminders, etc.)
    /// </summary>
    Notification = 2,

    /// <summary>
    /// Transaction emails (invoices, receipts, etc.)
    /// </summary>
    Transaction = 3,

    /// <summary>
    /// Marketing emails (campaigns, newsletters, etc.)
    /// </summary>
    Marketing = 4,

    /// <summary>
    /// CRM related emails (deal won, lead assigned, etc.)
    /// </summary>
    CRM = 5,

    /// <summary>
    /// System emails (maintenance, updates, etc.)
    /// </summary>
    System = 6
}
