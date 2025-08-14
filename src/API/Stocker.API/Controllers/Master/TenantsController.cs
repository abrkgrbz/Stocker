using MediatR;
using Microsoft.AspNetCore.Mvc;
using Stocker.Application.Features.Tenants.Commands.CreateTenant;
using Stocker.Application.Features.Tenants.Commands.UpdateTenant;
using Stocker.Application.Features.Tenants.Commands.ToggleTenantStatus;
using Stocker.Application.Features.Tenants.Commands.DeleteTenant;
using Stocker.Application.Features.Tenants.Queries.GetTenantById;
using Stocker.Application.Features.Tenants.Queries.GetTenantsList;
using Stocker.Application.Features.Tenants.Queries.GetTenantStatistics;
using Stocker.Application.DTOs.Tenant;
using Swashbuckle.AspNetCore.Annotations;

namespace Stocker.API.Controllers.Master;

[SwaggerTag("Tenant Management - Manage system tenants and their configurations")]

public class TenantsController : MasterControllerBase
{
    public TenantsController(IMediator mediator, ILogger<TenantsController> logger) 
        : base(mediator, logger)
    {
    }

    /// <summary>
    /// Get all tenants with pagination and filtering
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<List<TenantListDto>>), 200)]
    public async Task<IActionResult> GetAll([FromQuery] GetTenantsListQuery query)
    {
        _logger.LogInformation("Getting all tenants with query: {@Query}", query);
        
        var result = await _mediator.Send(query);
        return HandleResult(result);
    }

    /// <summary>
    /// Get tenant by ID with detailed information
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<TenantDto>), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetById(Guid id)
    {
        _logger.LogInformation("Getting tenant details for ID: {TenantId}", id);
        
        var query = new GetTenantByIdQuery(id);
        var result = await _mediator.Send(query);
        return HandleResult(result);
    }

    /// <summary>
    /// Get tenant statistics
    /// </summary>
    [HttpGet("{id}/statistics")]
    [ProducesResponseType(typeof(ApiResponse<TenantStatisticsDto>), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetStatistics(Guid id)
    {
        _logger.LogInformation("Getting tenant statistics for ID: {TenantId}", id);
        
        var query = new GetTenantStatisticsQuery { TenantId = id };
        var result = await _mediator.Send(query);
        return HandleResult(result);
    }

    /// <summary>
    /// Create a new tenant
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<TenantDto>), 201)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> Create([FromBody] CreateTenantCommand command)
    {
        _logger.LogInformation("Creating new tenant: {TenantName}", command.Name);
        
        var result = await _mediator.Send(command);
        
        if (result.IsSuccess)
        {
            _logger.LogInformation("Tenant created successfully with ID: {TenantId}", result.Value.Id);
            return CreatedAtAction(nameof(GetById), new { id = result.Value.Id }, 
                new ApiResponse<TenantDto>
                {
                    Success = true,
                    Data = result.Value,
                    Message = "Tenant created successfully",
                    Timestamp = DateTime.UtcNow
                });
        }
        
        return HandleResult(result);
    }

    /// <summary>
    /// Update tenant information
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<bool>), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateTenantCommand command)
    {
        _logger.LogInformation("Updating tenant ID: {TenantId}", id);
        
        command.Id = id;
        command.ModifiedBy = CurrentUserId;
        
        var result = await _mediator.Send(command);
        
        if (result.IsSuccess)
        {
            _logger.LogInformation("Tenant {TenantId} updated successfully", id);
        }
        
        return HandleResult(result);
    }

    /// <summary>
    /// Activate or deactivate a tenant
    /// </summary>
    [HttpPost("{id}/toggle-status")]
    [ProducesResponseType(typeof(ApiResponse<bool>), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> ToggleStatus(Guid id)
    {
        _logger.LogWarning("Toggling status for tenant ID: {TenantId} by user: {UserEmail}", 
            id, CurrentUserEmail);
        
        var command = new ToggleTenantStatusCommand 
        { 
            Id = id,
            ModifiedBy = CurrentUserId
        };
        
        var result = await _mediator.Send(command);
        
        if (result.IsSuccess)
        {
            var status = result.Value ? "activated" : "deactivated";
            _logger.LogWarning("Tenant {TenantId} has been {Status} by {UserEmail}", 
                id, status, CurrentUserEmail);
        }
        
        return HandleResult(result);
    }

    /// <summary>
    /// Delete a tenant (soft delete)
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(typeof(ApiResponse<bool>), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> Delete(Guid id, [FromQuery] string? reason = null, [FromQuery] bool hardDelete = false)
    {
        _logger.LogWarning("Deleting tenant ID: {TenantId} by user: {UserEmail}. HardDelete: {HardDelete}", 
            id, CurrentUserEmail, hardDelete);
        
        var command = new DeleteTenantCommand(id, reason, hardDelete);
        var result = await _mediator.Send(command);
        
        return HandleResult(result);
    }
}
