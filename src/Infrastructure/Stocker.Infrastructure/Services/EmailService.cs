using System.Text;
using System.Linq;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.EntityFrameworkCore;
using MimeKit;
using MimeKit.Text;
using MailKit.Net.Smtp;
using MailKit.Security;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.Settings;
using Stocker.Application.Common.Exceptions;
using Stocker.SharedKernel.Exceptions;

namespace Stocker.Infrastructure.Services;

public class EmailService : IEmailService
{
    private readonly EmailSettings _emailSettings;
    private readonly ILogger<EmailService> _logger;
    private readonly IEncryptionService _encryptionService;
    private readonly IMasterDbContext _masterContext;
    private readonly string _templatesPath;

    public EmailService(
        IOptions<EmailSettings> emailSettings,
        ILogger<EmailService> logger,
        IEncryptionService encryptionService,
        IMasterDbContext masterContext)
    {
        _emailSettings = emailSettings.Value;
        _logger = logger;
        _encryptionService = encryptionService;
        _masterContext = masterContext;
        _templatesPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, _emailSettings.TemplatesPath);
    }

    public async Task SendAsync(EmailMessage message, CancellationToken cancellationToken = default)
    {
        // Get email settings from database
        var emailSettings = await GetEmailSettingsFromDatabaseAsync(cancellationToken);
        
        if (!emailSettings.EnableEmail)
        {
            _logger.LogWarning("Email service is disabled. Email not sent to {To}", message.To);
            return;
        }

        try
        {
            var email = new MimeMessage();
            email.From.Add(new MailboxAddress(emailSettings.FromName, emailSettings.FromEmail));
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
            
            // Set timeout to 30 seconds
            smtp.Timeout = 30000;
            
            // Log connection attempt (without exposing password)
            _logger.LogInformation("Attempting to connect to SMTP server {Host}:{Port}", emailSettings.SmtpHost, emailSettings.SmtpPort);
            
            await smtp.ConnectAsync(
                emailSettings.SmtpHost, 
                emailSettings.SmtpPort, 
                emailSettings.SmtpPort == 465 ? SecureSocketOptions.SslOnConnect : 
                emailSettings.EnableSsl ? SecureSocketOptions.StartTls : SecureSocketOptions.None, 
                cancellationToken);
            
            await smtp.AuthenticateAsync(emailSettings.SmtpUsername, emailSettings.SmtpPassword, cancellationToken);
            await smtp.SendAsync(email, cancellationToken);
            await smtp.DisconnectAsync(true, cancellationToken);

            _logger.LogInformation("Email sent successfully to {To}", message.To);
        }
        catch (ExternalServiceException)
        {
            throw;
        }
        catch (System.Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {To}", message.To);
            throw new ExternalServiceException("EmailService", "Failed to send email", ex);
        }
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

    private async Task<EmailSettings> GetEmailSettingsFromDatabaseAsync(CancellationToken cancellationToken)
    {
        try
        {
            _logger.LogInformation("Loading email settings from database");
            
            // Check if MasterDbContext is available
            if (_masterContext == null)
            {
                _logger.LogWarning("MasterDbContext is null, using fallback email settings");
                return GetFallbackEmailSettings();
            }

            // Get all email settings from the database
            var settings = await _masterContext.SystemSettings
                .Where(s => s.Category == "Email" || s.Key.StartsWith("Email.") || s.Key.StartsWith("Smtp."))
                .ToListAsync(cancellationToken);

            if (!settings.Any())
            {
                _logger.LogWarning("No email settings found in database, using fallback");
                return GetFallbackEmailSettings();
            }

            // Build EmailSettings object from database values
            var emailSettings = new EmailSettings();

            // SMTP settings
            var smtpHost = settings.FirstOrDefault(s => s.Key == "Smtp.Host")?.Value;
            if (string.IsNullOrEmpty(smtpHost))
            {
                _logger.LogWarning("SMTP host not found in database, using fallback");
                return GetFallbackEmailSettings();
            }
            emailSettings.SmtpHost = smtpHost;
            
            var smtpPortSetting = settings.FirstOrDefault(s => s.Key == "Smtp.Port")?.Value;
            emailSettings.SmtpPort = int.TryParse(smtpPortSetting, out var port) ? port : 465;
            
            emailSettings.SmtpUsername = settings.FirstOrDefault(s => s.Key == "Smtp.Username")?.Value ?? "info@stoocker.app";
            
            // Decrypt password if encrypted
            var passwordSetting = settings.FirstOrDefault(s => s.Key == "Smtp.Password");
            if (passwordSetting != null && !string.IsNullOrEmpty(passwordSetting.Value))
            {
                try
                {
                    emailSettings.SmtpPassword = passwordSetting.IsEncrypted 
                        ? _encryptionService.Decrypt(passwordSetting.Value)
                        : passwordSetting.Value;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to decrypt SMTP password");
                    return GetFallbackEmailSettings();
                }
            }
            else
            {
                emailSettings.SmtpPassword = "A.bg010203"; // Fallback password
            }
            
            // SSL Settings
            var enableSslSetting = settings.FirstOrDefault(s => s.Key == "Smtp.EnableSsl")?.Value;
            emailSettings.EnableSsl = bool.TryParse(enableSslSetting, out var enableSsl) ? enableSsl : true;
            
            // From settings
            emailSettings.FromEmail = settings.FirstOrDefault(s => s.Key == "Email.FromAddress")?.Value ?? "info@stoocker.app";
            emailSettings.FromName = settings.FirstOrDefault(s => s.Key == "Email.FromName")?.Value ?? "Stoocker";
            
            // Enable email
            var enableEmailSetting = settings.FirstOrDefault(s => s.Key == "Email.Enable")?.Value;
            emailSettings.EnableEmail = bool.TryParse(enableEmailSetting, out var enableEmail) ? enableEmail : true;
            
            // Template path (use default from injected settings)
            emailSettings.TemplatesPath = _emailSettings.TemplatesPath;
            
            _logger.LogInformation("Email settings loaded successfully from database");
            return emailSettings;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to load email settings from database, using fallback");
            return GetFallbackEmailSettings();
        }
    }

    private EmailSettings GetFallbackEmailSettings()
    {
        _logger.LogInformation("Using fallback email settings");
        return new EmailSettings 
        { 
            SmtpHost = "mail.privateemail.com",
            SmtpPort = 465,
            SmtpUsername = "info@stoocker.app",
            SmtpPassword = "A.bg010203",
            EnableSsl = true,
            FromEmail = "info@stoocker.app",
            FromName = "Stoocker",
            EnableEmail = true,
            TemplatesPath = _emailSettings.TemplatesPath ?? "EmailTemplates"
        };
    }

    public async Task SendBulkAsync(IEnumerable<EmailMessage> messages, CancellationToken cancellationToken = default)
    {
        await Task.WhenAll(messages.Select(m => SendAsync(m, cancellationToken)));
    }

    public async Task SendEmailVerificationAsync(string email, string token, string userName, CancellationToken cancellationToken = default)
    {
        var templateBody = GetDefaultTemplate("EmailVerification");
        var subject = GetDefaultSubject("EmailVerification");
        
        var verificationUrl = $"https://stoocker.app/verify-email?token={token}";
        
        // Replace placeholders
        templateBody = templateBody
            .Replace("{{userName}}", userName)
            .Replace("{{verificationUrl}}", verificationUrl);
            
        subject = subject.Replace("{{appName}}", "Stoocker");

        await SendAsync(new EmailMessage
        {
            To = email,
            Subject = subject,
            Body = templateBody,
            IsHtml = true
        }, cancellationToken);
    }

    public async Task SendPasswordResetAsync(string email, string token, string userName, CancellationToken cancellationToken = default)
    {
        var templateBody = GetDefaultTemplate("PasswordReset");
        var subject = GetDefaultSubject("PasswordReset");
        
        var resetUrl = $"https://stoocker.app/reset-password?token={token}";
        
        // Replace placeholders
        templateBody = templateBody
            .Replace("{{userName}}", userName)
            .Replace("{{resetUrl}}", resetUrl);
            
        subject = subject.Replace("{{appName}}", "Stoocker");

        await SendAsync(new EmailMessage
        {
            To = email,
            Subject = subject,
            Body = templateBody,
            IsHtml = true
        }, cancellationToken);
    }

    public async Task SendWelcomeEmailAsync(string email, string userName, string companyName, CancellationToken cancellationToken = default)
    {
        var templateBody = GetDefaultTemplate("Welcome");
        var subject = GetDefaultSubject("Welcome");
        
        var loginUrl = "https://stoocker.app/login";
        
        // Replace placeholders
        templateBody = templateBody
            .Replace("{{userName}}", userName)
            .Replace("{{companyName}}", companyName)
            .Replace("{{loginUrl}}", loginUrl);
            
        subject = subject.Replace("{{appName}}", "Stoocker");

        await SendAsync(new EmailMessage
        {
            To = email,
            Subject = subject,
            Body = templateBody,
            IsHtml = true
        }, cancellationToken);
    }

    public async Task SendInvitationEmailAsync(string email, string inviterName, string companyName, string inviteToken, CancellationToken cancellationToken = default)
    {
        var subject = GetDefaultSubject("Invitation");
        subject = subject
            .Replace("{{inviterName}}", inviterName)
            .Replace("{{companyName}}", companyName);
            
        var inviteUrl = $"https://stoocker.app/accept-invite?token={inviteToken}";
        
        var body = $@"
            <h2>Davetlisiniz!</h2>
            <p>{inviterName} sizi {companyName} şirketine davet ediyor.</p>
            <p>Daveti kabul etmek için <a href='{inviteUrl}'>buraya tıklayın</a>.</p>
        ";

        await SendAsync(new EmailMessage
        {
            To = email,
            Subject = subject,
            Body = body,
            IsHtml = true
        }, cancellationToken);
    }

    public async Task<bool> IsEmailServiceAvailable()
    {
        try
        {
            var emailSettings = await GetEmailSettingsFromDatabaseAsync(CancellationToken.None);
            return emailSettings.EnableEmail && !string.IsNullOrEmpty(emailSettings.SmtpHost);
        }
        catch
        {
            return false;
        }
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