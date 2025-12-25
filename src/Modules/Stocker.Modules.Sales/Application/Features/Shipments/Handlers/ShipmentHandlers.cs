using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Application.Features.Shipments.Commands;
using Stocker.Modules.Sales.Application.Features.Shipments.Queries;
using Stocker.Modules.Sales.Domain.Entities;
using Stocker.Modules.Sales.Interfaces;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Application.Features.Shipments.Handlers;

#region Query Handlers

public class GetShipmentsHandler : IRequestHandler<GetShipmentsQuery, Result<PagedResult<ShipmentListDto>>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public GetShipmentsHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PagedResult<ShipmentListDto>>> Handle(GetShipmentsQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var query = _unitOfWork.ReadRepository<Shipment>().AsQueryable()
            .Include(s => s.Items)
            .Where(s => s.TenantId == tenantId);

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var searchTerm = request.SearchTerm.ToLower();
            query = query.Where(s =>
                s.ShipmentNumber.ToLower().Contains(searchTerm) ||
                s.SalesOrderNumber.ToLower().Contains(searchTerm) ||
                (s.CustomerName != null && s.CustomerName.ToLower().Contains(searchTerm)) ||
                (s.TrackingNumber != null && s.TrackingNumber.ToLower().Contains(searchTerm)));
        }

        if (request.Status.HasValue)
            query = query.Where(s => s.Status == request.Status.Value);

        if (request.SalesOrderId.HasValue)
            query = query.Where(s => s.SalesOrderId == request.SalesOrderId.Value);

        if (request.CustomerId.HasValue)
            query = query.Where(s => s.CustomerId == request.CustomerId.Value);

        if (request.CarrierId.HasValue)
            query = query.Where(s => s.CarrierId == request.CarrierId.Value);

        if (request.FromDate.HasValue)
            query = query.Where(s => s.ShipmentDate >= request.FromDate.Value);

        if (request.ToDate.HasValue)
            query = query.Where(s => s.ShipmentDate <= request.ToDate.Value);

        if (request.Priority.HasValue)
            query = query.Where(s => s.Priority == request.Priority.Value);

        if (request.ShipmentType.HasValue)
            query = query.Where(s => s.ShipmentType == request.ShipmentType.Value);

        if (request.IsDeliveryNoteCreated.HasValue)
            query = query.Where(s => s.IsDeliveryNoteCreated == request.IsDeliveryNoteCreated.Value);

        if (request.IsInvoiced.HasValue)
            query = query.Where(s => s.IsInvoiced == request.IsInvoiced.Value);

        var totalCount = await query.CountAsync(cancellationToken);

        query = request.SortBy?.ToLower() switch
        {
            "shipmentnumber" => request.SortDescending ? query.OrderByDescending(s => s.ShipmentNumber) : query.OrderBy(s => s.ShipmentNumber),
            "customername" => request.SortDescending ? query.OrderByDescending(s => s.CustomerName) : query.OrderBy(s => s.CustomerName),
            "expecteddeliverydate" => request.SortDescending ? query.OrderByDescending(s => s.ExpectedDeliveryDate) : query.OrderBy(s => s.ExpectedDeliveryDate),
            "status" => request.SortDescending ? query.OrderByDescending(s => s.Status) : query.OrderBy(s => s.Status),
            _ => request.SortDescending ? query.OrderByDescending(s => s.ShipmentDate) : query.OrderBy(s => s.ShipmentDate)
        };

        var shipments = await query
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        var items = shipments.Select(ShipmentListDto.FromEntity).ToList();

        return Result<PagedResult<ShipmentListDto>>.Success(
            new PagedResult<ShipmentListDto>(items, request.Page, request.PageSize, totalCount));
    }
}

