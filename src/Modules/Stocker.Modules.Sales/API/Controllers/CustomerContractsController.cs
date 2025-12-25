using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Application.Features.CustomerContracts.Commands;
using Stocker.Modules.Sales.Application.Features.CustomerContracts.Queries;
using Stocker.SharedKernel.Authorization;
using Stocker.SharedKernel.Pagination;

namespace Stocker.Modules.Sales.API.Controllers;

/// <summary>
/// Controller for managing customer contracts.
/// Provides endpoints for contract lifecycle, credit limit management, and SLA configuration.
/// </summary>
[Authorize]
[ApiController]
[Route("api/sales/contracts")]
[RequireModule("Sales")]
[ApiExplorerSettings(GroupName = "sales")]
public class CustomerContractsController : ControllerBase
{
    private readonly IMediator _mediator;

    public CustomerContractsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    #region Query Endpoints

    /// <summary>
    /// Gets all customer contracts with pagination and filtering
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<PagedResult<CustomerContractListDto>>> GetContracts(
        [FromQuery] GetCustomerContractsQuery query,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(query, cancellationToken);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error.Description });

        return Ok(result.Value);
    }

    /// <summary>
    /// Gets a customer contract by ID
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<CustomerContractDto>> GetContractById(Guid id, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetCustomerContractByIdQuery { Id = id }, cancellationToken);

        if (!result.IsSuccess)
        {
            if (result.Error.Code == "NotFound")
                return NotFound(new { error = result.Error.Description });
            return BadRequest(new { error = result.Error.Description });
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Gets a customer contract by contract number
    /// </summary>
    [HttpGet("number/{contractNumber}")]
    public async Task<ActionResult<CustomerContractDto>> GetContractByNumber(
        string contractNumber,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetCustomerContractByNumberQuery { ContractNumber = contractNumber }, cancellationToken);

        if (!result.IsSuccess)
        {
            if (result.Error.Code == "NotFound")
                return NotFound(new { error = result.Error.Description });
            return BadRequest(new { error = result.Error.Description });
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Gets the active contract for a customer
    /// </summary>
    [HttpGet("customer/{customerId:guid}/active")]
    public async Task<ActionResult<CustomerContractDto>> GetActiveContractByCustomer(
        Guid customerId,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetActiveContractByCustomerQuery { CustomerId = customerId }, cancellationToken);

        if (!result.IsSuccess)
        {
            if (result.Error.Code == "NotFound")
                return NotFound(new { error = result.Error.Description });
            return BadRequest(new { error = result.Error.Description });
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Gets contracts expiring within specified days
    /// </summary>
    [HttpGet("expiring")]
    public async Task<ActionResult<IReadOnlyList<CustomerContractListDto>>> GetExpiringContracts(
        [FromQuery] int daysUntilExpiration = 30,
        CancellationToken cancellationToken = default)
    {
        var result = await _mediator.Send(new GetExpiringContractsQuery { DaysUntilExpiration = daysUntilExpiration }, cancellationToken);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error.Description });

        return Ok(result.Value);
    }

    /// <summary>
    /// Gets contracts requiring renewal notification
    /// </summary>
    [HttpGet("requiring-renewal")]
    public async Task<ActionResult<IReadOnlyList<CustomerContractListDto>>> GetContractsRequiringRenewal(
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetContractsRequiringRenewalQuery(), cancellationToken);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error.Description });

        return Ok(result.Value);
    }

    /// <summary>
    /// Validates if a contract can accept a new order
    /// </summary>
    [HttpGet("{id:guid}/validate-for-order")]
    public async Task<ActionResult<ContractValidationResult>> ValidateForOrder(
        Guid id,
        [FromQuery] decimal orderAmount,
        [FromQuery] decimal currentOutstandingBalance = 0,
        [FromQuery] bool allowGracePeriod = false,
        CancellationToken cancellationToken = default)
    {
        var result = await _mediator.Send(new ValidateContractForOrderQuery
        {
            ContractId = id,
            OrderAmount = orderAmount,
            CurrentOutstandingBalance = currentOutstandingBalance,
            AllowGracePeriod = allowGracePeriod
        }, cancellationToken);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error.Description });

        return Ok(result.Value);
    }

    #endregion

    #region Command Endpoints - Contract Management

    /// <summary>
    /// Creates a new customer contract
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<CustomerContractDto>> CreateContract(
        [FromBody] CreateCustomerContractCommand command,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(command, cancellationToken);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error.Description });

        return CreatedAtAction(nameof(GetContractById), new { id = result.Value.Id }, result.Value);
    }

    /// <summary>
    /// Updates an existing customer contract
    /// </summary>
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<CustomerContractDto>> UpdateContract(
        Guid id,
        [FromBody] UpdateCustomerContractCommand command,
        CancellationToken cancellationToken)
    {
        if (id != command.Id)
            return BadRequest(new { error = "ID mismatch" });

        var result = await _mediator.Send(command, cancellationToken);

        if (!result.IsSuccess)
        {
            if (result.Error.Code == "NotFound")
                return NotFound(new { error = result.Error.Description });
            return BadRequest(new { error = result.Error.Description });
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Activates a customer contract
    /// </summary>
    [HttpPost("{id:guid}/activate")]
    public async Task<ActionResult<CustomerContractDto>> ActivateContract(Guid id, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new ActivateContractCommand { Id = id }, cancellationToken);

        if (!result.IsSuccess)
        {
            if (result.Error.Code == "NotFound")
                return NotFound(new { error = result.Error.Description });
            return BadRequest(new { error = result.Error.Description });
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Suspends a customer contract
    /// </summary>
    [HttpPost("{id:guid}/suspend")]
    public async Task<ActionResult<CustomerContractDto>> SuspendContract(
        Guid id,
        [FromBody] SuspendContractCommand command,
        CancellationToken cancellationToken)
    {
        if (id != command.Id)
            return BadRequest(new { error = "ID mismatch" });

        var result = await _mediator.Send(command, cancellationToken);

        if (!result.IsSuccess)
        {
            if (result.Error.Code == "NotFound")
                return NotFound(new { error = result.Error.Description });
            return BadRequest(new { error = result.Error.Description });
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Terminates a customer contract
    /// </summary>
    [HttpPost("{id:guid}/terminate")]
    public async Task<ActionResult<CustomerContractDto>> TerminateContract(
        Guid id,
        [FromBody] TerminateContractCommand command,
        CancellationToken cancellationToken)
    {
        if (id != command.Id)
            return BadRequest(new { error = "ID mismatch" });

        var result = await _mediator.Send(command, cancellationToken);

        if (!result.IsSuccess)
        {
            if (result.Error.Code == "NotFound")
                return NotFound(new { error = result.Error.Description });
            return BadRequest(new { error = result.Error.Description });
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Renews a customer contract
    /// </summary>
    [HttpPost("{id:guid}/renew")]
    public async Task<ActionResult<CustomerContractDto>> RenewContract(
        Guid id,
        [FromBody] RenewContractCommand command,
        CancellationToken cancellationToken)
    {
        if (id != command.Id)
            return BadRequest(new { error = "ID mismatch" });

        var result = await _mediator.Send(command, cancellationToken);

        if (!result.IsSuccess)
        {
            if (result.Error.Code == "NotFound")
                return NotFound(new { error = result.Error.Description });
            return BadRequest(new { error = result.Error.Description });
        }

        return Ok(result.Value);
    }

    #endregion

    #region Command Endpoints - Credit Limit Management

    /// <summary>
    /// Updates the credit limit for a contract
    /// </summary>
    [HttpPost("{id:guid}/credit-limit")]
    public async Task<ActionResult<CustomerContractDto>> UpdateCreditLimit(
        Guid id,
        [FromBody] UpdateCreditLimitCommand command,
        CancellationToken cancellationToken)
    {
        if (id != command.Id)
            return BadRequest(new { error = "ID mismatch" });

        var result = await _mediator.Send(command, cancellationToken);

        if (!result.IsSuccess)
        {
            if (result.Error.Code == "NotFound")
                return NotFound(new { error = result.Error.Description });
            return BadRequest(new { error = result.Error.Description });
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Blocks a contract
    /// </summary>
    [HttpPost("{id:guid}/block")]
    public async Task<ActionResult<CustomerContractDto>> BlockContract(
        Guid id,
        [FromBody] BlockContractCommand command,
        CancellationToken cancellationToken)
    {
        if (id != command.Id)
            return BadRequest(new { error = "ID mismatch" });

        var result = await _mediator.Send(command, cancellationToken);

        if (!result.IsSuccess)
        {
            if (result.Error.Code == "NotFound")
                return NotFound(new { error = result.Error.Description });
            return BadRequest(new { error = result.Error.Description });
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Unblocks a contract
    /// </summary>
    [HttpPost("{id:guid}/unblock")]
    public async Task<ActionResult<CustomerContractDto>> UnblockContract(
        Guid id,
        [FromBody] UnblockContractCommand command,
        CancellationToken cancellationToken)
    {
        if (id != command.Id)
            return BadRequest(new { error = "ID mismatch" });

        var result = await _mediator.Send(command, cancellationToken);

        if (!result.IsSuccess)
        {
            if (result.Error.Code == "NotFound")
                return NotFound(new { error = result.Error.Description });
            return BadRequest(new { error = result.Error.Description });
        }

        return Ok(result.Value);
    }

    #endregion

    #region Command Endpoints - SLA Configuration

    /// <summary>
    /// Configures the SLA for a contract
    /// </summary>
    [HttpPost("{id:guid}/sla")]
    public async Task<ActionResult<CustomerContractDto>> ConfigureSLA(
        Guid id,
        [FromBody] ConfigureSLACommand command,
        CancellationToken cancellationToken)
    {
        if (id != command.Id)
            return BadRequest(new { error = "ID mismatch" });

        var result = await _mediator.Send(command, cancellationToken);

        if (!result.IsSuccess)
        {
            if (result.Error.Code == "NotFound")
                return NotFound(new { error = result.Error.Description });
            return BadRequest(new { error = result.Error.Description });
        }

        return Ok(result.Value);
    }

    #endregion

    #region Command Endpoints - Price Agreements

    /// <summary>
    /// Adds a price agreement to a contract
    /// </summary>
    [HttpPost("{id:guid}/price-agreements")]
    public async Task<ActionResult<CustomerContractDto>> AddPriceAgreement(
        Guid id,
        [FromBody] AddPriceAgreementCommand command,
        CancellationToken cancellationToken)
    {
        if (id != command.ContractId)
            return BadRequest(new { error = "ID mismatch" });

        var result = await _mediator.Send(command, cancellationToken);

        if (!result.IsSuccess)
        {
            if (result.Error.Code == "NotFound")
                return NotFound(new { error = result.Error.Description });
            return BadRequest(new { error = result.Error.Description });
        }

        return Ok(result.Value);
    }

    #endregion

    /// <summary>
    /// Deletes a customer contract
    /// </summary>
    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> DeleteContract(Guid id, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new DeleteCustomerContractCommand { Id = id }, cancellationToken);

        if (!result.IsSuccess)
        {
            if (result.Error.Code == "NotFound")
                return NotFound(new { error = result.Error.Description });
            return BadRequest(new { error = result.Error.Description });
        }

        return NoContent();
    }
}
