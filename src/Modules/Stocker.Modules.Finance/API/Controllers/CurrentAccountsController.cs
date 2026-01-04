using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.Finance.Application.DTOs;
using Stocker.Modules.Finance.Application.Features.CurrentAccounts.Commands;
using Stocker.Modules.Finance.Application.Features.CurrentAccounts.Queries;
using Stocker.Modules.Finance.Domain.Enums;
using Stocker.SharedKernel.Authorization;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Finance.API.Controllers;

/// <summary>
/// Cari Hesap (Current Account) API Controller
/// </summary>
[ApiController]
[Authorize]
[Route("api/finance/current-accounts")]
[RequireModule("Finance")]
[ApiExplorerSettings(GroupName = "finance")]
public class CurrentAccountsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ICurrentUserService _currentUserService;

    public CurrentAccountsController(IMediator mediator, ICurrentUserService currentUserService)
    {
        _mediator = mediator;
        _currentUserService = currentUserService;
    }

    /// <summary>
    /// Get paginated current accounts
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<CurrentAccountSummaryDto>), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<PagedResult<CurrentAccountSummaryDto>>> GetCurrentAccounts(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? searchTerm = null,
        [FromQuery] int? accountType = null,
        [FromQuery] int? status = null,
        [FromQuery] bool? hasBalance = null,
        [FromQuery] string? sortBy = null,
        [FromQuery] bool sortDescending = false)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
        {
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));
        }

        var query = new GetCurrentAccountsQuery
        {
            TenantId = tenantId.Value,
            PageNumber = pageNumber,
            PageSize = pageSize,
            SearchTerm = searchTerm,
            AccountType = accountType.HasValue ? (CurrentAccountType)accountType.Value : null,
            Status = status.HasValue ? (CurrentAccountStatus)status.Value : null,
            HasBalance = hasBalance,
            SortBy = sortBy,
            SortDescending = sortDescending
        };

        var result = await _mediator.Send(query);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    /// <summary>
    /// Get current account by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(CurrentAccountDto), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<CurrentAccountDto>> GetCurrentAccount(int id)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
        {
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));
        }

        var query = new GetCurrentAccountByIdQuery
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
    /// Get current account statement
    /// </summary>
    [HttpGet("{id}/statement")]
    [ProducesResponseType(typeof(CurrentAccountStatementDto), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<CurrentAccountStatementDto>> GetCurrentAccountStatement(
        int id,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
        {
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));
        }

        var query = new GetCurrentAccountStatementQuery
        {
            TenantId = tenantId.Value,
            CurrentAccountId = id,
            StartDate = startDate ?? DateTime.UtcNow.AddMonths(-1),
            EndDate = endDate ?? DateTime.UtcNow
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
    /// Create a new current account
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(CurrentAccountDto), 201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<CurrentAccountDto>> CreateCurrentAccount([FromBody] CreateCurrentAccountDto dto)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
        {
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));
        }

        var command = new CreateCurrentAccountCommand
        {
            TenantId = tenantId.Value,
            Data = dto
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return CreatedAtAction(nameof(GetCurrentAccount), new { id = result.Value.Id }, result.Value);
    }

    /// <summary>
    /// Update a current account
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(CurrentAccountDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<CurrentAccountDto>> UpdateCurrentAccount(int id, [FromBody] UpdateCurrentAccountDto dto)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
        {
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));
        }

        var command = new UpdateCurrentAccountCommand
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
    /// Delete a current account
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> DeleteCurrentAccount(int id)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
        {
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));
        }

        var command = new DeleteCurrentAccountCommand
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