public class GetShipmentByIdHandler : IRequestHandler<GetShipmentByIdQuery, Result<ShipmentDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public GetShipmentByIdHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<ShipmentDto>> Handle(GetShipmentByIdQuery request, CancellationToken cancellationToken)
    {
        var shipment = await _unitOfWork.Shipments.GetWithItemsAsync(request.Id, cancellationToken);

        if (shipment == null || shipment.TenantId != _unitOfWork.TenantId)
            return Result<ShipmentDto>.Failure(Error.NotFound("Shipment", "Sevkiyat bulunamadı."));

        return Result<ShipmentDto>.Success(ShipmentDto.FromEntity(shipment));
    }
}

public class GetShipmentByNumberHandler : IRequestHandler<GetShipmentByNumberQuery, Result<ShipmentDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public GetShipmentByNumberHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<ShipmentDto>> Handle(GetShipmentByNumberQuery request, CancellationToken cancellationToken)
    {
        var shipment = await _unitOfWork.Shipments.GetByShipmentNumberAsync(request.ShipmentNumber, cancellationToken);

        if (shipment == null || shipment.TenantId != _unitOfWork.TenantId)
            return Result<ShipmentDto>.Failure(Error.NotFound("Shipment", "Sevkiyat bulunamadı."));

        return Result<ShipmentDto>.Success(ShipmentDto.FromEntity(shipment));
    }
}

public class GetShipmentsByOrderHandler : IRequestHandler<GetShipmentsByOrderQuery, Result<IReadOnlyList<ShipmentListDto>>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public GetShipmentsByOrderHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<IReadOnlyList<ShipmentListDto>>> Handle(GetShipmentsByOrderQuery request, CancellationToken cancellationToken)
    {
        var shipments = await _unitOfWork.Shipments.GetByOrderIdAsync(request.SalesOrderId, cancellationToken);
        var items = shipments.Select(ShipmentListDto.FromEntity).ToList();

        return Result<IReadOnlyList<ShipmentListDto>>.Success(items);
    }
}

public class GetShipmentsByCustomerHandler : IRequestHandler<GetShipmentsByCustomerQuery, Result<PagedResult<ShipmentListDto>>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public GetShipmentsByCustomerHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PagedResult<ShipmentListDto>>> Handle(GetShipmentsByCustomerQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var query = _unitOfWork.ReadRepository<Shipment>().AsQueryable()
            .Include(s => s.Items)
            .Where(s => s.TenantId == tenantId && s.CustomerId == request.CustomerId);

        var totalCount = await query.CountAsync(cancellationToken);

        var shipments = await query
            .OrderByDescending(s => s.ShipmentDate)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        var items = shipments.Select(ShipmentListDto.FromEntity).ToList();

        return Result<PagedResult<ShipmentListDto>>.Success(
            new PagedResult<ShipmentListDto>(items, request.Page, request.PageSize, totalCount));
    }
}

public class GetPendingShipmentsHandler : IRequestHandler<GetPendingShipmentsQuery, Result<IReadOnlyList<ShipmentListDto>>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public GetPendingShipmentsHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<IReadOnlyList<ShipmentListDto>>> Handle(GetPendingShipmentsQuery request, CancellationToken cancellationToken)
    {
        var shipments = await _unitOfWork.Shipments.GetPendingShipmentsAsync(cancellationToken);
        var items = shipments.Select(ShipmentListDto.FromEntity).ToList();

        return Result<IReadOnlyList<ShipmentListDto>>.Success(items);
    }
}

public class GetShipmentsInTransitHandler : IRequestHandler<GetShipmentsInTransitQuery, Result<IReadOnlyList<ShipmentListDto>>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public GetShipmentsInTransitHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<IReadOnlyList<ShipmentListDto>>> Handle(GetShipmentsInTransitQuery request, CancellationToken cancellationToken)
    {
        var shipments = await _unitOfWork.Shipments.GetInTransitShipmentsAsync(cancellationToken);
        var items = shipments.Select(ShipmentListDto.FromEntity).ToList();

        return Result<IReadOnlyList<ShipmentListDto>>.Success(items);
    }
}

