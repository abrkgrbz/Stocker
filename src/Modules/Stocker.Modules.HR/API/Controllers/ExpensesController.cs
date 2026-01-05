using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Application.Features.Expenses.Commands;
using Stocker.Modules.HR.Application.Features.Expenses.Queries;
using Stocker.Modules.HR.Domain.Enums;
using Stocker.SharedKernel.Authorization;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.API.Controllers;

[ApiController]
[Authorize]
[Route("api/hr/expenses")]
[RequireModule("HR")]
[ApiExplorerSettings(GroupName = "hr")]
public class ExpensesController : ControllerBase
{
    private readonly IMediator _mediator;

    public ExpensesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Get all expenses with optional filtering
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<ExpenseDto>), 200)]
    [ProducesResponseType(400)]
    public async Task<ActionResult<List<ExpenseDto>>> GetExpenses(
        [FromQuery] int? employeeId = null,
        [FromQuery] ExpenseType? expenseType = null,
        [FromQuery] ExpenseStatus? status = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        [FromQuery] bool includeInactive = false)
    {
        var query = new GetExpensesQuery
        {
            EmployeeId = employeeId,
            ExpenseType = expenseType,
            Status = status,
            FromDate = fromDate,
            ToDate = toDate,
            IncludeInactive = includeInactive
        };

        var result = await _mediator.Send(query);
        if (result.IsFailure) return BadRequest(result.Error);
        return Ok(result.Value);
    }

    /// <summary>
    /// Get expenses for a specific employee
    /// </summary>
    [HttpGet("employee/{employeeId}")]
    [ProducesResponseType(typeof(List<ExpenseDto>), 200)]
    [ProducesResponseType(400)]
    public async Task<ActionResult<List<ExpenseDto>>> GetEmployeeExpenses(
        int employeeId,
        [FromQuery] ExpenseStatus? status = null,
        [FromQuery] bool includeInactive = false)
    {
        var query = new GetExpensesQuery
        {
            EmployeeId = employeeId,
            Status = status,
            IncludeInactive = includeInactive
        };

        var result = await _mediator.Send(query);
        if (result.IsFailure) return BadRequest(result.Error);
        return Ok(result.Value);
    }

    /// <summary>
    /// Get expense by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ExpenseDto), 200)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<ExpenseDto>> GetExpense(int id)
    {
        var query = new GetExpenseByIdQuery(id);
        var result = await _mediator.Send(query);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound) return NotFound(result.Error);
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
    public async Task<ActionResult<ExpenseDto>> CreateExpense(CreateExpenseDto dto)
    {
        var command = new CreateExpenseCommand { ExpenseData = dto };
        var result = await _mediator.Send(command);

        if (result.IsFailure) return BadRequest(result.Error);
        return CreatedAtAction(nameof(GetExpense), new { id = result.Value.Id }, result.Value);
    }

    /// <summary>
    /// Update an existing expense (only draft expenses)
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ExpenseDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<ExpenseDto>> UpdateExpense(int id, UpdateExpenseDto dto)
    {
        var command = new UpdateExpenseCommand { ExpenseId = id, ExpenseData = dto };
        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound) return NotFound(result.Error);
            return BadRequest(result.Error);
        }
        return Ok(result.Value);
    }

    /// <summary>
    /// Submit an expense for approval
    /// </summary>
    [HttpPost("{id}/submit")]
    [ProducesResponseType(typeof(ExpenseDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<ExpenseDto>> SubmitExpense(int id)
    {
        var command = new SubmitExpenseCommand { ExpenseId = id };
        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound) return NotFound(result.Error);
            return BadRequest(result.Error);
        }
        return Ok(result.Value);
    }

    /// <summary>
    /// Approve an expense
    /// </summary>
    [HttpPost("{id}/approve")]
    [ProducesResponseType(typeof(ExpenseDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<ExpenseDto>> ApproveExpense(int id, ApproveExpenseDto dto)
    {
        var command = new ApproveExpenseCommand
        {
            ExpenseId = id,
            ApprovalData = dto
        };
        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound) return NotFound(result.Error);
            return BadRequest(result.Error);
        }
        return Ok(result.Value);
    }

    /// <summary>
    /// Reject an expense
    /// </summary>
    [HttpPost("{id}/reject")]
    [ProducesResponseType(typeof(ExpenseDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<ExpenseDto>> RejectExpense(int id, RejectExpenseDto dto)
    {
        var command = new RejectExpenseCommand
        {
            ExpenseId = id,
            RejectionData = dto
        };
        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound) return NotFound(result.Error);
            return BadRequest(result.Error);
        }
        return Ok(result.Value);
    }

    /// <summary>
    /// Mark an expense as paid
    /// </summary>
    [HttpPost("{id}/pay")]
    [ProducesResponseType(typeof(ExpenseDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<ExpenseDto>> MarkExpensePaid(int id, [FromQuery] string? paymentReference = null)
    {
        var command = new MarkExpensePaidCommand
        {
            ExpenseId = id,
            PaymentReference = paymentReference
        };
        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound) return NotFound(result.Error);
            return BadRequest(result.Error);
        }
        return Ok(result.Value);
    }
}
