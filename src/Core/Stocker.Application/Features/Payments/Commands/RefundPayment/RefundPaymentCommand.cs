using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Payments.Commands.RefundPayment;

public class RefundPaymentCommand : IRequest<Result<RefundResultDto>>
{
    public Guid PaymentId { get; set; }
    public decimal RefundAmount { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string? RefundedBy { get; set; }
}

public class RefundResultDto
{
    public Guid RefundId { get; set; }
    public string TransactionId { get; set; } = string.Empty;
    public decimal RefundedAmount { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime RefundedAt { get; set; }
}