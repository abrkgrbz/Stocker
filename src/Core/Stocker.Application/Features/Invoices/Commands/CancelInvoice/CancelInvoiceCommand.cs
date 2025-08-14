using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Invoices.Commands.CancelInvoice;

public class CancelInvoiceCommand : IRequest<Result<bool>>
{
    public Guid InvoiceId { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string? CancelledBy { get; set; }
}