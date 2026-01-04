using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.Finance.Application.DTOs;
using Stocker.Modules.Finance.Application.Features.Expenses.Commands;
using Stocker.Modules.Finance.Application.Features.Expenses.Queries;
using Stocker.SharedKernel.Authorization;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Finance.API.Controllers;

/// <summary>
/// Gider (Expense) API Controller
/// </summary>
[ApiController]
[Authorize]
[Route("api/finance/expenses")]
[RequireModule("Finance")]
[ApiExplorerSettings(GroupName = "finance")]
public class ExpensesController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ICurrentUserService _currentUserService;

    public ExpensesController(IMediator mediator, ICurrentUserService currentUserService)
    {
        _mediator = mediator;
        _currentUserService = currentUserService;
    }

    /// <summary>
    /// Get paginated expenses
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<ExpenseSummaryDto>), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<PagedResult<ExpenseSummaryDto>>> GetExpenses([FromQuery] ExpenseFilterDto filter)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
        {
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));
        }

        var query = new GetExpensesQuery
        {
            TenantId = tenantId.Value,
            Filter = filter
        };

        var result = await _mediator.Send(query);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    /// <summary>
    /// Get expense by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ExpenseDto), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<ExpenseDto>> GetExpense(int id)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
        {
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));
        }

        var query = new GetExpenseByIdQuery
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
    /// Create a new expense
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ExpenseDto), 201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<ExpenseDto>> CreateExpense([FromBody] CreateExpenseDto dto)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
        {
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));
        }

        var command = new CreateExpenseCommand
        {
            TenantId = tenantId.Value,
            Data = dto
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return CreatedAtAction(nameof(GetExpense), new { id = result.Value.Id }, result.Value);
    }

    /// <summary>
    /// Update an expense
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ExpenseDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<ExpenseDto>> UpdateExpense(int id, [FromBody] UpdateExpenseDto dto)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
        {
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));
        }

        var command = new UpdateExpenseCommand
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
    /// Submit expense for approval
    /// </summary>
    [HttpPost("{id}/submit")]
    [ProducesResponseType(typeof(ExpenseDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<ExpenseDto>> SubmitExpense(int id)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
        {
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));
        }

        var command = new SubmitExpenseCommand
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

        return Ok(result.Value);
    }

    /// <summary>
    /// Approve expense
    /// </summary>
    [HttpPost("{id}/approve")]
    [ProducesResponseType(typeof(ExpenseDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<ExpenseDto>> ApproveExpense(int id, [FromBody] ApproveExpenseDto dto)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
        {
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));
        }

        var userId = _currentUserService.UserId;
        if (!userId.HasValue)
        {
            return Unauthorized();
        }

        var command = new ApproveExpenseCommand
        {
            TenantId = tenantId.Value,
            Id = id,
            ApprovedByUserId = userId.Value,
            Note = dto.ApprovalNotes
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
    /// Reject expense
    /// </summary>
    [HttpPost("{id}/reject")]
    [ProducesResponseType(typeof(ExpenseDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<ExpenseDto>> RejectExpense(int id, [FromBody] RejectExpenseDto dto)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
        {
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));
        }

        var userId = _currentUserService.UserId;
        if (!userId.HasValue)
        {
            return Unauthorized();
        }

        var command = new RejectExpenseCommand
        {
            TenantId = tenantId.Value,
            Id = id,
            RejectedByUserId = userId.Value,
            Reason = dto.RejectionReason
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
    /// Delete expense
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> DeleteExpense(int id)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
        {
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));
        }

        var command = new DeleteExpenseCommand
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
    /// Get pending approval expenses
    /// </summary>
    [HttpGet("pending-approval")]
    [ProducesResponseType(typeof(List<ExpenseSummaryDto>), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<List<ExpenseSummaryDto>>> GetPendingApprovalExpenses()
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
        {
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));
        }

        var query = new GetPendingApprovalExpensesQuery
        {
            TenantId = tenantId.Value
        };

        var result = await _mediator.Send(query);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    /// <summary>
    /// Get expense totals by category
    /// </summary>
    [HttpGet("totals-by-category")]
    [ProducesResponseType(typeof(Dictionary<string, decimal>), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<Dictionary<string, decimal>>> GetExpenseTotalsByCategory(
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
        {
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));
        }

        var query = new GetExpenseTotalsByCategoryQuery
        {
            TenantId = tenantId.Value,
            StartDate = startDate ?? DateTime.UtcNow.AddMonths(-1),
            EndDate = endDate ?? DateTime.UtcNow
        };

        var result = await _mediator.Send(query);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }
}
