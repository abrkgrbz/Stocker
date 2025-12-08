using MediatR;
using Stocker.Modules.Purchase.Application.DTOs;
using Stocker.Modules.Purchase.Domain.Entities;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Purchase.Application.Features.PurchaseInvoices.Queries;

public record GetPurchaseInvoiceByIdQuery(Guid Id) : IRequest<Result<PurchaseInvoiceDto>>;

public record GetPurchaseInvoiceByNumberQuery(string InvoiceNumber) : IRequest<Result<PurchaseInvoiceDto>>;

public record GetPurchaseInvoicesQuery(
    int Page = 1,
    int PageSize = 20,
    string? SearchTerm = null,
    PurchaseInvoiceStatus? Status = null,
    PurchaseInvoiceType? Type = null,
    Guid? SupplierId = null,
    DateTime? FromDate = null,
    DateTime? ToDate = null,
    DateTime? DueDateFrom = null,
    DateTime? DueDateTo = null,
    bool? IsOverdue = null,
    string? SortBy = null,
    bool SortDescending = true
) : IRequest<Result<PagedResult<PurchaseInvoiceListDto>>>;

public record GetPurchaseInvoicesBySupplierQuery(Guid SupplierId, int Page = 1, int PageSize = 20) : IRequest<Result<PagedResult<PurchaseInvoiceListDto>>>;

public record GetPurchaseInvoicesByPurchaseOrderQuery(Guid PurchaseOrderId) : IRequest<Result<List<PurchaseInvoiceListDto>>>;

public record GetPendingPurchaseInvoicesQuery() : IRequest<Result<List<PurchaseInvoiceListDto>>>;

public record GetOverduePurchaseInvoicesQuery() : IRequest<Result<List<PurchaseInvoiceListDto>>>;

public record GetPurchaseInvoiceSummaryQuery(
    DateTime? FromDate = null,
    DateTime? ToDate = null
) : IRequest<Result<PurchaseInvoiceSummaryDto>>;

public record GetUnpaidPurchaseInvoicesQuery(Guid? SupplierId = null) : IRequest<Result<List<PurchaseInvoiceListDto>>>;
