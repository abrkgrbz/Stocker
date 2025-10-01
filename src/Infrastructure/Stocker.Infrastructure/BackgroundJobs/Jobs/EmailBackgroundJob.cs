using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Hangfire;

namespace Stocker.Infrastructure.BackgroundJobs.Jobs;

public class EmailBackgroundJob : IEmailBackgroundJob
{
    private readonly IEmailService _emailService;
    private readonly ILogger<EmailBackgroundJob> _logger;

    public EmailBackgroundJob(
        IEmailService emailService,
        ILogger<EmailBackgroundJob> logger)
    {
        _emailService = emailService;
        _logger = logger;
    }

    [Queue("default")]
    [AutomaticRetry(Attempts = 3, DelaysInSeconds = new[] { 60, 300, 900 })] // 1 dk, 5 dk, 15 dk
    public async Task SendEmailAsync(EmailMessage message)
    {
        try
        {
            _logger.LogInformation("Processing email job for {To}", message.To);
            await _emailService.SendAsync(message);
            _logger.LogInformation("Email sent successfully to {To}", message.To);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {To}", message.To);
            throw; // Hangfire retry mekanizması için
        }
    }

    [Queue("default")]
    public async Task SendBulkEmailsAsync(IEnumerable<EmailMessage> messages)
    {
        try
        {
            _logger.LogInformation("Processing bulk email job for {Count} recipients", messages.Count());
            await _emailService.SendBulkAsync(messages);
            _logger.LogInformation("Bulk emails sent successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send bulk emails");
            throw;
        }
    }

    [Queue("critical")]
    [AutomaticRetry(Attempts = 5, DelaysInSeconds = new[] { 30, 60, 300, 900, 1800 })] // Kritik emailler için daha fazla deneme
    public async Task SendVerificationEmailAsync(string email, string token, string userName)
    {
        try
        {
            _logger.LogInformation("Sending verification email to {Email}", email);
            await _emailService.SendEmailVerificationAsync(email, token, userName, CancellationToken.None);
            _logger.LogInformation("Verification email sent to {Email}", email);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send verification email to {Email}", email);
            throw;
        }
    }

    [Queue("critical")]
    [AutomaticRetry(Attempts = 5, DelaysInSeconds = new[] { 30, 60, 300, 900, 1800 })]
    public async Task SendTenantVerificationEmailAsync(string email, string code, string token, string userName)
    {
        try
        {
            _logger.LogInformation("Sending tenant verification email to {Email} with code {Code}", email, code);
            await _emailService.SendTenantEmailVerificationAsync(email, code, token, userName, CancellationToken.None);
            _logger.LogInformation("Tenant verification email sent to {Email}", email);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send tenant verification email to {Email}", email);
            throw;
        }
    }

    [Queue("critical")]
    [AutomaticRetry(Attempts = 5, DelaysInSeconds = new[] { 30, 60, 300, 900, 1800 })]
    public async Task SendPasswordResetEmailAsync(string email, string token, string userName)
    {
        try
        {
            _logger.LogInformation("Sending password reset email to {Email}", email);
            await _emailService.SendPasswordResetAsync(email, token, userName);
            _logger.LogInformation("Password reset email sent to {Email}", email);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send password reset email to {Email}", email);
            throw;
        }
    }

    [Queue("default")]
    [AutomaticRetry(Attempts = 3, DelaysInSeconds = new[] { 60, 300, 900 })]
    public async Task SendWelcomeEmailAsync(string email, string userName, string companyName)
    {
        try
        {
            _logger.LogInformation("Sending welcome email to {Email}", email);
            await _emailService.SendWelcomeEmailAsync(email, userName, companyName);
            _logger.LogInformation("Welcome email sent to {Email}", email);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send welcome email to {Email}", email);
            throw;
        }
    }

    [Queue("default")]
    [AutomaticRetry(Attempts = 3, DelaysInSeconds = new[] { 60, 300, 900 })]
    public async Task SendInvitationEmailAsync(string email, string inviterName, string companyName, string inviteToken)
    {
        try
        {
            _logger.LogInformation("Sending invitation email to {Email}", email);
            await _emailService.SendInvitationEmailAsync(email, inviterName, companyName, inviteToken);
            _logger.LogInformation("Invitation email sent to {Email}", email);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send invitation email to {Email}", email);
            throw;
        }
    }
}