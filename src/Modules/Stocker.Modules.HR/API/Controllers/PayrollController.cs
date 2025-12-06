using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Application.Features.Payroll.Commands;
using Stocker.Modules.HR.Application.Features.Payroll.Queries;
using Stocker.Modules.HR.Domain.Enums;
using Stocker.SharedKernel.Authorization;
using Stocker.SharedKernel.Interfaces;
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
    private readonly ITenantService _tenantService;

    public PayrollController(IMediator mediator, ITenantService tenantService)
    {
        _mediator = mediator;
        _tenantService = tenantService;
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
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var query = new GetPayrollsQuery
        {
            TenantId = tenantId.Value,
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
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var query = new GetPayrollSummaryQuery
        {
            TenantId = tenantId.Value,
            Year = year,
            Month = month
        };

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
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var query = new GetPayrollsQuery
        {
            TenantId = tenantId.Value,
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
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var query = new GetPayrollByIdQuery { TenantId = tenantId.Value, PayrollId = id };
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
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var command = new CreatePayrollCommand { TenantId = tenantId.Value, PayrollData = dto };
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
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var command = new AddPayrollItemCommand
        {
            TenantId = tenantId.Value,
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
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var command = new CalculatePayrollCommand
        {
            TenantId = tenantId.Value,
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
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var command = new ApprovePayrollCommand
        {
            TenantId = tenantId.Value,
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
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var command = new MarkPayrollPaidCommand
        {
            TenantId = tenantId.Value,
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

    private static Error CreateTenantError()
    {
        return new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation);
    }
}
