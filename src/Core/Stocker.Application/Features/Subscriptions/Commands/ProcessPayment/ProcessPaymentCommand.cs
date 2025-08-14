using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Subscriptions.Commands.ProcessPayment;

public class ProcessPaymentCommand : IRequest<Result<ProcessPaymentResult>>
{
    public Guid TenantId { get; set; }
    public string PackageId { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "TRY";
    public string PaymentMethod { get; set; } = string.Empty;
    public string BillingPeriod { get; set; } = "Monthly";
    public string? TransactionId { get; set; }
    public string? InvoiceNumber { get; set; }
    
    // Credit Card Details (optional, for logging purposes only)
    public string? CardLastFourDigits { get; set; }
    public string? CardType { get; set; }
}

public class ProcessPaymentResult
{
    public Guid PaymentId { get; set; }
    public Guid SubscriptionId { get; set; }
    public string TransactionId { get; set; } = string.Empty;
    public string InvoiceNumber { get; set; } = string.Empty;
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public DateTime ProcessedAt { get; set; }
}