public class GetOverdueShipmentsHandler : IRequestHandler<GetOverdueShipmentsQuery, Result<IReadOnlyList<ShipmentListDto>>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public GetOverdueShipmentsHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<IReadOnlyList<ShipmentListDto>>> Handle(GetOverdueShipmentsQuery request, CancellationToken cancellationToken)
    {
        var shipments = await _unitOfWork.Shipments.GetOverdueShipmentsAsync(cancellationToken);
        var items = shipments.Select(ShipmentListDto.FromEntity).ToList();

        return Result<IReadOnlyList<ShipmentListDto>>.Success(items);
    }
}

public class GetShipmentStatisticsHandler : IRequestHandler<GetShipmentStatisticsQuery, Result<ShipmentStatisticsDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public GetShipmentStatisticsHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<ShipmentStatisticsDto>> Handle(GetShipmentStatisticsQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var query = _unitOfWork.ReadRepository<Shipment>().AsQueryable()
            .Where(s => s.TenantId == tenantId);

        if (request.FromDate.HasValue)
            query = query.Where(s => s.ShipmentDate >= request.FromDate.Value);

        if (request.ToDate.HasValue)
            query = query.Where(s => s.ShipmentDate <= request.ToDate.Value);

        var stats = await query
            .GroupBy(_ => 1)
            .Select(g => new ShipmentStatisticsDto
            {
                TotalShipments = g.Count(),
                DraftShipments = g.Count(s => s.Status == ShipmentStatus.Draft),
                PreparingShipments = g.Count(s => s.Status == ShipmentStatus.Preparing),
                ReadyShipments = g.Count(s => s.Status == ShipmentStatus.Ready),
                ShippedShipments = g.Count(s => s.Status == ShipmentStatus.Shipped),
                InTransitShipments = g.Count(s => s.Status == ShipmentStatus.InTransit),
                DeliveredShipments = g.Count(s => s.Status == ShipmentStatus.Delivered),
                ReturnedShipments = g.Count(s => s.Status == ShipmentStatus.Returned),
                CancelledShipments = g.Count(s => s.Status == ShipmentStatus.Cancelled),
                TotalShippingCost = g.Sum(s => s.ShippingCost)
            })
            .FirstOrDefaultAsync(cancellationToken);

        return Result<ShipmentStatisticsDto>.Success(stats ?? new ShipmentStatisticsDto());
    }
}

#endregion

#region Command Handlers

public class CreateShipmentHandler : IRequestHandler<CreateShipmentCommand, Result<ShipmentDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public CreateShipmentHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<ShipmentDto>> Handle(CreateShipmentCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        // Get the sales order to retrieve order number
        var order = await _unitOfWork.SalesOrders.GetByIdAsync(request.SalesOrderId, cancellationToken);
        if (order == null || order.TenantId != tenantId)
            return Result<ShipmentDto>.Failure(Error.NotFound("SalesOrder", "Sipariş bulunamadı."));

        var shipmentNumber = await _unitOfWork.Shipments.GenerateShipmentNumberAsync(cancellationToken);

        var shipmentResult = Shipment.Create(
            tenantId,
            shipmentNumber,
            request.SalesOrderId,
            order.OrderNumber,
            request.ShipmentDate,
            request.ShippingAddress,
            request.ShipmentType);

        if (!shipmentResult.IsSuccess)
            return Result<ShipmentDto>.Failure(shipmentResult.Error);

        var shipment = shipmentResult.Value!;

        // Set customer info from order
        if (order.CustomerId.HasValue)
            shipment.SetCustomer(order.CustomerId.Value, order.CustomerName);

        if (!string.IsNullOrWhiteSpace(request.RecipientName))
            shipment.SetRecipient(request.RecipientName, request.RecipientPhone);

        if (request.ExpectedDeliveryDate.HasValue)
            shipment.SetExpectedDeliveryDate(request.ExpectedDeliveryDate.Value);

        if (request.CarrierId.HasValue)
            shipment.SetCarrier(request.CarrierId, request.CarrierName);

        if (!string.IsNullOrWhiteSpace(request.Notes))
            shipment.SetNotes(request.Notes);

        if (!string.IsNullOrWhiteSpace(request.SpecialInstructions))
            shipment.SetSpecialInstructions(request.SpecialInstructions);

        shipment.SetPriority(request.Priority);

        // Add items
        foreach (var item in request.Items)
        {
            shipment.AddItem(
                item.SalesOrderItemId,
                item.ProductId,
                item.ProductCode,
                item.ProductName,
                item.Quantity,
                item.Unit,
                item.UnitWeight);
        }

        await _unitOfWork.Repository<Shipment>().AddAsync(shipment, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<ShipmentDto>.Success(ShipmentDto.FromEntity(shipment));
    }
}

