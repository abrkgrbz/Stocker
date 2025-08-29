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
        var userEmail = GetUserEmail();
        
        Logger.LogInformation("CreateCompany - User: {Email}, Role: {Role}, TenantId: {TenantId}", 
            userEmail, userRole ?? "NO_ROLE", tenantId);
        
        // TenantOwner role'ünü de ekleyelim (RegisterTenantCommandHandler'da bu role veriliyor)
        if (userRole != "FirmaYoneticisi" && userRole != "SistemYoneticisi")
        {
            Logger.LogWarning("User {Email} with role {Role} attempted to create company - DENIED", 
                userEmail, userRole ?? "NO_ROLE");
            return StatusCode(403, new { 
                message = "Bu işlem için yetkiniz yok",
                currentRole = userRole ?? "NO_ROLE",
                allowedRoles = new[] { "FirmaYoneticisi", "SistemYoneticisi" }
            });
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
        var userEmail = GetUserEmail();
        
        // TenantOwner role'ünü de ekleyelim
        if (userRole != "FirmaYoneticisi" && userRole != "SistemYoneticisi")
        {
            Logger.LogWarning("User {Email} with role {Role} attempted to update company - DENIED", 
                userEmail, userRole ?? "NO_ROLE");
            return StatusCode(403, new { 
                message = "Bu işlem için yetkiniz yok",
                currentRole = userRole ?? "NO_ROLE",
                allowedRoles = new[] { "FirmaYoneticisi", "SistemYoneticisi" }
            });
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