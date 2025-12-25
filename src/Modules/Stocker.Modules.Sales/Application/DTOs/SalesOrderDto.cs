using Stocker.Modules.Sales.Domain.Entities;

namespace Stocker.Modules.Sales.Application.DTOs;

/// <summary>
/// Address snapshot DTO for preserving address data at order time
/// </summary>
public record AddressSnapshotDto
{
    public string RecipientName { get; init; } = string.Empty;
    public string? RecipientPhone { get; init; }
    public string? CompanyName { get; init; }
    public string AddressLine1 { get; init; } = string.Empty;
    public string? AddressLine2 { get; init; }
    public string? District { get; init; }
    public string? Town { get; init; }
    public string City { get; init; } = string.Empty;
    public string? State { get; init; }
    public string Country { get; init; } = "Türkiye";
    public string? PostalCode { get; init; }
    public string? TaxId { get; init; }
    public string? TaxOffice { get; init; }
}

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

    // Address Snapshots - structured address data preserved at order time
    public AddressSnapshotDto? ShippingAddressSnapshot { get; init; }
    public AddressSnapshotDto? BillingAddressSnapshot { get; init; }

    // Source Document Relations - traceability to originating documents
    public Guid? QuotationId { get; init; }
    public string? QuotationNumber { get; init; }
    public Guid? OpportunityId { get; init; }
    public Guid? CustomerContractId { get; init; }

    // Invoicing Status - tracks invoice coverage
    public string InvoicingStatus { get; init; } = "NotInvoiced";
    public decimal TotalInvoicedAmount { get; init; }
    public decimal RemainingInvoiceAmount => TotalAmount - TotalInvoicedAmount;

    // Fulfillment Status - tracks shipment progress
    public string FulfillmentStatus { get; init; } = "Pending";
    public int CompletedShipmentCount { get; init; }

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
            Items = entity.Items.Select(SalesOrderItemDto.FromEntity).ToList(),

            // Address Snapshots
            ShippingAddressSnapshot = entity.ShippingAddressSnapshot != null
                ? new AddressSnapshotDto
                {
                    RecipientName = entity.ShippingAddressSnapshot.RecipientName,
                    RecipientPhone = entity.ShippingAddressSnapshot.RecipientPhone,
                    CompanyName = entity.ShippingAddressSnapshot.CompanyName,
                    AddressLine1 = entity.ShippingAddressSnapshot.AddressLine1,
                    AddressLine2 = entity.ShippingAddressSnapshot.AddressLine2,
                    District = entity.ShippingAddressSnapshot.District,
                    Town = entity.ShippingAddressSnapshot.Town,
                    City = entity.ShippingAddressSnapshot.City,
                    State = entity.ShippingAddressSnapshot.State,
                    Country = entity.ShippingAddressSnapshot.Country,
                    PostalCode = entity.ShippingAddressSnapshot.PostalCode,
                    TaxId = entity.ShippingAddressSnapshot.TaxId,
                    TaxOffice = entity.ShippingAddressSnapshot.TaxOffice
                }
                : null,
            BillingAddressSnapshot = entity.BillingAddressSnapshot != null
                ? new AddressSnapshotDto
                {
                    RecipientName = entity.BillingAddressSnapshot.RecipientName,
                    RecipientPhone = entity.BillingAddressSnapshot.RecipientPhone,
                    CompanyName = entity.BillingAddressSnapshot.CompanyName,
                    AddressLine1 = entity.BillingAddressSnapshot.AddressLine1,
                    AddressLine2 = entity.BillingAddressSnapshot.AddressLine2,
                    District = entity.BillingAddressSnapshot.District,
                    Town = entity.BillingAddressSnapshot.Town,
                    City = entity.BillingAddressSnapshot.City,
                    State = entity.BillingAddressSnapshot.State,
                    Country = entity.BillingAddressSnapshot.Country,
                    PostalCode = entity.BillingAddressSnapshot.PostalCode,
                    TaxId = entity.BillingAddressSnapshot.TaxId,
                    TaxOffice = entity.BillingAddressSnapshot.TaxOffice
                }
                : null,

            // Source Document Relations
            QuotationId = entity.QuotationId,
            QuotationNumber = entity.QuotationNumber,
            OpportunityId = entity.OpportunityId,
            CustomerContractId = entity.CustomerContractId,

            // Invoicing Status
            InvoicingStatus = entity.InvoicingStatus.ToString(),
            TotalInvoicedAmount = entity.TotalInvoicedAmount,

            // Fulfillment Status
            FulfillmentStatus = entity.FulfillmentStatus.ToString(),
            CompletedShipmentCount = entity.CompletedShipmentCount
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

    // Source Document Reference
    public string? QuotationNumber { get; init; }

    // Status Tracking for list view
    public string InvoicingStatus { get; init; } = "NotInvoiced";
    public string FulfillmentStatus { get; init; } = "Pending";

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
            CreatedAt = entity.CreatedAt,
            QuotationNumber = entity.QuotationNumber,
            InvoicingStatus = entity.InvoicingStatus.ToString(),
            FulfillmentStatus = entity.FulfillmentStatus.ToString()
        };
    }
}
