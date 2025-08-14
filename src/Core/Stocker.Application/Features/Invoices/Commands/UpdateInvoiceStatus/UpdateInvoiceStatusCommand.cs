using MediatR;
using Stocker.Domain.Master.Enums;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Invoices.Commands.UpdateInvoiceStatus;

public class UpdateInvoiceStatusCommand : IRequest<Result<bool>>
{
    public Guid InvoiceId { get; set; }
    public InvoiceStatus NewStatus { get; set; }
    public string? Notes { get; set; }
    public string? UpdatedBy { get; set; }
}