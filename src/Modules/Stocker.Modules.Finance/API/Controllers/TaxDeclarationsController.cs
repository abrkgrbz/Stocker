using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.Finance.Application.DTOs;
using Stocker.Modules.Finance.Application.Features.TaxDeclarations.Commands;
using Stocker.Modules.Finance.Application.Features.TaxDeclarations.Queries;
using Stocker.SharedKernel.Authorization;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Finance.API.Controllers;

/// <summary>
/// Vergi Beyannamesi API Controller
/// KDV, Muhtasar, Geçici Vergi vb. beyannamelerin yönetimi
/// </summary>
[ApiController]
[Authorize]
[Route("api/finance/tax-declarations")]
[RequireModule("Finance")]
[ApiExplorerSettings(GroupName = "finance")]
public class TaxDeclarationsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ICurrentUserService _currentUserService;

    public TaxDeclarationsController(IMediator mediator, ICurrentUserService currentUserService)
    {
        _mediator = mediator;
        _currentUserService = currentUserService;
    }

    /// <summary>
    /// Get paginated tax declarations
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<TaxDeclarationSummaryDto>), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<PagedResult<TaxDeclarationSummaryDto>>> GetDeclarations([FromQuery] TaxDeclarationFilterDto filter)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
        {
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));
        }

        var query = new GetTaxDeclarationsQuery
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
    /// Get tax declaration by ID with details
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(TaxDeclarationDto), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<TaxDeclarationDto>> GetDeclaration(int id)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
        {
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));
        }

        var query = new GetTaxDeclarationByIdQuery
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
    /// Create a new tax declaration
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(TaxDeclarationDto), 201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<TaxDeclarationDto>> CreateDeclaration([FromBody] CreateTaxDeclarationDto dto)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
        {
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));
        }

        var command = new CreateTaxDeclarationCommand
        {
            TenantId = tenantId.Value,
            Data = dto
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return CreatedAtAction(nameof(GetDeclaration), new { id = result.Value.Id }, result.Value);
    }

    /// <summary>
    /// Mark tax declaration as ready for approval
    /// </summary>
    [HttpPost("{id}/ready")]
    [ProducesResponseType(typeof(TaxDeclarationDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<TaxDeclarationDto>> MarkAsReady(int id)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
        {
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));
        }

        var userName = _currentUserService.UserName ?? "System";

        var command = new MarkTaxDeclarationReadyCommand
        {
            TenantId = tenantId.Value,
            Id = id,
            PreparedBy = userName
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
    /// Approve tax declaration
    /// </summary>
    [HttpPost("{id}/approve")]
    [ProducesResponseType(typeof(TaxDeclarationDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<TaxDeclarationDto>> ApproveDeclaration(int id, [FromBody] ApproveTaxDeclarationDto dto)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
        {
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));
        }

        var userName = _currentUserService.UserName ?? "System";

        var command = new ApproveTaxDeclarationCommand
        {
            TenantId = tenantId.Value,
            Id = id,
            ApprovedBy = userName,
            Note = dto.Note
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
    /// File tax declaration to GİB
    /// </summary>
    [HttpPost("{id}/file")]
    [ProducesResponseType(typeof(TaxDeclarationDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<TaxDeclarationDto>> FileDeclaration(int id, [FromBody] TaxDeclarationGibResultDto dto)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
        {
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));
        }

        var command = new FileTaxDeclarationCommand
        {
            TenantId = tenantId.Value,
            Id = id,
            GibApprovalNumber = dto.ApprovalNumber,
            AccrualSlipNumber = dto.AccrualSlipNumber
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
    /// Record payment for tax declaration
    /// </summary>
    [HttpPost("{id}/payments")]
    [ProducesResponseType(typeof(TaxDeclarationDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<TaxDeclarationDto>> RecordPayment(int id, [FromBody] RecordTaxPaymentDto dto)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
        {
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));
        }

        var command = new RecordTaxPaymentCommand
        {
            TenantId = tenantId.Value,
            Id = id,
            Payment = dto
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
    /// Create amendment for tax declaration
    /// </summary>
    [HttpPost("{id}/amendment")]
    [ProducesResponseType(typeof(TaxDeclarationDto), 201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<TaxDeclarationDto>> CreateAmendment(int id, [FromBody] CreateTaxAmendmentDto dto)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
        {
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));
        }

        var command = new CreateTaxAmendmentCommand
        {
            TenantId = tenantId.Value,
            OriginalDeclarationId = id,
            Amendment = dto
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(result.Error);
            return BadRequest(result.Error);
        }

        return CreatedAtAction(nameof(GetDeclaration), new { id = result.Value.Id }, result.Value);
    }

    /// <summary>
    /// Cancel tax declaration
    /// </summary>
    [HttpPost("{id}/cancel")]
    [ProducesResponseType(typeof(TaxDeclarationDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<TaxDeclarationDto>> CancelDeclaration(int id, [FromBody] CancelTaxDeclarationDto dto)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
        {
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));
        }

        var command = new CancelTaxDeclarationCommand
        {
            TenantId = tenantId.Value,
            Id = id,
            Reason = dto.Reason
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
    /// Delete tax declaration (only draft/cancelled)
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult> DeleteDeclaration(int id)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
        {
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));
        }

        var command = new DeleteTaxDeclarationCommand
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

        return Ok();
    }

    /// <summary>
    /// Get overdue tax declarations
    /// </summary>
    [HttpGet("overdue")]
    [ProducesResponseType(typeof(List<TaxDeclarationSummaryDto>), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<List<TaxDeclarationSummaryDto>>> GetOverdueDeclarations()
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
        {
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));
        }

        var query = new GetOverdueTaxDeclarationsQuery
        {
            TenantId = tenantId.Value
        };

        var result = await _mediator.Send(query);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    /// <summary>
    /// Get tax declaration statistics
    /// </summary>
    [HttpGet("stats")]
    [ProducesResponseType(typeof(TaxDeclarationStatsDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<TaxDeclarationStatsDto>> GetStats([FromQuery] int? year = null)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
        {
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));
        }

        var query = new GetTaxDeclarationStatsQuery
        {
            TenantId = tenantId.Value,
            Year = year
        };

        var result = await _mediator.Send(query);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    /// <summary>
    /// Get upcoming tax deadlines (tax calendar)
    /// </summary>
    [HttpGet("calendar")]
    [ProducesResponseType(typeof(List<TaxCalendarItemDto>), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<List<TaxCalendarItemDto>>> GetTaxCalendar([FromQuery] int daysAhead = 30)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
        {
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));
        }

        var query = new GetUpcomingTaxDeadlinesQuery
        {
            TenantId = tenantId.Value,
            DaysAhead = daysAhead
        };

        var result = await _mediator.Send(query);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }
}
