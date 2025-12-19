using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Purchase.Application.DTOs;
using Stocker.Modules.Purchase.Application.Features.GoodsReceipts.Commands;
using Stocker.Modules.Purchase.Application.Features.GoodsReceipts.Queries;
using Stocker.Modules.Purchase.Domain.Entities;
using Stocker.Modules.Purchase.Interfaces;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Purchase.Application.Features.GoodsReceipts.Handlers;

/// <summary>
/// Handler for CreateGoodsReceiptCommand
/// Uses IPurchaseUnitOfWork for consistent data access
/// </summary>
public class CreateGoodsReceiptHandler : IRequestHandler<CreateGoodsReceiptCommand, Result<GoodsReceiptDto>>
{
    private readonly IPurchaseUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ICurrentUserService _currentUserService;

    public CreateGoodsReceiptHandler(
        IPurchaseUnitOfWork unitOfWork,
        IMapper mapper,
        ICurrentUserService currentUserService)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _currentUserService = currentUserService;
    }

    public async Task<Result<GoodsReceiptDto>> Handle(CreateGoodsReceiptCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var receiptNumber = $"GR-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..8].ToUpper()}";
        var receivedById = _currentUserService.UserId ?? Guid.Empty;
        var receivedByName = _currentUserService.UserName;

        var receipt = GoodsReceipt.Create(
            receiptNumber,
            request.Dto.PurchaseOrderId ?? Guid.Empty,
            request.Dto.PurchaseOrderNumber,
            request.Dto.SupplierId,
            request.Dto.SupplierName,
            request.Dto.WarehouseId ?? Guid.Empty,
            request.Dto.WarehouseName,
            tenantId,
            request.Dto.Type
        );

        if (!string.IsNullOrEmpty(request.Dto.DeliveryNoteNumber) || request.Dto.DeliveryDate.HasValue)
            receipt.SetDeliveryInfo(
                request.Dto.DeliveryNoteNumber,
                request.Dto.DeliveryDate,
                request.Dto.VehiclePlate,
                request.Dto.DriverName
            );

        receipt.SetReceiver(receivedById, receivedByName);

        if (request.Dto.RequiresQualityCheck)
            receipt.SetRequiresQualityCheck(true);

        if (!string.IsNullOrEmpty(request.Dto.Notes))
            receipt.SetNotes(request.Dto.Notes);

        int lineNumber = 1;
        foreach (var itemDto in request.Dto.Items)
        {
            var item = GoodsReceiptItem.Create(
                receipt.Id,
                itemDto.PurchaseOrderItemId ?? Guid.Empty,
                itemDto.ProductId ?? Guid.Empty,
                itemDto.ProductCode,
                itemDto.ProductName,
                itemDto.Unit ?? "Adet",
                itemDto.OrderedQuantity,
                itemDto.ReceivedQuantity,
                itemDto.UnitPrice,
                lineNumber++,
                tenantId
            );

            if (!string.IsNullOrEmpty(itemDto.BatchNumber) || itemDto.ExpiryDate.HasValue)
                item.SetBatchInfo(itemDto.BatchNumber, itemDto.ExpiryDate);

            if (itemDto.SerialNumbers != null && itemDto.SerialNumbers.Any())
                item.SetSerialNumbers(string.Join(",", itemDto.SerialNumbers));

            if (!string.IsNullOrEmpty(itemDto.StorageLocation))
                item.SetStorageLocation(itemDto.StorageLocation);

            receipt.AddItem(item);
        }

        await _unitOfWork.Repository<GoodsReceipt>().AddAsync(receipt, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<GoodsReceiptDto>.Success(_mapper.Map<GoodsReceiptDto>(receipt));
    }
}

/// <summary>
/// Handler for GetGoodsReceiptByIdQuery
/// Uses IPurchaseUnitOfWork for consistent data access
/// </summary>
public class GetGoodsReceiptByIdHandler : IRequestHandler<GetGoodsReceiptByIdQuery, Result<GoodsReceiptDto>>
{
    private readonly IPurchaseUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public GetGoodsReceiptByIdHandler(IPurchaseUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<Result<GoodsReceiptDto>> Handle(GetGoodsReceiptByIdQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var receipt = await _unitOfWork.ReadRepository<GoodsReceipt>().AsQueryable()
            .Include(r => r.Items)
            .FirstOrDefaultAsync(r => r.Id == request.Id && r.TenantId == tenantId, cancellationToken);

        if (receipt == null)
            return Result<GoodsReceiptDto>.Failure(Error.NotFound("GoodsReceipt", "Goods receipt not found"));

        return Result<GoodsReceiptDto>.Success(_mapper.Map<GoodsReceiptDto>(receipt));
    }
}

/// <summary>
/// Handler for GetGoodsReceiptsQuery
/// Uses IPurchaseUnitOfWork for consistent data access
/// </summary>
public class GetGoodsReceiptsHandler : IRequestHandler<GetGoodsReceiptsQuery, Result<PagedResult<GoodsReceiptListDto>>>
{
    private readonly IPurchaseUnitOfWork _unitOfWork;

