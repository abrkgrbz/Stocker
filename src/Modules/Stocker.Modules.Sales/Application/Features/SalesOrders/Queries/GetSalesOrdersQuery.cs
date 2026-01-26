using MediatR;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Application.Features.SalesOrders.Queries;

public record GetSalesOrdersQuery : IRequest<Result<PagedResult<SalesOrderListDto>>>
{
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 10;

    /// <summary>
    /// Smart search term - searches across multiple fields with weighted relevance:
    /// 1. Exact OrderNumber match (highest priority)
    /// 2. CustomerName, CustomerEmail
    /// 3. Product codes and names in items
    /// 4. Order notes
    /// 5. QuotationNumber reference
    /// </summary>
    public string? SearchTerm { get; init; }

    /// <summary>
    /// Enable fuzzy matching for typo tolerance (default: false)
    /// When enabled, allows partial matches and small variations
    /// </summary>
    public bool FuzzySearch { get; init; } = false;

    /// <summary>
    /// Minimum relevance score threshold (0.0 to 1.0)
    /// Only returns results above this threshold when smart search is active
    /// </summary>
    public decimal MinRelevanceScore { get; init; } = 0.3m;

    public string? Status { get; init; }
    public Guid? CustomerId { get; init; }
    public Guid? SalesPersonId { get; init; }
    public DateTime? FromDate { get; init; }
    public DateTime? ToDate { get; init; }

    /// <summary>
    /// Filter by invoicing status: NotInvoiced, PartiallyInvoiced, FullyInvoiced
    /// </summary>
    public string? InvoicingStatus { get; init; }

    /// <summary>
    /// Filter by fulfillment status: Pending, PartiallyFulfilled, Fulfilled
    /// </summary>
    public string? FulfillmentStatus { get; init; }

    /// <summary>
    /// Filter for returnable orders only
    /// </summary>
    public bool? IsReturnable { get; init; }

    public string? SortBy { get; init; } = "OrderDate";
    public bool SortDescending { get; init; } = true;
}

public record GetSalesOrderByIdQuery : IRequest<Result<SalesOrderDto>>
{
    public Guid Id { get; init; }
}

public record GetSalesOrderByNumberQuery : IRequest<Result<SalesOrderDto>>
{
    public string OrderNumber { get; init; } = string.Empty;
}

public record GetSalesOrderStatisticsQuery : IRequest<Result<SalesOrderStatisticsDto>>
{
    public DateTime? FromDate { get; init; }
    public DateTime? ToDate { get; init; }
}

public record SalesOrderStatisticsDto
{
    public int TotalOrders { get; init; }
    public int DraftOrders { get; init; }
    public int ApprovedOrders { get; init; }
    public int CompletedOrders { get; init; }
    public int CancelledOrders { get; init; }
    public decimal TotalAmount { get; init; }
    public decimal AverageOrderValue { get; init; }
    public string Currency { get; init; } = "TRY";
}

