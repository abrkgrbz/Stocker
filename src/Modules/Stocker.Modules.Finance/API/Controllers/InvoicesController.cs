using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.Finance.Application.DTOs;
using Stocker.Modules.Finance.Application.Features.Invoices.Commands;
using Stocker.Modules.Finance.Application.Features.Invoices.Queries;
using Stocker.SharedKernel.Authorization;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Finance.API.Controllers;

/// <summary>
/// Fatura (Invoice) API Controller
/// </summary>
[ApiController]
[Authorize]
[Route("api/finance/invoices")]
[RequireModule("Finance")]
[ApiExplorerSettings(GroupName = "finance")]
public class InvoicesController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ICurrentUserService _currentUserService;

    public InvoicesController(IMediator mediator, ICurrentUserService currentUserService)
    {
        _mediator = mediator;
        _currentUserService = currentUserService;
    }

    /// <summary>
    /// Get paginated invoices
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<InvoiceSummaryDto>), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<PagedResult<InvoiceSummaryDto>>> GetInvoices([FromQuery] InvoiceFilterDto filter)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
        {
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));
        }

        var query = new GetInvoicesQuery
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
    /// Get invoice by ID with full details
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(InvoiceDto), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<InvoiceDto>> GetInvoice(int id)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
        {
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));
        }

        var query = new GetInvoiceByIdQuery
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
    /// Get invoice by invoice number
    /// </summary>
    [HttpGet("by-number/{invoiceNumber}")]
    [ProducesResponseType(typeof(InvoiceDto), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<InvoiceDto>> GetInvoiceByNumber(string invoiceNumber)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
        {
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));
        }

        var query = new GetInvoiceByNumberQuery
        {
            TenantId = tenantId.Value,
            InvoiceNumber = invoiceNumber
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
    /// Create a new sales invoice (Satış Faturası)
    /// </summary>
    [HttpPost("sales")]
    [ProducesResponseType(typeof(InvoiceDto), 201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<InvoiceDto>> CreateSalesInvoice([FromBody] CreateInvoiceDto dto)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
        {
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));
        }

        var command = new CreateInvoiceCommand
        {
            TenantId = tenantId.Value,
            Data = dto,
            InvoiceType = Domain.Enums.InvoiceType.Sales
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return CreatedAtAction(nameof(GetInvoice), new { id = result.Value.Id }, result.Value);
    }

    /// <summary>
    /// Create a new purchase invoice (Alış Faturası)
    /// </summary>
    [HttpPost("purchase")]
    [ProducesResponseType(typeof(InvoiceDto), 201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<InvoiceDto>> CreatePurchaseInvoice([FromBody] CreateInvoiceDto dto)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
        {
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));
        }

        var command = new CreateInvoiceCommand
        {
            TenantId = tenantId.Value,
            Data = dto,
            InvoiceType = Domain.Enums.InvoiceType.Purchase
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return CreatedAtAction(nameof(GetInvoice), new { id = result.Value.Id }, result.Value);
    }

    /// <summary>
    /// Update an invoice (only for draft status)
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(InvoiceDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<InvoiceDto>> UpdateInvoice(int id, [FromBody] UpdateInvoiceDto dto)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
        {
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));
        }

        var command = new UpdateInvoiceCommand
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
    /// Submit invoice for approval
    /// </summary>
    [HttpPost("{id}/submit")]
    [ProducesResponseType(typeof(InvoiceDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<InvoiceDto>> SubmitInvoice(int id)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
        {
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));
        }

        var command = new SubmitInvoiceCommand
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
    /// Approve invoice
    /// </summary>
    [HttpPost("{id}/approve")]
    [ProducesResponseType(typeof(InvoiceDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<InvoiceDto>> ApproveInvoice(int id)
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

        var command = new ApproveInvoiceCommand
        {
            TenantId = tenantId.Value,
            Id = id,
            ApprovedByUserId = userId.Value
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
    /// Cancel invoice
    /// </summary>
    [HttpPost("{id}/cancel")]
    [ProducesResponseType(typeof(InvoiceDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<InvoiceDto>> CancelInvoice(int id, [FromBody] CancelInvoiceDto dto)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
        {
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));
        }

        var command = new CancelInvoiceCommand
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
    /// Get overdue invoices
    /// </summary>
    [HttpGet("overdue")]
    [ProducesResponseType(typeof(List<InvoiceSummaryDto>), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<List<InvoiceSummaryDto>>> GetOverdueInvoices()
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
        {
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));
        }

        var query = new GetOverdueInvoicesQuery
        {
            TenantId = tenantId.Value
        };

        var result = await _mediator.Send(query);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }
}
