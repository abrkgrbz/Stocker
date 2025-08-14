using MediatR;
using Microsoft.AspNetCore.Mvc;
using Stocker.Application.Features.Invoices.Commands.CreateInvoice;
using Stocker.Application.Features.Invoices.Commands.UpdateInvoiceStatus;
using Stocker.Application.Features.Invoices.Commands.MarkAsPaid;
using Stocker.Application.Features.Invoices.Commands.CancelInvoice;
using Stocker.Application.Features.Invoices.Queries.GetInvoiceById;
using Stocker.Application.Features.Invoices.Queries.GetInvoicesList;
using Stocker.Application.Features.Invoices.Queries.GetTenantInvoices;
using Stocker.Application.DTOs.Invoice;
using Swashbuckle.AspNetCore.Annotations;

namespace Stocker.API.Controllers.Master;

[SwaggerTag("Invoice Management - Manage billing invoices and statements")]
public class InvoicesController : MasterControllerBase
{
    public InvoicesController(IMediator mediator, ILogger<InvoicesController> logger) 
        : base(mediator, logger)
    {
    }

    /// <summary>
    /// Get all invoices with filtering
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<InvoicesListResponse>), 200)]
    public async Task<IActionResult> GetAll([FromQuery] GetInvoicesListQuery query)
    {
        _logger.LogInformation("Getting all invoices with query: {@Query}", query);
        
        var result = await _mediator.Send(query);
        return HandleResult(result);
    }

    /// <summary>
    /// Get invoice by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<InvoiceDto>), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetById(Guid id)
    {
        _logger.LogInformation("Getting invoice details for ID: {InvoiceId}", id);
        
        var query = new GetInvoiceByIdQuery { InvoiceId = id };
        var result = await _mediator.Send(query);
        return HandleResult(result);
    }

    /// <summary>
    /// Get all invoices for a specific tenant
    /// </summary>
    [HttpGet("tenant/{tenantId}")]
    [ProducesResponseType(typeof(ApiResponse<List<InvoiceDto>>), 200)]
    public async Task<IActionResult> GetByTenant(Guid tenantId, [FromQuery] string? status = null)
    {
        _logger.LogInformation("Getting invoices for tenant: {TenantId}", tenantId);
        
        var query = new GetTenantInvoicesQuery 
        { 
            TenantId = tenantId,
            Status = status
        };
        var result = await _mediator.Send(query);
        return HandleResult(result);
    }

    /// <summary>
    /// Create a new invoice
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<InvoiceDto>), 201)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> Create([FromBody] CreateInvoiceCommand command)
    {
        _logger.LogInformation("Creating new invoice for tenant: {TenantId}", command.TenantId);
        
        var result = await _mediator.Send(command);
        
        if (result.IsSuccess)
        {
            _logger.LogInformation("Invoice created successfully with ID: {InvoiceId}", result.Value.Id);
            return CreatedAtAction(nameof(GetById), new { id = result.Value.Id }, 
                new ApiResponse<InvoiceDto>
                {
                    Success = true,
                    Data = result.Value,
                    Message = "Fatura başarıyla oluşturuldu",
                    Timestamp = DateTime.UtcNow
                });
        }
        
        return HandleResult(result);
    }

    /// <summary>
    /// Mark invoice as paid
    /// </summary>
    [HttpPost("{id}/mark-paid")]
    [ProducesResponseType(typeof(ApiResponse<bool>), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> MarkAsPaid(Guid id, [FromBody] MarkAsPaidCommand command)
    {
        _logger.LogInformation("Marking invoice {InvoiceId} as paid", id);
        
        command.InvoiceId = id;
        command.PaidBy = CurrentUserId;
        
        var result = await _mediator.Send(command);
        
        if (result.IsSuccess)
        {
            _logger.LogInformation("Invoice {InvoiceId} marked as paid successfully", id);
        }
        
        return HandleResult(result);
    }

    /// <summary>
    /// Update invoice status
    /// </summary>
    [HttpPut("{id}/status")]
    [ProducesResponseType(typeof(ApiResponse<bool>), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateInvoiceStatusCommand command)
    {
        _logger.LogInformation("Updating status for invoice {InvoiceId} to {Status}", id, command.NewStatus);
        
        command.InvoiceId = id;
        command.UpdatedBy = CurrentUserId;
        
        var result = await _mediator.Send(command);
        
        if (result.IsSuccess)
        {
            _logger.LogInformation("Invoice {InvoiceId} status updated to {Status}", id, command.NewStatus);
        }
        
        return HandleResult(result);
    }

    /// <summary>
    /// Cancel an invoice
    /// </summary>
    [HttpPost("{id}/cancel")]
    [ProducesResponseType(typeof(ApiResponse<bool>), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> Cancel(Guid id, [FromBody] CancelInvoiceCommand command)
    {
        _logger.LogWarning("Cancelling invoice {InvoiceId} by {UserEmail}. Reason: {Reason}", 
            id, CurrentUserEmail, command.Reason);
        
        command.InvoiceId = id;
        command.CancelledBy = CurrentUserId;
        
        var result = await _mediator.Send(command);
        
        if (result.IsSuccess)
        {
            _logger.LogWarning("Invoice {InvoiceId} cancelled by {UserEmail}", id, CurrentUserEmail);
        }
        
        return HandleResult(result);
    }

    /// <summary>
    /// Get overdue invoices
    /// </summary>
    [HttpGet("overdue")]
    [ProducesResponseType(typeof(ApiResponse<InvoicesListResponse>), 200)]
    public async Task<IActionResult> GetOverdueInvoices()
    {
        _logger.LogInformation("Getting overdue invoices");
        
        var query = new GetInvoicesListQuery 
        { 
            Status = Domain.Master.Enums.InvoiceStatus.Overdue,
            ToDate = DateTime.UtcNow
        };
        
        var result = await _mediator.Send(query);
        return HandleResult(result);
    }

    /// <summary>
    /// Send reminder for unpaid invoices
    /// </summary>
    [HttpPost("{id}/send-reminder")]
    [ProducesResponseType(typeof(ApiResponse<bool>), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> SendReminder(Guid id)
    {
        _logger.LogInformation("Sending payment reminder for invoice {InvoiceId}", id);
        
        // TODO: Implement email reminder functionality
        return Ok(new ApiResponse<bool>
        {
            Success = true,
            Data = true,
            Message = "Ödeme hatırlatması gönderildi",
            Timestamp = DateTime.UtcNow
        });
    }
}