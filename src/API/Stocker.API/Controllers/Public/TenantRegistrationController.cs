using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Application.DTOs.TenantRegistration;
using Stocker.Application.Features.TenantRegistration.Commands.CreateTenantRegistration;
using Stocker.Application.Features.TenantRegistration.Commands.VerifyEmail;
using Stocker.Application.Features.TenantRegistration.Queries.GetTenantRegistration;
using Stocker.Application.Features.TenantRegistration.Queries.GetSetupWizard;
using Stocker.Application.Features.TenantRegistration.Queries.GetSetupChecklist;
using Stocker.Application.Features.TenantSetupWizard.Commands.UpdateWizardStep;
using Stocker.Application.Features.TenantSetupChecklist.Commands.UpdateChecklistItem;

namespace Stocker.API.Controllers.Public;

[Route("api/public/tenant-registration")]
[ApiController]
[AllowAnonymous]
public class TenantRegistrationController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<TenantRegistrationController> _logger;

    public TenantRegistrationController(IMediator mediator, ILogger<TenantRegistrationController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Create a new tenant registration
    /// </summary>
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] CreateTenantRegistrationCommand command)
    {
        try
        {
            var result = await _mediator.Send(command);
            
            if (result.IsSuccess)
            {
                return Ok(new
                {
                    success = true,
                    data = result.Value,
                    message = "Kayıt başarıyla oluşturuldu. E-posta adresinize onay maili gönderildi."
                });
            }
            
            return BadRequest(new
            {
                success = false,
                message = result.Error?.Description ?? "An error occurred"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in tenant registration");
            return StatusCode(500, new
            {
                success = false,
                message = "Kayıt sırasında bir hata oluştu. Lütfen daha sonra tekrar deneyin."
            });
        }
    }

    /// <summary>
    /// Get registration status by code
    /// </summary>
    [HttpGet("status/{registrationCode}")]
    public async Task<IActionResult> GetRegistrationStatus(string registrationCode)
    {
        try
        {
            var query = new GetTenantRegistrationQuery { RegistrationCode = registrationCode };
            var result = await _mediator.Send(query);
            
            if (result.IsSuccess)
            {
                return Ok(new
                {
                    success = true,
                    data = result.Value
                });
            }
            
            return NotFound(new
            {
                success = false,
                message = "Kayıt bulunamadı."
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting registration status");
            return StatusCode(500, new
            {
                success = false,
                message = "Bir hata oluştu."
            });
        }
    }

    /// <summary>
    /// Get setup wizard for a tenant
    /// </summary>
    [HttpGet("wizard/{tenantId}")]
    [Authorize]
    public async Task<IActionResult> GetSetupWizard(Guid tenantId)
    {
        try
        {
            var query = new GetSetupWizardQuery { TenantId = tenantId };
            var result = await _mediator.Send(query);
            
            if (result.IsSuccess)
            {
                return Ok(new
                {
                    success = true,
                    data = result.Value
                });
            }
            
            return NotFound(new
            {
                success = false,
                message = "Setup wizard bulunamadı."
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting setup wizard");
            return StatusCode(500, new
            {
                success = false,
                message = "Bir hata oluştu."
            });
        }
    }

    /// <summary>
    /// Update wizard step
    /// </summary>
    [HttpPut("wizard/{wizardId}/step")]
    [Authorize]
    public async Task<IActionResult> UpdateWizardStep(Guid wizardId, [FromBody] UpdateWizardStepCommand command)
    {
        try
        {
            command.WizardId = wizardId;
            var result = await _mediator.Send(command);
            
            if (result.IsSuccess)
            {
                return Ok(new
                {
                    success = true,
                    data = result.Value,
                    message = "Adım güncellendi."
                });
            }
            
            return BadRequest(new
            {
                success = false,
                message = result.Error?.Description ?? "An error occurred"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating wizard step");
            return StatusCode(500, new
            {
                success = false,
                message = "Bir hata oluştu."
            });
        }
    }

    /// <summary>
    /// Get setup checklist for a tenant
    /// </summary>
    [HttpGet("checklist/{tenantId}")]
    [Authorize]
    public async Task<IActionResult> GetSetupChecklist(Guid tenantId)
    {
        try
        {
            var query = new GetSetupChecklistQuery { TenantId = tenantId };
            var result = await _mediator.Send(query);
            
            if (result.IsSuccess)
            {
                return Ok(new
                {
                    success = true,
                    data = result.Value
                });
            }
            
            return NotFound(new
            {
                success = false,
                message = "Checklist bulunamadı."
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting setup checklist");
            return StatusCode(500, new
            {
                success = false,
                message = "Bir hata oluştu."
            });
        }
    }

    /// <summary>
    /// Update checklist item
    /// </summary>
    [HttpPut("checklist/{checklistId}/item")]
    [Authorize]
    public async Task<IActionResult> UpdateChecklistItem(Guid checklistId, [FromBody] UpdateChecklistItemCommand command)
    {
        try
        {
            command.ChecklistId = checklistId;
            var result = await _mediator.Send(command);
            
            if (result.IsSuccess)
            {
                return Ok(new
                {
                    success = true,
                    data = result.Value,
                    message = "Checklist öğesi güncellendi."
                });
            }
            
            return BadRequest(new
            {
                success = false,
                message = result.Error?.Description ?? "An error occurred"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating checklist item");
            return StatusCode(500, new
            {
                success = false,
                message = "Bir hata oluştu."
            });
        }
    }

    /// <summary>
    /// Verify email for registration
    /// </summary>
    [HttpPost("verify-email")]
    public async Task<IActionResult> VerifyEmail([FromBody] VerifyEmailCommand command)
    {
        try
        {
            var result = await _mediator.Send(command);
            
            if (result.IsSuccess)
            {
                return Ok(new
                {
                    success = true,
                    message = "E-posta adresi doğrulandı."
                });
            }
            
            return BadRequest(new
            {
                success = false,
                message = result.Error?.Description ?? "An error occurred"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error verifying email");
            return StatusCode(500, new
            {
                success = false,
                message = "Bir hata oluştu."
            });
        }
    }
}