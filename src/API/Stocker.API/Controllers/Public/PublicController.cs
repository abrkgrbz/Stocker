using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.DTOs.Package;
using Stocker.Application.DTOs.Tenant;
using Stocker.Application.Features.Packages.Queries.GetPublicPackages;
using Stocker.Application.Features.Tenants.Commands.RegisterTenant;
using Stocker.Application.Features.Subscriptions.Commands.ProcessPayment;
using Stocker.Persistence.Contexts;
using Swashbuckle.AspNetCore.Annotations;
using Stocker.Application.Common.Exceptions;
using Stocker.SharedKernel.Exceptions;
using System.Diagnostics;

namespace Stocker.API.Controllers.Public;

[ApiController]
[Route("api/public")]
[AllowAnonymous]
[SwaggerTag("Public API - Registration, packages, and public information")]
public class PublicController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<PublicController> _logger;
    private readonly IEmailService _emailService;
    private readonly MasterDbContext _masterContext;
    private readonly ISecurityAuditService _auditService;

    public PublicController(
        IMediator mediator,
        ILogger<PublicController> logger,
        IEmailService emailService,
        MasterDbContext masterContext,
        ISecurityAuditService auditService)
    {
        _mediator = mediator;
        _logger = logger;
        _emailService = emailService;
        _masterContext = masterContext;
        _auditService = auditService;
    }

    /// <summary>
    /// Get available packages for public registration
    /// </summary>
    [HttpGet("packages")]
    [ProducesResponseType(typeof(List<PackageDto>), 200)]
    public async Task<IActionResult> GetPackages()
    {
        _logger.LogInformation("Getting public packages list");
        
        var query = new GetPublicPackagesQuery();
        var result = await _mediator.Send(query);
        
        if (result.IsSuccess)
        {
            return Ok(new { success = true, data = result.Value });
        }
        
        return BadRequest(new { success = false, message = result.Error.Description });
    }

    /// <summary>
    /// Register new tenant with selected package
    /// </summary>
    [HttpPost("register")]
    [ProducesResponseType(typeof(TenantDto), 200)]
    public async Task<IActionResult> RegisterTenant([FromBody] RegisterTenantCommand command)
    {
        _logger.LogInformation("Registering new tenant: {CompanyName}", command.CompanyName);
        
        var result = await _mediator.Send(command);
        
        if (result.IsSuccess)
        {
            return Ok(new 
            { 
                success = true, 
                data = result.Value,
                message = "Kayıt başarılı! Email adresinize aktivasyon linki gönderildi."
            });
        }
        
        return BadRequest(new 
        { 
            success = false, 
            message = result.Error.Description 
        });
    }

    /// <summary>
    /// Process payment for tenant registration (simulation)
    /// </summary>
    [HttpPost("process-payment")]
    [ProducesResponseType(200)]
    public async Task<IActionResult> ProcessPayment([FromBody] ProcessPaymentCommand command)
    {
        _logger.LogInformation("Processing payment for tenant: {TenantId}", command.TenantId);
        
        // Simulate payment processing
        await Task.Delay(2000); // Simulate payment gateway delay
        
        var result = await _mediator.Send(command);
        
        if (result.IsSuccess)
        {
            return Ok(new 
            { 
                success = true,
                message = "Ödeme başarıyla işlendi",
                transactionId = Guid.NewGuid().ToString(),
                data = result.Value
            });
        }
        
        return BadRequest(new 
        { 
            success = false, 
            message = result.Error.Description 
        });
    }

    /// <summary>
    /// Verify email address
    /// </summary>
    [HttpGet("verify-email")]
    public async Task<IActionResult> VerifyEmail([FromQuery] string token)
    {
        _logger.LogInformation("Verifying email with token: {Token}", token);
        
        // In real implementation, this would verify the email token
        await Task.Delay(1000);
        
        return Ok(new 
        { 
            success = true, 
            message = "Email adresiniz başarıyla doğrulandı" 
        });
    }

    /// <summary>
    /// Check domain availability
    /// </summary>
    [HttpGet("check-domain")]
    public async Task<IActionResult> CheckDomain([FromQuery] string domain)
    {
        _logger.LogInformation("Checking domain availability: {Domain}", domain);
        
        // In real implementation, check if domain is available
        var isAvailable = !domain.ToLower().Contains("test");
        
        await Task.Delay(500);
        
        return Ok(new 
        { 
            success = true,
            available = isAvailable,
            message = isAvailable ? "Domain kullanılabilir" : "Bu domain zaten kullanımda"
        });
    }

    /// <summary>
    /// Test email service connectivity and configuration
    /// </summary>
    [HttpPost("test-email")]
    [ProducesResponseType(200)]
    [ProducesResponseType(500)]
    public async Task<IActionResult> TestEmail([FromBody] TestEmailRequest request)
    {
        _logger.LogInformation("Testing email service to: {Email}", request.Email);

        var emailMessage = new EmailMessage
        {
            To = request.Email,
            Subject = "Stocker Email Test",
            Body = $@"
                <h2>Email Test Başarılı!</h2>
                <p>Bu bir test emailidir.</p>
                <p>Eğer bu emaili aldıysanız, email servisi çalışıyor demektir.</p>
                <br>
                <p><strong>Test Bilgileri:</strong></p>
                <ul>
                    <li>Gönderim Zamanı: {DateTime.Now:dd.MM.yyyy HH:mm:ss}</li>
                    <li>Server: {Environment.MachineName}</li>
                    <li>Environment: {Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Development"}</li>
                </ul>
                <br>
                <p>Saygılarımızla,<br>Stocker Ekibi</p>
            ",
            IsHtml = true
        };

        await _emailService.SendAsync(emailMessage);

        _logger.LogInformation("Test email sent successfully to: {Email}", request.Email);

        return Ok(new
        {
            success = true,
            message = $"Test emaili başarıyla {request.Email} adresine gönderildi. Lütfen inbox ve spam klasörünüzü kontrol edin.",
            timestamp = DateTime.UtcNow
        });
    }

    /// <summary>
    /// Check if email exists and return tenant information
    /// </summary>
    [HttpPost("check-email")]
    [ProducesResponseType(200)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> CheckEmail([FromBody] CheckEmailRequest request)
    {
        var stopwatch = Stopwatch.StartNew();
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
        var userAgent = Request.Headers["User-Agent"].ToString();

        _logger.LogInformation("Checking email existence: {Email}", request.Email);

        try
        {
            var normalizedEmail = request.Email.ToLowerInvariant().Trim();

            // Find MasterUser by email
            var masterUser = await _masterContext.Set<Domain.Master.Entities.MasterUser>()
                .Where(u => u.Email.Value.ToLower() == normalizedEmail)
                .Select(u => new { u.Id, Email = u.Email.Value, u.IsActive })
                .FirstOrDefaultAsync();

            if (masterUser == null)
            {
                // Log email check - not found
                await _auditService.LogAuthEventAsync(new SecurityAuditEvent
                {
                    Event = "email_check_not_found",
                    Email = normalizedEmail,
                    IpAddress = ipAddress,
                    UserAgent = userAgent,
                    DurationMs = (int)stopwatch.ElapsedMilliseconds,
                    GdprCategory = "authentication"
                });

                return Ok(new
                {
                    success = true,
                    data = new
                    {
                        exists = false,
                        tenant = (object?)null
                    }
                });
            }

            // Find tenant through TenantRegistration
            var registration = await _masterContext.TenantRegistrations
                .Where(r => r.AdminEmail.Value.ToLower() == normalizedEmail && r.TenantId != null)
                .Select(r => new { r.TenantId })
                .FirstOrDefaultAsync();

            Guid? tenantId = registration?.TenantId;

            // Fallback: try Tenant.ContactEmail
            if (!tenantId.HasValue)
            {
                tenantId = await _masterContext.Tenants
                    .Where(t => t.ContactEmail.Value.ToLower() == normalizedEmail)
                    .Select(t => (Guid?)t.Id)
                    .FirstOrDefaultAsync();
            }

            if (!tenantId.HasValue)
            {
                _logger.LogWarning("User {Email} found but not associated with tenant", request.Email);

                // Log email check - no tenant
                await _auditService.LogSecurityEventAsync(new SecurityAuditEvent
                {
                    Event = "email_check_no_tenant",
                    Email = normalizedEmail,
                    IpAddress = ipAddress,
                    UserAgent = userAgent,
                    RiskScore = 20,
                    DurationMs = (int)stopwatch.ElapsedMilliseconds
                });

                return Ok(new
                {
                    success = true,
                    data = new
                    {
                        exists = true,
                        tenant = (object?)null
                    }
                });
            }

            // Get tenant info
            var tenant = await _masterContext.Tenants
                .Where(t => t.Id == tenantId.Value)
                .Select(t => new
                {
                    id = t.Id,
                    name = t.Name,
                    code = t.Code,
                    logoUrl = t.LogoUrl,
                    isActive = t.IsActive
                })
                .FirstOrDefaultAsync();

            _logger.LogInformation("User {Email} found with tenant: {TenantName}", request.Email, tenant?.name ?? "None");

            // Log successful email check
            await _auditService.LogAuthEventAsync(new SecurityAuditEvent
            {
                Event = "email_check_success",
                Email = normalizedEmail,
                TenantCode = tenant?.code,
                UserId = masterUser.Id,
                IpAddress = ipAddress,
                UserAgent = userAgent,
                DurationMs = (int)stopwatch.ElapsedMilliseconds,
                GdprCategory = "authentication"
            });

            return Ok(new
            {
                success = true,
                data = new
                {
                    exists = true,
                    tenant
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking email: {Email}", request.Email);

            // Log error
            await _auditService.LogSecurityEventAsync(new SecurityAuditEvent
            {
                Event = "email_check_error",
                Email = request.Email,
                IpAddress = ipAddress,
                RiskScore = 30,
                DurationMs = (int)stopwatch.ElapsedMilliseconds,
                Metadata = System.Text.Json.JsonSerializer.Serialize(new { error = ex.Message })
            });

            return BadRequest(new
            {
                success = false,
                message = "An error occurred while checking email"
            });
        }
    }
}

public class CheckEmailRequest
{
    public string Email { get; set; } = string.Empty;
}

public class TestEmailRequest
{
    public string Email { get; set; } = string.Empty;
}