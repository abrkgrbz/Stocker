using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.CRM.Application.Services.Email;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Email.Commands.SendTestEmail;

/// <summary>
/// Handler for sending test emails
/// </summary>
public class SendTestEmailCommandHandler : IRequestHandler<SendTestEmailCommand, Result>
{
    private readonly IEmailService _emailService;
    private readonly ILogger<SendTestEmailCommandHandler> _logger;

    public SendTestEmailCommandHandler(
        IEmailService emailService,
        ILogger<SendTestEmailCommandHandler> logger)
    {
        _emailService = emailService;
        _logger = logger;
    }

    public async Task<Result> Handle(SendTestEmailCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var subject = request.Subject ?? "Stocker CRM - Test Email";
            var body = @"
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white !important; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        .success { background: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 15px 0; border-radius: 4px; }
    </style>
</head>
<body>
    <div class=""container"">
        <div class=""header"">
            <h1>✅ Email Test Successful!</h1>
        </div>
        <div class=""content"">
            <div class=""success"">
                <strong>Congratulations!</strong> Your email service is working correctly.
            </div>

            <h2>Email Configuration Verified</h2>
            <ul>
                <li>✅ SMTP Connection: Successful</li>
                <li>✅ Email Delivery: Working</li>
                <li>✅ HTML Rendering: Enabled</li>
                <li>✅ PrivateEmail Integration: Active</li>
            </ul>

            <h3>Next Steps</h3>
            <p>You can now use email functionality for:</p>
            <ul>
                <li>🔔 Workflow email notifications</li>
                <li>📧 Customer communications</li>
                <li>📨 Deal updates and alerts</li>
                <li>🚀 Automated marketing campaigns</li>
            </ul>

            <p>Test sent at: <strong>" + DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss") + @"</strong></p>
        </div>
        <div class=""footer"">
            <p>Sent from Stocker CRM - Communication Hub</p>
            <p>© 2025 Stocker. All rights reserved.</p>
        </div>
    </div>
</body>
</html>";

            var message = new EmailMessage(
                To: request.To,
                Subject: subject,
                Body: body,
                IsHtml: true
            );

            var result = await _emailService.SendEmailAsync(message, cancellationToken);

            if (!result.IsSuccess)
            {
                _logger.LogError("Failed to send test email to {To}: {Error}",
                    request.To, result.ErrorMessage);
                return Result.Failure(Error.Failure("Email.SendTest", result.ErrorMessage ?? "Failed to send email"));
            }

            _logger.LogInformation("Test email sent successfully to {To}", request.To);
            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending test email to {To}", request.To);
            return Result.Failure(Error.Failure("Email.SendTest", $"Failed to send test email: {ex.Message}"));
        }
    }
}
