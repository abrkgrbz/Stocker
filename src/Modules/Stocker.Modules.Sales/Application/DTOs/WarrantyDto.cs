using Stocker.Modules.Sales.Domain.Entities;

namespace Stocker.Modules.Sales.Application.DTOs;

public record WarrantyDto
{
    public Guid Id { get; init; }
    public string WarrantyNumber { get; init; } = string.Empty;

    // Product
    public Guid? ProductId { get; init; }
    public string ProductCode { get; init; } = string.Empty;
    public string ProductName { get; init; } = string.Empty;
    public string? SerialNumber { get; init; }
    public string? LotNumber { get; init; }

    // Sale
    public Guid? SalesOrderId { get; init; }
    public string? SalesOrderNumber { get; init; }
    public Guid? SalesOrderItemId { get; init; }
    public Guid? InvoiceId { get; init; }
    public string? InvoiceNumber { get; init; }
    public DateTime? PurchaseDate { get; init; }

    // Customer
    public Guid? CustomerId { get; init; }
    public string CustomerName { get; init; } = string.Empty;
    public string? CustomerEmail { get; init; }
    public string? CustomerPhone { get; init; }
    public string? CustomerAddress { get; init; }

    // Period
    public DateTime StartDate { get; init; }
    public DateTime EndDate { get; init; }
    public int DurationMonths { get; init; }
    public int RemainingDays { get; init; }

    // Type & Coverage
    public string Type { get; init; } = string.Empty;
    public string CoverageType { get; init; } = string.Empty;
    public string? CoverageDescription { get; init; }
    public decimal? MaxClaimAmount { get; init; }
    public int? MaxClaimCount { get; init; }

    // Status
    public string Status { get; init; } = string.Empty;
    public bool IsActive { get; init; }
    public bool IsExpired { get; init; }
    public bool IsVoid { get; init; }
    public string? VoidReason { get; init; }
    public DateTime? VoidedDate { get; init; }

    // Extended
    public bool IsExtended { get; init; }
    public Guid? OriginalWarrantyId { get; init; }
    public decimal? ExtensionPrice { get; init; }
    public DateTime? ExtendedDate { get; init; }

    // Claims
    public int ClaimCount { get; init; }
    public int ApprovedClaimCount { get; init; }
    public decimal TotalClaimedAmount { get; init; }

    // Registration
    public bool IsRegistered { get; init; }
    public DateTime? RegisteredDate { get; init; }
    public string? RegisteredBy { get; init; }

    // Audit
    public string? Notes { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }

    public List<WarrantyClaimDto> Claims { get; init; } = new();

    public static WarrantyDto FromEntity(Warranty entity)
    {
        return new WarrantyDto
        {
            Id = entity.Id,
            WarrantyNumber = entity.WarrantyNumber,
            ProductId = entity.ProductId,
            ProductCode = entity.ProductCode,
            ProductName = entity.ProductName,
            SerialNumber = entity.SerialNumber,
            LotNumber = entity.LotNumber,
            SalesOrderId = entity.SalesOrderId,
            SalesOrderNumber = entity.SalesOrderNumber,
            SalesOrderItemId = entity.SalesOrderItemId,
            InvoiceId = entity.InvoiceId,
            InvoiceNumber = entity.InvoiceNumber,
            PurchaseDate = entity.PurchaseDate,
            CustomerId = entity.CustomerId,
            CustomerName = entity.CustomerName,
            CustomerEmail = entity.CustomerEmail,
            CustomerPhone = entity.CustomerPhone,
            CustomerAddress = entity.CustomerAddress,
            StartDate = entity.StartDate,
            EndDate = entity.EndDate,
            DurationMonths = entity.DurationMonths,
            RemainingDays = entity.RemainingDays,
            Type = entity.Type.ToString(),
            CoverageType = entity.CoverageType.ToString(),
            CoverageDescription = entity.CoverageDescription,
            MaxClaimAmount = entity.MaxClaimAmount,
            MaxClaimCount = entity.MaxClaimCount,
            Status = entity.Status.ToString(),
            IsActive = entity.IsActive,
            IsExpired = entity.IsExpired,
            IsVoid = entity.IsVoid,
            VoidReason = entity.VoidReason,
            VoidedDate = entity.VoidedDate,
            IsExtended = entity.IsExtended,
            OriginalWarrantyId = entity.OriginalWarrantyId,
            ExtensionPrice = entity.ExtensionPrice,
            ExtendedDate = entity.ExtendedDate,
            ClaimCount = entity.ClaimCount,
            ApprovedClaimCount = entity.ApprovedClaimCount,
            TotalClaimedAmount = entity.TotalClaimedAmount,
            IsRegistered = entity.IsRegistered,
            RegisteredDate = entity.RegisteredDate,
            RegisteredBy = entity.RegisteredBy,
            Notes = entity.Notes,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt,
            Claims = entity.Claims.Select(WarrantyClaimDto.FromEntity).ToList()
        };
    }
}

