using Stocker.Modules.Sales.Domain.Entities;

namespace Stocker.Modules.Sales.Application.DTOs;

public record SalesOrderDto
{
    public Guid Id { get; init; }
    public string OrderNumber { get; init; } = string.Empty;
    public DateTime OrderDate { get; init; }
    public DateTime? DeliveryDate { get; init; }
    public Guid? CustomerId { get; init; }
    public string? CustomerName { get; init; }
    public string? CustomerEmail { get; init; }
    public Guid? BranchId { get; init; }
    public Guid? WarehouseId { get; init; }
    public string? CustomerOrderNumber { get; init; }
    public decimal SubTotal { get; init; }
    public decimal DiscountAmount { get; init; }
    public decimal DiscountRate { get; init; }
    public decimal VatAmount { get; init; }
    public decimal TotalAmount { get; init; }
    public string Currency { get; init; } = "TRY";
    public decimal ExchangeRate { get; init; }
    public string Status { get; init; } = string.Empty;
    public string? ShippingAddress { get; init; }
    public string? BillingAddress { get; init; }
    public string? Notes { get; init; }
    public Guid? SalesPersonId { get; init; }
    public string? SalesPersonName { get; init; }
    public bool IsApproved { get; init; }
    public Guid? ApprovedBy { get; init; }
    public DateTime? ApprovedDate { get; init; }
    public bool IsCancelled { get; init; }
    public string? CancellationReason { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
    public List<SalesOrderItemDto> Items { get; init; } = new();

    public static SalesOrderDto FromEntity(SalesOrder entity)
    {
        return new SalesOrderDto
        {
            Id = entity.Id,
            OrderNumber = entity.OrderNumber,
            OrderDate = entity.OrderDate,
            DeliveryDate = entity.DeliveryDate,
            CustomerId = entity.CustomerId,
            CustomerName = entity.CustomerName,
            CustomerEmail = entity.CustomerEmail,
            BranchId = entity.BranchId,
            WarehouseId = entity.WarehouseId,
            CustomerOrderNumber = entity.CustomerOrderNumber,
            SubTotal = entity.SubTotal,
            DiscountAmount = entity.DiscountAmount,
            DiscountRate = entity.DiscountRate,
            VatAmount = entity.VatAmount,
            TotalAmount = entity.TotalAmount,
            Currency = entity.Currency,
            ExchangeRate = entity.ExchangeRate,
            Status = entity.Status.ToString(),
            ShippingAddress = entity.ShippingAddress,
            BillingAddress = entity.BillingAddress,
            Notes = entity.Notes,
            SalesPersonId = entity.SalesPersonId,
            SalesPersonName = entity.SalesPersonName,
            IsApproved = entity.IsApproved,
            ApprovedBy = entity.ApprovedBy,
            ApprovedDate = entity.ApprovedDate,
            IsCancelled = entity.IsCancelled,
            CancellationReason = entity.CancellationReason,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt,
            Items = entity.Items.Select(SalesOrderItemDto.FromEntity).ToList()
        };
    }
}

public record SalesOrderItemDto
{
    public Guid Id { get; init; }
    public Guid SalesOrderId { get; init; }
    public Guid? ProductId { get; init; }
    public string ProductCode { get; init; } = string.Empty;
    public string ProductName { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string Unit { get; init; } = string.Empty;
    public decimal Quantity { get; init; }
    public decimal UnitPrice { get; init; }
    public decimal DiscountRate { get; init; }
    public decimal DiscountAmount { get; init; }
    public decimal VatRate { get; init; }
    public decimal VatAmount { get; init; }
    public decimal LineTotal { get; init; }
    public int LineNumber { get; init; }
    public decimal DeliveredQuantity { get; init; }
    public bool IsDelivered { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }

    public static SalesOrderItemDto FromEntity(SalesOrderItem entity)
    {
        return new SalesOrderItemDto
        {
            Id = entity.Id,
            SalesOrderId = entity.SalesOrderId,
            ProductId = entity.ProductId,
            ProductCode = entity.ProductCode,
            ProductName = entity.ProductName,
            Description = entity.Description,
            Unit = entity.Unit,
            Quantity = entity.Quantity,
            UnitPrice = entity.UnitPrice,
            DiscountRate = entity.DiscountRate,
            DiscountAmount = entity.DiscountAmount,
            VatRate = entity.VatRate,
            VatAmount = entity.VatAmount,
            LineTotal = entity.LineTotal,
            LineNumber = entity.LineNumber,
            DeliveredQuantity = entity.DeliveredQuantity,
            IsDelivered = entity.IsDelivered,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt
        };
    }
}

public record SalesOrderListDto
{
    public Guid Id { get; init; }
    public string OrderNumber { get; init; } = string.Empty;
    public DateTime OrderDate { get; init; }
    public string? CustomerName { get; init; }
    public decimal TotalAmount { get; init; }
    public string Currency { get; init; } = "TRY";
    public string Status { get; init; } = string.Empty;
    public bool IsApproved { get; init; }
    public bool IsCancelled { get; init; }
    public int ItemCount { get; init; }
    public DateTime CreatedAt { get; init; }

    public static SalesOrderListDto FromEntity(SalesOrder entity)
    {
        return new SalesOrderListDto
        {
            Id = entity.Id,
            OrderNumber = entity.OrderNumber,
            OrderDate = entity.OrderDate,
            CustomerName = entity.CustomerName,
            TotalAmount = entity.TotalAmount,
            Currency = entity.Currency,
            Status = entity.Status.ToString(),
            IsApproved = entity.IsApproved,
            IsCancelled = entity.IsCancelled,
            ItemCount = entity.Items.Count,
            CreatedAt = entity.CreatedAt
        };
    }
}
