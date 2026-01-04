using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.Finance.Application.DTOs;
using Stocker.Modules.Finance.Application.Features.Budgets.Commands;
using Stocker.Modules.Finance.Application.Features.Budgets.Queries;
using Stocker.Modules.Finance.Domain.Entities;
using Stocker.SharedKernel.Authorization;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Finance.API.Controllers;

/// <summary>
/// Bütçe (Budget) API Controller
/// </summary>
[ApiController]
[Authorize]
[Route("api/finance/budgets")]
[RequireModule("Finance")]
[ApiExplorerSettings(GroupName = "finance")]
public class BudgetsController : ControllerBase
{
    private readonly IMediator _mediator;

    public BudgetsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Get paginated budgets
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<BudgetSummaryDto>), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<PagedResult<BudgetSummaryDto>>> GetBudgets(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? searchTerm = null,
        [FromQuery] int? type = null,
        [FromQuery] int? category = null,
        [FromQuery] int? status = null,
        [FromQuery] int? fiscalYear = null,
        [FromQuery] int? parentBudgetId = null,
        [FromQuery] int? costCenterId = null,
        [FromQuery] int? departmentId = null,
        [FromQuery] int? projectId = null,
        [FromQuery] int? ownerUserId = null,
        [FromQuery] bool? isActive = null,
        [FromQuery] bool? isLocked = null,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        [FromQuery] string? sortBy = null,
        [FromQuery] bool sortDescending = false)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var query = new GetBudgetsQuery
        {
            TenantId = tenantId.Value,
            Filter = new BudgetFilterDto
            {
                PageNumber = pageNumber,
                PageSize = pageSize,
                SearchTerm = searchTerm,
                Type = type.HasValue ? (BudgetType)type.Value : null,
                Category = category.HasValue ? (BudgetCategory)category.Value : null,
                Status = status.HasValue ? (BudgetStatus)status.Value : null,
                FiscalYear = fiscalYear,
                ParentBudgetId = parentBudgetId,
                CostCenterId = costCenterId,
                DepartmentId = departmentId,
                ProjectId = projectId,
                OwnerUserId = ownerUserId,
                IsActive = isActive,
                IsLocked = isLocked,
                StartDate = startDate,
                EndDate = endDate,
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
    /// Get budget by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(BudgetDto), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<BudgetDto>> GetBudget(int id)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var query = new GetBudgetByIdQuery
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
    /// Get budget by code
    /// </summary>
    [HttpGet("by-code/{code}")]
    [ProducesResponseType(typeof(BudgetDto), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<BudgetDto>> GetBudgetByCode(string code)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var query = new GetBudgetByCodeQuery
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
    /// Get budgets by fiscal year
    /// </summary>
    [HttpGet("by-fiscal-year/{fiscalYear}")]
    [ProducesResponseType(typeof(List<BudgetSummaryDto>), 200)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<List<BudgetSummaryDto>>> GetBudgetsByFiscalYear(int fiscalYear)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var query = new GetBudgetsByFiscalYearQuery
        {
            TenantId = tenantId.Value,
            FiscalYear = fiscalYear
        };

        var result = await _mediator.Send(query);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    /// <summary>
    /// Get budgets by cost center
    /// </summary>
    [HttpGet("by-cost-center/{costCenterId}")]
    [ProducesResponseType(typeof(List<BudgetSummaryDto>), 200)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<List<BudgetSummaryDto>>> GetBudgetsByCostCenter(int costCenterId)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var query = new GetBudgetsByCostCenterQuery
        {
            TenantId = tenantId.Value,
            CostCenterId = costCenterId
        };

        var result = await _mediator.Send(query);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    /// <summary>
    /// Get active budgets
    /// </summary>
    [HttpGet("active")]
    [ProducesResponseType(typeof(List<BudgetSummaryDto>), 200)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<List<BudgetSummaryDto>>> GetActiveBudgets(
        [FromQuery] int? fiscalYear = null)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var query = new GetActiveBudgetsQuery
        {
            TenantId = tenantId.Value,
            FiscalYear = fiscalYear
        };

        var result = await _mediator.Send(query);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    /// <summary>
    /// Create a new budget
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(BudgetDto), 201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<BudgetDto>> CreateBudget([FromBody] CreateBudgetDto dto)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var command = new CreateBudgetCommand
        {
            TenantId = tenantId.Value,
            Data = dto
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return CreatedAtAction(nameof(GetBudget), new { id = result.Value.Id }, result.Value);
    }

    /// <summary>
    /// Update a budget
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(BudgetDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<BudgetDto>> UpdateBudget(int id, [FromBody] UpdateBudgetDto dto)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var command = new UpdateBudgetCommand
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
    /// Approve a budget
    /// </summary>
    [HttpPost("{id}/approve")]
    [ProducesResponseType(204)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> ApproveBudget(int id, [FromQuery] string? approverName = null)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var command = new ApproveBudgetCommand
        {
            TenantId = tenantId.Value,
            Id = id,
            ApproverName = approverName
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
    /// Lock a budget
    /// </summary>
    [HttpPost("{id}/lock")]
    [ProducesResponseType(204)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> LockBudget(int id)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var command = new LockBudgetCommand
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
    /// Unlock a budget
    /// </summary>
    [HttpPost("{id}/unlock")]
    [ProducesResponseType(204)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> UnlockBudget(int id)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var command = new UnlockBudgetCommand
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
    /// Close a budget
    /// </summary>
    [HttpPost("{id}/close")]
    [ProducesResponseType(204)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> CloseBudget(int id)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var command = new CloseBudgetCommand
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
    /// Delete a budget
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> DeleteBudget(int id)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var command = new DeleteBudgetCommand
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
