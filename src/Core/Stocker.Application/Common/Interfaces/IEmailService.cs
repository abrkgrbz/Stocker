namespace Stocker.Application.Common.Interfaces;

public interface IEmailService
{
    Task SendAsync(EmailMessage message, CancellationToken cancellationToken = default);
    Task SendBulkAsync(IEnumerable<EmailMessage> messages, CancellationToken cancellationToken = default);
    
    // Specific email types
    Task SendEmailVerificationAsync(string email, string token, string userName, CancellationToken cancellationToken = default);
    Task SendTenantEmailVerificationAsync(string email, string code, string token, string userName, CancellationToken cancellationToken = default);
    Task SendPasswordResetAsync(string email, string token, string userName, CancellationToken cancellationToken = default);
    Task SendWelcomeEmailAsync(string email, string userName, string companyName, CancellationToken cancellationToken = default);
    Task SendInvitationEmailAsync(string email, string inviterName, string companyName, string inviteToken, CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends a user invitation email with activation link for setting up password.
    /// Used when admin creates a new user in the tenant.
    /// </summary>
    /// <param name="email">The email address of the invited user</param>
    /// <param name="userName">Full name of the invited user</param>
    /// <param name="inviterName">Name of the admin who sent the invitation</param>
    /// <param name="companyName">Company/Tenant name</param>
    /// <param name="activationToken">URL-safe token for account activation</param>
    /// <param name="userId">The user's ID for the activation link</param>
    /// <param name="tenantId">The tenant's ID for context</param>
    Task SendUserInvitationEmailAsync(
        string email,
        string userName,
        string inviterName,
        string companyName,
        string activationToken,
        Guid userId,
        Guid tenantId,
        CancellationToken cancellationToken = default);

    Task<bool> IsEmailServiceAvailable();
}

public class EmailMessage
{
    public string To { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public bool IsHtml { get; set; } = true;
    public List<string> Cc { get; set; } = new();
    public List<string> Bcc { get; set; } = new();
    public Dictionary<string, byte[]> Attachments { get; set; } = new();
}

public class EmailTemplate
{
    public string Subject { get; set; } = string.Empty;
    public string HtmlBody { get; set; } = string.Empty;
    public string PlainTextBody { get; set; } = string.Empty;
}