public record WarrantyClaimDto
{
    public Guid Id { get; init; }
    public Guid WarrantyId { get; init; }
    public string ClaimNumber { get; init; } = string.Empty;
    public DateTime ClaimDate { get; init; }
    public string IssueDescription { get; init; } = string.Empty;
    public string ClaimType { get; init; } = string.Empty;
    public string? FailureCode { get; init; }
    public string? DiagnosticNotes { get; init; }
    public string Status { get; init; } = string.Empty;
    public string? Resolution { get; init; }
    public string? ResolutionType { get; init; }
    public DateTime? ResolvedDate { get; init; }
    public Guid? ResolvedBy { get; init; }
    public decimal ClaimAmount { get; init; }
    public decimal ApprovedAmount { get; init; }
    public decimal PaidAmount { get; init; }
    public Guid? ReplacementProductId { get; init; }
    public string? ReplacementSerialNumber { get; init; }
    public Guid? ServiceOrderId { get; init; }
    public string? ServiceOrderNumber { get; init; }
    public string? Notes { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }

    public static WarrantyClaimDto FromEntity(WarrantyClaim entity)
    {
        return new WarrantyClaimDto
        {
            Id = entity.Id,
            WarrantyId = entity.WarrantyId,
            ClaimNumber = entity.ClaimNumber,
            ClaimDate = entity.ClaimDate,
            IssueDescription = entity.IssueDescription,
            ClaimType = entity.ClaimType.ToString(),
            FailureCode = entity.FailureCode,
            DiagnosticNotes = entity.DiagnosticNotes,
            Status = entity.Status.ToString(),
            Resolution = entity.Resolution,
            ResolutionType = entity.ResolutionType?.ToString(),
            ResolvedDate = entity.ResolvedDate,
            ResolvedBy = entity.ResolvedBy,
            ClaimAmount = entity.ClaimAmount,
            ApprovedAmount = entity.ApprovedAmount,
            PaidAmount = entity.PaidAmount,
            ReplacementProductId = entity.ReplacementProductId,
            ReplacementSerialNumber = entity.ReplacementSerialNumber,
            ServiceOrderId = entity.ServiceOrderId,
            ServiceOrderNumber = entity.ServiceOrderNumber,
            Notes = entity.Notes,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt
        };
    }
}

public record WarrantyListDto
{
    public Guid Id { get; init; }
    public string WarrantyNumber { get; init; } = string.Empty;
    public string ProductCode { get; init; } = string.Empty;
    public string ProductName { get; init; } = string.Empty;
    public string? SerialNumber { get; init; }
    public string CustomerName { get; init; } = string.Empty;
    public DateTime StartDate { get; init; }
    public DateTime EndDate { get; init; }
    public int RemainingDays { get; init; }
    public string Type { get; init; } = string.Empty;
    public string CoverageType { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public bool IsActive { get; init; }
    public bool IsExpired { get; init; }
    public int ClaimCount { get; init; }
    public DateTime CreatedAt { get; init; }

    public static WarrantyListDto FromEntity(Warranty entity)
    {
        return new WarrantyListDto
        {
            Id = entity.Id,
            WarrantyNumber = entity.WarrantyNumber,
            ProductCode = entity.ProductCode,
            ProductName = entity.ProductName,
            SerialNumber = entity.SerialNumber,
            CustomerName = entity.CustomerName,
            StartDate = entity.StartDate,
            EndDate = entity.EndDate,
            RemainingDays = entity.RemainingDays,
            Type = entity.Type.ToString(),
            CoverageType = entity.CoverageType.ToString(),
            Status = entity.Status.ToString(),
            IsActive = entity.IsActive,
            IsExpired = entity.IsExpired,
            ClaimCount = entity.ClaimCount,
            CreatedAt = entity.CreatedAt
        };
    }
}
