using MediatR;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Application.Features.ServiceOrders.Queries;

public record GetServiceOrdersQuery : IRequest<Result<PagedResult<ServiceOrderListDto>>>
{
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 10;
    public string? SearchTerm { get; init; }
    public string? Status { get; init; }
    public string? Type { get; init; }
    public string? Priority { get; init; }
    public Guid? CustomerId { get; init; }
    public Guid? TechnicianId { get; init; }
    public Guid? WarrantyId { get; init; }
    public DateTime? FromDate { get; init; }
    public DateTime? ToDate { get; init; }
    public bool? IsCoveredByWarranty { get; init; }
    public bool? IsBillable { get; init; }
    public string? SortBy { get; init; } = "OrderDate";
    public bool SortDescending { get; init; } = true;
}

public record GetServiceOrderByIdQuery : IRequest<Result<ServiceOrderDto>>
{
    public Guid Id { get; init; }
}

public record GetServiceOrderByNumberQuery : IRequest<Result<ServiceOrderDto>>
{
    public string ServiceOrderNumber { get; init; } = string.Empty;
}

public record GetServiceOrderStatisticsQuery : IRequest<Result<ServiceOrderStatisticsDto>>
{
    public DateTime? FromDate { get; init; }
    public DateTime? ToDate { get; init; }
}

public record ServiceOrderStatisticsDto
{
    public int TotalOrders { get; init; }
    public int OpenOrders { get; init; }
    public int AssignedOrders { get; init; }
    public int ScheduledOrders { get; init; }
    public int InProgressOrders { get; init; }
    public int CompletedOrders { get; init; }
    public int CancelledOrders { get; init; }
    public int WarrantyCoveredOrders { get; init; }
    public decimal TotalRevenue { get; init; }
    public decimal AverageRating { get; init; }
    public string Currency { get; init; } = "TRY";
}
