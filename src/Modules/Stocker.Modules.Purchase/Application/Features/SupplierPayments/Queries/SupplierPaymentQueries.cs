using MediatR;
using Stocker.Modules.Purchase.Application.DTOs;
using Stocker.Modules.Purchase.Domain.Entities;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Purchase.Application.Features.SupplierPayments.Queries;

public record GetSupplierPaymentByIdQuery(Guid Id) : IRequest<Result<SupplierPaymentDto>>;

public record GetSupplierPaymentByNumberQuery(string PaymentNumber) : IRequest<Result<SupplierPaymentDto>>;

public record GetSupplierPaymentsQuery(
    int Page = 1,
    int PageSize = 20,
    string? SearchTerm = null,
    SupplierPaymentStatus? Status = null,
    SupplierPaymentType? Type = null,
    PaymentMethod? Method = null,
    Guid? SupplierId = null,
    DateTime? FromDate = null,
    DateTime? ToDate = null,
    bool? IsReconciled = null,
    string? SortBy = null,
    bool SortDescending = true
) : IRequest<Result<PagedResult<SupplierPaymentListDto>>>;

public record GetSupplierPaymentsBySupplierQuery(Guid SupplierId, int Page = 1, int PageSize = 20) : IRequest<Result<PagedResult<SupplierPaymentListDto>>>;

public record GetSupplierPaymentsByInvoiceQuery(Guid InvoiceId) : IRequest<Result<List<SupplierPaymentListDto>>>;

public record GetPendingApprovalPaymentsQuery() : IRequest<Result<List<SupplierPaymentListDto>>>;

public record GetUnreconciledPaymentsQuery() : IRequest<Result<List<SupplierPaymentListDto>>>;

public record GetSupplierPaymentSummaryQuery(
    DateTime? FromDate = null,
    DateTime? ToDate = null
) : IRequest<Result<SupplierPaymentSummaryDto>>;
