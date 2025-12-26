using Stocker.Modules.Sales.Domain.Entities;

namespace Stocker.Modules.Sales.Application.DTOs;

public record ServiceOrderDto
{
    public Guid Id { get; init; }
    public string ServiceOrderNumber { get; init; } = string.Empty;
    public DateTime OrderDate { get; init; }
    public string Type { get; init; } = string.Empty;
    public string Priority { get; init; } = string.Empty;

    // Customer
    public Guid? CustomerId { get; init; }
    public string CustomerName { get; init; } = string.Empty;
    public string? CustomerEmail { get; init; }
    public string? CustomerPhone { get; init; }
    public string? CustomerAddress { get; init; }

    // Product
    public Guid? ProductId { get; init; }
    public string? ProductCode { get; init; }
    public string? ProductName { get; init; }
    public string? SerialNumber { get; init; }
    public string? AssetTag { get; init; }

    // Source Documents
    public Guid? SalesOrderId { get; init; }
    public string? SalesOrderNumber { get; init; }
    public Guid? InvoiceId { get; init; }
    public string? InvoiceNumber { get; init; }
    public Guid? WarrantyId { get; init; }
    public string? WarrantyNumber { get; init; }
    public bool IsCoveredByWarranty { get; init; }

    // Issue
    public string? ReportedIssue { get; init; }
    public string? DiagnosisNotes { get; init; }
    public string? RepairNotes { get; init; }
    public string? IssueCategory { get; init; }

    // Scheduling
    public DateTime? ScheduledDate { get; init; }
    public DateTime? ScheduledEndDate { get; init; }
    public string? EstimatedDuration { get; init; }
    public string Location { get; init; } = string.Empty;
    public string? ServiceAddress { get; init; }

    // Technician
    public Guid? TechnicianId { get; init; }
    public string? TechnicianName { get; init; }
    public Guid? AssignedTeamId { get; init; }
    public string? AssignedTeamName { get; init; }
    public DateTime? AssignedDate { get; init; }

    // Status
    public string Status { get; init; } = string.Empty;
    public DateTime? StartedDate { get; init; }
    public DateTime? CompletedDate { get; init; }
    public DateTime? CancelledDate { get; init; }
    public string? CancellationReason { get; init; }
    public string? ActualDuration { get; init; }

    // Billing
    public bool IsBillable { get; init; }
    public decimal LaborCost { get; init; }
    public decimal PartsCost { get; init; }
    public decimal TravelCost { get; init; }
    public decimal OtherCost { get; init; }
    public decimal DiscountAmount { get; init; }
    public decimal TaxAmount { get; init; }
    public decimal TotalAmount { get; init; }
    public string Currency { get; init; } = "TRY";

    // Invoice
    public bool IsInvoiced { get; init; }
    public Guid? ServiceInvoiceId { get; init; }
    public string? ServiceInvoiceNumber { get; init; }
    public DateTime? InvoicedDate { get; init; }

    // Feedback
    public int? CustomerRating { get; init; }
    public string? CustomerFeedback { get; init; }
    public DateTime? FeedbackDate { get; init; }

    // Audit
    public Guid? CreatedBy { get; init; }
    public string? CreatedByName { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }

    public List<ServiceOrderItemDto> Items { get; init; } = new();
    public List<ServiceOrderNoteDto> Notes { get; init; } = new();

    public static ServiceOrderDto FromEntity(ServiceOrder entity)
    {
        return new ServiceOrderDto
        {
            Id = entity.Id,
            ServiceOrderNumber = entity.ServiceOrderNumber,
            OrderDate = entity.OrderDate,
            Type = entity.Type.ToString(),
            Priority = entity.Priority.ToString(),
            CustomerId = entity.CustomerId,
            CustomerName = entity.CustomerName,
            CustomerEmail = entity.CustomerEmail,
            CustomerPhone = entity.CustomerPhone,
            CustomerAddress = entity.CustomerAddress,
            ProductId = entity.ProductId,
            ProductCode = entity.ProductCode,
            ProductName = entity.ProductName,
            SerialNumber = entity.SerialNumber,
            AssetTag = entity.AssetTag,
            SalesOrderId = entity.SalesOrderId,
            SalesOrderNumber = entity.SalesOrderNumber,
            InvoiceId = entity.InvoiceId,
            InvoiceNumber = entity.InvoiceNumber,
            WarrantyId = entity.WarrantyId,
            WarrantyNumber = entity.WarrantyNumber,
            IsCoveredByWarranty = entity.IsCoveredByWarranty,
            ReportedIssue = entity.ReportedIssue,
            DiagnosisNotes = entity.DiagnosisNotes,
            RepairNotes = entity.RepairNotes,
            IssueCategory = entity.IssueCategory?.ToString(),
            ScheduledDate = entity.ScheduledDate,
            ScheduledEndDate = entity.ScheduledEndDate,
            EstimatedDuration = entity.EstimatedDuration?.ToString(),
            Location = entity.Location.ToString(),
            ServiceAddress = entity.ServiceAddress,
            TechnicianId = entity.TechnicianId,
            TechnicianName = entity.TechnicianName,
            AssignedTeamId = entity.AssignedTeamId,
            AssignedTeamName = entity.AssignedTeamName,
            AssignedDate = entity.AssignedDate,
            Status = entity.Status.ToString(),
            StartedDate = entity.StartedDate,
            CompletedDate = entity.CompletedDate,
            CancelledDate = entity.CancelledDate,
            CancellationReason = entity.CancellationReason,
            ActualDuration = entity.ActualDuration?.ToString(),
            IsBillable = entity.IsBillable,
            LaborCost = entity.LaborCost,
            PartsCost = entity.PartsCost,
            TravelCost = entity.TravelCost,
            OtherCost = entity.OtherCost,
            DiscountAmount = entity.DiscountAmount,
            TaxAmount = entity.TaxAmount,
            TotalAmount = entity.TotalAmount,
            Currency = entity.Currency,
            IsInvoiced = entity.IsInvoiced,
            ServiceInvoiceId = entity.ServiceInvoiceId,
            ServiceInvoiceNumber = entity.ServiceInvoiceNumber,
            InvoicedDate = entity.InvoicedDate,
            CustomerRating = entity.CustomerRating,
            CustomerFeedback = entity.CustomerFeedback,
            FeedbackDate = entity.FeedbackDate,
            CreatedBy = entity.CreatedBy,
            CreatedByName = entity.CreatedByName,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt,
            Items = entity.Items.Select(ServiceOrderItemDto.FromEntity).ToList(),
            Notes = entity.Notes.Select(ServiceOrderNoteDto.FromEntity).ToList()
        };
    }
}

