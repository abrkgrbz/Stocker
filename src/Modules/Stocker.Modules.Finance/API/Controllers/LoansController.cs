using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.Finance.Application.DTOs;
using Stocker.Modules.Finance.Application.Features.Loans.Commands;
using Stocker.Modules.Finance.Application.Features.Loans.Queries;
using Stocker.Modules.Finance.Domain.Entities;
using Stocker.SharedKernel.Authorization;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Finance.API.Controllers;

/// <summary>
/// Kredi (Loan) API Controller
/// </summary>
[ApiController]
[Authorize]
[Route("api/finance/loans")]
[RequireModule("Finance")]
[ApiExplorerSettings(GroupName = "finance")]
public class LoansController : ControllerBase
{
    private readonly IMediator _mediator;

    public LoansController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Get paginated loans
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<LoanSummaryDto>), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<PagedResult<LoanSummaryDto>>> GetLoans(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? searchTerm = null,
        [FromQuery] int? loanType = null,
        [FromQuery] int? subType = null,
        [FromQuery] int? status = null,
        [FromQuery] int? interestType = null,
        [FromQuery] int? lenderId = null,
        [FromQuery] DateTime? startDateFrom = null,
        [FromQuery] DateTime? startDateTo = null,
        [FromQuery] DateTime? endDateFrom = null,
        [FromQuery] DateTime? endDateTo = null,
        [FromQuery] decimal? minPrincipalAmount = null,
        [FromQuery] decimal? maxPrincipalAmount = null,
        [FromQuery] string? currency = null,
        [FromQuery] string? sortBy = null,
        [FromQuery] bool sortDescending = true)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var query = new GetLoansQuery
        {
            TenantId = tenantId.Value,
            Filter = new LoanFilterDto
            {
                PageNumber = pageNumber,
                PageSize = pageSize,
                SearchTerm = searchTerm,
                LoanType = loanType.HasValue ? (LoanType)loanType.Value : null,
                SubType = subType.HasValue ? (LoanSubType)subType.Value : null,
                Status = status.HasValue ? (LoanStatus)status.Value : null,
                InterestType = interestType.HasValue ? (InterestType)interestType.Value : null,
                LenderId = lenderId,
                StartDateFrom = startDateFrom,
                StartDateTo = startDateTo,
                EndDateFrom = endDateFrom,
                EndDateTo = endDateTo,
                MinPrincipalAmount = minPrincipalAmount,
                MaxPrincipalAmount = maxPrincipalAmount,
                Currency = currency,
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
    /// Get loan by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(LoanDto), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<LoanDto>> GetLoan(int id)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var query = new GetLoanByIdQuery
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
    /// Get active loans
    /// </summary>
    [HttpGet("active")]
    [ProducesResponseType(typeof(List<LoanSummaryDto>), 200)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<List<LoanSummaryDto>>> GetActiveLoans(
        [FromQuery] int? loanType = null,
        [FromQuery] int? lenderId = null)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var query = new GetActiveLoansQuery
        {
            TenantId = tenantId.Value,
            LoanType = loanType.HasValue ? (LoanType)loanType.Value : null,
            LenderId = lenderId
        };

        var result = await _mediator.Send(query);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    /// <summary>
    /// Get loans by lender
    /// </summary>
    [HttpGet("by-lender/{lenderId}")]
    [ProducesResponseType(typeof(List<LoanSummaryDto>), 200)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<List<LoanSummaryDto>>> GetLoansByLender(
        int lenderId,
        [FromQuery] int? status = null)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var query = new GetLoansByLenderQuery
        {
            TenantId = tenantId.Value,
            LenderId = lenderId,
            Status = status.HasValue ? (LoanStatus)status.Value : null
        };

        var result = await _mediator.Send(query);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    /// <summary>
    /// Get loan payment schedule
    /// </summary>
    [HttpGet("{id}/schedule")]
    [ProducesResponseType(typeof(List<LoanScheduleDto>), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<List<LoanScheduleDto>>> GetPaymentSchedule(
        int id,
        [FromQuery] bool? onlyUnpaid = null)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var query = new GetLoanPaymentScheduleQuery
        {
            TenantId = tenantId.Value,
            LoanId = id,
            OnlyUnpaid = onlyUnpaid
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
    /// Get loan payments
    /// </summary>
    [HttpGet("{id}/payments")]
    [ProducesResponseType(typeof(List<LoanPaymentDto>), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<List<LoanPaymentDto>>> GetLoanPayments(int id)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var query = new GetLoanPaymentsQuery
        {
            TenantId = tenantId.Value,
            LoanId = id
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
    /// Get upcoming loan payments across all loans
    /// </summary>
    [HttpGet("upcoming-payments")]
    [ProducesResponseType(typeof(List<UpcomingLoanPaymentDto>), 200)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<List<UpcomingLoanPaymentDto>>> GetUpcomingPayments(
        [FromQuery] int days = 30)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var query = new GetUpcomingLoanPaymentsQuery
        {
            TenantId = tenantId.Value,
            Days = days
        };

        var result = await _mediator.Send(query);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    /// <summary>
    /// Get overdue loans
    /// </summary>
    [HttpGet("overdue")]
    [ProducesResponseType(typeof(List<OverdueLoanDto>), 200)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<List<OverdueLoanDto>>> GetOverdueLoans()
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var query = new GetOverdueLoansQuery
        {
            TenantId = tenantId.Value
        };

        var result = await _mediator.Send(query);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    /// <summary>
    /// Get loan summary statistics
    /// </summary>
    [HttpGet("statistics")]
    [ProducesResponseType(typeof(LoanSummaryStatisticsDto), 200)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<LoanSummaryStatisticsDto>> GetStatistics([FromQuery] string? currency = null)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var query = new GetLoanSummaryStatisticsQuery
        {
            TenantId = tenantId.Value,
            Currency = currency
        };

        var result = await _mediator.Send(query);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    /// <summary>
    /// Create a new loan
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(LoanDto), 201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<LoanDto>> CreateLoan([FromBody] CreateLoanDto dto)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var command = new CreateLoanCommand
        {
            TenantId = tenantId.Value,
            Data = dto
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return CreatedAtAction(nameof(GetLoan), new { id = result.Value.Id }, result.Value);
    }

    /// <summary>
    /// Update a loan
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(LoanDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<LoanDto>> UpdateLoan(int id, [FromBody] UpdateLoanDto dto)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var command = new UpdateLoanCommand
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
    /// Make a loan payment
    /// </summary>
    [HttpPost("{id}/payments")]
    [ProducesResponseType(typeof(LoanPaymentDto), 201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<LoanPaymentDto>> MakePayment(int id, [FromBody] MakeLoanPaymentDto dto)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var command = new MakeLoanPaymentCommand
        {
            TenantId = tenantId.Value,
            LoanId = id,
            Data = dto
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(result.Error);
            return BadRequest(result.Error);
        }

        return CreatedAtAction(nameof(GetLoanPayments), new { id }, result.Value);
    }

    /// <summary>
    /// Make a prepayment
    /// </summary>
    [HttpPost("{id}/prepayment")]
    [ProducesResponseType(typeof(LoanPaymentDto), 201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<LoanPaymentDto>> MakePrepayment(int id, [FromBody] MakePrepaymentDto dto)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var command = new MakePrepaymentCommand
        {
            TenantId = tenantId.Value,
            LoanId = id,
            Data = dto
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(result.Error);
            return BadRequest(result.Error);
        }

        return CreatedAtAction(nameof(GetLoanPayments), new { id }, result.Value);
    }

    /// <summary>
    /// Approve a loan
    /// </summary>
    [HttpPost("{id}/approve")]
    [ProducesResponseType(typeof(LoanDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<LoanDto>> ApproveLoan(int id, [FromBody] ApproveLoanDto dto)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var command = new ApproveLoanCommand
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
    /// Disburse a loan
    /// </summary>
    [HttpPost("{id}/disburse")]
    [ProducesResponseType(typeof(LoanDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<LoanDto>> DisburseLoan(int id, [FromBody] DisburseLoanDto dto)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var command = new DisburseLoanCommand
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
    /// Close a loan
    /// </summary>
    [HttpPost("{id}/close")]
    [ProducesResponseType(typeof(LoanDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<LoanDto>> CloseLoan(int id, [FromBody] CloseLoanDto dto)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var command = new CloseLoanCommand
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
    /// Restructure a loan
    /// </summary>
    [HttpPost("{id}/restructure")]
    [ProducesResponseType(typeof(LoanDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<LoanDto>> RestructureLoan(int id, [FromBody] RestructureLoanDto dto)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var command = new RestructureLoanCommand
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
    /// Mark a loan as defaulted
    /// </summary>
    [HttpPost("{id}/default")]
    [ProducesResponseType(typeof(LoanDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<LoanDto>> MarkAsDefaulted(int id, [FromBody] MarkLoanAsDefaultedDto? dto = null)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var command = new MarkLoanAsDefaultedCommand
        {
            TenantId = tenantId.Value,
            Id = id,
            Notes = dto?.Notes
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
    /// Regenerate loan payment schedule
    /// </summary>
    [HttpPost("{id}/regenerate-schedule")]
    [ProducesResponseType(typeof(List<LoanScheduleDto>), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<List<LoanScheduleDto>>> RegenerateSchedule(int id)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var command = new GenerateLoanScheduleCommand
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
    /// Delete a loan
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> DeleteLoan(int id)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var command = new DeleteLoanCommand
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

/// <summary>
/// DTO for marking loan as defaulted
/// </summary>
public class MarkLoanAsDefaultedDto
{
    public string? Notes { get; set; }
}
