using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Purchase.Application.DTOs;
using Stocker.Modules.Purchase.Application.Features.GoodsReceipts.Commands;
using Stocker.Modules.Purchase.Application.Features.GoodsReceipts.Queries;
using Stocker.Modules.Purchase.Domain.Entities;
using Stocker.Modules.Purchase.Infrastructure.Persistence;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Purchase.Application.Features.GoodsReceipts.Handlers;

public class CreateGoodsReceiptHandler : IRequestHandler<CreateGoodsReceiptCommand, Result<GoodsReceiptDto>>
{
    private readonly PurchaseDbContext _context;
    private readonly IMapper _mapper;
    private readonly ITenantService _tenantService;
    private readonly ICurrentUserService _currentUserService;

    public CreateGoodsReceiptHandler(
        PurchaseDbContext context,
        IMapper mapper,
        ITenantService tenantService,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _mapper = mapper;
        _tenantService = tenantService;
        _currentUserService = currentUserService;
    }

    public async Task<Result<GoodsReceiptDto>> Handle(CreateGoodsReceiptCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue)
            return Result<GoodsReceiptDto>.Failure(Error.Unauthorized("Tenant", "Tenant is required"));

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
            tenantId.Value,
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
                tenantId.Value
            );

            if (!string.IsNullOrEmpty(itemDto.BatchNumber) || itemDto.ExpiryDate.HasValue)
                item.SetBatchInfo(itemDto.BatchNumber, itemDto.ExpiryDate);

            if (itemDto.SerialNumbers != null && itemDto.SerialNumbers.Any())
                item.SetSerialNumbers(string.Join(",", itemDto.SerialNumbers));

            if (!string.IsNullOrEmpty(itemDto.StorageLocation))
                item.SetStorageLocation(itemDto.StorageLocation);

            receipt.AddItem(item);
        }

        _context.GoodsReceipts.Add(receipt);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<GoodsReceiptDto>.Success(_mapper.Map<GoodsReceiptDto>(receipt));
    }
}

public class GetGoodsReceiptByIdHandler : IRequestHandler<GetGoodsReceiptByIdQuery, Result<GoodsReceiptDto>>
{
    private readonly PurchaseDbContext _context;
    private readonly IMapper _mapper;

    public GetGoodsReceiptByIdHandler(PurchaseDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<GoodsReceiptDto>> Handle(GetGoodsReceiptByIdQuery request, CancellationToken cancellationToken)
    {
        var receipt = await _context.GoodsReceipts
            .Include(r => r.Items)
            .FirstOrDefaultAsync(r => r.Id == request.Id, cancellationToken);

        if (receipt == null)
            return Result<GoodsReceiptDto>.Failure(Error.NotFound("GoodsReceipt", "Goods receipt not found"));

        return Result<GoodsReceiptDto>.Success(_mapper.Map<GoodsReceiptDto>(receipt));
    }
}

public class GetGoodsReceiptsHandler : IRequestHandler<GetGoodsReceiptsQuery, Result<PagedResult<GoodsReceiptListDto>>>
{
    private readonly PurchaseDbContext _context;

    public GetGoodsReceiptsHandler(PurchaseDbContext context)
    {
        _context = context;
    }

    public async Task<Result<PagedResult<GoodsReceiptListDto>>> Handle(GetGoodsReceiptsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.GoodsReceipts
            .Include(r => r.Items)
            .AsQueryable();

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

public class PerformQualityCheckHandler : IRequestHandler<PerformQualityCheckCommand, Result<GoodsReceiptDto>>
{
    private readonly PurchaseDbContext _context;
    private readonly IMapper _mapper;
    private readonly ICurrentUserService _currentUserService;

    public PerformQualityCheckHandler(PurchaseDbContext context, IMapper mapper, ICurrentUserService currentUserService)
    {
        _context = context;
        _mapper = mapper;
        _currentUserService = currentUserService;
    }

    public async Task<Result<GoodsReceiptDto>> Handle(PerformQualityCheckCommand request, CancellationToken cancellationToken)
    {
        var receipt = await _context.GoodsReceipts
            .Include(r => r.Items)
            .FirstOrDefaultAsync(r => r.Id == request.Id, cancellationToken);

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
        await _context.SaveChangesAsync(cancellationToken);

        return Result<GoodsReceiptDto>.Success(_mapper.Map<GoodsReceiptDto>(receipt));
    }
}

public class CompleteGoodsReceiptHandler : IRequestHandler<CompleteGoodsReceiptCommand, Result<GoodsReceiptDto>>
{
    private readonly PurchaseDbContext _context;
    private readonly IMapper _mapper;

    public CompleteGoodsReceiptHandler(PurchaseDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<GoodsReceiptDto>> Handle(CompleteGoodsReceiptCommand request, CancellationToken cancellationToken)
    {
        var receipt = await _context.GoodsReceipts
            .Include(r => r.Items)
            .FirstOrDefaultAsync(r => r.Id == request.Id, cancellationToken);

        if (receipt == null)
            return Result<GoodsReceiptDto>.Failure(Error.NotFound("GoodsReceipt", "Goods receipt not found"));

        receipt.Complete();
        await _context.SaveChangesAsync(cancellationToken);

        return Result<GoodsReceiptDto>.Success(_mapper.Map<GoodsReceiptDto>(receipt));
    }
}

public class DeleteGoodsReceiptHandler : IRequestHandler<DeleteGoodsReceiptCommand, Result>
{
    private readonly PurchaseDbContext _context;

    public DeleteGoodsReceiptHandler(PurchaseDbContext context)
    {
        _context = context;
    }

    public async Task<Result> Handle(DeleteGoodsReceiptCommand request, CancellationToken cancellationToken)
    {
        var receipt = await _context.GoodsReceipts
            .FirstOrDefaultAsync(r => r.Id == request.Id, cancellationToken);

        if (receipt == null)
            return Result.Failure(Error.NotFound("GoodsReceipt", "Goods receipt not found"));

        if (receipt.Status != GoodsReceiptStatus.Draft)
            return Result.Failure(Error.Conflict("GoodsReceipt.Status", "Only draft receipts can be deleted"));

        _context.GoodsReceipts.Remove(receipt);
        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}

public class GetPendingQualityCheckHandler : IRequestHandler<GetPendingQualityCheckQuery, Result<List<GoodsReceiptListDto>>>
{
    private readonly PurchaseDbContext _context;

    public GetPendingQualityCheckHandler(PurchaseDbContext context)
    {
        _context = context;
    }

    public async Task<Result<List<GoodsReceiptListDto>>> Handle(GetPendingQualityCheckQuery request, CancellationToken cancellationToken)
    {
        var receipts = await _context.GoodsReceipts
            .Include(r => r.Items)
            .Where(r => r.RequiresQualityCheck && !r.QualityCheckCompleted && r.Status == GoodsReceiptStatus.Pending)
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
