namespace Stocker.Application.Common.Interfaces;

public interface IEmailBackgroundJob
{
    Task SendEmailAsync(EmailMessage message);
    Task SendBulkEmailsAsync(IEnumerable<EmailMessage> messages);
    Task SendVerificationEmailAsync(string email, string token, string userName);
    Task SendPasswordResetEmailAsync(string email, string token, string userName);
    Task SendWelcomeEmailAsync(string email, string userName, string companyName);
    Task SendInvitationEmailAsync(string email, string inviterName, string companyName, string inviteToken);
}