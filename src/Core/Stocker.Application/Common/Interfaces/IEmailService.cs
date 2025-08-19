namespace Stocker.Application.Common.Interfaces;

public interface IEmailService
{
    Task SendAsync(EmailMessage message, CancellationToken cancellationToken = default);
    Task SendBulkAsync(IEnumerable<EmailMessage> messages, CancellationToken cancellationToken = default);
    
    // Specific email types
    Task SendEmailVerificationAsync(string email, string token, string userName, CancellationToken cancellationToken = default);
    Task SendPasswordResetAsync(string email, string token, string userName, CancellationToken cancellationToken = default);
    Task SendWelcomeEmailAsync(string email, string userName, string companyName, CancellationToken cancellationToken = default);
    Task SendInvitationEmailAsync(string email, string inviterName, string companyName, string inviteToken, CancellationToken cancellationToken = default);
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