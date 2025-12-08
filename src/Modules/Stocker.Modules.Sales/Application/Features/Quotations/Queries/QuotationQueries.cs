using MediatR;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Application.Features.SalesOrders.Queries;
using Stocker.Modules.Sales.Domain.Entities;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Application.Features.Quotations.Queries;

public record GetQuotationByIdQuery(Guid Id) : IRequest<Result<QuotationDto>>;

public record GetQuotationsQuery(
    int Page = 1,
    int PageSize = 20,
    string? SearchTerm = null,
    QuotationStatus? Status = null,
    Guid? CustomerId = null,
    Guid? SalesPersonId = null,
    DateTime? FromDate = null,
    DateTime? ToDate = null,
    string? SortBy = null,
    bool SortDescending = true
) : IRequest<Result<PagedResult<QuotationListDto>>>;

public record GetQuotationsByCustomerQuery(Guid CustomerId, int Page = 1, int PageSize = 20) : IRequest<Result<PagedResult<QuotationListDto>>>;

public record GetQuotationsBySalesPersonQuery(Guid SalesPersonId, int Page = 1, int PageSize = 20) : IRequest<Result<PagedResult<QuotationListDto>>>;

public record GetExpiringQuotationsQuery(int DaysUntilExpiry = 7) : IRequest<Result<List<QuotationListDto>>>;

public record GetQuotationRevisionsQuery(Guid QuotationId) : IRequest<Result<List<QuotationListDto>>>;

public record GetQuotationStatisticsQuery(DateTime? FromDate = null, DateTime? ToDate = null) : IRequest<Result<QuotationStatisticsDto>>;

public record QuotationStatisticsDto
{
    public int TotalQuotations { get; init; }
    public int DraftQuotations { get; init; }
    public int SentQuotations { get; init; }
    public int AcceptedQuotations { get; init; }
    public int RejectedQuotations { get; init; }
    public int ExpiredQuotations { get; init; }
    public int ConvertedQuotations { get; init; }
    public decimal TotalQuotedAmount { get; init; }
    public decimal AcceptedAmount { get; init; }
    public decimal ConversionRate { get; init; }
    public decimal AverageQuotationValue { get; init; }
}
