using MediatR;
using Stocker.Application.DTOs.TenantInvoice;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.TenantInvoices.Commands.CreateInvoice;

public class CreateInvoiceCommand : IRequest<Result<TenantInvoiceDto>>
{
    public string InvoiceNumber { get; set; } = string.Empty;
    public Guid CustomerId { get; set; }
    public DateTime InvoiceDate { get; set; }
    public DateTime DueDate { get; set; }
    public string Currency { get; set; } = "TRY";
    public string? Notes { get; set; }
    public string? Terms { get; set; }
    public List<CreateInvoiceItemDto> Items { get; set; } = new();
}

public class CreateInvoiceItemDto
{
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal? DiscountPercentage { get; set; }
    public decimal? TaxRate { get; set; }
}