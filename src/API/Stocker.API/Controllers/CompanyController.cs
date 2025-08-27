using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MediatR;
using Stocker.Application.Features.Companies.Commands.CreateCompany;
using Stocker.Application.Features.Companies.Commands.UpdateCompany;
using Stocker.Application.Features.Companies.Queries.GetCompany;
using Stocker.Application.Features.Companies.Queries.GetCurrentCompany;
using Stocker.API.Extensions;
using System.Security.Claims;

namespace Stocker.API.Controllers;

[Authorize]
[ApiController]
[Route("api/companies")]
public class CompanyController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<CompanyController> _logger;

    public CompanyController(IMediator mediator, ILogger<CompanyController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Get current tenant's company
    /// </summary>
    [HttpGet("current")]
    public async Task<IActionResult> GetCurrentCompany(CancellationToken cancellationToken)
    {
        try
        {
            var tenantId = User.GetTenantId();
            if (!tenantId.HasValue)
            {
                return BadRequest(new { message = "Tenant bilgisi bulunamadı" });
            }

            var query = new GetCurrentCompanyQuery { TenantId = tenantId.Value };
            var result = await _mediator.Send(query, cancellationToken);
            
            if (result.IsFailure)
            {
                return result.Error.Code == "NotFound" 
                    ? NotFound(new { message = result.Error.Description })
                    : BadRequest(new { message = result.Error.Description });
            }

            return Ok(result.Value);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting current company");
            return StatusCode(500, new { message = "Şirket bilgileri alınırken bir hata oluştu" });
        }
    }

    /// <summary>
    /// Create new company
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> CreateCompany([FromBody] CreateCompanyCommand command, CancellationToken cancellationToken)
    {
        try
        {
            var tenantId = User.GetTenantId();
            if (!tenantId.HasValue)
            {
                return BadRequest(new { message = "Tenant bilgisi bulunamadı" });
            }

            // Check if user is TenantAdmin or Admin
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            if (userRole != "TenantAdmin" && userRole != "Admin" && userRole != "SystemAdmin")
            {
                return Forbid("Bu işlem için yetkiniz yok");
            }

            command.TenantId = tenantId.Value;
            var result = await _mediator.Send(command, cancellationToken);
            
            if (result.IsFailure)
            {
                return BadRequest(new { message = result.Error.Description });
            }

            return CreatedAtAction(nameof(GetCurrentCompany), new { }, result.Value);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating company");
            return StatusCode(500, new { message = "Şirket oluşturulurken bir hata oluştu" });
        }
    }

    /// <summary>
    /// Update company
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCompany(Guid id, [FromBody] UpdateCompanyCommand command, CancellationToken cancellationToken)
    {
        try
        {
            var tenantId = User.GetTenantId();
            if (!tenantId.HasValue)
            {
                return BadRequest(new { message = "Tenant bilgisi bulunamadı" });
            }

            // Check if user is TenantAdmin or Admin
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            if (userRole != "TenantAdmin" && userRole != "Admin" && userRole != "SystemAdmin")
            {
                return Forbid("Bu işlem için yetkiniz yok");
            }

            command.Id = id;
            command.TenantId = tenantId.Value;
            var result = await _mediator.Send(command, cancellationToken);
            
            if (result.IsFailure)
            {
                return result.Error.Code == "NotFound"
                    ? NotFound(new { message = result.Error.Description })
                    : BadRequest(new { message = result.Error.Description });
            }

            return Ok(result.Value);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating company");
            return StatusCode(500, new { message = "Şirket güncellenirken bir hata oluştu" });
        }
    }

    /// <summary>
    /// Get company by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetCompany(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            var tenantId = User.GetTenantId();
            if (!tenantId.HasValue)
            {
                return BadRequest(new { message = "Tenant bilgisi bulunamadı" });
            }

            var query = new GetCompanyQuery { Id = id, TenantId = tenantId.Value };
            var result = await _mediator.Send(query, cancellationToken);
            
            if (result.IsFailure)
            {
                return result.Error.Code == "NotFound"
                    ? NotFound(new { message = result.Error.Description })
                    : BadRequest(new { message = result.Error.Description });
            }

            return Ok(result.Value);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting company");
            return StatusCode(500, new { message = "Şirket bilgileri alınırken bir hata oluştu" });
        }
    }
}