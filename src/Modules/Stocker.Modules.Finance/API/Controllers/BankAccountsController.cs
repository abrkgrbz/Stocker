using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.Finance.Application.DTOs;
using Stocker.Modules.Finance.Application.Features.BankAccounts.Commands;
using Stocker.Modules.Finance.Application.Features.BankAccounts.Queries;
using Stocker.Modules.Finance.Domain.Entities;
using Stocker.SharedKernel.Authorization;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Finance.API.Controllers;

/// <summary>
/// Banka Hesabı (Bank Account) API Controller
/// </summary>
[ApiController]
[Authorize]
[Route("api/finance/bank-accounts")]
[RequireModule("Finance")]
[ApiExplorerSettings(GroupName = "finance")]
public class BankAccountsController : ControllerBase
{
    private readonly IMediator _mediator;

    public BankAccountsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Get paginated bank accounts
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<BankAccountSummaryDto>), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<PagedResult<BankAccountSummaryDto>>> GetBankAccounts(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? searchTerm = null,
        [FromQuery] int? status = null,
        [FromQuery] string? currency = null,
        [FromQuery] string? sortBy = null,
        [FromQuery] bool sortDescending = false)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var query = new GetBankAccountsQuery
        {
            TenantId = tenantId.Value,
            PageNumber = pageNumber,
            PageSize = pageSize,
            Filter = new BankAccountFilterDto
            {
                SearchTerm = searchTerm,
                Status = status.HasValue ? (BankAccountStatus)status.Value : null,
                Currency = currency
            },
            SortBy = sortBy,
            SortDescending = sortDescending
        };

        var result = await _mediator.Send(query);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    /// <summary>
    /// Get bank account by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(BankAccountDto), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<BankAccountDto>> GetBankAccount(int id)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var query = new GetBankAccountByIdQuery
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
    /// Get bank account by IBAN
    /// </summary>
    [HttpGet("by-iban/{iban}")]
    [ProducesResponseType(typeof(BankAccountDto), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<BankAccountDto>> GetBankAccountByIban(string iban)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var query = new GetBankAccountByIbanQuery
        {
            TenantId = tenantId.Value,
            Iban = iban
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
    /// Get bank accounts by currency
    /// </summary>
    [HttpGet("by-currency/{currency}")]
    [ProducesResponseType(typeof(List<BankAccountSummaryDto>), 200)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<List<BankAccountSummaryDto>>> GetBankAccountsByCurrency(string currency)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var query = new GetBankAccountsByCurrencyQuery
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
    /// Get bank account balance summary
    /// </summary>
    [HttpGet("balance-summary")]
    [ProducesResponseType(typeof(BankAccountBalanceSummaryDto), 200)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<BankAccountBalanceSummaryDto>> GetBalanceSummary([FromQuery] string? currency = null)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var query = new GetBankAccountBalanceSummaryQuery
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
    /// Create a new bank account
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(BankAccountDto), 201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<BankAccountDto>> CreateBankAccount([FromBody] CreateBankAccountDto dto)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var command = new CreateBankAccountCommand
        {
            TenantId = tenantId.Value,
            Data = dto
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return CreatedAtAction(nameof(GetBankAccount), new { id = result.Value.Id }, result.Value);
    }

    /// <summary>
    /// Update a bank account
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(BankAccountDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<BankAccountDto>> UpdateBankAccount(int id, [FromBody] UpdateBankAccountDto dto)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var command = new UpdateBankAccountCommand
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
    /// Activate a bank account
    /// </summary>
    [HttpPost("{id}/activate")]
    [ProducesResponseType(204)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> ActivateBankAccount(int id)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var command = new ActivateBankAccountCommand
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
    /// Deactivate a bank account
    /// </summary>
    [HttpPost("{id}/deactivate")]
    [ProducesResponseType(204)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> DeactivateBankAccount(int id)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var command = new DeactivateBankAccountCommand
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
    /// Update bank account balance
    /// </summary>
    [HttpPost("{id}/update-balance")]
    [ProducesResponseType(204)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> UpdateBalance(int id, [FromBody] UpdateBankAccountBalanceDto dto)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var command = new UpdateBankAccountBalanceCommand
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

        return NoContent();
    }

    /// <summary>
    /// Delete a bank account
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> DeleteBankAccount(int id)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var command = new DeleteBankAccountCommand
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
