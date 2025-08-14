using MediatR;
using Stocker.Application.DTOs.Invoice;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Invoices.Commands.CreateInvoice;

public class CreateInvoiceCommand : IRequest<Result<InvoiceDto>>
{
    public Guid TenantId { get; set; }
    public Guid? SubscriptionId { get; set; }
    public decimal Amount { get; set; }
    public decimal Tax { get; set; }
    public string Description { get; set; } = string.Empty;
    public DateTime DueDate { get; set; }
    public List<CreateInvoiceItemDto> Items { get; set; } = new();
}

public class CreateInvoiceItemDto
{
    public string Description { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
}