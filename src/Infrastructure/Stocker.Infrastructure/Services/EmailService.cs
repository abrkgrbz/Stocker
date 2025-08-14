using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;

namespace Stocker.Infrastructure.Services;

public class EmailService : IEmailService
{
    private readonly ILogger<EmailService> _logger;

    public EmailService(ILogger<EmailService> logger)
    {
        _logger = logger;
    }

    public async Task SendAsync(EmailMessage message, CancellationToken cancellationToken = default)
    {
        // In production, this would use SMTP, SendGrid, AWS SES, etc.
        // For now, just log the email
        _logger.LogInformation("Sending email to {To}", message.To);
        _logger.LogInformation("Subject: {Subject}", message.Subject);
        _logger.LogInformation("Body: {Body}", message.Body);
        
        // Simulate email sending delay
        await Task.Delay(500, cancellationToken);
        
        _logger.LogInformation("Email sent successfully to {To}", message.To);
    }

    public async Task SendBulkAsync(IEnumerable<EmailMessage> messages, CancellationToken cancellationToken = default)
    {
        foreach (var message in messages)
        {
            await SendAsync(message, cancellationToken);
        }
    }
}

// Alternative implementation for development/testing
public class DevelopmentEmailService : IEmailService
{
    private readonly ILogger<DevelopmentEmailService> _logger;
    private readonly string _outputPath;

    public DevelopmentEmailService(ILogger<DevelopmentEmailService> logger)
    {
        _logger = logger;
        _outputPath = Path.Combine(Directory.GetCurrentDirectory(), "emails");
        
        if (!Directory.Exists(_outputPath))
        {
            Directory.CreateDirectory(_outputPath);
        }
    }

    public async Task SendAsync(EmailMessage message, CancellationToken cancellationToken = default)
    {
        // Save email to file for development
        var fileName = $"{DateTime.UtcNow:yyyyMMdd_HHmmss}_{message.To.Replace("@", "_at_")}.html";
        var filePath = Path.Combine(_outputPath, fileName);
        
        var content = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <title>{message.Subject}</title>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 20px; }}
        .header {{ background: #f0f0f0; padding: 10px; margin-bottom: 20px; }}
        .field {{ margin: 10px 0; }}
        .label {{ font-weight: bold; }}
        .content {{ margin-top: 20px; padding: 20px; border: 1px solid #ddd; }}
    </style>
</head>
<body>
    <div class='header'>
        <h2>Development Email Preview</h2>
    </div>
    <div class='field'>
        <span class='label'>To:</span> {message.To}
    </div>
    <div class='field'>
        <span class='label'>Subject:</span> {message.Subject}
    </div>
    <div class='field'>
        <span class='label'>Date:</span> {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss} UTC
    </div>
    {(message.Cc.Any() ? $"<div class='field'><span class='label'>CC:</span> {string.Join(", ", message.Cc)}</div>" : "")}
    {(message.Bcc.Any() ? $"<div class='field'><span class='label'>BCC:</span> {string.Join(", ", message.Bcc)}</div>" : "")}
    <div class='content'>
        {message.Body}
    </div>
</body>
</html>";
        
        await File.WriteAllTextAsync(filePath, content, cancellationToken);
        
        _logger.LogInformation("Email saved to {FilePath}", filePath);
        _logger.LogInformation("Email to: {To}, Subject: {Subject}", message.To, message.Subject);
    }

    public async Task SendBulkAsync(IEnumerable<EmailMessage> messages, CancellationToken cancellationToken = default)
    {
        foreach (var message in messages)
        {
            await SendAsync(message, cancellationToken);
        }
    }
}