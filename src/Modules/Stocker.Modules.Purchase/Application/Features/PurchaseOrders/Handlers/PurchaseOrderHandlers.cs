using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Purchase.Application.DTOs;
using Stocker.Modules.Purchase.Application.Features.PurchaseOrders.Commands;
using Stocker.Modules.Purchase.Application.Features.PurchaseOrders.Queries;
using Stocker.Modules.Purchase.Domain.Entities;
using Stocker.Modules.Purchase.Interfaces;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Purchase.Application.Features.PurchaseOrders.Handlers;

/// <summary>
/// Handler for CreatePurchaseOrderCommand
/// Uses IPurchaseUnitOfWork for consistent data access
/// </summary>
public class CreatePurchaseOrderHandler : IRequestHandler<CreatePurchaseOrderCommand, Result<PurchaseOrderDto>>
{
    private readonly IPurchaseUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public CreatePurchaseOrderHandler(IPurchaseUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<Result<PurchaseOrderDto>> Handle(CreatePurchaseOrderCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var orderNumber = $"PO-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..8].ToUpper()}";

        var purchaseOrder = PurchaseOrder.Create(
            orderNumber,
            request.Dto.SupplierId,
            request.Dto.SupplierName,
            tenantId,
            request.Dto.Type,
            request.Dto.Currency ?? "TRY",
            request.Dto.WarehouseId,
            request.Dto.WarehouseName
        );

        if (request.Dto.ExpectedDeliveryDate.HasValue)
            purchaseOrder.SetExpectedDeliveryDate(request.Dto.ExpectedDeliveryDate);

        if (request.Dto.PurchaseRequestId.HasValue)
            purchaseOrder.LinkToPurchaseRequest(request.Dto.PurchaseRequestId.Value, request.Dto.PurchaseRequestNumber ?? "");

        if (request.Dto.ExchangeRate > 0)
            purchaseOrder.SetExchangeRate(request.Dto.ExchangeRate);

        if (request.Dto.PaymentTermDays > 0)
            purchaseOrder.SetPaymentTerms(request.Dto.PaymentTermDays, request.Dto.PaymentMethod);

        if (!string.IsNullOrEmpty(request.Dto.DeliveryAddress))
            purchaseOrder.SetDeliveryAddress(
                request.Dto.DeliveryAddress,
                request.Dto.DeliveryCity,
                request.Dto.DeliveryDistrict,
                request.Dto.DeliveryPostalCode
            );

        if (!string.IsNullOrEmpty(request.Dto.DeliveryContactPerson))
            purchaseOrder.SetDeliveryContact(request.Dto.DeliveryContactPerson, request.Dto.DeliveryContactPhone);

        purchaseOrder.SetNotes(request.Dto.InternalNotes, request.Dto.SupplierNotes);

        int lineNumber = 1;
        foreach (var itemDto in request.Dto.Items)
        {
            var item = PurchaseOrderItem.Create(
                purchaseOrder.Id,
                itemDto.ProductId ?? Guid.Empty,
                itemDto.ProductCode,
                itemDto.ProductName,
                itemDto.Unit ?? "Adet",
                itemDto.Quantity,
                itemDto.UnitPrice,
                itemDto.VatRate,
                lineNumber++,
                tenantId,
                request.Dto.Currency ?? "TRY"
            );

            if (!string.IsNullOrEmpty(itemDto.Description))
                item.SetDescription(itemDto.Description);

            if (itemDto.DiscountRate > 0)
                item.ApplyDiscount(itemDto.DiscountRate);

            purchaseOrder.AddItem(item);
        }

        if (request.Dto.DiscountRate > 0)
            purchaseOrder.ApplyDiscount(request.Dto.DiscountRate);

        await _unitOfWork.Repository<PurchaseOrder>().AddAsync(purchaseOrder, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<PurchaseOrderDto>.Success(_mapper.Map<PurchaseOrderDto>(purchaseOrder));
    }
}

/// <summary>
/// Handler for GetPurchaseOrderByIdQuery
/// Uses IPurchaseUnitOfWork for consistent data access
/// </summary>
public class GetPurchaseOrderByIdHandler : IRequestHandler<GetPurchaseOrderByIdQuery, Result<PurchaseOrderDto>>
{
    private readonly IPurchaseUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public GetPurchaseOrderByIdHandler(IPurchaseUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<Result<PurchaseOrderDto>> Handle(GetPurchaseOrderByIdQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var order = await _unitOfWork.ReadRepository<PurchaseOrder>().AsQueryable()
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == request.Id && o.TenantId == tenantId, cancellationToken);

        if (order == null)
            return Result<PurchaseOrderDto>.Failure(Error.NotFound("PurchaseOrder", "Purchase order not found"));

        return Result<PurchaseOrderDto>.Success(_mapper.Map<PurchaseOrderDto>(order));
    }
}

/// <summary>
/// Handler for GetPurchaseOrdersQuery
/// Uses IPurchaseUnitOfWork for consistent data access
/// </summary>
public class GetPurchaseOrdersHandler : IRequestHandler<GetPurchaseOrdersQuery, Result<PagedResult<PurchaseOrderListDto>>>
{
    private readonly IPurchaseUnitOfWork _unitOfWork;

    public GetPurchaseOrdersHandler(IPurchaseUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PagedResult<PurchaseOrderListDto>>> Handle(GetPurchaseOrdersQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var query = _unitOfWork.ReadRepository<PurchaseOrder>().AsQueryable()
            .Include(o => o.Items)
            .Where(o => o.TenantId == tenantId);

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var searchTerm = request.SearchTerm.ToLower();
            query = query.Where(o =>
                o.OrderNumber.ToLower().Contains(searchTerm) ||
                (o.SupplierName != null && o.SupplierName.ToLower().Contains(searchTerm)) ||
                (o.SupplierOrderNumber != null && o.SupplierOrderNumber.ToLower().Contains(searchTerm)));
        }

        if (request.Status.HasValue)
            query = query.Where(o => o.Status == request.Status.Value);

        if (request.Type.HasValue)
            query = query.Where(o => o.Type == request.Type.Value);

        if (request.SupplierId.HasValue)
            query = query.Where(o => o.SupplierId == request.SupplierId.Value);

        if (request.FromDate.HasValue)
            query = query.Where(o => o.OrderDate >= request.FromDate.Value);

        if (request.ToDate.HasValue)
            query = query.Where(o => o.OrderDate <= request.ToDate.Value);

        var totalCount = await query.CountAsync(cancellationToken);

        query = request.SortBy?.ToLower() switch
        {
            "ordernumber" => request.SortDescending ? query.OrderByDescending(o => o.OrderNumber) : query.OrderBy(o => o.OrderNumber),
            "suppliername" => request.SortDescending ? query.OrderByDescending(o => o.SupplierName) : query.OrderBy(o => o.SupplierName),
            "totalamount" => request.SortDescending ? query.OrderByDescending(o => o.TotalAmount) : query.OrderBy(o => o.TotalAmount),
            "expecteddeliverydate" => request.SortDescending ? query.OrderByDescending(o => o.ExpectedDeliveryDate) : query.OrderBy(o => o.ExpectedDeliveryDate),
            "status" => request.SortDescending ? query.OrderByDescending(o => o.Status) : query.OrderBy(o => o.Status),
            _ => request.SortDescending ? query.OrderByDescending(o => o.CreatedAt) : query.OrderBy(o => o.CreatedAt)
        };

        var items = await query
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(o => new PurchaseOrderListDto
            {
                Id = o.Id,
                OrderNumber = o.OrderNumber,
                OrderDate = o.OrderDate,
                ExpectedDeliveryDate = o.ExpectedDeliveryDate,
                SupplierName = o.SupplierName,
                Status = o.Status.ToString(),
                Type = o.Type.ToString(),
                TotalAmount = o.TotalAmount,
                Currency = o.Currency,
                ItemCount = o.Items.Count,
                CreatedAt = o.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return Result<PagedResult<PurchaseOrderListDto>>.Success(
            new PagedResult<PurchaseOrderListDto>(items, request.Page, request.PageSize, totalCount));
    }
}

/// <summary>
/// Handler for UpdatePurchaseOrderCommand
/// Uses IPurchaseUnitOfWork for consistent data access
/// </summary>
public class UpdatePurchaseOrderHandler : IRequestHandler<UpdatePurchaseOrderCommand, Result<PurchaseOrderDto>>
{
    private readonly IPurchaseUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public UpdatePurchaseOrderHandler(IPurchaseUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<Result<PurchaseOrderDto>> Handle(UpdatePurchaseOrderCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var order = await _unitOfWork.ReadRepository<PurchaseOrder>().AsQueryable()
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == request.Id && o.TenantId == tenantId, cancellationToken);

        if (order == null)
            return Result<PurchaseOrderDto>.Failure(Error.NotFound("PurchaseOrder", "Purchase order not found"));

        if (order.Status != PurchaseOrderStatus.Draft)
            return Result<PurchaseOrderDto>.Failure(Error.Conflict("PurchaseOrder.Status", "Only draft orders can be updated"));

        if (request.Dto.ExpectedDeliveryDate.HasValue)
            order.SetExpectedDeliveryDate(request.Dto.ExpectedDeliveryDate);

        if (request.Dto.DiscountRate.HasValue)
            order.ApplyDiscount(request.Dto.DiscountRate.Value);

        if (request.Dto.PaymentTermDays.HasValue && request.Dto.PaymentTermDays.Value > 0)
            order.SetPaymentTerms(request.Dto.PaymentTermDays.Value, request.Dto.PaymentMethod ?? order.PaymentMethod);

        if (!string.IsNullOrEmpty(request.Dto.DeliveryAddress))
            order.SetDeliveryAddress(
                request.Dto.DeliveryAddress,
                request.Dto.DeliveryCity,
                request.Dto.DeliveryDistrict,
                request.Dto.DeliveryPostalCode
            );

        if (!string.IsNullOrEmpty(request.Dto.DeliveryContactPerson))
            order.SetDeliveryContact(request.Dto.DeliveryContactPerson, request.Dto.DeliveryContactPhone);

        if (request.Dto.InternalNotes != null || request.Dto.SupplierNotes != null)
            order.SetNotes(request.Dto.InternalNotes ?? order.InternalNotes, request.Dto.SupplierNotes ?? order.SupplierNotes);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<PurchaseOrderDto>.Success(_mapper.Map<PurchaseOrderDto>(order));
    }
}

/// <summary>
/// Handler for ApprovePurchaseOrderCommand
/// Uses IPurchaseUnitOfWork for consistent data access
/// </summary>
public class ApprovePurchaseOrderHandler : IRequestHandler<ApprovePurchaseOrderCommand, Result<PurchaseOrderDto>>
{
    private readonly IPurchaseUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ICurrentUserService _currentUserService;

    public ApprovePurchaseOrderHandler(IPurchaseUnitOfWork unitOfWork, IMapper mapper, ICurrentUserService currentUserService)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _currentUserService = currentUserService;
    }

    public async Task<Result<PurchaseOrderDto>> Handle(ApprovePurchaseOrderCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var order = await _unitOfWork.ReadRepository<PurchaseOrder>().AsQueryable()
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == request.Id && o.TenantId == tenantId, cancellationToken);

        if (order == null)
            return Result<PurchaseOrderDto>.Failure(Error.NotFound("PurchaseOrder", "Purchase order not found"));

        var userId = _currentUserService.UserId ?? Guid.Empty;
        var userName = _currentUserService.UserName;

        order.Approve(userId, userName);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<PurchaseOrderDto>.Success(_mapper.Map<PurchaseOrderDto>(order));
    }
}

/// <summary>
/// Handler for ConfirmPurchaseOrderCommand
/// Uses IPurchaseUnitOfWork for consistent data access
/// </summary>
public class ConfirmPurchaseOrderHandler : IRequestHandler<ConfirmPurchaseOrderCommand, Result<PurchaseOrderDto>>
{
    private readonly IPurchaseUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public ConfirmPurchaseOrderHandler(IPurchaseUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<Result<PurchaseOrderDto>> Handle(ConfirmPurchaseOrderCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var order = await _unitOfWork.ReadRepository<PurchaseOrder>().AsQueryable()
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == request.Id && o.TenantId == tenantId, cancellationToken);

        if (order == null)
            return Result<PurchaseOrderDto>.Failure(Error.NotFound("PurchaseOrder", "Purchase order not found"));

        // Submit the order (which automatically approves if no approval is required)
        order.Submit();
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<PurchaseOrderDto>.Success(_mapper.Map<PurchaseOrderDto>(order));
    }
}

/// <summary>
/// Handler for SendPurchaseOrderCommand
/// Uses IPurchaseUnitOfWork for consistent data access
/// </summary>
public class SendPurchaseOrderHandler : IRequestHandler<SendPurchaseOrderCommand, Result<PurchaseOrderDto>>
{
    private readonly IPurchaseUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public SendPurchaseOrderHandler(IPurchaseUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<Result<PurchaseOrderDto>> Handle(SendPurchaseOrderCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var order = await _unitOfWork.ReadRepository<PurchaseOrder>().AsQueryable()
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == request.Id && o.TenantId == tenantId, cancellationToken);

        if (order == null)
            return Result<PurchaseOrderDto>.Failure(Error.NotFound("PurchaseOrder", "Purchase order not found"));

        order.Send();
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<PurchaseOrderDto>.Success(_mapper.Map<PurchaseOrderDto>(order));
    }
}

/// <summary>
/// Handler for CancelPurchaseOrderCommand
/// Uses IPurchaseUnitOfWork for consistent data access
/// </summary>
public class CancelPurchaseOrderHandler : IRequestHandler<CancelPurchaseOrderCommand, Result<PurchaseOrderDto>>
{
    private readonly IPurchaseUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public CancelPurchaseOrderHandler(IPurchaseUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<Result<PurchaseOrderDto>> Handle(CancelPurchaseOrderCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var order = await _unitOfWork.ReadRepository<PurchaseOrder>().AsQueryable()
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == request.Id && o.TenantId == tenantId, cancellationToken);

        if (order == null)
            return Result<PurchaseOrderDto>.Failure(Error.NotFound("PurchaseOrder", "Purchase order not found"));

        order.Cancel(request.Reason);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<PurchaseOrderDto>.Success(_mapper.Map<PurchaseOrderDto>(order));
    }
}

/// <summary>
/// Handler for DeletePurchaseOrderCommand
/// Uses IPurchaseUnitOfWork for consistent data access
/// </summary>
public class DeletePurchaseOrderHandler : IRequestHandler<DeletePurchaseOrderCommand, Result>
{
    private readonly IPurchaseUnitOfWork _unitOfWork;

    public DeletePurchaseOrderHandler(IPurchaseUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(DeletePurchaseOrderCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var order = await _unitOfWork.Repository<PurchaseOrder>().GetByIdAsync(request.Id, cancellationToken);

        if (order == null || order.TenantId != tenantId)
            return Result.Failure(Error.NotFound("PurchaseOrder", "Purchase order not found"));

        if (order.Status != PurchaseOrderStatus.Draft && order.Status != PurchaseOrderStatus.Cancelled)
            return Result.Failure(Error.Conflict("PurchaseOrder.Status", "Only draft or cancelled orders can be deleted"));

        _unitOfWork.Repository<PurchaseOrder>().Remove(order);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}

/// <summary>
/// Handler for GetPendingPurchaseOrdersQuery
/// Uses IPurchaseUnitOfWork for consistent data access
/// </summary>
public class GetPendingPurchaseOrdersHandler : IRequestHandler<GetPendingPurchaseOrdersQuery, Result<List<PurchaseOrderListDto>>>
{
    private readonly IPurchaseUnitOfWork _unitOfWork;

    public GetPendingPurchaseOrdersHandler(IPurchaseUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<List<PurchaseOrderListDto>>> Handle(GetPendingPurchaseOrdersQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var orders = await _unitOfWork.ReadRepository<PurchaseOrder>().AsQueryable()
            .Include(o => o.Items)
            .Where(o => o.TenantId == tenantId && o.Status == PurchaseOrderStatus.PendingApproval)
            .OrderBy(o => o.CreatedAt)
            .Select(o => new PurchaseOrderListDto
            {
                Id = o.Id,
                OrderNumber = o.OrderNumber,
                OrderDate = o.OrderDate,
                ExpectedDeliveryDate = o.ExpectedDeliveryDate,
                SupplierName = o.SupplierName,
                Status = o.Status.ToString(),
                Type = o.Type.ToString(),
                TotalAmount = o.TotalAmount,
                Currency = o.Currency,
                ItemCount = o.Items.Count,
                CreatedAt = o.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return Result<List<PurchaseOrderListDto>>.Success(orders);
    }
}
