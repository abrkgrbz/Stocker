using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Application.DTOs.Package;
using Stocker.Application.DTOs.Tenant;
using Stocker.Application.Features.Packages.Queries.GetPublicPackages;
using Stocker.Application.Features.Tenants.Commands.RegisterTenant;
using Stocker.Application.Features.Subscriptions.Commands.ProcessPayment;
using Swashbuckle.AspNetCore.Annotations;

namespace Stocker.API.Controllers.Public;

[ApiController]
[Route("api/public")]
[AllowAnonymous]
[SwaggerTag("Public API - Registration, packages, and public information")]
public class PublicController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<PublicController> _logger;

    public PublicController(IMediator mediator, ILogger<PublicController> logger)
    {
        _mediator = mediator;
        _logger = logger;
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
        
        try
        {
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
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error registering tenant");
            return StatusCode(500, new 
            { 
                success = false, 
                message = "Kayıt işlemi sırasında bir hata oluştu" 
            });
        }
    }

    /// <summary>
    /// Process payment for tenant registration (simulation)
    /// </summary>
    [HttpPost("process-payment")]
    [ProducesResponseType(200)]
    public async Task<IActionResult> ProcessPayment([FromBody] ProcessPaymentCommand command)
    {
        _logger.LogInformation("Processing payment for tenant: {TenantId}", command.TenantId);
        
        try
        {
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
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing payment");
            return StatusCode(500, new 
            { 
                success = false, 
                message = "Ödeme işlemi sırasında bir hata oluştu" 
            });
        }
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
}