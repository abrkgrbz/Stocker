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

    /// <summary>
    /// Get registration status by code
    /// </summary>
    [HttpGet("status/{registrationCode}")]
    public async Task<IActionResult> GetRegistrationStatus(string registrationCode)
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

    /// <summary>
    /// Get setup wizard for a tenant
    /// </summary>
    [HttpGet("wizard/{tenantId}")]
    [Authorize]
    public async Task<IActionResult> GetSetupWizard(Guid tenantId)
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

    /// <summary>
    /// Update wizard step
    /// </summary>
    [HttpPut("wizard/{wizardId}/step")]
    [Authorize]
    public async Task<IActionResult> UpdateWizardStep(Guid wizardId, [FromBody] UpdateWizardStepCommand command)
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

    /// <summary>
    /// Get setup checklist for a tenant
    /// </summary>
    [HttpGet("checklist/{tenantId}")]
    [Authorize]
    public async Task<IActionResult> GetSetupChecklist(Guid tenantId)
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

    /// <summary>
    /// Update checklist item
    /// </summary>
    [HttpPut("checklist/{checklistId}/item")]
    [Authorize]
    public async Task<IActionResult> UpdateChecklistItem(Guid checklistId, [FromBody] UpdateChecklistItemCommand command)
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

    /// <summary>
    /// Verify email for registration
    /// </summary>
    [HttpPost("verify-email")]
    public async Task<IActionResult> VerifyEmail([FromBody] VerifyTenantEmailCommand command)
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
}