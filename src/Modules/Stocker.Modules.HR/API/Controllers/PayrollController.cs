using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Application.Features.Payroll.Commands;
using Stocker.Modules.HR.Application.Features.Payroll.Queries;
using Stocker.Modules.HR.Application.Services;
using Stocker.Modules.HR.Domain.Enums;
using Stocker.SharedKernel.Authorization;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.API.Controllers;

[ApiController]
[Authorize]
[Route("api/hr/payroll")]
[RequireModule("HR")]
[ApiExplorerSettings(GroupName = "hr")]
public class PayrollController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ITurkishPayrollCalculationService _calculationService;

    public PayrollController(
        IMediator mediator,
        ITurkishPayrollCalculationService calculationService)
    {
        _mediator = mediator;
        _calculationService = calculationService;
    }

    /// <summary>
    /// Get all payrolls with optional filtering
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<PayrollDto>), 200)]
    [ProducesResponseType(400)]
    public async Task<ActionResult<List<PayrollDto>>> GetPayrolls(
        [FromQuery] int? employeeId = null,
        [FromQuery] int? year = null,
        [FromQuery] int? month = null,
        [FromQuery] PayrollStatus? status = null,
        [FromQuery] int? departmentId = null)
    {
        var query = new GetPayrollsQuery
        {
            EmployeeId = employeeId,
            Year = year,
            Month = month,
            Status = status,
            DepartmentId = departmentId
        };

        var result = await _mediator.Send(query);
        if (result.IsFailure) return BadRequest(result.Error);
        return Ok(result.Value);
    }

    /// <summary>
    /// Get payroll summary for a period
    /// </summary>
    [HttpGet("summary/{year}/{month}")]
    [ProducesResponseType(typeof(PayrollSummaryDto), 200)]
    [ProducesResponseType(400)]
    public async Task<ActionResult<PayrollSummaryDto>> GetPayrollSummary(int year, int month)
    {
        var query = new GetPayrollSummaryQuery(year, month);

        var result = await _mediator.Send(query);
        if (result.IsFailure) return BadRequest(result.Error);
        return Ok(result.Value);
    }

    /// <summary>
    /// Get payrolls for a specific employee
    /// </summary>
    [HttpGet("employee/{employeeId}")]
    [ProducesResponseType(typeof(List<PayrollDto>), 200)]
    [ProducesResponseType(400)]
    public async Task<ActionResult<List<PayrollDto>>> GetEmployeePayrolls(
        int employeeId,
        [FromQuery] int? year = null)
    {
        var query = new GetPayrollsQuery
        {
            EmployeeId = employeeId,
            Year = year
        };

        var result = await _mediator.Send(query);
        if (result.IsFailure) return BadRequest(result.Error);
        return Ok(result.Value);
    }

    /// <summary>
    /// Get payroll by ID with items
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(PayrollDto), 200)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<PayrollDto>> GetPayroll(int id)
    {
        var query = new GetPayrollByIdQuery(id);
        var result = await _mediator.Send(query);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound) return NotFound(result.Error);
            return BadRequest(result.Error);
        }
        return Ok(result.Value);
    }

    /// <summary>
    /// Create a new payroll record
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(PayrollDto), 201)]
    [ProducesResponseType(400)]
    public async Task<ActionResult<PayrollDto>> CreatePayroll(CreatePayrollDto dto)
    {
        var command = new CreatePayrollCommand { PayrollData = dto };
        var result = await _mediator.Send(command);

        if (result.IsFailure) return BadRequest(result.Error);
        return CreatedAtAction(nameof(GetPayroll), new { id = result.Value.Id }, result.Value);
    }

    /// <summary>
    /// Add an item to a payroll
    /// </summary>
    [HttpPost("{id}/items")]
    [ProducesResponseType(typeof(PayrollItemDto), 201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<PayrollItemDto>> AddPayrollItem(int id, AddPayrollItemDto dto)
    {
        var command = new AddPayrollItemCommand
        {
            PayrollId = id,
            ItemData = dto
        };
        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound) return NotFound(result.Error);
            return BadRequest(result.Error);
        }
        return Created($"/api/hr/payroll/{id}/items/{result.Value.Id}", result.Value);
    }

    /// <summary>
    /// Calculate payroll amounts
    /// </summary>
    [HttpPost("{id}/calculate")]
    [ProducesResponseType(typeof(PayrollDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<PayrollDto>> CalculatePayroll(int id, [FromQuery] int calculatedById)
    {
        var command = new CalculatePayrollCommand
        {
            PayrollId = id,
            CalculatedById = calculatedById
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
    /// Approve a payroll
    /// </summary>
    [HttpPost("{id}/approve")]
    [ProducesResponseType(typeof(PayrollDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<PayrollDto>> ApprovePayroll(int id, [FromQuery] int approvedById, ApprovePayrollDto? dto = null)
    {
        var command = new ApprovePayrollCommand
        {
            PayrollId = id,
            ApprovedById = approvedById,
            Notes = dto?.Notes
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
    /// Mark payroll as paid
    /// </summary>
    [HttpPost("{id}/pay")]
    [ProducesResponseType(typeof(PayrollDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<PayrollDto>> MarkPayrollPaid(int id, MarkPayrollPaidDto? dto = null)
    {
        var command = new MarkPayrollPaidCommand
        {
            PayrollId = id,
            PaymentData = dto ?? new MarkPayrollPaidDto()
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
    /// Get Turkish payroll calculation parameters (2024)
    /// </summary>
    [HttpGet("parameters")]
    [ProducesResponseType(typeof(TurkishPayrollParameters), 200)]
    public ActionResult<TurkishPayrollParameters> GetPayrollParameters()
    {
        var parameters = _calculationService.GetParameters();
        return Ok(parameters);
    }

    /// <summary>
    /// Preview payroll calculation without saving
    /// </summary>
    [HttpPost("calculate-preview")]
    [ProducesResponseType(typeof(PayrollCalculationResult), 200)]
    [ProducesResponseType(400)]
    public ActionResult<PayrollCalculationResult> CalculatePreview(CalculatePreviewDto dto)
    {
        var input = new PayrollCalculationInput
        {
            BaseSalary = dto.BaseSalary,
            OvertimePay = dto.OvertimePay,
            Bonus = dto.Bonus,
            Allowances = dto.Allowances,
            CumulativeGrossEarnings = dto.CumulativeGrossEarnings,
            ApplyMinWageExemption = dto.ApplyMinWageExemption
        };

        var result = _calculationService.Calculate(input);
        return Ok(result);
    }

    /// <summary>
    /// Get cumulative gross for an employee up to a specific period
    /// </summary>
    [HttpGet("employee/{employeeId}/cumulative/{year}/{month}")]
    [ProducesResponseType(typeof(decimal), 200)]
    [ProducesResponseType(400)]
    public async Task<ActionResult<decimal>> GetEmployeeCumulativeGross(int employeeId, int year, int month)
    {
        var query = new GetEmployeeCumulativeGrossQuery(employeeId, year, month);

        var result = await _mediator.Send(query);
        if (result.IsFailure) return BadRequest(result.Error);
        return Ok(result.Value);
    }
}

/// <summary>
/// DTO for payroll calculation preview
/// </summary>
public class CalculatePreviewDto
{
    public decimal BaseSalary { get; set; }
    public decimal OvertimePay { get; set; }
    public decimal Bonus { get; set; }
    public decimal Allowances { get; set; }
    public decimal CumulativeGrossEarnings { get; set; }
    public bool ApplyMinWageExemption { get; set; } = true;
}
