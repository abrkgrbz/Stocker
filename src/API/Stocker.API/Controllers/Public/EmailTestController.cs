using Microsoft.AspNetCore.Mvc;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.Common.Models;

namespace Stocker.API.Controllers.Public;

[ApiController]
[Route("api/public/email-test")]
public class EmailTestController : ControllerBase
{
    private readonly IEmailService _emailService;
    private readonly ILogger<EmailTestController> _logger;
    private readonly IConfiguration _configuration;

    public EmailTestController(
        IEmailService emailService,
        ILogger<EmailTestController> logger,
        IConfiguration configuration)
    {
        _emailService = emailService;
        _logger = logger;
        _configuration = configuration;
    }

    [HttpPost("send-test")]
    public async Task<IActionResult> SendTestEmail([FromBody] TestEmailRequest request)
    {
        try
        {
            _logger.LogInformation("Test email requested to {Email}", request.Email);
            
            // Check environment
            var environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Unknown";
            _logger.LogInformation("Current environment: {Environment}", environment);
            
            // Check if email is enabled
            var emailEnabled = _configuration.GetValue<bool>("EmailSettings:EnableEmail");
            _logger.LogInformation("Email enabled in config: {EmailEnabled}", emailEnabled);
            
            // Send test email
            var message = new EmailMessage
            {
                To = request.Email,
                Subject = "Stocker Test Email",
                Body = $@"
                    <h2>Test Email from Stocker</h2>
                    <p>This is a test email sent from Stocker application.</p>
                    <p><strong>Environment:</strong> {environment}</p>
                    <p><strong>Timestamp:</strong> {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss} UTC</p>
                    <p><strong>Email Service:</strong> {_emailService.GetType().Name}</p>
                    <hr>
                    <p>If you received this email, your email configuration is working correctly!</p>
                ",
                IsHtml = true
            };
            
            await _emailService.SendAsync(message);
            
            _logger.LogInformation("Test email sent successfully to {Email}", request.Email);
            
            return Ok(new ApiResponse<object>
            {
                Success = true,
                Message = $"Test email sent to {request.Email}",
                Data = new
                {
                    Environment = environment,
                    EmailEnabled = emailEnabled,
                    EmailService = _emailService.GetType().Name,
                    Timestamp = DateTime.UtcNow
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send test email to {Email}", request.Email);
            
            return BadRequest(new ApiResponse<object>
            {
                Success = false,
                Message = $"Failed to send test email: {ex.Message}",
                Errors = new List<string> { ex.ToString() }
            });
        }
    }

    [HttpPost("test-welcome")]
    public async Task<IActionResult> SendTestWelcomeEmail([FromBody] TestWelcomeRequest request)
    {
        try
        {
            _logger.LogInformation("Test welcome email requested to {Email}", request.Email);
            
            // Send welcome email
            await _emailService.SendWelcomeEmailAsync(
                email: request.Email,
                userName: request.UserName ?? "Test User",
                companyName: request.CompanyName ?? "Test Company"
            );
            
            _logger.LogInformation("Test welcome email sent successfully to {Email}", request.Email);
            
            return Ok(new ApiResponse<object>
            {
                Success = true,
                Message = $"Test welcome email sent to {request.Email}",
                Data = new
                {
                    Environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Unknown",
                    EmailService = _emailService.GetType().Name,
                    Timestamp = DateTime.UtcNow
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send test welcome email to {Email}", request.Email);
            
            return BadRequest(new ApiResponse<object>
            {
                Success = false,
                Message = $"Failed to send test welcome email: {ex.Message}",
                Errors = new List<string> { ex.ToString() }
            });
        }
    }

    [HttpGet("check-config")]
    public IActionResult CheckEmailConfiguration()
    {
        var emailSettings = new
        {
            EnableEmail = _configuration.GetValue<bool>("EmailSettings:EnableEmail"),
            SmtpHost = _configuration["EmailSettings:SmtpHost"],
            SmtpPort = _configuration.GetValue<int>("EmailSettings:SmtpPort"),
            FromEmail = _configuration["EmailSettings:FromEmail"],
            FromName = _configuration["EmailSettings:FromName"],
            EnableSsl = _configuration.GetValue<bool>("EmailSettings:EnableSsl"),
            BaseUrl = _configuration["EmailSettings:BaseUrl"],
            Environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Unknown",
            EmailService = _emailService.GetType().Name
        };
        
        return Ok(new ApiResponse<object>
        {
            Success = true,
            Data = emailSettings
        });
    }
}

public class TestEmailRequest
{
    public string Email { get; set; } = string.Empty;
}

public class TestWelcomeRequest
{
    public string Email { get; set; } = string.Empty;
    public string? UserName { get; set; }
    public string? CompanyName { get; set; }
}