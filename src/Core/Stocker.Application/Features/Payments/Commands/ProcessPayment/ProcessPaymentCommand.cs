using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Payments.Commands.ProcessPayment;

public class ProcessPaymentCommand : IRequest<Result<PaymentResultDto>>
{
    public Guid InvoiceId { get; set; }
    public decimal Amount { get; set; }
    public string PaymentMethod { get; set; } = string.Empty;
    public string? CardNumber { get; set; }
    public string? CardHolderName { get; set; }
    public string? ExpiryMonth { get; set; }
    public string? ExpiryYear { get; set; }
    public string? CVV { get; set; }
    public string? ProcessedBy { get; set; }
}

public class PaymentResultDto
{
    public Guid PaymentId { get; set; }
    public string TransactionId { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? Message { get; set; }
    public DateTime ProcessedAt { get; set; }
}