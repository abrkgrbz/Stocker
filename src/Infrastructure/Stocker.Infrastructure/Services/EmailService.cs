using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MimeKit;
using MailKit.Net.Smtp;
using MailKit.Security;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.Interfaces.Repositories;
using Stocker.SharedKernel.Settings;
using Stocker.SharedKernel.Exceptions;

namespace Stocker.Infrastructure.Services;

/// <summary>
/// Production email service using database-driven templates with Liquid rendering.
/// All templates are stored in the database and rendered using the Liquid template engine.
/// </summary>
public class EmailService : IEmailService
{
    private readonly EmailSettings _emailSettings;
    private readonly ILogger<EmailService> _logger;
    private readonly IEmailTemplateRepository? _templateRepository;
    private readonly ILiquidTemplateService? _liquidTemplateService;

    public EmailService(
        IOptions<EmailSettings> emailSettings,
        ILogger<EmailService> logger,
        IEmailTemplateRepository? templateRepository = null,
        ILiquidTemplateService? liquidTemplateService = null)
    {
        _emailSettings = emailSettings.Value;
        _logger = logger;
        _templateRepository = templateRepository;
        _liquidTemplateService = liquidTemplateService;
    }

    public async Task SendAsync(EmailMessage message, CancellationToken cancellationToken = default)
    {
        if (!_emailSettings.EnableEmail)
        {
            _logger.LogWarning("Email service is disabled. Email not sent to {To}", message.To);
            return;
        }

        try
        {
            var email = new MimeMessage();
            email.From.Add(new MailboxAddress(_emailSettings.FromName, _emailSettings.FromEmail));
            email.To.Add(MailboxAddress.Parse(message.To));
            email.Subject = message.Subject;

            var builder = new BodyBuilder();

            if (message.IsHtml)
            {
                builder.HtmlBody = message.Body;
            }
            else
            {
                builder.TextBody = message.Body;
            }

            // Add attachments if any
            foreach (var attachment in message.Attachments)
            {
                builder.Attachments.Add(attachment.Key, attachment.Value);
            }

            // Add CC recipients
            foreach (var cc in message.Cc)
            {
                email.Cc.Add(MailboxAddress.Parse(cc));
            }

            // Add BCC recipients
            foreach (var bcc in message.Bcc)
            {
                email.Bcc.Add(MailboxAddress.Parse(bcc));
            }

            email.Body = builder.ToMessageBody();

            using var smtp = new SmtpClient();

            // Configure SSL/TLS
            smtp.ServerCertificateValidationCallback = (s, c, h, e) => true;
            smtp.Timeout = 30000;

            _logger.LogDebug("Connecting to SMTP server {Host}:{Port}", _emailSettings.SmtpHost, _emailSettings.SmtpPort);

            var secureSocketOptions = _emailSettings.SmtpPort == 465
                ? SecureSocketOptions.SslOnConnect
                : _emailSettings.EnableSsl
                    ? SecureSocketOptions.StartTls
                    : SecureSocketOptions.None;

            await smtp.ConnectAsync(_emailSettings.SmtpHost, _emailSettings.SmtpPort, secureSocketOptions, cancellationToken);
            await smtp.AuthenticateAsync(_emailSettings.SmtpUsername, _emailSettings.SmtpPassword, cancellationToken);
            await smtp.SendAsync(email, cancellationToken);
            await smtp.DisconnectAsync(true, cancellationToken);

            _logger.LogInformation("Email sent successfully to {To}", message.To);
        }
        catch (ExternalServiceException)
        {
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {To}", message.To);
            throw new ExternalServiceException("EmailService", "Failed to send email", ex);
        }
    }

    public async Task SendBulkAsync(IEnumerable<EmailMessage> messages, CancellationToken cancellationToken = default)
    {
        await Task.WhenAll(messages.Select(m => SendAsync(m, cancellationToken)));
    }

