using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.Finance.Application.DTOs;
using Stocker.Modules.Finance.Application.Features.CostCenters.Commands;
using Stocker.Modules.Finance.Application.Features.CostCenters.Queries;
using Stocker.Modules.Finance.Domain.Entities;
using Stocker.SharedKernel.Authorization;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Finance.API.Controllers;

/// <summary>
/// Masraf Merkezi (Cost Center) API Controller
/// </summary>
[ApiController]
[Authorize]
[Route("api/finance/cost-centers")]
[RequireModule("Finance")]
[ApiExplorerSettings(GroupName = "finance")]
public class CostCentersController : ControllerBase
{
    private readonly IMediator _mediator;

    public CostCentersController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Get paginated cost centers
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<CostCenterSummaryDto>), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<PagedResult<CostCenterSummaryDto>>> GetCostCenters(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? searchTerm = null,
        [FromQuery] int? type = null,
        [FromQuery] int? category = null,
        [FromQuery] int? parentId = null,
        [FromQuery] int? departmentId = null,
        [FromQuery] int? branchId = null,
        [FromQuery] bool? isActive = null,
        [FromQuery] bool? isFrozen = null,
        [FromQuery] bool? isOverBudget = null,
        [FromQuery] string? sortBy = null,
        [FromQuery] bool sortDescending = false)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var query = new GetCostCentersQuery
        {
            TenantId = tenantId.Value,
            Filter = new CostCenterFilterDto
            {
                PageNumber = pageNumber,
                PageSize = pageSize,
                SearchTerm = searchTerm,
                Type = type.HasValue ? (CostCenterType)type.Value : null,
                Category = category.HasValue ? (CostCenterCategory)category.Value : null,
                ParentId = parentId,
                DepartmentId = departmentId,
                BranchId = branchId,
                IsActive = isActive,
                IsFrozen = isFrozen,
                IsOverBudget = isOverBudget,
                SortBy = sortBy,
                SortDescending = sortDescending
            }
        };

        var result = await _mediator.Send(query);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    /// <summary>
    /// Get cost center by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(CostCenterDto), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<CostCenterDto>> GetCostCenter(int id)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var query = new GetCostCenterByIdQuery
        {
            TenantId = tenantId.Value,
            Id = id
        };

        var result = await _mediator.Send(query);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(result.Error);
            return BadRequest(result.Error);
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Get cost center by code
    /// </summary>
    [HttpGet("by-code/{code}")]
    [ProducesResponseType(typeof(CostCenterDto), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<CostCenterDto>> GetCostCenterByCode(string code)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var query = new GetCostCenterByCodeQuery
        {
            TenantId = tenantId.Value,
            Code = code
        };

        var result = await _mediator.Send(query);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(result.Error);
            return BadRequest(result.Error);
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Get cost center tree structure
    /// </summary>
    [HttpGet("tree")]
    [ProducesResponseType(typeof(List<CostCenterTreeNodeDto>), 200)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<List<CostCenterTreeNodeDto>>> GetCostCenterTree(
        [FromQuery] int? rootId = null,
        [FromQuery] bool activeOnly = true,
        [FromQuery] int maxDepth = 0)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var query = new GetCostCenterTreeQuery
        {
            TenantId = tenantId.Value,
            RootId = rootId,
            ActiveOnly = activeOnly,
            MaxDepth = maxDepth
        };

        var result = await _mediator.Send(query);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    /// <summary>
    /// Get active cost centers for selection
    /// </summary>
    [HttpGet("active")]
    [ProducesResponseType(typeof(List<CostCenterSummaryDto>), 200)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<List<CostCenterSummaryDto>>> GetActiveCostCenters(
        [FromQuery] int? type = null,
        [FromQuery] int? category = null)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var query = new GetActiveCostCentersQuery
        {
            TenantId = tenantId.Value,
            Type = type.HasValue ? (CostCenterType)type.Value : null,
            Category = category.HasValue ? (CostCenterCategory)category.Value : null
        };

        var result = await _mediator.Send(query);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    /// <summary>
    /// Get child cost centers
    /// </summary>
    [HttpGet("{parentId}/children")]
    [ProducesResponseType(typeof(List<CostCenterSummaryDto>), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<List<CostCenterSummaryDto>>> GetChildCostCenters(
        int parentId,
        [FromQuery] bool activeOnly = true,
        [FromQuery] bool recursive = false)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var query = new GetChildCostCentersQuery
        {
            TenantId = tenantId.Value,
            ParentId = parentId,
            ActiveOnly = activeOnly,
            Recursive = recursive
        };

        var result = await _mediator.Send(query);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(result.Error);
            return BadRequest(result.Error);
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Create a new cost center
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(CostCenterDto), 201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<CostCenterDto>> CreateCostCenter([FromBody] CreateCostCenterDto dto)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var command = new CreateCostCenterCommand
        {
            TenantId = tenantId.Value,
            Data = dto
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return CreatedAtAction(nameof(GetCostCenter), new { id = result.Value.Id }, result.Value);
    }

    /// <summary>
    /// Update a cost center
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(CostCenterDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<CostCenterDto>> UpdateCostCenter(int id, [FromBody] UpdateCostCenterDto dto)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var command = new UpdateCostCenterCommand
        {
            TenantId = tenantId.Value,
            Id = id,
            Data = dto
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(result.Error);
            return BadRequest(result.Error);
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Activate a cost center
    /// </summary>
    [HttpPost("{id}/activate")]
    [ProducesResponseType(204)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> ActivateCostCenter(int id)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var command = new ActivateCostCenterCommand
        {
            TenantId = tenantId.Value,
            Id = id
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(result.Error);
            return BadRequest(result.Error);
        }

        return NoContent();
    }

    /// <summary>
    /// Deactivate a cost center
    /// </summary>
    [HttpPost("{id}/deactivate")]
    [ProducesResponseType(204)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> DeactivateCostCenter(int id)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var command = new DeactivateCostCenterCommand
        {
            TenantId = tenantId.Value,
            Id = id
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(result.Error);
            return BadRequest(result.Error);
        }

        return NoContent();
    }

    /// <summary>
    /// Freeze a cost center
    /// </summary>
    [HttpPost("{id}/freeze")]
    [ProducesResponseType(204)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> FreezeCostCenter(int id)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var command = new FreezeCostCenterCommand
        {
            TenantId = tenantId.Value,
            Id = id
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(result.Error);
            return BadRequest(result.Error);
        }

        return NoContent();
    }

    /// <summary>
    /// Unfreeze a cost center
    /// </summary>
    [HttpPost("{id}/unfreeze")]
    [ProducesResponseType(204)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> UnfreezeCostCenter(int id)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var command = new UnfreezeCostCenterCommand
        {
            TenantId = tenantId.Value,
            Id = id
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(result.Error);
            return BadRequest(result.Error);
        }

        return NoContent();
    }

    /// <summary>
    /// Delete a cost center
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> DeleteCostCenter(int id)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var command = new DeleteCostCenterCommand
        {
            TenantId = tenantId.Value,
            Id = id
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(result.Error);
            return BadRequest(result.Error);
        }

        return NoContent();
    }
}
