using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Application.Features.SalesReturns.Commands;
using Stocker.Modules.Sales.Application.Features.SalesReturns.Queries;
using Stocker.Modules.Sales.Domain.Entities;
using Stocker.Modules.Sales.Interfaces;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Application.Features.SalesReturns.Handlers;

/// <summary>
/// Handler for CreateSalesReturnCommand
/// Uses ISalesUnitOfWork for consistent data access
/// </summary>
public class CreateSalesReturnHandler : IRequestHandler<CreateSalesReturnCommand, Result<SalesReturnDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public CreateSalesReturnHandler(ISalesUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<Result<SalesReturnDto>> Handle(CreateSalesReturnCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var salesOrder = await _unitOfWork.SalesOrders.GetWithItemsAsync(request.Dto.SalesOrderId, cancellationToken);

        if (salesOrder == null || salesOrder.TenantId != tenantId)
            return Result<SalesReturnDto>.Failure(Error.NotFound("SalesOrder", "Sales order not found"));

        var returnNumber = SalesReturn.GenerateReturnNumber();

        var returnResult = SalesReturn.Create(
            tenantId,
            returnNumber,
            salesOrder.Id,
            salesOrder.OrderNumber,
            request.Dto.Type,
            request.Dto.Reason,
            salesOrder.CustomerId,
            salesOrder.CustomerName,
            null,
            null,
            request.Dto.ReasonDetails
        );

        if (!returnResult.IsSuccess)
            return Result<SalesReturnDto>.Failure(returnResult.Error);

        var salesReturn = returnResult.Value;
        salesReturn.SetRefundMethod(request.Dto.RefundMethod);
        salesReturn.SetRestockOptions(request.Dto.RestockItems, request.Dto.RestockWarehouseId);
        salesReturn.SetNotes(request.Dto.Notes, null);

        foreach (var itemDto in request.Dto.Items)
        {
            var itemResult = SalesReturnItem.Create(
                tenantId,
                itemDto.SalesOrderItemId,
                itemDto.ProductId,
                itemDto.ProductName,
                itemDto.ProductCode,
                itemDto.QuantityOrdered,
                itemDto.QuantityReturned,
                itemDto.UnitPrice,
                itemDto.VatRate,
                itemDto.Condition,
                itemDto.ConditionNotes,
                itemDto.Unit
            );

            if (!itemResult.IsSuccess)
                return Result<SalesReturnDto>.Failure(itemResult.Error);

            var item = itemResult.Value;
            item.SetSalesReturnId(salesReturn.Id);
            salesReturn.AddItem(item);
        }

        await _unitOfWork.Repository<SalesReturn>().AddAsync(salesReturn, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<SalesReturnDto>.Success(_mapper.Map<SalesReturnDto>(salesReturn));
    }
}

/// <summary>
/// Handler for GetSalesReturnByIdQuery
/// Uses ISalesUnitOfWork for consistent data access
/// </summary>
public class GetSalesReturnByIdHandler : IRequestHandler<GetSalesReturnByIdQuery, Result<SalesReturnDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public GetSalesReturnByIdHandler(ISalesUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<Result<SalesReturnDto>> Handle(GetSalesReturnByIdQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var salesReturn = await _unitOfWork.ReadRepository<SalesReturn>().AsQueryable()
            .Include(r => r.Items)
            .FirstOrDefaultAsync(r => r.Id == request.Id && r.TenantId == tenantId, cancellationToken);

        if (salesReturn == null)
            return Result<SalesReturnDto>.Failure(Error.NotFound("SalesReturn", "Sales return not found"));

        return Result<SalesReturnDto>.Success(_mapper.Map<SalesReturnDto>(salesReturn));
    }
}

/// <summary>
/// Handler for GetSalesReturnsQuery
/// Uses ISalesUnitOfWork for consistent data access
/// </summary>
public class GetSalesReturnsHandler : IRequestHandler<GetSalesReturnsQuery, Result<PagedResult<SalesReturnListDto>>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public GetSalesReturnsHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PagedResult<SalesReturnListDto>>> Handle(GetSalesReturnsQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var query = _unitOfWork.ReadRepository<SalesReturn>().AsQueryable()
            .Include(r => r.Items)
            .Where(r => r.TenantId == tenantId)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var searchTerm = request.SearchTerm.ToLower();
            query = query.Where(r =>
                r.ReturnNumber.ToLower().Contains(searchTerm) ||
                r.SalesOrderNumber.ToLower().Contains(searchTerm) ||
                (r.CustomerName != null && r.CustomerName.ToLower().Contains(searchTerm)));
        }

        if (request.Status.HasValue)
            query = query.Where(r => r.Status == request.Status.Value);

        if (request.Reason.HasValue)
            query = query.Where(r => r.Reason == request.Reason.Value);

        if (request.CustomerId.HasValue)
            query = query.Where(r => r.CustomerId == request.CustomerId.Value);

        if (request.FromDate.HasValue)
            query = query.Where(r => r.ReturnDate >= request.FromDate.Value);

        if (request.ToDate.HasValue)
            query = query.Where(r => r.ReturnDate <= request.ToDate.Value);

        var totalCount = await query.CountAsync(cancellationToken);

        query = request.SortBy?.ToLower() switch
        {
            "returnnumber" => request.SortDescending ? query.OrderByDescending(r => r.ReturnNumber) : query.OrderBy(r => r.ReturnNumber),
            "customername" => request.SortDescending ? query.OrderByDescending(r => r.CustomerName) : query.OrderBy(r => r.CustomerName),
            "totalamount" => request.SortDescending ? query.OrderByDescending(r => r.TotalAmount) : query.OrderBy(r => r.TotalAmount),
            "status" => request.SortDescending ? query.OrderByDescending(r => r.Status) : query.OrderBy(r => r.Status),
            _ => request.SortDescending ? query.OrderByDescending(r => r.CreatedAt) : query.OrderBy(r => r.CreatedAt)
        };

        var items = await query
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(r => new SalesReturnListDto
            {
                Id = r.Id,
                ReturnNumber = r.ReturnNumber,
                ReturnDate = r.ReturnDate,
                SalesOrderNumber = r.SalesOrderNumber,
                CustomerName = r.CustomerName,
                Type = r.Type.ToString(),
                Reason = r.Reason.ToString(),
                Status = r.Status.ToString(),
                TotalAmount = r.TotalAmount,
                RefundAmount = r.RefundAmount,
                ItemCount = r.Items.Count,
                CreatedAt = r.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return Result<PagedResult<SalesReturnListDto>>.Success(new PagedResult<SalesReturnListDto>(
            items,
            request.Page,
            request.PageSize,
            totalCount));
    }
}

/// <summary>
/// Handler for SubmitSalesReturnCommand
/// Uses ISalesUnitOfWork for consistent data access
/// </summary>
public class SubmitSalesReturnHandler : IRequestHandler<SubmitSalesReturnCommand, Result<SalesReturnDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public SubmitSalesReturnHandler(ISalesUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<Result<SalesReturnDto>> Handle(SubmitSalesReturnCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var salesReturn = await _unitOfWork.ReadRepository<SalesReturn>().AsQueryable()
            .Include(r => r.Items)
            .FirstOrDefaultAsync(r => r.Id == request.Id && r.TenantId == tenantId, cancellationToken);

        if (salesReturn == null)
            return Result<SalesReturnDto>.Failure(Error.NotFound("SalesReturn", "Sales return not found"));

        var result = salesReturn.Submit();

        if (!result.IsSuccess)
            return Result<SalesReturnDto>.Failure(result.Error);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<SalesReturnDto>.Success(_mapper.Map<SalesReturnDto>(salesReturn));
    }
}

/// <summary>
/// Handler for ApproveSalesReturnCommand
/// Uses ISalesUnitOfWork for consistent data access
/// </summary>
public class ApproveSalesReturnHandler : IRequestHandler<ApproveSalesReturnCommand, Result<SalesReturnDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ICurrentUserService _currentUserService;

    public ApproveSalesReturnHandler(ISalesUnitOfWork unitOfWork, IMapper mapper, ICurrentUserService currentUserService)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _currentUserService = currentUserService;
    }

    public async Task<Result<SalesReturnDto>> Handle(ApproveSalesReturnCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var salesReturn = await _unitOfWork.ReadRepository<SalesReturn>().AsQueryable()
            .Include(r => r.Items)
            .FirstOrDefaultAsync(r => r.Id == request.Id && r.TenantId == tenantId, cancellationToken);

        if (salesReturn == null)
            return Result<SalesReturnDto>.Failure(Error.NotFound("SalesReturn", "Sales return not found"));

        var userId = _currentUserService.UserId ?? Guid.Empty;
        var result = salesReturn.Approve(userId);

        if (!result.IsSuccess)
            return Result<SalesReturnDto>.Failure(result.Error);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<SalesReturnDto>.Success(_mapper.Map<SalesReturnDto>(salesReturn));
    }
}