    public async Task SendEmailVerificationAsync(string email, string token, string userName, CancellationToken cancellationToken = default)
    {
        var verificationUrl = $"{_emailSettings.BaseUrl}/register/verify-email?email={Uri.EscapeDataString(email)}&token={Uri.EscapeDataString(token)}";

        var templateData = new Dictionary<string, object>
        {
            ["userName"] = userName,
            ["verificationUrl"] = verificationUrl,
            ["appName"] = "Stocker",
            ["email"] = email,
            ["year"] = DateTime.UtcNow.Year
        };

        var (subject, body) = await RenderTemplateAsync("email-verification", templateData, cancellationToken: cancellationToken);

        await SendAsync(new EmailMessage
        {
            To = email,
            Subject = subject,
            Body = body,
            IsHtml = true
        }, cancellationToken);
    }

    public async Task SendTenantEmailVerificationAsync(string email, string code, string token, string userName, CancellationToken cancellationToken = default)
    {
        var verificationUrl = $"{_emailSettings.BaseUrl}/register/verify-email?email={Uri.EscapeDataString(email)}&token={Uri.EscapeDataString(token)}";

        var templateData = new Dictionary<string, object>
        {
            ["userName"] = userName,
            ["verificationCode"] = code,
            ["verificationUrl"] = verificationUrl,
            ["appName"] = "Stocker",
            ["email"] = email,
            ["year"] = DateTime.UtcNow.Year
        };

        var (subject, body) = await RenderTemplateAsync("tenant-email-verification", templateData, cancellationToken: cancellationToken);

        await SendAsync(new EmailMessage
        {
            To = email,
            Subject = subject,
            Body = body,
            IsHtml = true
        }, cancellationToken);
    }

    public async Task SendPasswordResetAsync(string email, string token, string userName, CancellationToken cancellationToken = default)
    {
        var resetUrl = $"{_emailSettings.BaseUrl}/reset-password?token={Uri.EscapeDataString(token)}";

        var templateData = new Dictionary<string, object>
        {
            ["userName"] = userName,
            ["resetUrl"] = resetUrl,
            ["appName"] = "Stocker",
            ["email"] = email,
            ["year"] = DateTime.UtcNow.Year
        };

        var (subject, body) = await RenderTemplateAsync("password-reset", templateData, cancellationToken: cancellationToken);

        await SendAsync(new EmailMessage
        {
            To = email,
            Subject = subject,
            Body = body,
            IsHtml = true
        }, cancellationToken);
    }

    public async Task SendWelcomeEmailAsync(string email, string userName, string companyName, CancellationToken cancellationToken = default)
    {
        var loginUrl = $"{_emailSettings.BaseUrl}/login";

        var templateData = new Dictionary<string, object>
        {
            ["userName"] = userName,
            ["companyName"] = companyName,
            ["loginUrl"] = loginUrl,
            ["appName"] = "Stocker",
            ["email"] = email,
            ["year"] = DateTime.UtcNow.Year
        };

        var (subject, body) = await RenderTemplateAsync("welcome", templateData, cancellationToken: cancellationToken);

        await SendAsync(new EmailMessage
        {
            To = email,
            Subject = subject,
            Body = body,
            IsHtml = true
        }, cancellationToken);
    }

    public async Task SendInvitationEmailAsync(string email, string inviterName, string companyName, string inviteToken, CancellationToken cancellationToken = default)
    {
        var inviteUrl = $"{_emailSettings.BaseUrl}/accept-invite?token={Uri.EscapeDataString(inviteToken)}";

        var templateData = new Dictionary<string, object>
        {
            ["inviterName"] = inviterName,
            ["companyName"] = companyName,
            ["inviteUrl"] = inviteUrl,
            ["appName"] = "Stocker",
            ["email"] = email,
            ["year"] = DateTime.UtcNow.Year
        };

        var (subject, body) = await RenderTemplateAsync("invitation", templateData, cancellationToken: cancellationToken);

        await SendAsync(new EmailMessage
        {
            To = email,
            Subject = subject,
            Body = body,
            IsHtml = true
        }, cancellationToken);
    }

