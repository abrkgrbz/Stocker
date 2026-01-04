using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.Finance.Application.DTOs;
using Stocker.Modules.Finance.Application.Features.AccountingPeriods.Commands;
using Stocker.Modules.Finance.Application.Features.AccountingPeriods.Queries;
using Stocker.Modules.Finance.Domain.Entities;
using Stocker.SharedKernel.Authorization;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Finance.API.Controllers;

/// <summary>
/// Muhasebe Dönemi (Accounting Period) API Controller
/// </summary>
[ApiController]
[Authorize]
[Route("api/finance/accounting-periods")]
[RequireModule("Finance")]
[ApiExplorerSettings(GroupName = "finance")]
public class AccountingPeriodsController : ControllerBase
{
    private readonly IMediator _mediator;

    public AccountingPeriodsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Get paginated accounting periods
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<AccountingPeriodSummaryDto>), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<PagedResult<AccountingPeriodSummaryDto>>> GetAccountingPeriods(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? searchTerm = null,
        [FromQuery] int? fiscalYear = null,
        [FromQuery] int? periodType = null,
        [FromQuery] int? status = null,
        [FromQuery] bool? isActive = null,
        [FromQuery] bool? isLocked = null,
        [FromQuery] bool? isOpen = null,
        [FromQuery] DateTime? startDateFrom = null,
        [FromQuery] DateTime? startDateTo = null,
        [FromQuery] DateTime? endDateFrom = null,
        [FromQuery] DateTime? endDateTo = null,
        [FromQuery] string? sortBy = null,
        [FromQuery] bool sortDescending = true)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var query = new GetAccountingPeriodsQuery
        {
            TenantId = tenantId.Value,
            Filter = new AccountingPeriodFilterDto
            {
                PageNumber = pageNumber,
                PageSize = pageSize,
                SearchTerm = searchTerm,
                FiscalYear = fiscalYear,
                PeriodType = periodType.HasValue ? (AccountingPeriodType)periodType.Value : null,
                Status = status.HasValue ? (AccountingPeriodStatus)status.Value : null,
                IsActive = isActive,
                IsLocked = isLocked,
                IsOpen = isOpen,
                StartDateFrom = startDateFrom,
                StartDateTo = startDateTo,
                EndDateFrom = endDateFrom,
                EndDateTo = endDateTo,
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
    /// Get accounting period by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(AccountingPeriodDto), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<AccountingPeriodDto>> GetAccountingPeriod(int id)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var query = new GetAccountingPeriodByIdQuery
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
    /// Get the active accounting period
    /// </summary>
    [HttpGet("active")]
    [ProducesResponseType(typeof(AccountingPeriodDto), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<AccountingPeriodDto>> GetActiveAccountingPeriod()
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var query = new GetActiveAccountingPeriodQuery
        {
            TenantId = tenantId.Value
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
    /// Get accounting period by date
    /// </summary>
    [HttpGet("by-date")]
    [ProducesResponseType(typeof(AccountingPeriodDto), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<AccountingPeriodDto>> GetAccountingPeriodByDate([FromQuery] DateTime date)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var query = new GetAccountingPeriodByDateQuery
        {
            TenantId = tenantId.Value,
            Date = date
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
    /// Get accounting periods by fiscal year
    /// </summary>
    [HttpGet("by-fiscal-year/{fiscalYear}")]
    [ProducesResponseType(typeof(List<AccountingPeriodSummaryDto>), 200)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<List<AccountingPeriodSummaryDto>>> GetAccountingPeriodsByFiscalYear(int fiscalYear)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var query = new GetAccountingPeriodsByFiscalYearQuery
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
    /// Get open accounting periods
    /// </summary>
    [HttpGet("open")]
    [ProducesResponseType(typeof(List<AccountingPeriodSummaryDto>), 200)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<List<AccountingPeriodSummaryDto>>> GetOpenAccountingPeriods()
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var query = new GetOpenAccountingPeriodsQuery
        {
            TenantId = tenantId.Value
        };

        var result = await _mediator.Send(query);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    /// <summary>
    /// Create a monthly accounting period
    /// </summary>
    [HttpPost("monthly")]
    [ProducesResponseType(typeof(AccountingPeriodDto), 201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<AccountingPeriodDto>> CreateMonthlyPeriod([FromBody] CreateMonthlyPeriodDto dto)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var command = new CreateMonthlyPeriodCommand
        {
            TenantId = tenantId.Value,
            Data = dto
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return CreatedAtAction(nameof(GetAccountingPeriod), new { id = result.Value.Id }, result.Value);
    }

    /// <summary>
    /// Create a quarterly accounting period
    /// </summary>
    [HttpPost("quarterly")]
    [ProducesResponseType(typeof(AccountingPeriodDto), 201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<AccountingPeriodDto>> CreateQuarterlyPeriod([FromBody] CreateQuarterlyPeriodDto dto)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var command = new CreateQuarterlyPeriodCommand
        {
            TenantId = tenantId.Value,
            Data = dto
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return CreatedAtAction(nameof(GetAccountingPeriod), new { id = result.Value.Id }, result.Value);
    }

    /// <summary>
    /// Create an annual accounting period
    /// </summary>
    [HttpPost("annual")]
    [ProducesResponseType(typeof(AccountingPeriodDto), 201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<AccountingPeriodDto>> CreateAnnualPeriod([FromBody] CreateAnnualPeriodDto dto)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var command = new CreateAnnualPeriodCommand
        {
            TenantId = tenantId.Value,
            Data = dto
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return CreatedAtAction(nameof(GetAccountingPeriod), new { id = result.Value.Id }, result.Value);
    }

    /// <summary>
    /// Create a custom accounting period
    /// </summary>
    [HttpPost("custom")]
    [ProducesResponseType(typeof(AccountingPeriodDto), 201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<AccountingPeriodDto>> CreateCustomPeriod([FromBody] CreateCustomPeriodDto dto)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var command = new CreateCustomPeriodCommand
        {
            TenantId = tenantId.Value,
            Data = dto
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return CreatedAtAction(nameof(GetAccountingPeriod), new { id = result.Value.Id }, result.Value);
    }

    /// <summary>
    /// Update an accounting period
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(AccountingPeriodDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<AccountingPeriodDto>> UpdateAccountingPeriod(int id, [FromBody] UpdateAccountingPeriodDto dto)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var command = new UpdateAccountingPeriodCommand
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
    /// Activate an accounting period
    /// </summary>
    [HttpPost("{id}/activate")]
    [ProducesResponseType(typeof(AccountingPeriodDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<AccountingPeriodDto>> ActivateAccountingPeriod(int id)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var command = new ActivateAccountingPeriodCommand
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
    /// Deactivate an accounting period
    /// </summary>
    [HttpPost("{id}/deactivate")]
    [ProducesResponseType(typeof(AccountingPeriodDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<AccountingPeriodDto>> DeactivateAccountingPeriod(int id)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var command = new DeactivateAccountingPeriodCommand
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
    /// Soft close an accounting period
    /// </summary>
    [HttpPost("{id}/soft-close")]
    [ProducesResponseType(typeof(AccountingPeriodDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<AccountingPeriodDto>> SoftCloseAccountingPeriod(int id)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var command = new SoftCloseAccountingPeriodCommand
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
    /// Hard close an accounting period
    /// </summary>
    [HttpPost("{id}/hard-close")]
    [ProducesResponseType(typeof(AccountingPeriodDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<AccountingPeriodDto>> HardCloseAccountingPeriod(int id)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var userId = HttpContext.Items["UserId"] as Guid?;
        if (!userId.HasValue)
            return BadRequest(new Error("User.Required", "User ID is required", ErrorType.Validation));

        var command = new HardCloseAccountingPeriodCommand
        {
            TenantId = tenantId.Value,
            Id = id,
            ClosedByUserId = userId.Value
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
    /// Reopen an accounting period from soft close
    /// </summary>
    [HttpPost("{id}/reopen")]
    [ProducesResponseType(typeof(AccountingPeriodDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<AccountingPeriodDto>> ReopenAccountingPeriod(int id)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var command = new ReopenAccountingPeriodCommand
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
    /// Lock an accounting period
    /// </summary>
    [HttpPost("{id}/lock")]
    [ProducesResponseType(typeof(AccountingPeriodDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<AccountingPeriodDto>> LockAccountingPeriod(int id)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var command = new LockAccountingPeriodCommand
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
    /// Unlock an accounting period
    /// </summary>
    [HttpPost("{id}/unlock")]
    [ProducesResponseType(typeof(AccountingPeriodDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<AccountingPeriodDto>> UnlockAccountingPeriod(int id)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var command = new UnlockAccountingPeriodCommand
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
    /// Set restrictions on an accounting period
    /// </summary>
    [HttpPost("{id}/restrictions")]
    [ProducesResponseType(typeof(AccountingPeriodDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<AccountingPeriodDto>> SetRestrictions(int id, [FromBody] SetPeriodRestrictionsDto dto)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var command = new SetRestrictionsCommand
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
    /// Process closing entries for an accounting period
    /// </summary>
    [HttpPost("{id}/process-closing-entries")]
    [ProducesResponseType(typeof(AccountingPeriodDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<AccountingPeriodDto>> ProcessClosingEntries(int id, [FromBody] ProcessClosingEntriesRequestDto dto)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var command = new ProcessClosingEntriesCommand
        {
            TenantId = tenantId.Value,
            Id = id,
            ClosingJournalEntryId = dto.ClosingJournalEntryId
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
    /// Process opening entries for an accounting period
    /// </summary>
    [HttpPost("{id}/process-opening-entries")]
    [ProducesResponseType(typeof(AccountingPeriodDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<AccountingPeriodDto>> ProcessOpeningEntries(int id, [FromBody] ProcessOpeningEntriesRequestDto dto)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var command = new ProcessOpeningEntriesCommand
        {
            TenantId = tenantId.Value,
            Id = id,
            OpeningJournalEntryId = dto.OpeningJournalEntryId
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
    /// Mark VAT return as filed for an accounting period
    /// </summary>
    [HttpPost("{id}/mark-vat-filed")]
    [ProducesResponseType(typeof(AccountingPeriodDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<AccountingPeriodDto>> MarkVatReturnFiled(int id, [FromBody] MarkTaxFiledRequestDto dto)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var command = new MarkVatReturnFiledCommand
        {
            TenantId = tenantId.Value,
            Id = id,
            FilingDate = dto.FilingDate
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
    /// Mark provisional tax return as filed for an accounting period
    /// </summary>
    [HttpPost("{id}/mark-provisional-tax-filed")]
    [ProducesResponseType(typeof(AccountingPeriodDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<AccountingPeriodDto>> MarkProvisionalTaxFiled(int id, [FromBody] MarkTaxFiledRequestDto dto)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var command = new MarkProvisionalTaxFiledCommand
        {
            TenantId = tenantId.Value,
            Id = id,
            FilingDate = dto.FilingDate
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
}

/// <summary>
/// Request DTO for processing closing entries
/// </summary>
public class ProcessClosingEntriesRequestDto
{
    public int ClosingJournalEntryId { get; set; }
}

/// <summary>
/// Request DTO for processing opening entries
/// </summary>
public class ProcessOpeningEntriesRequestDto
{
    public int OpeningJournalEntryId { get; set; }
}

/// <summary>
/// Request DTO for marking tax returns as filed
/// </summary>
public class MarkTaxFiledRequestDto
{
    public DateTime FilingDate { get; set; }
}