/// <summary>
/// Handler for ProcessRefundCommand
/// Uses ISalesUnitOfWork for consistent data access
/// </summary>
public class ProcessRefundHandler : IRequestHandler<ProcessRefundCommand, Result<SalesReturnDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public ProcessRefundHandler(ISalesUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<Result<SalesReturnDto>> Handle(ProcessRefundCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var salesReturn = await _unitOfWork.ReadRepository<SalesReturn>().AsQueryable()
            .Include(r => r.Items)
            .FirstOrDefaultAsync(r => r.Id == request.Id && r.TenantId == tenantId, cancellationToken);

        if (salesReturn == null)
            return Result<SalesReturnDto>.Failure(Error.NotFound("SalesReturn", "Sales return not found"));

        var result = salesReturn.ProcessRefund(request.Dto.RefundReference, request.Dto.OverrideAmount);

        if (!result.IsSuccess)
            return Result<SalesReturnDto>.Failure(result.Error);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<SalesReturnDto>.Success(_mapper.Map<SalesReturnDto>(salesReturn));
    }
}

/// <summary>
/// Handler for GetReturnSummaryQuery
/// Uses ISalesUnitOfWork for consistent data access
/// </summary>
public class GetReturnSummaryHandler : IRequestHandler<GetReturnSummaryQuery, Result<SalesReturnSummaryDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public GetReturnSummaryHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<SalesReturnSummaryDto>> Handle(GetReturnSummaryQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var query = _unitOfWork.ReadRepository<SalesReturn>().AsQueryable()
            .Where(r => r.TenantId == tenantId);

        if (request.FromDate.HasValue)
            query = query.Where(r => r.ReturnDate >= request.FromDate.Value);

        if (request.ToDate.HasValue)
            query = query.Where(r => r.ReturnDate <= request.ToDate.Value);

        var returns = await query.ToListAsync(cancellationToken);

        var summary = new SalesReturnSummaryDto
        {
            TotalReturns = returns.Count,
            PendingReturns = returns.Count(r => r.Status == SalesReturnStatus.Pending || r.Status == SalesReturnStatus.Submitted),
            ApprovedReturns = returns.Count(r => r.Status == SalesReturnStatus.Approved),
            CompletedReturns = returns.Count(r => r.Status == SalesReturnStatus.Completed),
            TotalRefundAmount = returns.Sum(r => r.RefundAmount),
            PendingRefundAmount = returns
                .Where(r => r.Status != SalesReturnStatus.Refunded && r.Status != SalesReturnStatus.Completed)
                .Sum(r => r.TotalAmount),
            ReturnsByReason = returns
                .GroupBy(r => r.Reason.ToString())
                .ToDictionary(g => g.Key, g => g.Count()),
            RefundsByMethod = returns
                .Where(r => r.RefundAmount > 0)
                .GroupBy(r => r.RefundMethod.ToString())
                .ToDictionary(g => g.Key, g => g.Sum(r => r.RefundAmount))
        };

        return Result<SalesReturnSummaryDto>.Success(summary);
    }
}

/// <summary>
/// Handler for DeleteSalesReturnCommand
/// Uses ISalesUnitOfWork for consistent data access
/// </summary>
public class DeleteSalesReturnHandler : IRequestHandler<DeleteSalesReturnCommand, Result>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public DeleteSalesReturnHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(DeleteSalesReturnCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var salesReturn = await _unitOfWork.Repository<SalesReturn>().GetByIdAsync(request.Id, cancellationToken);

        if (salesReturn == null || salesReturn.TenantId != tenantId)
            return Result.Failure(Error.NotFound("SalesReturn", "Sales return not found"));

        if (salesReturn.Status != SalesReturnStatus.Pending && salesReturn.Status != SalesReturnStatus.Cancelled)
            return Result.Failure(Error.Conflict("SalesReturn.Status", "Only pending or cancelled returns can be deleted"));

        _unitOfWork.Repository<SalesReturn>().Remove(salesReturn);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