    public async Task SendUserInvitationEmailAsync(
        string email,
        string userName,
        string inviterName,
        string companyName,
        string activationToken,
        Guid userId,
        Guid tenantId,
        CancellationToken cancellationToken = default)
    {
        var encodedToken = Uri.EscapeDataString(activationToken);
        var activationUrl = $"{_emailSettings.BaseUrl}/setup-password?userId={userId}&tenantId={tenantId}&token={encodedToken}";

        var templateData = new Dictionary<string, object>
        {
            ["userName"] = userName,
            ["inviterName"] = inviterName,
            ["companyName"] = companyName,
            ["activationUrl"] = activationUrl,
            ["email"] = email,
            ["userId"] = userId.ToString(),
            ["tenantId"] = tenantId.ToString(),
            ["appName"] = "Stocker",
            ["expirationDays"] = 7,
            ["year"] = DateTime.UtcNow.Year
        };

        var (subject, body) = await RenderTemplateAsync("user-invitation", templateData, tenantId: tenantId, cancellationToken: cancellationToken);

        await SendAsync(new EmailMessage
        {
            To = email,
            Subject = subject,
            Body = body,
            IsHtml = true
        }, cancellationToken);

        _logger.LogInformation("User invitation email sent to {Email} for tenant {TenantId}", email, tenantId);
    }

    public Task<bool> IsEmailServiceAvailable()
    {
        return Task.FromResult(_emailSettings.EnableEmail && !string.IsNullOrEmpty(_emailSettings.SmtpHost));
    }

    /// <summary>
    /// Renders an email template from database using Liquid engine.
    /// Throws exception if template is not found (no hardcoded fallbacks).
    /// </summary>
    private async Task<(string Subject, string Body)> RenderTemplateAsync(
        string templateKey,
        Dictionary<string, object> data,
        string language = "tr",
        Guid? tenantId = null,
        CancellationToken cancellationToken = default)
    {
        if (_templateRepository == null || _liquidTemplateService == null)
        {
            _logger.LogError("Template repository or liquid service not available for template {TemplateKey}", templateKey);
            throw new InvalidOperationException($"Email template service is not properly configured. Cannot render template '{templateKey}'.");
        }

        // Try to get template from database
        var template = await _templateRepository.GetByKeyAsync(templateKey, language, tenantId, cancellationToken);

        if (template == null)
        {
            _logger.LogError("Email template not found: {TemplateKey} (Language: {Language}, TenantId: {TenantId})",
                templateKey, language, tenantId);
            throw new InvalidOperationException($"Email template '{templateKey}' not found for language '{language}'. Please ensure the template exists in the database.");
        }

        _logger.LogDebug("Rendering database template: {TemplateKey} (Language: {Language}, TenantId: {TenantId})",
            templateKey, language, tenantId);

        // Render subject with Liquid
        var subjectResult = await _liquidTemplateService.RenderAsync(template.Subject, data, cancellationToken);
        if (!subjectResult.IsSuccess)
        {
            _logger.LogError("Failed to render subject for template {TemplateKey}: {Error}", templateKey, subjectResult.ErrorMessage);
            throw new InvalidOperationException($"Failed to render email subject for template '{templateKey}': {subjectResult.ErrorMessage}");
        }

        // Render body with Liquid
        var bodyResult = await _liquidTemplateService.RenderAsync(template.HtmlBody, data, cancellationToken);
        if (!bodyResult.IsSuccess)
        {
            _logger.LogError("Failed to render body for template {TemplateKey}: {Error}", templateKey, bodyResult.ErrorMessage);
            throw new InvalidOperationException($"Failed to render email body for template '{templateKey}': {bodyResult.ErrorMessage}");
        }

        return (subjectResult.RenderedContent!, bodyResult.RenderedContent!);
    }
}

/// <summary>
/// Development email service for testing - saves emails to local files instead of sending.
/// </summary>
public class DevelopmentEmailService : IEmailService
{
    private readonly ILogger<DevelopmentEmailService> _logger;
    private readonly IEmailTemplateRepository? _templateRepository;
    private readonly ILiquidTemplateService? _liquidTemplateService;
    private readonly EmailSettings _emailSettings;
    private readonly string _outputPath;

