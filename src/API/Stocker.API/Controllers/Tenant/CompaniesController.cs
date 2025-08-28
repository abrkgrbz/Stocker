using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.API.Controllers.Base;
using Stocker.Application.DTOs.Company;
using Stocker.Application.Features.Companies.Commands.CreateCompany;
using Stocker.Application.Features.Companies.Commands.UpdateCompany;
using Stocker.Application.Features.Companies.Queries.GetCompany;
using Stocker.Application.Features.Companies.Queries.GetCurrentCompany;
using Swashbuckle.AspNetCore.Annotations;

namespace Stocker.API.Controllers.Tenant;

[Authorize]
[ApiController]
[Route("api/tenant/companies")]
[SwaggerTag("Tenant - Company Management")]
public class CompaniesController : ApiController
{
    /// <summary>
    /// Get current tenant's company
    /// </summary>
    [HttpGet("current")]
    [ProducesResponseType(typeof(CompanyDto), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetCurrentCompany()
    {
        var tenantId = GetTenantId();
        if (!tenantId.HasValue)
        {
            Logger.LogWarning("GetCurrentCompany called without TenantId");
            return BadRequest(new { message = "Tenant bilgisi bulunamadı" });
        }

        var query = new GetCurrentCompanyQuery { TenantId = tenantId.Value };
        var result = await Mediator.Send(query);
        
        if (result.IsFailure)
        {
            Logger.LogInformation("Company not found for tenant {TenantId}", tenantId);
            return HandleResult(result);
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Create new company for current tenant
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(CompanyDto), 201)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> CreateCompany([FromBody] CreateCompanyCommand command)
    {
        var tenantId = GetTenantId();
        if (!tenantId.HasValue)
        {
            Logger.LogWarning("CreateCompany called without TenantId");
            return BadRequest(new { message = "Tenant bilgisi bulunamadı" });
        }

        // Check user role
        var userRole = GetUserRole();
        if (userRole != "TenantAdmin" && userRole != "Admin" && userRole != "SystemAdmin")
        {
            Logger.LogWarning("User {Email} with role {Role} attempted to create company", 
                GetUserEmail(), userRole);
            return StatusCode(403, new { message = "Bu işlem için yetkiniz yok" });
        }

        command.TenantId = tenantId.Value;
        
        Logger.LogInformation("Creating company for tenant {TenantId}", tenantId);
        var result = await Mediator.Send(command);
        
        if (result.IsFailure)
        {
            Logger.LogWarning("Failed to create company for tenant {TenantId}: {Error}", 
                tenantId, result.Error.Description);
            return HandleResult(result);
        }

        Logger.LogInformation("Company created successfully for tenant {TenantId}", tenantId);
        return CreatedAtAction(nameof(GetCurrentCompany), new { }, result.Value);
    }

    /// <summary>
    /// Update company information
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(CompanyDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> UpdateCompany(Guid id, [FromBody] UpdateCompanyCommand command)
    {
        var tenantId = GetTenantId();
        if (!tenantId.HasValue)
        {
            Logger.LogWarning("UpdateCompany called without TenantId");
            return BadRequest(new { message = "Tenant bilgisi bulunamadı" });
        }

        // Check user role
        var userRole = GetUserRole();
        if (userRole != "TenantAdmin" && userRole != "Admin" && userRole != "SystemAdmin")
        {
            Logger.LogWarning("User {Email} with role {Role} attempted to update company", 
                GetUserEmail(), userRole);
            return StatusCode(403, new { message = "Bu işlem için yetkiniz yok" });
        }

        command.Id = id;
        command.TenantId = tenantId.Value;
        
        Logger.LogInformation("Updating company {CompanyId} for tenant {TenantId}", id, tenantId);
        var result = await Mediator.Send(command);
        
        if (result.IsFailure)
        {
            Logger.LogWarning("Failed to update company {CompanyId}: {Error}", 
                id, result.Error.Description);
            return HandleResult(result);
        }

        Logger.LogInformation("Company {CompanyId} updated successfully", id);
        return Ok(result.Value);
    }

    /// <summary>
    /// Get company by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(CompanyDto), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetCompany(Guid id)
    {
        var tenantId = GetTenantId();
        if (!tenantId.HasValue)
        {
            Logger.LogWarning("GetCompany called without TenantId");
            return BadRequest(new { message = "Tenant bilgisi bulunamadı" });
        }

        var query = new GetCompanyQuery { Id = id, TenantId = tenantId.Value };
        var result = await Mediator.Send(query);
        
        if (result.IsFailure)
        {
            Logger.LogInformation("Company {CompanyId} not found", id);
            return HandleResult(result);
        }

        return Ok(result.Value);
    }
}