public class CreateShipmentFromOrderHandler : IRequestHandler<CreateShipmentFromOrderCommand, Result<ShipmentDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public CreateShipmentFromOrderHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<ShipmentDto>> Handle(CreateShipmentFromOrderCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var order = await _unitOfWork.SalesOrders.GetWithItemsAsync(request.SalesOrderId, cancellationToken);
        if (order == null || order.TenantId != tenantId)
            return Result<ShipmentDto>.Failure(Error.NotFound("SalesOrder", "Sipariş bulunamadı."));

        var shipmentResult = Shipment.CreateFromOrder(
            tenantId,
            await _unitOfWork.Shipments.GenerateShipmentNumberAsync(cancellationToken),
            order,
            request.ShipmentDate);

        if (!shipmentResult.IsSuccess)
            return Result<ShipmentDto>.Failure(shipmentResult.Error);

        var shipment = shipmentResult.Value!;

        // Add all items from order if requested
        if (request.IncludeAllItems)
        {
            foreach (var item in order.Items.Where(i => i.ProductId.HasValue))
            {
                shipment.AddItem(
                    item.Id,
                    item.ProductId!.Value,
                    item.ProductCode,
                    item.ProductName,
                    item.Quantity,
                    item.Unit);
            }
        }

        await _unitOfWork.Repository<Shipment>().AddAsync(shipment, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<ShipmentDto>.Success(ShipmentDto.FromEntity(shipment));
    }
}

public class UpdateShipmentHandler : IRequestHandler<UpdateShipmentCommand, Result<ShipmentDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public UpdateShipmentHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<ShipmentDto>> Handle(UpdateShipmentCommand request, CancellationToken cancellationToken)
    {
        var shipment = await _unitOfWork.Shipments.GetWithItemsAsync(request.Id, cancellationToken);

        if (shipment == null || shipment.TenantId != _unitOfWork.TenantId)
            return Result<ShipmentDto>.Failure(Error.NotFound("Shipment", "Sevkiyat bulunamadı."));

        if (!string.IsNullOrWhiteSpace(request.RecipientName) || !string.IsNullOrWhiteSpace(request.RecipientPhone))
            shipment.SetRecipient(request.RecipientName, request.RecipientPhone);

        if (request.ExpectedDeliveryDate.HasValue)
            shipment.SetExpectedDeliveryDate(request.ExpectedDeliveryDate.Value);

        shipment.SetShippingAddress(
            request.ShippingAddress,
            request.ShippingDistrict,
            request.ShippingCity,
            null,
            null);

        if (!string.IsNullOrWhiteSpace(request.Notes))
            shipment.SetNotes(request.Notes);

        if (!string.IsNullOrWhiteSpace(request.SpecialInstructions))
            shipment.SetSpecialInstructions(request.SpecialInstructions);

        shipment.SetPriority(request.Priority);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<ShipmentDto>.Success(ShipmentDto.FromEntity(shipment));
    }
}