    public GetGoodsReceiptsHandler(IPurchaseUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PagedResult<GoodsReceiptListDto>>> Handle(GetGoodsReceiptsQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var query = _unitOfWork.ReadRepository<GoodsReceipt>().AsQueryable()
            .Include(r => r.Items)
            .Where(r => r.TenantId == tenantId);

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var searchTerm = request.SearchTerm.ToLower();
            query = query.Where(r =>
                r.ReceiptNumber.ToLower().Contains(searchTerm) ||
                (r.SupplierName != null && r.SupplierName.ToLower().Contains(searchTerm)) ||
                (r.PurchaseOrderNumber != null && r.PurchaseOrderNumber.ToLower().Contains(searchTerm)));
        }

        if (request.Status.HasValue)
            query = query.Where(r => r.Status == request.Status.Value);

        if (request.Type.HasValue)
            query = query.Where(r => r.Type == request.Type.Value);

        if (request.SupplierId.HasValue)
            query = query.Where(r => r.SupplierId == request.SupplierId.Value);

        if (request.WarehouseId.HasValue)
            query = query.Where(r => r.WarehouseId == request.WarehouseId.Value);

        if (request.PurchaseOrderId.HasValue)
            query = query.Where(r => r.PurchaseOrderId == request.PurchaseOrderId.Value);

        if (request.FromDate.HasValue)
            query = query.Where(r => r.ReceiptDate >= request.FromDate.Value);

        if (request.ToDate.HasValue)
            query = query.Where(r => r.ReceiptDate <= request.ToDate.Value);

        var totalCount = await query.CountAsync(cancellationToken);

        query = request.SortBy?.ToLower() switch
        {
            "receiptnumber" => request.SortDescending ? query.OrderByDescending(r => r.ReceiptNumber) : query.OrderBy(r => r.ReceiptNumber),
            "suppliername" => request.SortDescending ? query.OrderByDescending(r => r.SupplierName) : query.OrderBy(r => r.SupplierName),
            "status" => request.SortDescending ? query.OrderByDescending(r => r.Status) : query.OrderBy(r => r.Status),
            _ => request.SortDescending ? query.OrderByDescending(r => r.CreatedAt) : query.OrderBy(r => r.CreatedAt)
        };

        var items = await query
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(r => new GoodsReceiptListDto
            {
                Id = r.Id,
                ReceiptNumber = r.ReceiptNumber,
                ReceiptDate = r.ReceiptDate,
                PurchaseOrderNumber = r.PurchaseOrderNumber,
                SupplierName = r.SupplierName,
                WarehouseName = r.WarehouseName,
                Status = r.Status.ToString(),
                Type = r.Type.ToString(),
                ItemCount = r.Items.Count,
                RequiresQualityCheck = r.RequiresQualityCheck,
                CreatedAt = r.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return Result<PagedResult<GoodsReceiptListDto>>.Success(
            new PagedResult<GoodsReceiptListDto>(items, request.Page, request.PageSize, totalCount));
    }
}

/// <summary>
/// Handler for PerformQualityCheckCommand
/// Uses IPurchaseUnitOfWork for consistent data access
/// </summary>
public class PerformQualityCheckHandler : IRequestHandler<PerformQualityCheckCommand, Result<GoodsReceiptDto>>
{
    private readonly IPurchaseUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ICurrentUserService _currentUserService;

    public PerformQualityCheckHandler(IPurchaseUnitOfWork unitOfWork, IMapper mapper, ICurrentUserService currentUserService)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _currentUserService = currentUserService;
    }

    public async Task<Result<GoodsReceiptDto>> Handle(PerformQualityCheckCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var receipt = await _unitOfWork.ReadRepository<GoodsReceipt>().AsQueryable()
            .Include(r => r.Items)
            .FirstOrDefaultAsync(r => r.Id == request.Id && r.TenantId == tenantId, cancellationToken);

        if (receipt == null)
            return Result<GoodsReceiptDto>.Failure(Error.NotFound("GoodsReceipt", "Goods receipt not found"));

        var userId = _currentUserService.UserId ?? Guid.Empty;
        var userName = _currentUserService.UserName;

        foreach (var itemDto in request.Dto.Items)
        {
            var item = receipt.Items.FirstOrDefault(i => i.Id == itemDto.ItemId);
            if (item != null)
            {
                item.SetQuantities(itemDto.ReceivedQuantity, itemDto.AcceptedQuantity, itemDto.RejectedQuantity);
                if (itemDto.Condition != ItemCondition.Good)
                    item.SetCondition(itemDto.Condition, itemDto.RejectionReason);
            }
        }

        receipt.CompleteQualityCheck(userId, userName, request.Dto.QualityNotes);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<GoodsReceiptDto>.Success(_mapper.Map<GoodsReceiptDto>(receipt));
    }
}

/// <summary>
/// Handler for CompleteGoodsReceiptCommand
/// Uses IPurchaseUnitOfWork for consistent data access
/// </summary>
public class CompleteGoodsReceiptHandler : IRequestHandler<CompleteGoodsReceiptCommand, Result<GoodsReceiptDto>>
{
    private readonly IPurchaseUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public CompleteGoodsReceiptHandler(IPurchaseUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<Result<GoodsReceiptDto>> Handle(CompleteGoodsReceiptCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var receipt = await _unitOfWork.ReadRepository<GoodsReceipt>().AsQueryable()
            .Include(r => r.Items)
            .FirstOrDefaultAsync(r => r.Id == request.Id && r.TenantId == tenantId, cancellationToken);

        if (receipt == null)
            return Result<GoodsReceiptDto>.Failure(Error.NotFound("GoodsReceipt", "Goods receipt not found"));

        receipt.Complete();
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<GoodsReceiptDto>.Success(_mapper.Map<GoodsReceiptDto>(receipt));
    }
}

/// <summary>
/// Handler for DeleteGoodsReceiptCommand
/// Uses IPurchaseUnitOfWork for consistent data access
/// </summary>
public class DeleteGoodsReceiptHandler : IRequestHandler<DeleteGoodsReceiptCommand, Result>
{
    private readonly IPurchaseUnitOfWork _unitOfWork;

