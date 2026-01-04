using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Finance.Application.DTOs;
using Stocker.Modules.Finance.Application.Features.Payments.Commands;
using Stocker.Modules.Finance.Domain.Entities;
using Stocker.Modules.Finance.Domain.Enums;
using Stocker.Modules.Finance.Interfaces;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Finance.Application.Features.Payments.Queries;

/// <summary>
/// Query to get paginated payments
/// </summary>
public class GetPaymentsQuery : IRequest<Result<PagedResult<PaymentSummaryDto>>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public PaymentFilterDto? Filter { get; set; }
}

/// <summary>
/// Handler for GetPaymentsQuery
/// </summary>
public class GetPaymentsQueryHandler : IRequestHandler<GetPaymentsQuery, Result<PagedResult<PaymentSummaryDto>>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public GetPaymentsQueryHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PagedResult<PaymentSummaryDto>>> Handle(GetPaymentsQuery request, CancellationToken cancellationToken)
    {
        var query = _unitOfWork.Payments.AsQueryable();

        // Apply filters
        if (request.Filter != null)
        {
            if (!string.IsNullOrEmpty(request.Filter.SearchTerm))
            {
                var searchTerm = request.Filter.SearchTerm.ToLower();
                query = query.Where(p =>
                    p.PaymentNumber.ToLower().Contains(searchTerm) ||
                    p.CurrentAccountName.ToLower().Contains(searchTerm) ||
                    (p.Description != null && p.Description.ToLower().Contains(searchTerm)));
            }

            if (request.Filter.PaymentType.HasValue)
            {
                query = query.Where(p => p.PaymentType == request.Filter.PaymentType.Value);
            }

            if (request.Filter.Direction.HasValue)
            {
                query = query.Where(p => p.Direction == request.Filter.Direction.Value);
            }

            if (request.Filter.Status.HasValue)
            {
                query = query.Where(p => p.Status == request.Filter.Status.Value);
            }

            if (request.Filter.CurrentAccountId.HasValue)
            {
                query = query.Where(p => p.CurrentAccountId == request.Filter.CurrentAccountId.Value);
            }

            if (request.Filter.BankAccountId.HasValue)
            {
                query = query.Where(p => p.BankAccountId == request.Filter.BankAccountId.Value);
            }

            if (request.Filter.CashAccountId.HasValue)
            {
                query = query.Where(p => p.CashAccountId == request.Filter.CashAccountId.Value);
            }

            if (request.Filter.StartDate.HasValue)
            {
                query = query.Where(p => p.PaymentDate >= request.Filter.StartDate.Value);
            }

            if (request.Filter.EndDate.HasValue)
            {
                query = query.Where(p => p.PaymentDate <= request.Filter.EndDate.Value);
            }

            if (request.Filter.HasUnallocated.HasValue && request.Filter.HasUnallocated.Value)
            {
                query = query.Where(p => p.UnallocatedAmount.Amount > 0);
            }
        }

        // Get total count
        var totalCount = await query.CountAsync(cancellationToken);

        // Apply sorting
        var sortBy = request.Filter?.SortBy ?? "PaymentDate";
        var sortDesc = request.Filter?.SortDescending ?? true;

        query = sortBy.ToLower() switch
        {
            "paymentnumber" => sortDesc ? query.OrderByDescending(p => p.PaymentNumber) : query.OrderBy(p => p.PaymentNumber),
            "amount" => sortDesc ? query.OrderByDescending(p => p.Amount.Amount) : query.OrderBy(p => p.Amount.Amount),
            "currentaccountname" => sortDesc ? query.OrderByDescending(p => p.CurrentAccountName) : query.OrderBy(p => p.CurrentAccountName),
            "status" => sortDesc ? query.OrderByDescending(p => p.Status) : query.OrderBy(p => p.Status),
            _ => sortDesc ? query.OrderByDescending(p => p.PaymentDate) : query.OrderBy(p => p.PaymentDate)
        };

        // Apply pagination
        var pageNumber = request.Filter?.PageNumber ?? 1;
        var pageSize = request.Filter?.PageSize ?? 20;
        var payments = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var dtos = payments.Select(MapToSummaryDto).ToList();

        return Result<PagedResult<PaymentSummaryDto>>.Success(
            new PagedResult<PaymentSummaryDto>(dtos, totalCount, pageNumber, pageSize));
    }

    private static PaymentSummaryDto MapToSummaryDto(Payment payment)
    {
        return new PaymentSummaryDto
        {
            Id = payment.Id,
            PaymentNumber = payment.PaymentNumber,
            PaymentDate = payment.PaymentDate,
            PaymentType = payment.PaymentType,
            Direction = payment.Direction,
            CurrentAccountName = payment.CurrentAccountName,
            Amount = payment.Amount.Amount,
            Currency = payment.Currency,
            Status = payment.Status,
            AllocatedAmount = payment.AllocatedAmount.Amount,
            UnallocatedAmount = payment.UnallocatedAmount.Amount
        };
    }
}

/// <summary>
/// Query to get a payment by ID
/// </summary>
public class GetPaymentByIdQuery : IRequest<Result<PaymentDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
}

/// <summary>
/// Handler for GetPaymentByIdQuery
/// </summary>
public class GetPaymentByIdQueryHandler : IRequestHandler<GetPaymentByIdQuery, Result<PaymentDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public GetPaymentByIdQueryHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PaymentDto>> Handle(GetPaymentByIdQuery request, CancellationToken cancellationToken)
    {
        var payment = await _unitOfWork.Payments.GetWithAllocationsAsync(request.Id, cancellationToken);
        if (payment == null)
        {
            return Result<PaymentDto>.Failure(
                Error.NotFound("Payment", $"ID {request.Id} ile ödeme bulunamadı"));
        }

        var dto = CreatePaymentCommandHandler.MapToDto(payment);
        return Result<PaymentDto>.Success(dto);
    }
}

/// <summary>
/// Query to get unallocated payments
/// </summary>
public class GetUnallocatedPaymentsQuery : IRequest<Result<List<PaymentSummaryDto>>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int? CurrentAccountId { get; set; }
}

/// <summary>
/// Handler for GetUnallocatedPaymentsQuery
/// </summary>
public class GetUnallocatedPaymentsQueryHandler : IRequestHandler<GetUnallocatedPaymentsQuery, Result<List<PaymentSummaryDto>>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public GetUnallocatedPaymentsQueryHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<List<PaymentSummaryDto>>> Handle(GetUnallocatedPaymentsQuery request, CancellationToken cancellationToken)
    {
        var payments = await _unitOfWork.Payments.GetUnallocatedPaymentsAsync(cancellationToken);

        // Filter by current account if specified
        if (request.CurrentAccountId.HasValue)
        {
            payments = payments.Where(p => p.CurrentAccountId == request.CurrentAccountId.Value).ToList();
        }

        var dtos = payments.Select(p => new PaymentSummaryDto
        {
            Id = p.Id,
            PaymentNumber = p.PaymentNumber,
            PaymentDate = p.PaymentDate,
            PaymentType = p.PaymentType,
            Direction = p.Direction,
            CurrentAccountName = p.CurrentAccountName,
            Amount = p.Amount.Amount,
            Currency = p.Currency,
            Status = p.Status,
            AllocatedAmount = p.AllocatedAmount.Amount,
            UnallocatedAmount = p.UnallocatedAmount.Amount
        }).ToList();

        return Result<List<PaymentSummaryDto>>.Success(dtos);
    }
}
