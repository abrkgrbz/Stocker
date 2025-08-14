using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Payments.Commands.CancelPayment;

public class CancelPaymentCommand : IRequest<Result<bool>>
{
    public Guid PaymentId { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string? CancelledBy { get; set; }
}