    public DeleteGoodsReceiptHandler(IPurchaseUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(DeleteGoodsReceiptCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var receipt = await _unitOfWork.Repository<GoodsReceipt>().GetByIdAsync(request.Id, cancellationToken);

        if (receipt == null || receipt.TenantId != tenantId)
            return Result.Failure(Error.NotFound("GoodsReceipt", "Goods receipt not found"));

        if (receipt.Status != GoodsReceiptStatus.Draft)
            return Result.Failure(Error.Conflict("GoodsReceipt.Status", "Only draft receipts can be deleted"));

        _unitOfWork.Repository<GoodsReceipt>().Remove(receipt);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}

/// <summary>
/// Handler for GetPendingQualityCheckQuery
/// Uses IPurchaseUnitOfWork for consistent data access
/// </summary>
public class GetPendingQualityCheckHandler : IRequestHandler<GetPendingQualityCheckQuery, Result<List<GoodsReceiptListDto>>>
{
    private readonly IPurchaseUnitOfWork _unitOfWork;

    public GetPendingQualityCheckHandler(IPurchaseUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<List<GoodsReceiptListDto>>> Handle(GetPendingQualityCheckQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var receipts = await _unitOfWork.ReadRepository<GoodsReceipt>().AsQueryable()
            .Include(r => r.Items)
            .Where(r => r.TenantId == tenantId && r.RequiresQualityCheck && !r.QualityCheckCompleted && r.Status == GoodsReceiptStatus.Pending)
            .OrderBy(r => r.ReceiptDate)
            .Select(r => new GoodsReceiptListDto
            {
                Id = r.Id,
                ReceiptNumber = r.ReceiptNumber,
                ReceiptDate = r.ReceiptDate,
                PurchaseOrderNumber = r.PurchaseOrderNumber,
                SupplierName = r.SupplierName,
                WarehouseName = r.WarehouseName,
                Status = r.Status.ToString(),
                Type = r.Type.ToString(),
                ItemCount = r.Items.Count,
                RequiresQualityCheck = r.RequiresQualityCheck,
                CreatedAt = r.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return Result<List<GoodsReceiptListDto>>.Success(receipts);
    }
}