public class AddShipmentItemHandler : IRequestHandler<AddShipmentItemCommand, Result<ShipmentDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public AddShipmentItemHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<ShipmentDto>> Handle(AddShipmentItemCommand request, CancellationToken cancellationToken)
    {
        var shipment = await _unitOfWork.Shipments.GetWithItemsAsync(request.ShipmentId, cancellationToken);

        if (shipment == null || shipment.TenantId != _unitOfWork.TenantId)
            return Result<ShipmentDto>.Failure(Error.NotFound("Shipment", "Sevkiyat bulunamadı."));

        var result = shipment.AddItem(
            request.SalesOrderItemId,
            request.ProductId,
            request.ProductCode,
            request.ProductName,
            request.Quantity,
            request.Unit,
            request.UnitWeight);

        if (!result.IsSuccess)
            return Result<ShipmentDto>.Failure(result.Error);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<ShipmentDto>.Success(ShipmentDto.FromEntity(shipment));
    }
}

public class SetCarrierHandler : IRequestHandler<SetCarrierCommand, Result<ShipmentDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public SetCarrierHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<ShipmentDto>> Handle(SetCarrierCommand request, CancellationToken cancellationToken)
    {
        var shipment = await _unitOfWork.Shipments.GetWithItemsAsync(request.Id, cancellationToken);

        if (shipment == null || shipment.TenantId != _unitOfWork.TenantId)
            return Result<ShipmentDto>.Failure(Error.NotFound("Shipment", "Sevkiyat bulunamadı."));

        shipment.SetCarrier(request.CarrierId, request.CarrierName, request.TrackingNumber);

        if (!string.IsNullOrWhiteSpace(request.TrackingUrl))
            shipment.SetTrackingUrl(request.TrackingUrl);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<ShipmentDto>.Success(ShipmentDto.FromEntity(shipment));
    }
}

public class SetVehicleInfoHandler : IRequestHandler<SetVehicleInfoCommand, Result<ShipmentDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public SetVehicleInfoHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<ShipmentDto>> Handle(SetVehicleInfoCommand request, CancellationToken cancellationToken)
    {
        var shipment = await _unitOfWork.Shipments.GetWithItemsAsync(request.Id, cancellationToken);

        if (shipment == null || shipment.TenantId != _unitOfWork.TenantId)
            return Result<ShipmentDto>.Failure(Error.NotFound("Shipment", "Sevkiyat bulunamadı."));

        shipment.SetVehicleInfo(request.VehiclePlate, request.DriverName, request.DriverPhone);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<ShipmentDto>.Success(ShipmentDto.FromEntity(shipment));
    }
}

public class SetShippingCostHandler : IRequestHandler<SetShippingCostCommand, Result<ShipmentDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public SetShippingCostHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<ShipmentDto>> Handle(SetShippingCostCommand request, CancellationToken cancellationToken)
    {
        var shipment = await _unitOfWork.Shipments.GetWithItemsAsync(request.Id, cancellationToken);

        if (shipment == null || shipment.TenantId != _unitOfWork.TenantId)
            return Result<ShipmentDto>.Failure(Error.NotFound("Shipment", "Sevkiyat bulunamadı."));

        shipment.SetShippingCost(request.ShippingCost, request.InsuranceAmount, request.CustomerShippingFee);
        shipment.SetFreeShipping(request.IsFreeShipping);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<ShipmentDto>.Success(ShipmentDto.FromEntity(shipment));
    }
}

