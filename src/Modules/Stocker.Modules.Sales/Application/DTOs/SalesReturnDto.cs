using Stocker.Modules.Sales.Domain.Entities;

namespace Stocker.Modules.Sales.Application.DTOs;

public record SalesReturnDto
{
    public Guid Id { get; init; }
    public string ReturnNumber { get; init; } = string.Empty;
    public DateTime ReturnDate { get; init; }
    public Guid SalesOrderId { get; init; }
    public string SalesOrderNumber { get; init; } = string.Empty;
    public Guid? InvoiceId { get; init; }
    public string? InvoiceNumber { get; init; }
    public Guid? CustomerId { get; init; }
    public string? CustomerName { get; init; }
    public string? CustomerEmail { get; init; }
    public string Type { get; init; } = string.Empty;
    public string Reason { get; init; } = string.Empty;
    public string? ReasonDetails { get; init; }
    public string Status { get; init; } = string.Empty;
    public decimal SubTotal { get; init; }
    public decimal VatAmount { get; init; }
    public decimal TotalAmount { get; init; }
    public decimal RefundAmount { get; init; }
    public string RefundMethod { get; init; } = string.Empty;
    public string? RefundReference { get; init; }
    public DateTime? RefundDate { get; init; }
    public bool RestockItems { get; init; }
    public Guid? RestockWarehouseId { get; init; }
    public bool IsRestocked { get; init; }
    public DateTime? RestockedDate { get; init; }
    public Guid? ProcessedBy { get; init; }
    public DateTime? ProcessedDate { get; init; }
    public Guid? ApprovedBy { get; init; }
    public DateTime? ApprovedDate { get; init; }
    public string? Notes { get; init; }
    public Guid? CreditNoteId { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
    public List<SalesReturnItemDto> Items { get; init; } = new();
}

public record SalesReturnItemDto
{
    public Guid Id { get; init; }
    public Guid SalesReturnId { get; init; }
    public Guid SalesOrderItemId { get; init; }
    public Guid ProductId { get; init; }
    public string ProductName { get; init; } = string.Empty;
    public string? ProductCode { get; init; }
    public decimal QuantityOrdered { get; init; }
    public decimal QuantityReturned { get; init; }
    public string Unit { get; init; } = "Adet";
    public decimal UnitPrice { get; init; }
    public decimal VatRate { get; init; }
    public decimal VatAmount { get; init; }
    public decimal LineTotal { get; init; }
    public string Condition { get; init; } = string.Empty;
    public string? ConditionNotes { get; init; }
    public bool IsRestockable { get; init; }
    public bool IsRestocked { get; init; }
}

public record SalesReturnListDto
{
    public Guid Id { get; init; }
    public string ReturnNumber { get; init; } = string.Empty;
    public DateTime ReturnDate { get; init; }
    public string SalesOrderNumber { get; init; } = string.Empty;
    public string? CustomerName { get; init; }
    public string Type { get; init; } = string.Empty;
    public string Reason { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public decimal TotalAmount { get; init; }
    public decimal RefundAmount { get; init; }
    public int ItemCount { get; init; }
    public DateTime CreatedAt { get; init; }
}

public record CreateSalesReturnDto
{
    public Guid SalesOrderId { get; init; }
    public SalesReturnType Type { get; init; }
    public SalesReturnReason Reason { get; init; }
    public string? ReasonDetails { get; init; }
    public RefundMethod RefundMethod { get; init; } = RefundMethod.Original;
    public bool RestockItems { get; init; } = true;
    public Guid? RestockWarehouseId { get; init; }
    public string? Notes { get; init; }
    public List<CreateSalesReturnItemDto> Items { get; init; } = new();
}

public record CreateSalesReturnItemDto
{
    public Guid SalesOrderItemId { get; init; }
    public Guid ProductId { get; init; }
    public string ProductName { get; init; } = string.Empty;
    public string? ProductCode { get; init; }
    public decimal QuantityOrdered { get; init; }
    public decimal QuantityReturned { get; init; }
    public decimal UnitPrice { get; init; }
    public decimal VatRate { get; init; }
    public SalesReturnItemCondition Condition { get; init; } = SalesReturnItemCondition.Good;
    public string? ConditionNotes { get; init; }
    public string Unit { get; init; } = "Adet";
}

public record UpdateSalesReturnDto
{
    public string? ReasonDetails { get; init; }
    public RefundMethod? RefundMethod { get; init; }
    public bool? RestockItems { get; init; }
    public Guid? RestockWarehouseId { get; init; }
    public string? Notes { get; init; }
}

public record ProcessRefundDto
{
    public string RefundReference { get; init; } = string.Empty;
    public decimal? OverrideAmount { get; init; }
}

public record SalesReturnSummaryDto
{
    public int TotalReturns { get; init; }
    public int PendingReturns { get; init; }
    public int ApprovedReturns { get; init; }
    public int CompletedReturns { get; init; }
    public decimal TotalRefundAmount { get; init; }
    public decimal PendingRefundAmount { get; init; }
    public Dictionary<string, int> ReturnsByReason { get; init; } = new();
    public Dictionary<string, decimal> RefundsByMethod { get; init; } = new();
}
