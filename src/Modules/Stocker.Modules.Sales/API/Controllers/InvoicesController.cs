using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Application.Features.Invoices.Commands;
using Stocker.Modules.Sales.Application.Features.Invoices.Queries;
using Stocker.SharedKernel.Authorization;
using Stocker.SharedKernel.Pagination;

namespace Stocker.Modules.Sales.API.Controllers;

[Authorize]
[ApiController]
[Route("api/sales/invoices")]
[RequireModule("Sales")]
[ApiExplorerSettings(GroupName = "sales")]
public class InvoicesController : ControllerBase
{
    private readonly IMediator _mediator;

    public InvoicesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Gets all invoices with pagination and filtering
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<PagedResult<InvoiceListDto>>> GetInvoices(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? searchTerm = null,
        [FromQuery] string? status = null,
        [FromQuery] string? type = null,
        [FromQuery] Guid? customerId = null,
        [FromQuery] Guid? salesOrderId = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        [FromQuery] bool? isOverdue = null,
        [FromQuery] string? sortBy = "InvoiceDate",
        [FromQuery] bool sortDescending = true,
        CancellationToken cancellationToken = default)
    {
        var query = new GetInvoicesQuery
        {
            Page = page,
            PageSize = pageSize,
            SearchTerm = searchTerm,
            Status = status,
            Type = type,
            CustomerId = customerId,
            SalesOrderId = salesOrderId,
            FromDate = fromDate,
            ToDate = toDate,
            IsOverdue = isOverdue,
            SortBy = sortBy,
            SortDescending = sortDescending
        };

        var result = await _mediator.Send(query, cancellationToken);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error.Description });

        return Ok(result.Value);
    }

    /// <summary>
    /// Gets an invoice by ID
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<InvoiceDto>> GetInvoiceById(Guid id, CancellationToken cancellationToken)
    {
        var query = new GetInvoiceByIdQuery { Id = id };
        var result = await _mediator.Send(query, cancellationToken);

        if (!result.IsSuccess)
        {
            if (result.Error.Code == "NotFound")
                return NotFound(new { error = result.Error.Description });
            return BadRequest(new { error = result.Error.Description });
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Gets invoice statistics
    /// </summary>
    [HttpGet("statistics")]
    public async Task<ActionResult<InvoiceStatisticsDto>> GetStatistics(
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        CancellationToken cancellationToken = default)
    {
        var query = new GetInvoiceStatisticsQuery
        {
            FromDate = fromDate,
            ToDate = toDate
        };

        var result = await _mediator.Send(query, cancellationToken);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error.Description });

        return Ok(result.Value);
    }

    /// <summary>
    /// Creates a new invoice
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<InvoiceDto>> CreateInvoice(
        [FromBody] CreateInvoiceCommand command,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(command, cancellationToken);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error.Description });

        return CreatedAtAction(nameof(GetInvoiceById), new { id = result.Value.Id }, result.Value);
    }

    /// <summary>
    /// Creates an invoice from a sales order
    /// </summary>
    [HttpPost("from-order")]
    public async Task<ActionResult<InvoiceDto>> CreateInvoiceFromOrder(
        [FromBody] CreateInvoiceFromOrderCommand command,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(command, cancellationToken);

        if (!result.IsSuccess)
        {
            if (result.Error.Code == "NotFound")
                return NotFound(new { error = result.Error.Description });
            return BadRequest(new { error = result.Error.Description });
        }

        return CreatedAtAction(nameof(GetInvoiceById), new { id = result.Value.Id }, result.Value);
    }

    /// <summary>
    /// Updates an invoice
    /// </summary>
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<InvoiceDto>> UpdateInvoice(
        Guid id,
        [FromBody] UpdateInvoiceCommand command,
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
    /// Adds an item to an invoice
    /// </summary>
    [HttpPost("{id:guid}/items")]
    public async Task<ActionResult<InvoiceDto>> AddItem(
        Guid id,
        [FromBody] AddInvoiceItemCommand command,
        CancellationToken cancellationToken)
    {
        if (id != command.InvoiceId)
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
    /// Removes an item from an invoice
    /// </summary>
    [HttpDelete("{invoiceId:guid}/items/{itemId:guid}")]
    public async Task<ActionResult<InvoiceDto>> RemoveItem(
        Guid invoiceId,
        Guid itemId,
        CancellationToken cancellationToken)
    {
        var command = new RemoveInvoiceItemCommand
        {
            InvoiceId = invoiceId,
            ItemId = itemId
        };

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
    /// Issues an invoice
    /// </summary>
    [HttpPost("{id:guid}/issue")]
    public async Task<ActionResult<InvoiceDto>> IssueInvoice(Guid id, CancellationToken cancellationToken)
    {
        var command = new IssueInvoiceCommand { Id = id };
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
    /// Sends an invoice
    /// </summary>
    [HttpPost("{id:guid}/send")]
    public async Task<ActionResult<InvoiceDto>> SendInvoice(Guid id, CancellationToken cancellationToken)
    {
        var command = new SendInvoiceCommand { Id = id };
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
    /// Records a payment for an invoice
    /// </summary>
    [HttpPost("{id:guid}/record-payment")]
    public async Task<ActionResult<InvoiceDto>> RecordPayment(
        Guid id,
        [FromBody] RecordPaymentCommand command,
        CancellationToken cancellationToken)
    {
        if (id != command.InvoiceId)
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
    /// Sets e-invoice ID for an invoice
    /// </summary>
    [HttpPost("{id:guid}/e-invoice")]
    public async Task<ActionResult<InvoiceDto>> SetEInvoice(
        Guid id,
        [FromBody] SetEInvoiceCommand command,
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
    /// Cancels an invoice
    /// </summary>
    [HttpPost("{id:guid}/cancel")]
    public async Task<ActionResult<InvoiceDto>> CancelInvoice(
        Guid id,
        [FromBody] CancelInvoiceCommand command,
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
    /// Deletes an invoice
    /// </summary>
    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> DeleteInvoice(Guid id, CancellationToken cancellationToken)
    {
        var command = new DeleteInvoiceCommand { Id = id };
        var result = await _mediator.Send(command, cancellationToken);

        if (!result.IsSuccess)
        {
            if (result.Error.Code == "NotFound")
                return NotFound(new { error = result.Error.Description });
            return BadRequest(new { error = result.Error.Description });
        }

        return NoContent();
    }

    // =====================================
    // TÜRK MEVZUATI ENDPOINTLERİ
    // =====================================

    /// <summary>
    /// Voids an invoice (Hükümsüz kılma)
    /// </summary>
    [HttpPost("{id:guid}/void")]
    public async Task<ActionResult<InvoiceDto>> VoidInvoice(
        Guid id,
        [FromBody] VoidInvoiceCommand command,
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
    /// Applies withholding tax to an invoice (Tevkifat uygula)
    /// </summary>
    [HttpPost("{id:guid}/withholding-tax")]
    public async Task<ActionResult<InvoiceDto>> ApplyWithholdingTax(
        Guid id,
        [FromBody] ApplyWithholdingTaxCommand command,
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
    /// Removes withholding tax from an invoice (Tevkifat kaldır)
    /// </summary>
    [HttpDelete("{id:guid}/withholding-tax")]
    public async Task<ActionResult<InvoiceDto>> RemoveWithholdingTax(
        Guid id,
        CancellationToken cancellationToken)
    {
        var command = new RemoveWithholdingTaxCommand { Id = id };
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
    /// Sets e-archive information (E-Arşiv bilgisi ata)
    /// </summary>
    [HttpPost("{id:guid}/e-archive")]
    public async Task<ActionResult<InvoiceDto>> SetEArchive(
        Guid id,
        [FromBody] SetEArchiveCommand command,
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
    /// Sets GİB UUID for an invoice
    /// </summary>
    [HttpPost("{id:guid}/gib-uuid")]
    public async Task<ActionResult<InvoiceDto>> SetGibUuid(
        Guid id,
        [FromBody] SetGibUuidCommand command,
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
    /// Updates e-invoice status (E-Fatura durumu güncelle)
    /// </summary>
    [HttpPost("{id:guid}/e-invoice-status")]
    public async Task<ActionResult<InvoiceDto>> UpdateEInvoiceStatus(
        Guid id,
        [FromBody] UpdateEInvoiceStatusCommand command,
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
    /// Updates e-archive status (E-Arşiv durumu güncelle)
    /// </summary>
    [HttpPost("{id:guid}/e-archive-status")]
    public async Task<ActionResult<InvoiceDto>> UpdateEArchiveStatus(
        Guid id,
        [FromBody] UpdateEArchiveStatusCommand command,
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
}