    public DevelopmentEmailService(
        ILogger<DevelopmentEmailService> logger,
        IOptions<EmailSettings> emailSettings,
        IEmailTemplateRepository? templateRepository = null,
        ILiquidTemplateService? liquidTemplateService = null)
    {
        _logger = logger;
        _emailSettings = emailSettings.Value;
        _templateRepository = templateRepository;
        _liquidTemplateService = liquidTemplateService;
        _outputPath = Path.Combine(Directory.GetCurrentDirectory(), "emails");

        if (!Directory.Exists(_outputPath))
        {
            Directory.CreateDirectory(_outputPath);
        }
    }

    public async Task SendAsync(EmailMessage message, CancellationToken cancellationToken = default)
    {
        var fileName = $"{DateTime.Now:yyyyMMdd_HHmmss}_{Guid.NewGuid():N}.html";
        var filePath = Path.Combine(_outputPath, fileName);

        var content = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <title>{message.Subject}</title>
    <style>
        body {{ font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }}
        .email-meta {{ background: #fff; padding: 15px; margin-bottom: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }}
        .email-meta p {{ margin: 5px 0; }}
        .email-body {{ background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }}
    </style>
</head>
<body>
    <div class='email-meta'>
        <h2>Development Email Preview</h2>
        <p><strong>To:</strong> {message.To}</p>
        <p><strong>Subject:</strong> {message.Subject}</p>
        <p><strong>Date:</strong> {DateTime.Now:yyyy-MM-dd HH:mm:ss}</p>
        <p><strong>CC:</strong> {string.Join(", ", message.Cc)}</p>
        <p><strong>BCC:</strong> {string.Join(", ", message.Bcc)}</p>
    </div>
    <div class='email-body'>
        {message.Body}
    </div>
</body>
</html>";

        await File.WriteAllTextAsync(filePath, content, cancellationToken);

        _logger.LogInformation("Development email saved to: {FilePath}", filePath);
    }

    public Task SendBulkAsync(IEnumerable<EmailMessage> messages, CancellationToken cancellationToken = default)
    {
        return Task.WhenAll(messages.Select(m => SendAsync(m, cancellationToken)));
    }

    public async Task SendEmailVerificationAsync(string email, string token, string userName, CancellationToken cancellationToken = default)
    {
        var (subject, body) = await RenderTemplateAsync("email-verification", new Dictionary<string, object>
        {
            ["userName"] = userName,
            ["verificationUrl"] = $"{_emailSettings.BaseUrl}/register/verify-email?email={Uri.EscapeDataString(email)}&token={Uri.EscapeDataString(token)}",
            ["appName"] = "Stocker",
            ["email"] = email,
            ["year"] = DateTime.UtcNow.Year
        }, cancellationToken: cancellationToken);

        await SendAsync(new EmailMessage { To = email, Subject = subject, Body = body, IsHtml = true }, cancellationToken);
    }

    public async Task SendTenantEmailVerificationAsync(string email, string code, string token, string userName, CancellationToken cancellationToken = default)
    {
        var (subject, body) = await RenderTemplateAsync("tenant-email-verification", new Dictionary<string, object>
        {
            ["userName"] = userName,
            ["verificationCode"] = code,
            ["verificationUrl"] = $"{_emailSettings.BaseUrl}/register/verify-email?email={Uri.EscapeDataString(email)}&token={Uri.EscapeDataString(token)}",
            ["appName"] = "Stocker",
            ["email"] = email,
            ["year"] = DateTime.UtcNow.Year
        }, cancellationToken: cancellationToken);

        await SendAsync(new EmailMessage { To = email, Subject = subject, Body = body, IsHtml = true }, cancellationToken);
    }

    public async Task SendPasswordResetAsync(string email, string token, string userName, CancellationToken cancellationToken = default)
    {
        var (subject, body) = await RenderTemplateAsync("password-reset", new Dictionary<string, object>
        {
            ["userName"] = userName,
            ["resetUrl"] = $"{_emailSettings.BaseUrl}/reset-password?token={Uri.EscapeDataString(token)}",
            ["appName"] = "Stocker",
            ["email"] = email,
            ["year"] = DateTime.UtcNow.Year
        }, cancellationToken: cancellationToken);

        await SendAsync(new EmailMessage { To = email, Subject = subject, Body = body, IsHtml = true }, cancellationToken);
    }

    public async Task SendWelcomeEmailAsync(string email, string userName, string companyName, CancellationToken cancellationToken = default)
    {
        var (subject, body) = await RenderTemplateAsync("welcome", new Dictionary<string, object>
        {
            ["userName"] = userName,
            ["companyName"] = companyName,
            ["loginUrl"] = $"{_emailSettings.BaseUrl}/login",
            ["appName"] = "Stocker",
            ["email"] = email,
            ["year"] = DateTime.UtcNow.Year
        }, cancellationToken: cancellationToken);

        await SendAsync(new EmailMessage { To = email, Subject = subject, Body = body, IsHtml = true }, cancellationToken);
    }

    public async Task SendInvitationEmailAsync(string email, string inviterName, string companyName, string inviteToken, CancellationToken cancellationToken = default)
    {
        var (subject, body) = await RenderTemplateAsync("invitation", new Dictionary<string, object>
        {
            ["inviterName"] = inviterName,
            ["companyName"] = companyName,
            ["inviteUrl"] = $"{_emailSettings.BaseUrl}/accept-invite?token={Uri.EscapeDataString(inviteToken)}",
            ["appName"] = "Stocker",
            ["email"] = email,
            ["year"] = DateTime.UtcNow.Year
        }, cancellationToken: cancellationToken);

        await SendAsync(new EmailMessage { To = email, Subject = subject, Body = body, IsHtml = true }, cancellationToken);
    }

    public async Task SendUserInvitationEmailAsync(
        string email,
        string userName,
        string inviterName,
        string companyName,
        string activationToken,
        Guid userId,
        Guid tenantId,
        CancellationToken cancellationToken = default)
    {
        var (subject, body) = await RenderTemplateAsync("user-invitation", new Dictionary<string, object>
        {
            ["userName"] = userName,
            ["inviterName"] = inviterName,
            ["companyName"] = companyName,
            ["activationUrl"] = $"{_emailSettings.BaseUrl}/setup-password?userId={userId}&tenantId={tenantId}&token={Uri.EscapeDataString(activationToken)}",
            ["email"] = email,
            ["userId"] = userId.ToString(),
            ["tenantId"] = tenantId.ToString(),
            ["appName"] = "Stocker",
            ["expirationDays"] = 7,
            ["year"] = DateTime.UtcNow.Year
        }, tenantId: tenantId, cancellationToken: cancellationToken);

        await SendAsync(new EmailMessage { To = email, Subject = subject, Body = body, IsHtml = true }, cancellationToken);
    }

    public Task<bool> IsEmailServiceAvailable()
    {
        return Task.FromResult(true);
    }

    private async Task<(string Subject, string Body)> RenderTemplateAsync(
        string templateKey,
        Dictionary<string, object> data,
        string language = "tr",
        Guid? tenantId = null,
        CancellationToken cancellationToken = default)
    {
        // If services available, use database templates
        if (_templateRepository != null && _liquidTemplateService != null)
        {
            var template = await _templateRepository.GetByKeyAsync(templateKey, language, tenantId, cancellationToken);
            if (template != null)
            {
                var subjectResult = await _liquidTemplateService.RenderAsync(template.Subject, data, cancellationToken);
                var bodyResult = await _liquidTemplateService.RenderAsync(template.HtmlBody, data, cancellationToken);

                if (subjectResult.IsSuccess && bodyResult.IsSuccess)
                {
                    return (subjectResult.RenderedContent!, bodyResult.RenderedContent!);
                }
            }
        }

        // Fallback for development - simple placeholder
        _logger.LogWarning("Using development fallback for template {TemplateKey}", templateKey);
        var subject = $"[DEV] {templateKey}";
        var body = $"<h2>Development Template: {templateKey}</h2><pre>{System.Text.Json.JsonSerializer.Serialize(data, new System.Text.Json.JsonSerializerOptions { WriteIndented = true })}</pre>";
        return (subject, body);
    }
}
