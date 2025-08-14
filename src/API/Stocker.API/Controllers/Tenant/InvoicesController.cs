using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.API.Controllers.Base;
using Stocker.Application.DTOs.TenantInvoice;
using Stocker.Application.Features.TenantInvoices.Commands.CreateInvoice;
using Stocker.Application.Features.TenantInvoices.Queries.GetInvoices;
using Swashbuckle.AspNetCore.Annotations;

namespace Stocker.API.Controllers.Tenant;

[Authorize]
[ApiController]
[Route("api/tenant/invoices")]
[SwaggerTag("Tenant Invoice Management - Manage tenant invoices")]
public class InvoicesController : ApiController
{

    /// <summary>
    /// Get all invoices for current tenant
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<TenantInvoiceDto>), 200)]
    public async Task<IActionResult> GetInvoices([FromQuery] GetInvoicesQuery query)
    {
        var result = await Mediator.Send(query);
        return HandleResult(result);
    }

    /// <summary>
    /// Get invoice by id
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(TenantInvoiceDto), 200)]
    public async Task<IActionResult> GetInvoice(Guid id)
    {
        // TODO: Implement GetInvoiceByIdQuery
        return NotFound("Not implemented yet");
    }

    /// <summary>
    /// Create new invoice
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(TenantInvoiceDto), 201)]
    public async Task<IActionResult> CreateInvoice([FromBody] CreateTenantInvoiceDto dto)
    {
        var command = new CreateInvoiceCommand
        {
            InvoiceNumber = dto.InvoiceNumber,
            CustomerId = dto.CustomerId,
            InvoiceDate = dto.InvoiceDate,
            DueDate = dto.DueDate,
            Currency = dto.Currency,
            Notes = dto.Notes,
            Terms = dto.Terms,
            Items = dto.Items.Select(i => new CreateInvoiceItemDto
            {
                ProductId = i.ProductId,
                ProductName = i.ProductName,
                Description = i.Description,
                Quantity = i.Quantity,
                UnitPrice = i.UnitPrice,
                DiscountPercentage = i.DiscountPercentage,
                TaxRate = i.TaxRate
            }).ToList()
        };

        var result = await Mediator.Send(command);
        return HandleResult(result);
    }

    /// <summary>
    /// Send invoice to customer
    /// </summary>
    [HttpPost("{id}/send")]
    [ProducesResponseType(204)]
    public async Task<IActionResult> SendInvoice(Guid id)
    {
        // TODO: Implement SendInvoiceCommand
        return NotFound("Not implemented yet");
    }

    /// <summary>
    /// Mark invoice as paid
    /// </summary>
    [HttpPost("{id}/mark-paid")]
    [ProducesResponseType(204)]
    public async Task<IActionResult> MarkInvoiceAsPaid(Guid id, [FromBody] MarkInvoiceAsPaidDto dto)
    {
        // TODO: Implement MarkInvoiceAsPaidCommand
        return NotFound("Not implemented yet");
    }

    /// <summary>
    /// Cancel invoice
    /// </summary>
    [HttpPost("{id}/cancel")]
    [ProducesResponseType(204)]
    public async Task<IActionResult> CancelInvoice(Guid id, [FromBody] CancelInvoiceDto dto)
    {
        // TODO: Implement CancelInvoiceCommand
        return NotFound("Not implemented yet");
    }

    /// <summary>
    /// Update invoice
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(TenantInvoiceDto), 200)]
    public async Task<IActionResult> UpdateInvoice(Guid id, [FromBody] UpdateTenantInvoiceDto dto)
    {
        // TODO: Implement UpdateInvoiceCommand
        return NotFound("Not implemented yet");
    }

    /// <summary>
    /// Delete invoice
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(204)]
    public async Task<IActionResult> DeleteInvoice(Guid id)
    {
        // TODO: Implement DeleteInvoiceCommand
        return NotFound("Not implemented yet");
    }
}

public class MarkInvoiceAsPaidDto
{
    public DateTime PaymentDate { get; set; }
    public string PaymentMethod { get; set; } = string.Empty;
    public string? PaymentReference { get; set; }
}

public class CancelInvoiceDto
{
    public string Reason { get; set; } = string.Empty;
}

public class UpdateTenantInvoiceDto
{
    public string? Notes { get; set; }
    public string? Terms { get; set; }
    public DateTime? DueDate { get; set; }
}