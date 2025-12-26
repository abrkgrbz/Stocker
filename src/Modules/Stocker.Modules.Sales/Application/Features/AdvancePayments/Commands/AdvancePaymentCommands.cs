using MediatR;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Domain.Entities;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Application.Features.AdvancePayments.Commands;

public record CreateAdvancePaymentCommand : IRequest<Result<AdvancePaymentDto>>
{
    public DateTime PaymentDate { get; init; } = DateTime.UtcNow;
    public Guid? CustomerId { get; init; }
    public string CustomerName { get; init; } = string.Empty;
    public string? CustomerTaxNumber { get; init; }
    public decimal Amount { get; init; }
    public string Currency { get; init; } = "TRY";
    public decimal ExchangeRate { get; init; } = 1;
    public PaymentMethod PaymentMethod { get; init; } = PaymentMethod.BankTransfer;
    public string? PaymentReference { get; init; }
    public string? BankName { get; init; }
    public string? BankAccountNumber { get; init; }
    public string? Notes { get; init; }
}

public record CreateAdvancePaymentForOrderCommand : IRequest<Result<AdvancePaymentDto>>
{
    public Guid SalesOrderId { get; init; }
    public decimal Amount { get; init; }
    public PaymentMethod PaymentMethod { get; init; } = PaymentMethod.BankTransfer;
    public string? PaymentReference { get; init; }
    public string? Notes { get; init; }
}

public record UpdateAdvancePaymentCommand : IRequest<Result<AdvancePaymentDto>>
{
    public Guid Id { get; init; }
    public string? CustomerTaxNumber { get; init; }
    public decimal ExchangeRate { get; init; }
    public PaymentMethod PaymentMethod { get; init; }
    public string? PaymentReference { get; init; }
    public string? BankName { get; init; }
    public string? BankAccountNumber { get; init; }
    public string? CheckNumber { get; init; }
    public DateTime? CheckDate { get; init; }
    public string? Notes { get; init; }
}

public record CaptureAdvancePaymentCommand : IRequest<Result<AdvancePaymentDto>>
{
    public Guid Id { get; init; }
}

public record ApplyAdvancePaymentCommand : IRequest<Result<AdvancePaymentDto>>
{
    public Guid Id { get; init; }
    public Guid InvoiceId { get; init; }
    public string InvoiceNumber { get; init; } = string.Empty;
    public decimal AmountToApply { get; init; }
}

public record RefundAdvancePaymentCommand : IRequest<Result<AdvancePaymentDto>>
{
    public Guid Id { get; init; }
    public string Reason { get; init; } = string.Empty;
}

public record PartialRefundAdvancePaymentCommand : IRequest<Result<AdvancePaymentDto>>
{
    public Guid Id { get; init; }
    public decimal RefundAmount { get; init; }
    public string Reason { get; init; } = string.Empty;
}

public record CancelAdvancePaymentCommand : IRequest<Result<AdvancePaymentDto>>
{
    public Guid Id { get; init; }
    public string Reason { get; init; } = string.Empty;
}

public record IssueReceiptCommand : IRequest<Result<AdvancePaymentDto>>
{
    public Guid Id { get; init; }
    public string ReceiptNumber { get; init; } = string.Empty;
}

public record DeleteAdvancePaymentCommand : IRequest<Result>
{
    public Guid Id { get; init; }
}
