using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Stocker.Modules.CRM.Application.Services.Email;
using Stocker.Modules.CRM.Application.Services.Templates;

namespace Stocker.Modules.CRM.Infrastructure.Services.Email;

/// <summary>
/// SMTP email service implementation supporting PrivateEmail, Gmail, Outlook, and other SMTP providers
/// </summary>
public class SmtpEmailService : IEmailService
{
    private readonly ILogger<SmtpEmailService> _logger;
    private readonly ITemplateService _templateService;
    private readonly SmtpClient _smtpClient;
    private readonly string _fromEmail;
    private readonly string _fromName;

    public SmtpEmailService(
        IConfiguration configuration,
        ITemplateService templateService,
        ILogger<SmtpEmailService> logger)
    {
        _logger = logger;
        _templateService = templateService;

        var smtpHost = configuration["Email:Smtp:Host"]
            ?? throw new InvalidOperationException("Email:Smtp:Host is not configured");
        var smtpPort = int.Parse(configuration["Email:Smtp:Port"] ?? "587");
        var username = configuration["Email:Smtp:Username"]
            ?? throw new InvalidOperationException("Email:Smtp:Username is not configured");
        var password = configuration["Email:Smtp:Password"]
            ?? throw new InvalidOperationException("Email:Smtp:Password is not configured");

        _fromEmail = configuration["Email:Smtp:FromEmail"] ?? username;
        _fromName = configuration["Email:Smtp:FromName"] ?? "Stocker CRM";

        var enableSsl = bool.Parse(configuration["Email:Smtp:EnableSsl"] ?? "true");

        _smtpClient = new SmtpClient(smtpHost, smtpPort)
        {
            Credentials = new NetworkCredential(username, password),
            EnableSsl = enableSsl,
            DeliveryMethod = SmtpDeliveryMethod.Network,
            Timeout = 30000 // 30 seconds
        };

        _logger.LogInformation(
            "SMTP Email Service initialized with host: {Host}, port: {Port}, SSL: {EnableSsl}",
            smtpHost, smtpPort, enableSsl);
    }

    public async Task<EmailSendResult> SendEmailAsync(
        EmailMessage message,
        CancellationToken cancellationToken = default)
    {
        try
        {
            using var mailMessage = new MailMessage
            {
                From = new MailAddress(_fromEmail, message.FromName ?? _fromName),
                Subject = message.Subject,
                Body = message.Body,
                IsBodyHtml = message.IsHtml
            };

            mailMessage.To.Add(message.To);

            // Add CC recipients
            if (message.Cc != null)
            {
                foreach (var cc in message.Cc)
                {
                    mailMessage.CC.Add(cc);
                }
            }

            // Add BCC recipients
            if (message.Bcc != null)
            {
                foreach (var bcc in message.Bcc)
                {
                    mailMessage.Bcc.Add(bcc);
                }
            }

            // Add attachments
            if (message.Attachments != null)
            {
                foreach (var attachment in message.Attachments)
                {
                    var stream = new MemoryStream(attachment.Value);
                    mailMessage.Attachments.Add(new Attachment(stream, attachment.Key));
                }
            }

            await _smtpClient.SendMailAsync(mailMessage, cancellationToken);

            _logger.LogInformation(
                "Email sent successfully to {To} with subject: {Subject}",
                message.To, message.Subject);

            return EmailSendResult.Success();
        }
        catch (SmtpException ex)
        {
            _logger.LogError(ex,
                "SMTP error sending email to {To}: {StatusCode} - {Message}",
                message.To, ex.StatusCode, ex.Message);

            return EmailSendResult.Failure($"SMTP error: {ex.Message}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Error sending email to {To}",
                message.To);

            return EmailSendResult.Failure($"Failed to send email: {ex.Message}");
        }
    }

    public async Task<EmailSendResult> SendTemplatedEmailAsync(
        string to,
        string subject,
        string templateName,
        object templateData,
        CancellationToken cancellationToken = default)
    {
        try
        {
            // Render template with Liquid engine
            var renderResult = await _templateService.RenderFromFileAsync(templateName, templateData, cancellationToken);

            if (!renderResult.IsSuccess)
            {
                _logger.LogError(
                    "Failed to render template {TemplateName}: {Error}",
                    templateName, renderResult.Error?.Description);

                return EmailSendResult.Failure($"Template rendering failed: {renderResult.Error?.Description}");
            }

            var body = renderResult.Value;

            var message = new EmailMessage(
                To: to,
                Subject: subject,
                Body: body,
                IsHtml: true
            );

            return await SendEmailAsync(message, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Error sending templated email to {To} with template {TemplateName}",
                to, templateName);

            return EmailSendResult.Failure($"Failed to send templated email: {ex.Message}");
        }
    }

    public void Dispose()
    {
        _smtpClient?.Dispose();
    }
}
