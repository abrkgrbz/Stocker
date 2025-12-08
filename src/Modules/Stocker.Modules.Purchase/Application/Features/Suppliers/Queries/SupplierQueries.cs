using MediatR;
using Stocker.Modules.Purchase.Application.DTOs;
using Stocker.Modules.Purchase.Domain.Entities;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Purchase.Application.Features.Suppliers.Queries;

public record GetSupplierByIdQuery(Guid Id) : IRequest<Result<SupplierDto>>;

public record GetSupplierByCodeQuery(string Code) : IRequest<Result<SupplierDto>>;

public record GetSuppliersQuery(
    int Page = 1,
    int PageSize = 20,
    string? SearchTerm = null,
    SupplierType? Type = null,
    SupplierStatus? Status = null,
    bool? IsActive = null,
    string? City = null,
    string? SortBy = null,
    bool SortDescending = true
) : IRequest<Result<PagedResult<SupplierListDto>>>;

public record GetActiveSuppliersQuery() : IRequest<Result<List<SupplierListDto>>>;

public record GetSuppliersByProductQuery(Guid ProductId) : IRequest<Result<List<SupplierListDto>>>;

public record GetSupplierProductsQuery(Guid SupplierId) : IRequest<Result<List<SupplierProductDto>>>;

public record GetSupplierContactsQuery(Guid SupplierId) : IRequest<Result<List<SupplierContactDto>>>;

public record GetSupplierSummaryQuery() : IRequest<Result<SupplierSummaryDto>>;

public record GetTopSuppliersQuery(int Count = 10) : IRequest<Result<List<SupplierListDto>>>;
