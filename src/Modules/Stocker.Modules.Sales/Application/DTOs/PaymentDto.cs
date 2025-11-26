using Stocker.Modules.Sales.Domain.Entities;

namespace Stocker.Modules.Sales.Application.DTOs;

public record PaymentDto
{
    public Guid Id { get; init; }
    public string PaymentNumber { get; init; } = string.Empty;
    public DateTime PaymentDate { get; init; }
    public Guid? InvoiceId { get; init; }
    public Guid? CustomerId { get; init; }
    public string? CustomerName { get; init; }
    public decimal Amount { get; init; }
    public string Currency { get; init; } = "TRY";
    public decimal ExchangeRate { get; init; }
    public string Method { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public string? ReferenceNumber { get; init; }
    public string? BankName { get; init; }
    public string? BankAccountNumber { get; init; }
    public string? CheckNumber { get; init; }
    public DateTime? CheckDueDate { get; init; }
    public string? CardLastFourDigits { get; init; }
    public string? CardType { get; init; }
    public string? TransactionId { get; init; }
    public string? Notes { get; init; }
    public Guid? ReceivedBy { get; init; }
    public string? ReceivedByName { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }

    public static PaymentDto FromEntity(Payment entity)
    {
        return new PaymentDto
        {
            Id = entity.Id,
            PaymentNumber = entity.PaymentNumber,
            PaymentDate = entity.PaymentDate,
            InvoiceId = entity.InvoiceId,
            CustomerId = entity.CustomerId,
            CustomerName = entity.CustomerName,
            Amount = entity.Amount,
            Currency = entity.Currency,
            ExchangeRate = entity.ExchangeRate,
            Method = entity.Method.ToString(),
            Status = entity.Status.ToString(),
            ReferenceNumber = entity.ReferenceNumber,
            BankName = entity.BankName,
            BankAccountNumber = entity.BankAccountNumber,
            CheckNumber = entity.CheckNumber,
            CheckDueDate = entity.CheckDueDate,
            CardLastFourDigits = entity.CardLastFourDigits,
            CardType = entity.CardType,
            TransactionId = entity.TransactionId,
            Notes = entity.Notes,
            ReceivedBy = entity.ReceivedBy,
            ReceivedByName = entity.ReceivedByName,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt
        };
    }
}

public record PaymentListDto
{
    public Guid Id { get; init; }
    public string PaymentNumber { get; init; } = string.Empty;
    public DateTime PaymentDate { get; init; }
    public string? CustomerName { get; init; }
    public decimal Amount { get; init; }
    public string Currency { get; init; } = "TRY";
    public string Method { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public string? ReferenceNumber { get; init; }
    public DateTime CreatedAt { get; init; }

    public static PaymentListDto FromEntity(Payment entity)
    {
        return new PaymentListDto
        {
            Id = entity.Id,
            PaymentNumber = entity.PaymentNumber,
            PaymentDate = entity.PaymentDate,
            CustomerName = entity.CustomerName,
            Amount = entity.Amount,
            Currency = entity.Currency,
            Method = entity.Method.ToString(),
            Status = entity.Status.ToString(),
            ReferenceNumber = entity.ReferenceNumber,
            CreatedAt = entity.CreatedAt
        };
    }
}
