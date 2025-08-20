using System.Text;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MimeKit;
using MimeKit.Text;
using MailKit.Net.Smtp;
using MailKit.Security;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.Settings;

namespace Stocker.Infrastructure.Services;

public class EmailService : IEmailService
{
    private readonly EmailSettings _emailSettings;
    private readonly ILogger<EmailService> _logger;
    private readonly string _templatesPath;

    public EmailService(
        IOptions<EmailSettings> emailSettings,
        ILogger<EmailService> logger)
    {
        _emailSettings = emailSettings.Value;
        _logger = logger;
        _templatesPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, _emailSettings.TemplatesPath);
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
            
            await smtp.ConnectAsync(
                _emailSettings.SmtpHost, 
                _emailSettings.SmtpPort, 
                _emailSettings.SmtpPort == 465 ? SecureSocketOptions.SslOnConnect : 
                _emailSettings.EnableSsl ? SecureSocketOptions.StartTls : SecureSocketOptions.None, 
                cancellationToken);
            
            await smtp.AuthenticateAsync(_emailSettings.SmtpUsername, _emailSettings.SmtpPassword, cancellationToken);
            await smtp.SendAsync(email, cancellationToken);
            await smtp.DisconnectAsync(true, cancellationToken);

            _logger.LogInformation("Email sent successfully to {To}", message.To);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {To}", message.To);
            throw;
        }
    }

    public async Task SendBulkAsync(IEnumerable<EmailMessage> messages, CancellationToken cancellationToken = default)
    {
        foreach (var message in messages)
        {
            await SendAsync(message, cancellationToken);
            
            // Add a small delay to avoid rate limiting
            await Task.Delay(100, cancellationToken);
        }
    }

    public async Task SendEmailVerificationAsync(string email, string token, string userName, CancellationToken cancellationToken = default)
    {
        var verificationUrl = $"{_emailSettings.BaseUrl}/verify-email?token={Uri.EscapeDataString(token)}&email={Uri.EscapeDataString(email)}";
        
        var template = await GetEmailTemplate("EmailVerification");
        var body = template.HtmlBody
            .Replace("{{userName}}", userName)
            .Replace("{{verificationUrl}}", verificationUrl)
            .Replace("{{baseUrl}}", _emailSettings.BaseUrl);

        var message = new EmailMessage
        {
            To = email,
            Subject = template.Subject.Replace("{{appName}}", "Stocker"),
            Body = body,
            IsHtml = true
        };

        await SendAsync(message, cancellationToken);
    }

    public async Task SendPasswordResetAsync(string email, string token, string userName, CancellationToken cancellationToken = default)
    {
        var resetUrl = $"{_emailSettings.BaseUrl}/reset-password?token={Uri.EscapeDataString(token)}&email={Uri.EscapeDataString(email)}";
        
        var template = await GetEmailTemplate("PasswordReset");
        var body = template.HtmlBody
            .Replace("{{userName}}", userName)
            .Replace("{{resetUrl}}", resetUrl)
            .Replace("{{baseUrl}}", _emailSettings.BaseUrl);

        var message = new EmailMessage
        {
            To = email,
            Subject = template.Subject.Replace("{{appName}}", "Stocker"),
            Body = body,
            IsHtml = true
        };

        await SendAsync(message, cancellationToken);
    }

    public async Task SendWelcomeEmailAsync(string email, string userName, string companyName, CancellationToken cancellationToken = default)
    {
        var template = await GetEmailTemplate("Welcome");
        var body = template.HtmlBody
            .Replace("{{userName}}", userName)
            .Replace("{{companyName}}", companyName)
            .Replace("{{baseUrl}}", _emailSettings.BaseUrl)
            .Replace("{{loginUrl}}", $"{_emailSettings.BaseUrl}/login");

        var message = new EmailMessage
        {
            To = email,
            Subject = template.Subject.Replace("{{appName}}", "Stocker"),
            Body = body,
            IsHtml = true
        };

        await SendAsync(message, cancellationToken);
    }

    public async Task SendInvitationEmailAsync(string email, string inviterName, string companyName, string inviteToken, CancellationToken cancellationToken = default)
    {
        var inviteUrl = $"{_emailSettings.BaseUrl}/accept-invite?token={Uri.EscapeDataString(inviteToken)}&email={Uri.EscapeDataString(email)}";
        
        var template = await GetEmailTemplate("Invitation");
        var body = template.HtmlBody
            .Replace("{{inviterName}}", inviterName)
            .Replace("{{companyName}}", companyName)
            .Replace("{{inviteUrl}}", inviteUrl)
            .Replace("{{baseUrl}}", _emailSettings.BaseUrl);

        var message = new EmailMessage
        {
            To = email,
            Subject = template.Subject
                .Replace("{{inviterName}}", inviterName)
                .Replace("{{companyName}}", companyName),
            Body = body,
            IsHtml = true
        };

        await SendAsync(message, cancellationToken);
    }

    public async Task<bool> IsEmailServiceAvailable()
    {
        if (!_emailSettings.EnableEmail)
            return false;

        try
        {
            using var smtp = new SmtpClient();
            smtp.ServerCertificateValidationCallback = (s, c, h, e) => true;
            smtp.Timeout = _emailSettings.Timeout;
            
            await smtp.ConnectAsync(
                _emailSettings.SmtpHost, 
                _emailSettings.SmtpPort, 
                _emailSettings.SmtpPort == 465 ? SecureSocketOptions.SslOnConnect : 
                _emailSettings.EnableSsl ? SecureSocketOptions.StartTls : SecureSocketOptions.None);
            
            await smtp.AuthenticateAsync(_emailSettings.SmtpUsername, _emailSettings.SmtpPassword);
            await smtp.DisconnectAsync(true);
            
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Email service is not available");
            return false;
        }
    }

    private async Task<EmailTemplate> GetEmailTemplate(string templateName)
    {
        var template = new EmailTemplate();
        
        try
        {
            var htmlPath = Path.Combine(_templatesPath, $"{templateName}.html");
            var subjectPath = Path.Combine(_templatesPath, $"{templateName}.subject.txt");
            
            if (File.Exists(htmlPath))
            {
                template.HtmlBody = await File.ReadAllTextAsync(htmlPath);
            }
            else
            {
                // Use default template if file doesn't exist
                template.HtmlBody = GetDefaultTemplate(templateName);
            }
            
            if (File.Exists(subjectPath))
            {
                template.Subject = await File.ReadAllTextAsync(subjectPath);
            }
            else
            {
                template.Subject = GetDefaultSubject(templateName);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to load email template: {TemplateName}", templateName);
            template.HtmlBody = GetDefaultTemplate(templateName);
            template.Subject = GetDefaultSubject(templateName);
        }
        
        return template;
    }

    private string GetDefaultTemplate(string templateName)
    {
        return templateName switch
        {
            "EmailVerification" => @"
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class='container'>
                        <div class='header'>
                            <h1>Email Doğrulama</h1>
                        </div>
                        <div class='content'>
                            <p>Merhaba {{userName}},</p>
                            <p>Stocker'a hoşgeldiniz! Hesabınızı aktifleştirmek için lütfen aşağıdaki butona tıklayın:</p>
                            <div style='text-align: center;'>
                                <a href='{{verificationUrl}}' class='button'>Email Adresimi Doğrula</a>
                            </div>
                            <p>Veya aşağıdaki linki tarayıcınıza kopyalayın:</p>
                            <p style='word-break: break-all; color: #667eea;'>{{verificationUrl}}</p>
                            <p>Bu link 24 saat geçerlidir.</p>
                        </div>
                        <div class='footer'>
                            <p>© 2024 Stocker. Tüm hakları saklıdır.</p>
                        </div>
                    </div>
                </body>
                </html>",
            "PasswordReset" => @"
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class='container'>
                        <div class='header'>
                            <h1>Şifre Sıfırlama</h1>
                        </div>
                        <div class='content'>
                            <p>Merhaba {{userName}},</p>
                            <p>Şifrenizi sıfırlamak için bir talepte bulundunuz. Aşağıdaki butona tıklayarak yeni şifrenizi oluşturabilirsiniz:</p>
                            <div style='text-align: center;'>
                                <a href='{{resetUrl}}' class='button'>Şifremi Sıfırla</a>
                            </div>
                            <p>Bu link 1 saat geçerlidir.</p>
                            <p>Eğer bu talebi siz yapmadıysanız, bu emaili görmezden gelebilirsiniz.</p>
                        </div>
                        <div class='footer'>
                            <p>© 2024 Stocker. Tüm hakları saklıdır.</p>
                        </div>
                    </div>
                </body>
                </html>",
            "Welcome" => @"
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                        .features { margin: 20px 0; }
                        .feature { padding: 10px; background: white; margin: 10px 0; border-left: 3px solid #667eea; }
                        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class='container'>
                        <div class='header'>
                            <h1>Stocker'a Hoşgeldiniz!</h1>
                        </div>
                        <div class='content'>
                            <p>Merhaba {{userName}},</p>
                            <p><strong>{{companyName}}</strong> hesabınız başarıyla oluşturuldu!</p>
                            <div class='features'>
                                <div class='feature'>✅ CRM - Müşteri ilişkilerini yönetin</div>
                                <div class='feature'>✅ Stok Takibi - Envanterinizi kontrol edin</div>
                                <div class='feature'>✅ Raporlama - Detaylı analizler alın</div>
                                <div class='feature'>✅ 7/24 Destek - Her zaman yanınızdayız</div>
                            </div>
                            <div style='text-align: center;'>
                                <a href='{{loginUrl}}' class='button'>Hemen Başla</a>
                            </div>
                        </div>
                        <div class='footer'>
                            <p>© 2024 Stocker. Tüm hakları saklıdır.</p>
                        </div>
                    </div>
                </body>
                </html>",
            _ => "<p>{{content}}</p>"
        };
    }

    private string GetDefaultSubject(string templateName)
    {
        return templateName switch
        {
            "EmailVerification" => "{{appName}} - Email Adresinizi Doğrulayın",
            "PasswordReset" => "{{appName}} - Şifre Sıfırlama Talebi",
            "Welcome" => "{{appName}} - Hoşgeldiniz!",
            "Invitation" => "{{inviterName}} sizi {{companyName}} şirketine davet ediyor",
            _ => "{{appName}} Bildirimi"
        };
    }
}

// Development email service for testing
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
        var fileName = $"{DateTime.Now:yyyyMMdd_HHmmss}_{Guid.NewGuid():N}.html";
        var filePath = Path.Combine(_outputPath, fileName);
        
        var content = $@"
            <h2>Email Details</h2>
            <p><strong>To:</strong> {message.To}</p>
            <p><strong>Subject:</strong> {message.Subject}</p>
            <p><strong>Date:</strong> {DateTime.Now}</p>
            <hr>
            {message.Body}
        ";
        
        await File.WriteAllTextAsync(filePath, content, cancellationToken);
        
        _logger.LogInformation("Development email saved to: {FilePath}", filePath);
    }

    public Task SendBulkAsync(IEnumerable<EmailMessage> messages, CancellationToken cancellationToken = default)
    {
        return Task.WhenAll(messages.Select(m => SendAsync(m, cancellationToken)));
    }

    public async Task SendEmailVerificationAsync(string email, string token, string userName, CancellationToken cancellationToken = default)
    {
        var message = new EmailMessage
        {
            To = email,
            Subject = "Email Verification",
            Body = $"<p>Hello {userName}, please verify your email. Token: {token}</p>",
            IsHtml = true
        };
        await SendAsync(message, cancellationToken);
    }

    public async Task SendPasswordResetAsync(string email, string token, string userName, CancellationToken cancellationToken = default)
    {
        var message = new EmailMessage
        {
            To = email,
            Subject = "Password Reset",
            Body = $"<p>Hello {userName}, reset your password. Token: {token}</p>",
            IsHtml = true
        };
        await SendAsync(message, cancellationToken);
    }

    public async Task SendWelcomeEmailAsync(string email, string userName, string companyName, CancellationToken cancellationToken = default)
    {
        var message = new EmailMessage
        {
            To = email,
            Subject = "Welcome!",
            Body = $"<p>Welcome {userName} from {companyName}!</p>",
            IsHtml = true
        };
        await SendAsync(message, cancellationToken);
    }

    public async Task SendInvitationEmailAsync(string email, string inviterName, string companyName, string inviteToken, CancellationToken cancellationToken = default)
    {
        var message = new EmailMessage
        {
            To = email,
            Subject = "Invitation",
            Body = $"<p>{inviterName} invites you to {companyName}. Token: {inviteToken}</p>",
            IsHtml = true
        };
        await SendAsync(message, cancellationToken);
    }

    public Task<bool> IsEmailServiceAvailable()
    {
        return Task.FromResult(true);
    }
}