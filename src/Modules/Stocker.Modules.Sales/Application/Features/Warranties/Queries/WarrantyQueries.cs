using MediatR;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Application.Features.Warranties.Queries;

public record GetWarrantiesQuery : IRequest<Result<PagedResult<WarrantyListDto>>>
{
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 10;
    public string? SearchTerm { get; init; }
    public string? Status { get; init; }
    public string? Type { get; init; }
    public string? CoverageType { get; init; }
    public Guid? CustomerId { get; init; }
    public Guid? ProductId { get; init; }
    public DateTime? FromDate { get; init; }
    public DateTime? ToDate { get; init; }
    public bool? IsActive { get; init; }
    public bool? IsExpired { get; init; }
    public string? SortBy { get; init; } = "StartDate";
    public bool SortDescending { get; init; } = true;
}

public record GetWarrantyByIdQuery : IRequest<Result<WarrantyDto>>
{
    public Guid Id { get; init; }
}

public record GetWarrantyByNumberQuery : IRequest<Result<WarrantyDto>>
{
    public string WarrantyNumber { get; init; } = string.Empty;
}

public record GetWarrantyBySerialNumberQuery : IRequest<Result<WarrantyDto>>
{
    public string SerialNumber { get; init; } = string.Empty;
}

public record LookupWarrantyQuery : IRequest<Result<WarrantyDto>>
{
    public string? SerialNumber { get; init; }
    public string? WarrantyNumber { get; init; }
    public string? ProductCode { get; init; }
    public string? CustomerName { get; init; }
}

public record GetWarrantyStatisticsQuery : IRequest<Result<WarrantyStatisticsDto>>
{
    public DateTime? FromDate { get; init; }
    public DateTime? ToDate { get; init; }
}

public record WarrantyStatisticsDto
{
    public int TotalWarranties { get; init; }
    public int ActiveWarranties { get; init; }
    public int ExpiredWarranties { get; init; }
    public int ExpiringWithin30Days { get; init; }
    public int ExpiringWithin90Days { get; init; }
    public int ExtendedWarranties { get; init; }
    public int TotalClaims { get; init; }
    public int ApprovedClaims { get; init; }
    public int PendingClaims { get; init; }
    public decimal TotalClaimedAmount { get; init; }
    public decimal AverageClaimAmount { get; init; }
    public string Currency { get; init; } = "TRY";
}
