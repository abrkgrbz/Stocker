using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.Finance.Application.DTOs;
using Stocker.Modules.Finance.Application.Features.Accounts.Commands;
using Stocker.Modules.Finance.Application.Features.Accounts.Queries;
using Stocker.Modules.Finance.Domain.Enums;
using Stocker.SharedKernel.Authorization;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Finance.API.Controllers;

/// <summary>
/// Muhasebe Hesabı (Chart of Accounts) API Controller
/// </summary>
[ApiController]
[Authorize]
[Route("api/finance/accounts")]
[RequireModule("Finance")]
[ApiExplorerSettings(GroupName = "finance")]
public class AccountsController : ControllerBase
{
    private readonly IMediator _mediator;

    public AccountsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Get paginated accounts
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<AccountSummaryDto>), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<PagedResult<AccountSummaryDto>>> GetAccounts(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? searchTerm = null,
        [FromQuery] int? accountType = null,
        [FromQuery] int? subGroup = null,
        [FromQuery] string? currency = null,
        [FromQuery] bool? isActive = null,
        [FromQuery] bool? isSystemAccount = null,
        [FromQuery] bool? acceptsTransactions = null,
        [FromQuery] int? level = null,
        [FromQuery] int? parentAccountId = null,
        [FromQuery] bool? rootOnly = null,
        [FromQuery] string? sortBy = null,
        [FromQuery] bool sortDescending = false)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var query = new GetAccountsQuery
        {
            TenantId = tenantId.Value,
            Filter = new AccountFilterDto
            {
                PageNumber = pageNumber,
                PageSize = pageSize,
                SearchTerm = searchTerm,
                AccountType = accountType.HasValue ? (AccountType)accountType.Value : null,
                SubGroup = subGroup.HasValue ? (AccountSubGroup)subGroup.Value : null,
                Currency = currency,
                IsActive = isActive,
                IsSystemAccount = isSystemAccount,
                AcceptsTransactions = acceptsTransactions,
                Level = level,
                ParentAccountId = parentAccountId,
                RootOnly = rootOnly,
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
    /// Get account by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(AccountDto), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<AccountDto>> GetAccount(int id)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var query = new GetAccountByIdQuery
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
    /// Get account by code
    /// </summary>
    [HttpGet("by-code/{code}")]
    [ProducesResponseType(typeof(AccountDto), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<AccountDto>> GetAccountByCode(string code)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var query = new GetAccountByCodeQuery
        {
            TenantId = tenantId.Value,
            Code = code
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
    /// Get account tree structure
    /// </summary>
    [HttpGet("tree")]
    [ProducesResponseType(typeof(List<AccountTreeNodeDto>), 200)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<List<AccountTreeNodeDto>>> GetAccountTree(
        [FromQuery] int? accountType = null,
        [FromQuery] int? rootAccountId = null,
        [FromQuery] bool activeOnly = true,
        [FromQuery] int maxDepth = 0)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var query = new GetAccountTreeQuery
        {
            TenantId = tenantId.Value,
            AccountType = accountType.HasValue ? (AccountType)accountType.Value : null,
            RootAccountId = rootAccountId,
            ActiveOnly = activeOnly,
            MaxDepth = maxDepth
        };

        var result = await _mediator.Send(query);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    /// <summary>
    /// Get active accounts for selection
    /// </summary>
    [HttpGet("active")]
    [ProducesResponseType(typeof(List<AccountSummaryDto>), 200)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<List<AccountSummaryDto>>> GetActiveAccounts(
        [FromQuery] int? accountType = null,
        [FromQuery] int? subGroup = null,
        [FromQuery] bool transactionAccountsOnly = true,
        [FromQuery] string? currency = null)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var query = new GetActiveAccountsQuery
        {
            TenantId = tenantId.Value,
            AccountType = accountType.HasValue ? (AccountType)accountType.Value : null,
            SubGroup = subGroup.HasValue ? (AccountSubGroup)subGroup.Value : null,
            TransactionAccountsOnly = transactionAccountsOnly,
            Currency = currency
        };

        var result = await _mediator.Send(query);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    /// <summary>
    /// Get accounts by type
    /// </summary>
    [HttpGet("by-type/{accountType}")]
    [ProducesResponseType(typeof(List<AccountSummaryDto>), 200)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<List<AccountSummaryDto>>> GetAccountsByType(
        int accountType,
        [FromQuery] bool activeOnly = true)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var query = new GetAccountsByTypeQuery
        {
            TenantId = tenantId.Value,
            AccountType = (AccountType)accountType,
            ActiveOnly = activeOnly
        };

        var result = await _mediator.Send(query);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    /// <summary>
    /// Get child accounts
    /// </summary>
    [HttpGet("{parentId}/children")]
    [ProducesResponseType(typeof(List<AccountSummaryDto>), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<List<AccountSummaryDto>>> GetChildAccounts(
        int parentId,
        [FromQuery] bool activeOnly = true,
        [FromQuery] bool recursive = false)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var query = new GetChildAccountsQuery
        {
            TenantId = tenantId.Value,
            ParentAccountId = parentId,
            ActiveOnly = activeOnly,
            Recursive = recursive
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
    /// Create a new account
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(AccountDto), 201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<AccountDto>> CreateAccount([FromBody] CreateAccountDto dto)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var command = new CreateAccountCommand
        {
            TenantId = tenantId.Value,
            Data = dto
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return CreatedAtAction(nameof(GetAccount), new { id = result.Value.Id }, result.Value);
    }

    /// <summary>
    /// Update an account
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(AccountDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<AccountDto>> UpdateAccount(int id, [FromBody] UpdateAccountDto dto)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var command = new UpdateAccountCommand
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
    /// Activate an account
    /// </summary>
    [HttpPost("{id}/activate")]
    [ProducesResponseType(typeof(AccountDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<AccountDto>> ActivateAccount(int id)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var command = new ActivateAccountCommand
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
    /// Deactivate an account
    /// </summary>
    [HttpPost("{id}/deactivate")]
    [ProducesResponseType(typeof(AccountDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<AccountDto>> DeactivateAccount(int id)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var command = new DeactivateAccountCommand
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
    /// Delete an account
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> DeleteAccount(int id)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var command = new DeleteAccountCommand
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