public class StartPreparingShipmentHandler : IRequestHandler<StartPreparingShipmentCommand, Result<ShipmentDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public StartPreparingShipmentHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<ShipmentDto>> Handle(StartPreparingShipmentCommand request, CancellationToken cancellationToken)
    {
        var shipment = await _unitOfWork.Shipments.GetWithItemsAsync(request.Id, cancellationToken);

        if (shipment == null || shipment.TenantId != _unitOfWork.TenantId)
            return Result<ShipmentDto>.Failure(Error.NotFound("Shipment", "Sevkiyat bulunamadı."));

        var result = shipment.StartPreparing();
        if (!result.IsSuccess)
            return Result<ShipmentDto>.Failure(result.Error);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<ShipmentDto>.Success(ShipmentDto.FromEntity(shipment));
    }
}

public class MarkShipmentReadyHandler : IRequestHandler<MarkShipmentReadyCommand, Result<ShipmentDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public MarkShipmentReadyHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<ShipmentDto>> Handle(MarkShipmentReadyCommand request, CancellationToken cancellationToken)
    {
        var shipment = await _unitOfWork.Shipments.GetWithItemsAsync(request.Id, cancellationToken);

        if (shipment == null || shipment.TenantId != _unitOfWork.TenantId)
            return Result<ShipmentDto>.Failure(Error.NotFound("Shipment", "Sevkiyat bulunamadı."));

        var result = shipment.MarkAsReady();
        if (!result.IsSuccess)
            return Result<ShipmentDto>.Failure(result.Error);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<ShipmentDto>.Success(ShipmentDto.FromEntity(shipment));
    }
}

public class ShipHandler : IRequestHandler<ShipCommand, Result<ShipmentDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public ShipHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<ShipmentDto>> Handle(ShipCommand request, CancellationToken cancellationToken)
    {
        var shipment = await _unitOfWork.Shipments.GetWithItemsAsync(request.Id, cancellationToken);

        if (shipment == null || shipment.TenantId != _unitOfWork.TenantId)
            return Result<ShipmentDto>.Failure(Error.NotFound("Shipment", "Sevkiyat bulunamadı."));

        var result = shipment.Ship(request.TrackingNumber);
        if (!result.IsSuccess)
            return Result<ShipmentDto>.Failure(result.Error);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<ShipmentDto>.Success(ShipmentDto.FromEntity(shipment));
    }
}

public class MarkInTransitHandler : IRequestHandler<MarkInTransitCommand, Result<ShipmentDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public MarkInTransitHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<ShipmentDto>> Handle(MarkInTransitCommand request, CancellationToken cancellationToken)
    {
        var shipment = await _unitOfWork.Shipments.GetWithItemsAsync(request.Id, cancellationToken);

        if (shipment == null || shipment.TenantId != _unitOfWork.TenantId)
            return Result<ShipmentDto>.Failure(Error.NotFound("Shipment", "Sevkiyat bulunamadı."));

        var result = shipment.MarkAsInTransit();
        if (!result.IsSuccess)
            return Result<ShipmentDto>.Failure(result.Error);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<ShipmentDto>.Success(ShipmentDto.FromEntity(shipment));
    }
}

public class DeliverShipmentHandler : IRequestHandler<DeliverShipmentCommand, Result<ShipmentDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public DeliverShipmentHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<ShipmentDto>> Handle(DeliverShipmentCommand request, CancellationToken cancellationToken)
    {
        var shipment = await _unitOfWork.Shipments.GetWithItemsAsync(request.Id, cancellationToken);

        if (shipment == null || shipment.TenantId != _unitOfWork.TenantId)
            return Result<ShipmentDto>.Failure(Error.NotFound("Shipment", "Sevkiyat bulunamadı."));

        var result = shipment.Deliver(request.ReceivedBy, request.Notes);
        if (!result.IsSuccess)
            return Result<ShipmentDto>.Failure(result.Error);

        if (!string.IsNullOrWhiteSpace(request.ProofOfDelivery))
            shipment.SetProofOfDelivery(request.ProofOfDelivery);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<ShipmentDto>.Success(ShipmentDto.FromEntity(shipment));
    }
}

