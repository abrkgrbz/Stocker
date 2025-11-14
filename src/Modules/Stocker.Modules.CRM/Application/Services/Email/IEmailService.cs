namespace Stocker.Modules.CRM.Application.Services.Email;

/// <summary>
/// Email sending service interface
/// </summary>
public interface IEmailService
{
    /// <summary>
    /// Send an email message
    /// </summary>
    Task<EmailSendResult> SendEmailAsync(EmailMessage message, CancellationToken cancellationToken = default);

    /// <summary>
    /// Send an email with template
    /// </summary>
    Task<EmailSendResult> SendTemplatedEmailAsync(
        string to,
        string subject,
        string templateName,
        object templateData,
        CancellationToken cancellationToken = default);
}

/// <summary>
/// Email message model
/// </summary>
public record EmailMessage(
    string To,
    string Subject,
    string Body,
    bool IsHtml = true,
    string? FromName = null,
    List<string>? Cc = null,
    List<string>? Bcc = null,
    Dictionary<string, byte[]>? Attachments = null
);

/// <summary>
/// Email send result
/// </summary>
public record EmailSendResult(
    bool IsSuccess,
    string? ErrorMessage = null,
    DateTime? SentAt = null
)
{
    public static EmailSendResult Success() => new(true, null, DateTime.UtcNow);
    public static EmailSendResult Failure(string errorMessage) => new(false, errorMessage);
}
