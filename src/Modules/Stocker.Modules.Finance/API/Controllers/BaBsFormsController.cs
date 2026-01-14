using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.Finance.Application.DTOs;
using Stocker.Modules.Finance.Application.Features.BaBsForms.Commands;
using Stocker.Modules.Finance.Application.Features.BaBsForms.Queries;
using Stocker.SharedKernel.Authorization;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Finance.API.Controllers;

/// <summary>
/// Ba-Bs Formu API Controller
/// 5.000 TL ve üzeri mal/hizmet alım-satım bildirimi (GİB yasal zorunluluk)
/// </summary>
[ApiController]
[Authorize]
[Route("api/finance/ba-bs")]
[RequireModule("Finance")]
[ApiExplorerSettings(GroupName = "finance")]
public class BaBsFormsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ICurrentUserService _currentUserService;

    public BaBsFormsController(IMediator mediator, ICurrentUserService currentUserService)
    {
        _mediator = mediator;
        _currentUserService = currentUserService;
    }

    /// <summary>
    /// Get paginated Ba-Bs forms
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<BaBsFormSummaryDto>), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<PagedResult<BaBsFormSummaryDto>>> GetForms([FromQuery] BaBsFormFilterDto filter)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
        {
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));
        }

        var query = new GetBaBsFormsQuery
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
    /// Get Ba-Bs form by ID with items
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(BaBsFormDto), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<BaBsFormDto>> GetForm(int id)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
        {
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));
        }

        var query = new GetBaBsFormByIdQuery
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
    /// Create a new Ba-Bs form
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(BaBsFormDto), 201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<BaBsFormDto>> CreateForm([FromBody] CreateBaBsFormDto dto)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
        {
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));
        }

        var command = new CreateBaBsFormCommand
        {
            TenantId = tenantId.Value,
            Data = dto
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return CreatedAtAction(nameof(GetForm), new { id = result.Value.Id }, result.Value);
    }

    /// <summary>
    /// Add item to Ba-Bs form
    /// </summary>
    [HttpPost("{id}/items")]
    [ProducesResponseType(typeof(BaBsFormDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<BaBsFormDto>> AddItem(int id, [FromBody] CreateBaBsFormItemDto dto)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
        {
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));
        }

        var command = new AddBaBsFormItemCommand
        {
            TenantId = tenantId.Value,
            FormId = id,
            Item = dto
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
    /// Mark Ba-Bs form as ready for approval
    /// </summary>
    [HttpPost("{id}/ready")]
    [ProducesResponseType(typeof(BaBsFormDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<BaBsFormDto>> MarkAsReady(int id)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
        {
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));
        }

        var userName = _currentUserService.UserName ?? "System";

        var command = new MarkBaBsFormReadyCommand
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
    /// Approve Ba-Bs form
    /// </summary>
    [HttpPost("{id}/approve")]
    [ProducesResponseType(typeof(BaBsFormDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<BaBsFormDto>> ApproveForm(int id, [FromBody] ApproveBaBsFormDto dto)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
        {
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));
        }

        var userName = _currentUserService.UserName ?? "System";

        var command = new ApproveBaBsFormCommand
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
    /// File Ba-Bs form to GİB
    /// </summary>
    [HttpPost("{id}/file")]
    [ProducesResponseType(typeof(BaBsFormDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<BaBsFormDto>> FileForm(int id, [FromBody] FileBaBsFormDto dto)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
        {
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));
        }

        var command = new FileBaBsFormCommand
        {
            TenantId = tenantId.Value,
            Id = id,
            GibSubmissionReference = dto.GibSubmissionReference
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
    /// Record GİB result for Ba-Bs form
    /// </summary>
    [HttpPost("{id}/gib-result")]
    [ProducesResponseType(typeof(BaBsFormDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<BaBsFormDto>> RecordGibResult(int id, [FromBody] BaBsGibResultDto dto)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
        {
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));
        }

        var command = new RecordBaBsGibResultCommand
        {
            TenantId = tenantId.Value,
            Id = id,
            Result = dto
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
    /// Create correction for Ba-Bs form
    /// </summary>
    [HttpPost("{id}/correction")]
    [ProducesResponseType(typeof(BaBsFormDto), 201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<BaBsFormDto>> CreateCorrection(int id, [FromBody] CreateBaBsCorrectionDto dto)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
        {
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));
        }

        var command = new CreateBaBsCorrectionCommand
        {
            TenantId = tenantId.Value,
            OriginalFormId = id,
            CorrectionReason = dto.CorrectionReason
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(result.Error);
            return BadRequest(result.Error);
        }

        return CreatedAtAction(nameof(GetForm), new { id = result.Value.Id }, result.Value);
    }

    /// <summary>
    /// Cancel Ba-Bs form
    /// </summary>
    [HttpPost("{id}/cancel")]
    [ProducesResponseType(typeof(BaBsFormDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<BaBsFormDto>> CancelForm(int id, [FromBody] CancelBaBsFormDto dto)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
        {
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));
        }

        var command = new CancelBaBsFormCommand
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
    /// Delete Ba-Bs form (only draft/cancelled)
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult> DeleteForm(int id)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
        {
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));
        }

        var command = new DeleteBaBsFormCommand
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
    /// Get overdue Ba-Bs forms
    /// </summary>
    [HttpGet("overdue")]
    [ProducesResponseType(typeof(List<BaBsFormSummaryDto>), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<List<BaBsFormSummaryDto>>> GetOverdueForms()
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
        {
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));
        }

        var query = new GetOverdueBaBsFormsQuery
        {
            TenantId = tenantId.Value
        };

        var result = await _mediator.Send(query);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    /// <summary>
    /// Get Ba-Bs form statistics
    /// </summary>
    [HttpGet("stats")]
    [ProducesResponseType(typeof(BaBsFormStatsDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<BaBsFormStatsDto>> GetStats([FromQuery] int? year = null)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
        {
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));
        }

        var query = new GetBaBsFormStatsQuery
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
    /// Validate Ba-Bs form
    /// </summary>
    [HttpGet("{id}/validate")]
    [ProducesResponseType(typeof(BaBsValidationResultDto), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<BaBsValidationResultDto>> ValidateForm(int id)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
        {
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));
        }

        var query = new ValidateBaBsFormQuery
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
}
