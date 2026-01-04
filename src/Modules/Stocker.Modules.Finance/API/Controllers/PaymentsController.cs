using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.Finance.Application.DTOs;
using Stocker.Modules.Finance.Application.Features.Payments.Commands;
using Stocker.Modules.Finance.Application.Features.Payments.Queries;
using Stocker.SharedKernel.Authorization;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Finance.API.Controllers;

/// <summary>
/// Ödeme/Tahsilat (Payment/Collection) API Controller
/// </summary>
[ApiController]
[Authorize]
[Route("api/finance/payments")]
[RequireModule("Finance")]
[ApiExplorerSettings(GroupName = "finance")]
public class PaymentsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ICurrentUserService _currentUserService;

    public PaymentsController(IMediator mediator, ICurrentUserService currentUserService)
    {
        _mediator = mediator;
        _currentUserService = currentUserService;
    }

    /// <summary>
    /// Get paginated payments
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<PaymentSummaryDto>), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<PagedResult<PaymentSummaryDto>>> GetPayments([FromQuery] PaymentFilterDto filter)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
        {
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));
        }

        var query = new GetPaymentsQuery
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
    /// Get payment by ID with allocations
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(PaymentDto), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<PaymentDto>> GetPayment(int id)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
        {
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));
        }

        var query = new GetPaymentByIdQuery
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
    /// Create a new collection (Tahsilat)
    /// </summary>
    [HttpPost("collections")]
    [ProducesResponseType(typeof(PaymentDto), 201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<PaymentDto>> CreateCollection([FromBody] CreatePaymentDto dto)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
        {
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));
        }

        var command = new CreatePaymentCommand
        {
            TenantId = tenantId.Value,
            Data = dto,
            Direction = Domain.Enums.MovementDirection.Inbound
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return CreatedAtAction(nameof(GetPayment), new { id = result.Value.Id }, result.Value);
    }

    /// <summary>
    /// Create a new payment (Ödeme)
    /// </summary>
    [HttpPost("disbursements")]
    [ProducesResponseType(typeof(PaymentDto), 201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<PaymentDto>> CreateDisbursement([FromBody] CreatePaymentDto dto)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
        {
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));
        }

        var command = new CreatePaymentCommand
        {
            TenantId = tenantId.Value,
            Data = dto,
            Direction = Domain.Enums.MovementDirection.Outbound
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return CreatedAtAction(nameof(GetPayment), new { id = result.Value.Id }, result.Value);
    }

    /// <summary>
    /// Approve payment
    /// </summary>
    [HttpPost("{id}/approve")]
    [ProducesResponseType(typeof(PaymentDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<PaymentDto>> ApprovePayment(int id, [FromBody] ApprovePaymentDto dto)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
        {
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));
        }

        var userId = _currentUserService.UserId;
        if (!userId.HasValue)
        {
            return Unauthorized();
        }

        var command = new ApprovePaymentCommand
        {
            TenantId = tenantId.Value,
            Id = id,
            ApprovedByUserId = userId.Value,
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
    /// Complete payment
    /// </summary>
    [HttpPost("{id}/complete")]
    [ProducesResponseType(typeof(PaymentDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<PaymentDto>> CompletePayment(int id)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
        {
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));
        }

        var command = new CompletePaymentCommand
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
    /// Cancel payment
    /// </summary>
    [HttpPost("{id}/cancel")]
    [ProducesResponseType(typeof(PaymentDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<PaymentDto>> CancelPayment(int id, [FromBody] CancelPaymentDto dto)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
        {
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));
        }

        var command = new CancelPaymentCommand
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
    /// Allocate payment to invoices
    /// </summary>
    [HttpPost("{id}/allocate")]
    [ProducesResponseType(typeof(PaymentDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<PaymentDto>> AllocatePayment(int id, [FromBody] AllocatePaymentDto dto)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
        {
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));
        }

        var command = new AllocatePaymentCommand
        {
            TenantId = tenantId.Value,
            PaymentId = id,
            Allocations = dto.Allocations
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
    /// Get unallocated payments for a current account
    /// </summary>
    [HttpGet("unallocated")]
    [ProducesResponseType(typeof(List<PaymentSummaryDto>), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<List<PaymentSummaryDto>>> GetUnallocatedPayments([FromQuery] int? currentAccountId = null)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
        {
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));
        }

        var query = new GetUnallocatedPaymentsQuery
        {
            TenantId = tenantId.Value,
            CurrentAccountId = currentAccountId
        };

        var result = await _mediator.Send(query);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }
}
