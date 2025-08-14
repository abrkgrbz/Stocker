using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Invoices.Commands.MarkAsPaid;

public class MarkAsPaidCommand : IRequest<Result<bool>>
{
    public Guid InvoiceId { get; set; }
    public decimal PaidAmount { get; set; }
    public string PaymentMethod { get; set; } = string.Empty;
    public string? PaymentReference { get; set; }
    public DateTime? PaymentDate { get; set; }
    public string? PaidBy { get; set; }
}