public record ServiceOrderItemDto
{
    public Guid Id { get; init; }
    public Guid ServiceOrderId { get; init; }
    public int LineNumber { get; init; }
    public string ItemType { get; init; } = string.Empty;
    public Guid? ProductId { get; init; }
    public string Code { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string Unit { get; init; } = "Adet";
    public decimal Quantity { get; init; }
    public decimal UnitPrice { get; init; }
    public decimal DiscountRate { get; init; }
    public decimal DiscountAmount { get; init; }
    public decimal TotalPrice { get; init; }
    public decimal? HoursWorked { get; init; }
    public decimal? HourlyRate { get; init; }
    public bool IsCoveredByWarranty { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }

    public static ServiceOrderItemDto FromEntity(ServiceOrderItem entity)
    {
        return new ServiceOrderItemDto
        {
            Id = entity.Id,
            ServiceOrderId = entity.ServiceOrderId,
            LineNumber = entity.LineNumber,
            ItemType = entity.ItemType.ToString(),
            ProductId = entity.ProductId,
            Code = entity.Code,
            Name = entity.Name,
            Description = entity.Description,
            Unit = entity.Unit,
            Quantity = entity.Quantity,
            UnitPrice = entity.UnitPrice,
            DiscountRate = entity.DiscountRate,
            DiscountAmount = entity.DiscountAmount,
            TotalPrice = entity.TotalPrice,
            HoursWorked = entity.HoursWorked,
            HourlyRate = entity.HourlyRate,
            IsCoveredByWarranty = entity.IsCoveredByWarranty,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt
        };
    }
}

public record ServiceOrderNoteDto
{
    public Guid Id { get; init; }
    public Guid ServiceOrderId { get; init; }
    public string Type { get; init; } = string.Empty;
    public string Content { get; init; } = string.Empty;
    public Guid? CreatedBy { get; init; }
    public string? CreatedByName { get; init; }
    public DateTime CreatedAt { get; init; }

    public static ServiceOrderNoteDto FromEntity(ServiceOrderNote entity)
    {
        return new ServiceOrderNoteDto
        {
            Id = entity.Id,
            ServiceOrderId = entity.ServiceOrderId,
            Type = entity.Type.ToString(),
            Content = entity.Content,
            CreatedBy = entity.CreatedBy,
            CreatedByName = entity.CreatedByName,
            CreatedAt = entity.CreatedAt
        };
    }
}

public record ServiceOrderListDto
{
    public Guid Id { get; init; }
    public string ServiceOrderNumber { get; init; } = string.Empty;
    public DateTime OrderDate { get; init; }
    public string Type { get; init; } = string.Empty;
    public string Priority { get; init; } = string.Empty;
    public string CustomerName { get; init; } = string.Empty;
    public string? ProductName { get; init; }
    public string? SerialNumber { get; init; }
    public string Status { get; init; } = string.Empty;
    public DateTime? ScheduledDate { get; init; }
    public string? TechnicianName { get; init; }
    public bool IsCoveredByWarranty { get; init; }
    public bool IsBillable { get; init; }
    public decimal TotalAmount { get; init; }
    public bool IsInvoiced { get; init; }
    public int? CustomerRating { get; init; }
    public DateTime CreatedAt { get; init; }

    public static ServiceOrderListDto FromEntity(ServiceOrder entity)
    {
        return new ServiceOrderListDto
        {
            Id = entity.Id,
            ServiceOrderNumber = entity.ServiceOrderNumber,
            OrderDate = entity.OrderDate,
            Type = entity.Type.ToString(),
            Priority = entity.Priority.ToString(),
            CustomerName = entity.CustomerName,
            ProductName = entity.ProductName,
            SerialNumber = entity.SerialNumber,
            Status = entity.Status.ToString(),
            ScheduledDate = entity.ScheduledDate,
            TechnicianName = entity.TechnicianName,
            IsCoveredByWarranty = entity.IsCoveredByWarranty,
            IsBillable = entity.IsBillable,
            TotalAmount = entity.TotalAmount,
            IsInvoiced = entity.IsInvoiced,
            CustomerRating = entity.CustomerRating,
            CreatedAt = entity.CreatedAt
        };
    }
}
