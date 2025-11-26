using MediatR;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Domain.Entities;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Application.Features.Payments.Commands;

public record CreatePaymentCommand : IRequest<Result<PaymentDto>>
{
    public DateTime PaymentDate { get; init; } = DateTime.UtcNow;
    public Guid? InvoiceId { get; init; }
    public Guid? CustomerId { get; init; }
    public string? CustomerName { get; init; }
    public decimal Amount { get; init; }
    public string Currency { get; init; } = "TRY";
    public PaymentMethod Method { get; init; } = PaymentMethod.Cash;
    public string? ReferenceNumber { get; init; }
    public string? BankName { get; init; }
    public string? BankAccountNumber { get; init; }
    public string? CheckNumber { get; init; }
    public DateTime? CheckDueDate { get; init; }
    public string? CardLastFourDigits { get; init; }
    public string? CardType { get; init; }
    public string? TransactionId { get; init; }
    public string? Notes { get; init; }
}

public record UpdatePaymentCommand : IRequest<Result<PaymentDto>>
{
    public Guid Id { get; init; }
    public string? ReferenceNumber { get; init; }
    public string? BankName { get; init; }
    public string? BankAccountNumber { get; init; }
    public string? Notes { get; init; }
}

public record ConfirmPaymentCommand : IRequest<Result<PaymentDto>>
{
    public Guid Id { get; init; }
}

public record CompletePaymentCommand : IRequest<Result<PaymentDto>>
{
    public Guid Id { get; init; }
}

public record RejectPaymentCommand : IRequest<Result<PaymentDto>>
{
    public Guid Id { get; init; }
    public string Reason { get; init; } = string.Empty;
}

public record RefundPaymentCommand : IRequest<Result<PaymentDto>>
{
    public Guid Id { get; init; }
    public string Reason { get; init; } = string.Empty;
}

public record DeletePaymentCommand : IRequest<Result>
{
    public Guid Id { get; init; }
}
