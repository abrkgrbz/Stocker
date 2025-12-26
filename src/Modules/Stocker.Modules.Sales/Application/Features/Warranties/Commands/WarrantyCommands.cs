using MediatR;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Domain.Entities;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Application.Features.Warranties.Commands;

public record CreateWarrantyCommand : IRequest<Result<WarrantyDto>>
{
    public string ProductCode { get; init; } = string.Empty;
    public string ProductName { get; init; } = string.Empty;
    public Guid? ProductId { get; init; }
    public string? SerialNumber { get; init; }
    public string? LotNumber { get; init; }
    public DateTime StartDate { get; init; }
    public DateTime EndDate { get; init; }
    public WarrantyType Type { get; init; } = WarrantyType.Standard;
    public WarrantyCoverageType CoverageType { get; init; } = WarrantyCoverageType.Full;
    public string? CoverageDescription { get; init; }
    public decimal? MaxClaimAmount { get; init; }
    public int? MaxClaimCount { get; init; }
    public Guid? CustomerId { get; init; }
    public string CustomerName { get; init; } = string.Empty;
    public string? CustomerEmail { get; init; }
    public string? CustomerPhone { get; init; }
    public string? CustomerAddress { get; init; }
    public string? Notes { get; init; }
}

public record CreateStandardWarrantyCommand : IRequest<Result<WarrantyDto>>
{
    public string ProductCode { get; init; } = string.Empty;
    public string ProductName { get; init; } = string.Empty;
    public Guid? ProductId { get; init; }
    public string? SerialNumber { get; init; }
    public DateTime StartDate { get; init; }
    public int DurationMonths { get; init; } = 12;
    public Guid? CustomerId { get; init; }
    public string CustomerName { get; init; } = string.Empty;
    public string? CustomerEmail { get; init; }
    public string? CustomerPhone { get; init; }
}

public record UpdateWarrantyCommand : IRequest<Result<WarrantyDto>>
{
    public Guid Id { get; init; }
    public string? SerialNumber { get; init; }
    public string? LotNumber { get; init; }
    public WarrantyCoverageType CoverageType { get; init; }
    public string? CoverageDescription { get; init; }
    public decimal? MaxClaimAmount { get; init; }
    public int? MaxClaimCount { get; init; }
    public string? CustomerEmail { get; init; }
    public string? CustomerPhone { get; init; }
    public string? CustomerAddress { get; init; }
    public string? Notes { get; init; }
}

public record RegisterWarrantyCommand : IRequest<Result<WarrantyDto>>
{
    public Guid Id { get; init; }
    public string? RegisteredBy { get; init; }
}

public record ActivateWarrantyCommand : IRequest<Result<WarrantyDto>>
{
    public Guid Id { get; init; }
}

public record SuspendWarrantyCommand : IRequest<Result<WarrantyDto>>
{
    public Guid Id { get; init; }
    public string Reason { get; init; } = string.Empty;
}

public record VoidWarrantyCommand : IRequest<Result<WarrantyDto>>
{
    public Guid Id { get; init; }
    public string Reason { get; init; } = string.Empty;
}

public record ExtendWarrantyCommand : IRequest<Result<WarrantyDto>>
{
    public Guid Id { get; init; }
    public int AdditionalMonths { get; init; }
    public decimal? Price { get; init; }
}

public record SetSaleInfoCommand : IRequest<Result<WarrantyDto>>
{
    public Guid Id { get; init; }
    public Guid SalesOrderId { get; init; }
    public string SalesOrderNumber { get; init; } = string.Empty;
    public Guid SalesOrderItemId { get; init; }
    public DateTime PurchaseDate { get; init; }
}

public record SetInvoiceCommand : IRequest<Result<WarrantyDto>>
{
    public Guid Id { get; init; }
    public Guid InvoiceId { get; init; }
    public string InvoiceNumber { get; init; } = string.Empty;
}

public record CreateWarrantyClaimCommand : IRequest<Result<WarrantyClaimDto>>
{
    public Guid WarrantyId { get; init; }
    public string IssueDescription { get; init; } = string.Empty;
    public WarrantyClaimType ClaimType { get; init; } = WarrantyClaimType.Defect;
    public decimal EstimatedAmount { get; init; }
    public string? FailureCode { get; init; }
    public string? DiagnosticNotes { get; init; }
}

public record StartClaimReviewCommand : IRequest<Result<WarrantyClaimDto>>
{
    public Guid WarrantyId { get; init; }
    public Guid ClaimId { get; init; }
}

public record ApproveClaimCommand : IRequest<Result<WarrantyClaimDto>>
{
    public Guid WarrantyId { get; init; }
    public Guid ClaimId { get; init; }
    public decimal ApprovedAmount { get; init; }
    public WarrantyResolutionType ResolutionType { get; init; }
    public string Resolution { get; init; } = string.Empty;
}

public record RejectClaimCommand : IRequest<Result<WarrantyClaimDto>>
{
    public Guid WarrantyId { get; init; }
    public Guid ClaimId { get; init; }
    public string Reason { get; init; } = string.Empty;
}

public record CompleteClaimCommand : IRequest<Result<WarrantyClaimDto>>
{
    public Guid WarrantyId { get; init; }
    public Guid ClaimId { get; init; }
    public decimal PaidAmount { get; init; }
}

public record DeleteWarrantyCommand : IRequest<Result>
{
    public Guid Id { get; init; }
}
