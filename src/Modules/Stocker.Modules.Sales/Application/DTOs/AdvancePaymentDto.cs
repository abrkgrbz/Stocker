using Stocker.Modules.Sales.Domain.Entities;

namespace Stocker.Modules.Sales.Application.DTOs;

public record AdvancePaymentDto
{
    public Guid Id { get; init; }
    public string PaymentNumber { get; init; } = string.Empty;
    public DateTime PaymentDate { get; init; }

    // Customer
    public Guid? CustomerId { get; init; }
    public string CustomerName { get; init; } = string.Empty;
    public string? CustomerTaxNumber { get; init; }

    // Related Order
    public Guid? SalesOrderId { get; init; }
    public string? SalesOrderNumber { get; init; }
    public decimal OrderTotalAmount { get; init; }

    // Payment Details
    public decimal Amount { get; init; }
    public decimal AppliedAmount { get; init; }
    public decimal RemainingAmount { get; init; }
    public decimal RefundedAmount { get; init; }
    public string Currency { get; init; } = "TRY";
    public decimal ExchangeRate { get; init; }

    // Payment Method
    public string PaymentMethod { get; init; } = string.Empty;
    public string? PaymentReference { get; init; }
    public string? BankName { get; init; }
    public string? BankAccountNumber { get; init; }
    public string? CheckNumber { get; init; }
    public DateTime? CheckDate { get; init; }

    // Status
    public string Status { get; init; } = string.Empty;
    public bool IsCaptured { get; init; }
    public bool IsFullyApplied { get; init; }
    public bool IsRefunded { get; init; }

    // Capture
    public DateTime? CapturedDate { get; init; }
    public Guid? CapturedBy { get; init; }
    public string? CapturedByName { get; init; }

    // Refund
    public DateTime? RefundedDate { get; init; }
    public Guid? RefundedBy { get; init; }
    public string? RefundReason { get; init; }

    // Receipt
    public string? ReceiptNumber { get; init; }
    public DateTime? ReceiptDate { get; init; }
    public bool ReceiptIssued { get; init; }

    // Audit
    public string? Notes { get; init; }
    public Guid? CreatedBy { get; init; }
    public string? CreatedByName { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }

    public static AdvancePaymentDto FromEntity(AdvancePayment entity)
    {
        return new AdvancePaymentDto
        {
            Id = entity.Id,
            PaymentNumber = entity.PaymentNumber,
            PaymentDate = entity.PaymentDate,
            CustomerId = entity.CustomerId,
            CustomerName = entity.CustomerName,
            CustomerTaxNumber = entity.CustomerTaxNumber,
            SalesOrderId = entity.SalesOrderId,
            SalesOrderNumber = entity.SalesOrderNumber,
            OrderTotalAmount = entity.OrderTotalAmount,
            Amount = entity.Amount,
            AppliedAmount = entity.AppliedAmount,
            RemainingAmount = entity.RemainingAmount,
            RefundedAmount = entity.RefundedAmount,
            Currency = entity.Currency,
            ExchangeRate = entity.ExchangeRate,
            PaymentMethod = entity.PaymentMethod.ToString(),
            PaymentReference = entity.PaymentReference,
            BankName = entity.BankName,
            BankAccountNumber = entity.BankAccountNumber,
            CheckNumber = entity.CheckNumber,
            CheckDate = entity.CheckDate,
            Status = entity.Status.ToString(),
            IsCaptured = entity.IsCaptured,
            IsFullyApplied = entity.IsFullyApplied,
            IsRefunded = entity.IsRefunded,
            CapturedDate = entity.CapturedDate,
            CapturedBy = entity.CapturedBy,
            CapturedByName = entity.CapturedByName,
            RefundedDate = entity.RefundedDate,
            RefundedBy = entity.RefundedBy,
            RefundReason = entity.RefundReason,
            ReceiptNumber = entity.ReceiptNumber,
            ReceiptDate = entity.ReceiptDate,
            ReceiptIssued = entity.ReceiptIssued,
            Notes = entity.Notes,
            CreatedBy = entity.CreatedBy,
            CreatedByName = entity.CreatedByName,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt
        };
    }
}

public record AdvancePaymentListDto
{
    public Guid Id { get; init; }
    public string PaymentNumber { get; init; } = string.Empty;
    public DateTime PaymentDate { get; init; }
    public string CustomerName { get; init; } = string.Empty;
    public string? SalesOrderNumber { get; init; }
    public decimal Amount { get; init; }
    public decimal AppliedAmount { get; init; }
    public decimal RemainingAmount { get; init; }
    public string Currency { get; init; } = "TRY";
    public string PaymentMethod { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public bool IsCaptured { get; init; }
    public bool ReceiptIssued { get; init; }
    public DateTime CreatedAt { get; init; }

    public static AdvancePaymentListDto FromEntity(AdvancePayment entity)
    {
        return new AdvancePaymentListDto
        {
            Id = entity.Id,
            PaymentNumber = entity.PaymentNumber,
            PaymentDate = entity.PaymentDate,
            CustomerName = entity.CustomerName,
            SalesOrderNumber = entity.SalesOrderNumber,
            Amount = entity.Amount,
            AppliedAmount = entity.AppliedAmount,
            RemainingAmount = entity.RemainingAmount,
            Currency = entity.Currency,
            PaymentMethod = entity.PaymentMethod.ToString(),
            Status = entity.Status.ToString(),
            IsCaptured = entity.IsCaptured,
            ReceiptIssued = entity.ReceiptIssued,
            CreatedAt = entity.CreatedAt
        };
    }
}
