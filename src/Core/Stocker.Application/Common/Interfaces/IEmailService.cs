namespace Stocker.Application.Common.Interfaces;

public interface IEmailService
{
    Task SendAsync(EmailMessage message, CancellationToken cancellationToken = default);
    Task SendBulkAsync(IEnumerable<EmailMessage> messages, CancellationToken cancellationToken = default);
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