using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.DTOs.Package;
using Stocker.Application.DTOs.Tenant;
using Stocker.Application.DTOs.Module;
using Stocker.Application.Features.Packages.Queries.GetPublicPackages;
using Stocker.Application.Features.Tenants.Commands.RegisterTenant;
using Stocker.Application.Features.Subscriptions.Commands.ProcessPayment;
using Stocker.Application.Features.Modules.Queries.GetAvailableModules;
using Stocker.Application.Features.Modules.Queries.CalculateCustomPackagePrice;
using Stocker.Persistence.Contexts;
using Swashbuckle.AspNetCore.Annotations;
using Stocker.Application.Common.Exceptions;
using Stocker.SharedKernel.Exceptions;
using System.Diagnostics;
using System.Security.Cryptography;
using System.Text;

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
    private readonly IConfiguration _configuration;

    public PublicController(
        IMediator mediator,
        ILogger<PublicController> logger,
        IEmailService emailService,
        MasterDbContext masterContext,
        ISecurityAuditService auditService,
        IConfiguration configuration)
    {
        _mediator = mediator;
        _logger = logger;
        _emailService = emailService;
        _masterContext = masterContext;
        _auditService = auditService;
        _configuration = configuration;
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
    /// Get available modules for custom package creation
    /// </summary>
    [HttpGet("modules")]
    [ProducesResponseType(typeof(List<ModuleDefinitionDto>), 200)]
    public async Task<IActionResult> GetAvailableModules()
    {
        _logger.LogInformation("Getting available modules list for custom package");

        var query = new GetAvailableModulesQuery();
        var result = await _mediator.Send(query);

        if (result.IsSuccess)
        {
            return Ok(new { success = true, data = result.Value });
        }

        return BadRequest(new { success = false, message = result.Error?.Description ?? "Modüller yüklenemedi" });
    }

    /// <summary>
    /// Calculate price for custom package based on selected modules
    /// </summary>
    [HttpPost("calculate-price")]
    [ProducesResponseType(typeof(CustomPackagePriceResponseDto), 200)]
    public async Task<IActionResult> CalculateCustomPackagePrice([FromBody] CustomPackagePriceRequestDto request)
    {
        _logger.LogInformation("Calculating custom package price for {ModuleCount} modules", request.SelectedModuleCodes.Count);

        var query = new CalculateCustomPackagePriceQuery(request.SelectedModuleCodes);
        var result = await _mediator.Send(query);

        if (result.IsSuccess)
        {
            return Ok(new { success = true, data = result.Value });
        }

        return BadRequest(new { success = false, message = result.Error?.Description ?? "Fiyat hesaplanamadı" });
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
    /// Check if email exists and return list of accessible tenants
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

            // Find MasterUser by email - optimized query
            var masterUsers = await _masterContext.Set<Domain.Master.Entities.MasterUser>()
                .Where(u => u.IsActive)
                .Select(u => new { u.Id, Email = u.Email.Value, u.IsActive })
                .ToListAsync();

            var masterUser = masterUsers.FirstOrDefault(u => u.Email.ToLowerInvariant() == normalizedEmail);

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
                        tenants = new List<object>()
                    }
                });
            }

            // Get tenant registrations where this email is the admin - optimized query
            var allRegistrations = await _masterContext.TenantRegistrations
                .Where(r => r.TenantId.HasValue)
                .Select(r => new { Email = r.AdminEmail.Value, TenantId = r.TenantId!.Value })
                .ToListAsync();

            var tenantRegistrations = allRegistrations
                .Where(r => r.Email.ToLowerInvariant() == normalizedEmail)
                .Select(r => r.TenantId)
                .ToList();

            // Get tenant details for these registrations
            var tenantsData = await _masterContext.Tenants
                .Where(t => tenantRegistrations.Contains(t.Id) && t.IsActive)
                .OrderBy(t => t.Name)
                .Select(t => new
                {
                    id = t.Id,
                    name = t.Name,
                    code = t.Code,
                    logoUrl = t.LogoUrl,
                    domain = $"{t.Code}.stoocker.app"
                })
                .ToListAsync();

            _logger.LogInformation("User {Email} found with {TenantCount} available tenants", request.Email, tenantsData.Count);

            // Log successful email check
            await _auditService.LogAuthEventAsync(new SecurityAuditEvent
            {
                Event = "email_check_success",
                Email = normalizedEmail,
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
                    tenants = tenantsData
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

    /// <summary>
    /// Check if tenant exists and is active by tenant code
    /// </summary>
    [HttpGet("tenant-check/{tenantCode}")]
    [ProducesResponseType(200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> CheckTenant(string tenantCode)
    {
        _logger.LogInformation("Checking tenant existence: {TenantCode}", tenantCode);

        try
        {
            var normalizedCode = tenantCode.ToLowerInvariant().Trim();

            // Fetch all active tenants and filter in memory (SQL Server doesn't support ToLower in LINQ)
            var tenants = await _masterContext.Tenants
                .Where(t => t.IsActive)
                .Select(t => new
                {
                    id = t.Id,
                    name = t.Name,
                    code = t.Code,
                    isActive = t.IsActive
                })
                .ToListAsync();

            var tenant = tenants
                .FirstOrDefault(t => t.code.ToLowerInvariant() == normalizedCode);

            if (tenant == null)
            {
                _logger.LogWarning("Tenant not found or inactive: {TenantCode}", tenantCode);
                return NotFound(new
                {
                    success = false,
                    message = "Tenant not found"
                });
            }

            _logger.LogInformation("Tenant {TenantCode} found and active", tenantCode);

            return Ok(new
            {
                success = true,
                data = tenant
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking tenant: {TenantCode}", tenantCode);
            return BadRequest(new
            {
                success = false,
                message = "An error occurred while checking tenant"
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