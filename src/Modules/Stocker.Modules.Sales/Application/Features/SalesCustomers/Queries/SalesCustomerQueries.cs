using MediatR;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Domain.Enums;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Application.Features.SalesCustomers.Queries;

/// <summary>
/// Query to get a sales customer by ID
/// </summary>
public record GetSalesCustomerByIdQuery : IRequest<Result<SalesCustomerDto>>
{
    public Guid Id { get; init; }
}

/// <summary>
/// Query to get a sales customer by code
/// </summary>
public record GetSalesCustomerByCodeQuery : IRequest<Result<SalesCustomerDto>>
{
    public string CustomerCode { get; init; } = string.Empty;
}

/// <summary>
/// Query to get a sales customer by tax number
/// </summary>
public record GetSalesCustomerByTaxNumberQuery : IRequest<Result<SalesCustomerDto>>
{
    public string TaxNumber { get; init; } = string.Empty;
}

/// <summary>
/// Query to get a sales customer by identity number
/// </summary>
public record GetSalesCustomerByIdentityNumberQuery : IRequest<Result<SalesCustomerDto>>
{
    public string IdentityNumber { get; init; } = string.Empty;
}

/// <summary>
/// Query to get all sales customers (not paginated)
/// </summary>
public record GetAllSalesCustomersQuery : IRequest<Result<List<SalesCustomerListDto>>>
{
    public bool IncludeInactive { get; init; }
}

/// <summary>
/// Query to get paginated sales customers with filtering
/// </summary>
public record GetSalesCustomersPagedQuery : IRequest<Result<PagedResult<SalesCustomerListDto>>>
{
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
    public string? SearchTerm { get; init; }
    public SalesCustomerType? CustomerType { get; init; }
    public bool? IsEInvoiceRegistered { get; init; }
    public string? City { get; init; }
    public bool IncludeInactive { get; init; }
    public string? SortBy { get; init; }
    public bool SortDescending { get; init; }
}

/// <summary>
/// Query to search sales customers for autocomplete/dropdown
/// </summary>
public record SearchSalesCustomersQuery : IRequest<Result<List<SalesCustomerListDto>>>
{
    public string SearchTerm { get; init; } = string.Empty;
    public int MaxResults { get; init; } = 10;
    public bool OnlyActive { get; init; } = true;
}

/// <summary>
/// Query to get e-invoice registered customers
/// </summary>
public record GetEInvoiceCustomersQuery : IRequest<Result<List<SalesCustomerListDto>>>
{
    public bool OnlyActive { get; init; } = true;
}

/// <summary>
/// Query to check if a tax number exists
/// </summary>
public record CheckTaxNumberExistsQuery : IRequest<Result<bool>>
{
    public string TaxNumber { get; init; } = string.Empty;
    public Guid? ExcludeCustomerId { get; init; }
}

/// <summary>
/// Query to check if an identity number exists
/// </summary>
public record CheckIdentityNumberExistsQuery : IRequest<Result<bool>>
{
    public string IdentityNumber { get; init; } = string.Empty;
    public Guid? ExcludeCustomerId { get; init; }
}