public class ReturnShipmentHandler : IRequestHandler<ReturnShipmentCommand, Result<ShipmentDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public ReturnShipmentHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<ShipmentDto>> Handle(ReturnShipmentCommand request, CancellationToken cancellationToken)
    {
        var shipment = await _unitOfWork.Shipments.GetWithItemsAsync(request.Id, cancellationToken);

        if (shipment == null || shipment.TenantId != _unitOfWork.TenantId)
            return Result<ShipmentDto>.Failure(Error.NotFound("Shipment", "Sevkiyat bulunamadı."));

        var result = shipment.MarkAsReturned(request.Reason);
        if (!result.IsSuccess)
            return Result<ShipmentDto>.Failure(result.Error);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<ShipmentDto>.Success(ShipmentDto.FromEntity(shipment));
    }
}

public class CancelShipmentHandler : IRequestHandler<CancelShipmentCommand, Result<ShipmentDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public CancelShipmentHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<ShipmentDto>> Handle(CancelShipmentCommand request, CancellationToken cancellationToken)
    {
        var shipment = await _unitOfWork.Shipments.GetWithItemsAsync(request.Id, cancellationToken);

        if (shipment == null || shipment.TenantId != _unitOfWork.TenantId)
            return Result<ShipmentDto>.Failure(Error.NotFound("Shipment", "Sevkiyat bulunamadı."));

        var result = shipment.Cancel(request.Reason);
        if (!result.IsSuccess)
            return Result<ShipmentDto>.Failure(result.Error);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<ShipmentDto>.Success(ShipmentDto.FromEntity(shipment));
    }
}

public class LinkDeliveryNoteHandler : IRequestHandler<LinkDeliveryNoteCommand, Result<ShipmentDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public LinkDeliveryNoteHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<ShipmentDto>> Handle(LinkDeliveryNoteCommand request, CancellationToken cancellationToken)
    {
        var shipment = await _unitOfWork.Shipments.GetWithItemsAsync(request.ShipmentId, cancellationToken);

        if (shipment == null || shipment.TenantId != _unitOfWork.TenantId)
            return Result<ShipmentDto>.Failure(Error.NotFound("Shipment", "Sevkiyat bulunamadı."));

        shipment.LinkDeliveryNote(request.DeliveryNoteId);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<ShipmentDto>.Success(ShipmentDto.FromEntity(shipment));
    }
}

public class LinkInvoiceToShipmentHandler : IRequestHandler<LinkInvoiceToShipmentCommand, Result<ShipmentDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public LinkInvoiceToShipmentHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<ShipmentDto>> Handle(LinkInvoiceToShipmentCommand request, CancellationToken cancellationToken)
    {
        var shipment = await _unitOfWork.Shipments.GetWithItemsAsync(request.ShipmentId, cancellationToken);

        if (shipment == null || shipment.TenantId != _unitOfWork.TenantId)
            return Result<ShipmentDto>.Failure(Error.NotFound("Shipment", "Sevkiyat bulunamadı."));

        shipment.LinkInvoice(request.InvoiceId);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<ShipmentDto>.Success(ShipmentDto.FromEntity(shipment));
    }
}

public class DeleteShipmentHandler : IRequestHandler<DeleteShipmentCommand, Result>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public DeleteShipmentHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(DeleteShipmentCommand request, CancellationToken cancellationToken)
    {
        var shipment = await _unitOfWork.Shipments.GetWithItemsAsync(request.Id, cancellationToken);

        if (shipment == null || shipment.TenantId != _unitOfWork.TenantId)
            return Result.Failure(Error.NotFound("Shipment", "Sevkiyat bulunamadı."));

        if (shipment.Status != ShipmentStatus.Draft && shipment.Status != ShipmentStatus.Cancelled)
            return Result.Failure(Error.Conflict("Shipment", "Sadece taslak veya iptal edilmiş sevkiyat silinebilir."));

        _unitOfWork.Repository<Shipment>().Remove(shipment);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}

#endregion
