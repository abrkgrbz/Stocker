using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Invoices.Commands.SendReminder;

public record SendInvoiceReminderCommand : IRequest<Result<bool>>
{
    public Guid InvoiceId { get; init; }
}
