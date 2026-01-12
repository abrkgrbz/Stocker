using MediatR;
using Stocker.Modules.Manufacturing.Application.DTOs;
using Stocker.Modules.Manufacturing.Domain.Enums;
using Stocker.Modules.Manufacturing.Interfaces;

namespace Stocker.Modules.Manufacturing.Application.Features.SubcontractOrders.Queries;

public record GetSubcontractOrdersQuery(
    SubcontractOrderStatus? Status,
    int? SubcontractorId,
    int? ProductionOrderId,
    DateTime? StartDate,
    DateTime? EndDate) : IRequest<IReadOnlyList<SubcontractOrderListDto>>;

public class GetSubcontractOrdersQueryHandler : IRequestHandler<GetSubcontractOrdersQuery, IReadOnlyList<SubcontractOrderListDto>>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetSubcontractOrdersQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<SubcontractOrderListDto>> Handle(GetSubcontractOrdersQuery query, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        IReadOnlyList<Domain.Entities.SubcontractOrder> orders;

        if (query.Status.HasValue)
        {
            orders = await _unitOfWork.SubcontractOrders.GetByStatusAsync(query.Status.Value, cancellationToken);
        }
        else if (query.SubcontractorId.HasValue)
        {
            orders = await _unitOfWork.SubcontractOrders.GetBySubcontractorAsync(query.SubcontractorId.Value, cancellationToken);
        }
        else if (query.ProductionOrderId.HasValue)
        {
            orders = await _unitOfWork.SubcontractOrders.GetByProductionOrderAsync(query.ProductionOrderId.Value, cancellationToken);
        }
        else if (query.StartDate.HasValue && query.EndDate.HasValue)
        {
            orders = await _unitOfWork.SubcontractOrders.GetByDateRangeAsync(query.StartDate.Value, query.EndDate.Value, cancellationToken);
        }
        else
        {
            orders = await _unitOfWork.SubcontractOrders.GetAllAsync(cancellationToken);
        }

        return orders
            .Where(o => o.TenantId == tenantId)
            .Select(MapToListDto)
            .ToList();
    }

    private static SubcontractOrderListDto MapToListDto(Domain.Entities.SubcontractOrder entity) => new(
        entity.Id,
        entity.OrderNumber,
        entity.SubcontractorId,
        entity.SubcontractorName,
        entity.Status.ToString(),
        entity.ProductCode,
        entity.ProductName,
        entity.OrderQuantity,
        entity.Unit,
        entity.ExpectedDeliveryDate,
        entity.ShippedQuantity,
        entity.ReceivedQuantity,
        entity.GetCompletionPercent(),
        entity.ExpectedDeliveryDate < DateTime.UtcNow && entity.ReceivedQuantity < entity.OrderQuantity,
        entity.CreatedDate);
}

public record GetSubcontractOrderByIdQuery(int Id) : IRequest<SubcontractOrderDto?>;

public class GetSubcontractOrderByIdQueryHandler : IRequestHandler<GetSubcontractOrderByIdQuery, SubcontractOrderDto?>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetSubcontractOrderByIdQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<SubcontractOrderDto?> Handle(GetSubcontractOrderByIdQuery query, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var order = await _unitOfWork.SubcontractOrders.GetFullOrderAsync(query.Id, cancellationToken);

        if (order == null || order.TenantId != tenantId)
            return null;

        return MapToDto(order);
    }

    private static SubcontractOrderDto MapToDto(Domain.Entities.SubcontractOrder entity)
    {
        var shipments = entity.Shipments?.Select(s => new SubcontractShipmentDto(
            s.Id,
            s.SubcontractOrderId,
            s.Type.ToString(),
            s.Quantity,
            s.RejectedQuantity,
            s.ShipmentDate,
            s.BatchNumber,
            s.LotNumber,
            s.InvoiceNumber,
            s.DeliveryNoteNumber,
            s.Notes)).ToList();

        var materials = entity.Materials?.Select(m => new SubcontractMaterialDto(
            m.Id,
            m.SubcontractOrderId,
            m.MaterialId,
            m.MaterialCode,
            m.MaterialName,
            m.RequiredQuantity,
            m.ShippedQuantity,
            m.ReturnedQuantity,
            m.ConsumedQuantity,
            m.Unit)).ToList();

        return new SubcontractOrderDto(
            entity.Id,
            entity.OrderNumber,
            entity.SubcontractorId,
            entity.SubcontractorName,
            entity.ProductionOrderId,
            entity.ProductionOrder?.OrderNumber,
            entity.OperationId,
            entity.Operation?.Name,
            entity.Status.ToString(),
            entity.ProductId,
            entity.ProductCode,
            entity.ProductName,
            entity.OrderQuantity,
            entity.Unit,
            entity.OrderDate,
            entity.ExpectedDeliveryDate,
            entity.ActualDeliveryDate,
            entity.LeadTimeDays,
            entity.UnitCost,
            entity.TotalCost,
            entity.ActualCost,
            entity.CostCenterId,
            entity.ShippedQuantity,
            entity.ReceivedQuantity,
            entity.RejectedQuantity,
            entity.ScrapQuantity,
            entity.RequiresInspection,
            entity.QualityPlanId,
            entity.Notes,
            entity.CreatedBy,
            entity.ApprovedBy,
            entity.ApprovedDate,
            entity.IsActive,
            entity.CreatedDate,
            entity.GetCompletionPercent(),
            shipments,
            materials);
    }
}

public record GetPendingDeliveriesQuery() : IRequest<IReadOnlyList<SubcontractOrderListDto>>;

public class GetPendingDeliveriesQueryHandler : IRequestHandler<GetPendingDeliveriesQuery, IReadOnlyList<SubcontractOrderListDto>>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetPendingDeliveriesQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<SubcontractOrderListDto>> Handle(GetPendingDeliveriesQuery query, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var orders = await _unitOfWork.SubcontractOrders.GetPendingDeliveriesAsync(cancellationToken);

        return orders
            .Where(o => o.TenantId == tenantId)
            .Select(o => new SubcontractOrderListDto(
                o.Id,
                o.OrderNumber,
                o.SubcontractorId,
                o.SubcontractorName,
                o.Status.ToString(),
                o.ProductCode,
                o.ProductName,
                o.OrderQuantity,
                o.Unit,
                o.ExpectedDeliveryDate,
                o.ShippedQuantity,
                o.ReceivedQuantity,
                o.GetCompletionPercent(),
                false,
                o.CreatedDate))
            .ToList();
    }
}

public record GetOverdueOrdersQuery() : IRequest<IReadOnlyList<SubcontractOrderListDto>>;

public class GetOverdueOrdersQueryHandler : IRequestHandler<GetOverdueOrdersQuery, IReadOnlyList<SubcontractOrderListDto>>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetOverdueOrdersQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<SubcontractOrderListDto>> Handle(GetOverdueOrdersQuery query, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var orders = await _unitOfWork.SubcontractOrders.GetOverdueOrdersAsync(cancellationToken);

        return orders
            .Where(o => o.TenantId == tenantId)
            .Select(o => new SubcontractOrderListDto(
                o.Id,
                o.OrderNumber,
                o.SubcontractorId,
                o.SubcontractorName,
                o.Status.ToString(),
                o.ProductCode,
                o.ProductName,
                o.OrderQuantity,
                o.Unit,
                o.ExpectedDeliveryDate,
                o.ShippedQuantity,
                o.ReceivedQuantity,
                o.GetCompletionPercent(),
                true,
                o.CreatedDate))
            .ToList();
    }
}

public record GetSubcontractShipmentsQuery(int OrderId) : IRequest<IReadOnlyList<SubcontractShipmentDto>>;

public class GetSubcontractShipmentsQueryHandler : IRequestHandler<GetSubcontractShipmentsQuery, IReadOnlyList<SubcontractShipmentDto>>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetSubcontractShipmentsQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<SubcontractShipmentDto>> Handle(GetSubcontractShipmentsQuery query, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var order = await _unitOfWork.SubcontractOrders.GetByIdAsync(query.OrderId, cancellationToken);
        if (order == null || order.TenantId != tenantId)
            return new List<SubcontractShipmentDto>();

        var shipments = await _unitOfWork.SubcontractOrders.GetShipmentsByOrderAsync(query.OrderId, cancellationToken);

        return shipments.Select(s => new SubcontractShipmentDto(
            s.Id,
            s.SubcontractOrderId,
            s.Type.ToString(),
            s.Quantity,
            s.RejectedQuantity,
            s.ShipmentDate,
            s.BatchNumber,
            s.LotNumber,
            s.InvoiceNumber,
            s.DeliveryNoteNumber,
            s.Notes)).ToList();
    }
}

public record GetSubcontractMaterialsQuery(int OrderId) : IRequest<IReadOnlyList<SubcontractMaterialDto>>;

public class GetSubcontractMaterialsQueryHandler : IRequestHandler<GetSubcontractMaterialsQuery, IReadOnlyList<SubcontractMaterialDto>>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetSubcontractMaterialsQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<SubcontractMaterialDto>> Handle(GetSubcontractMaterialsQuery query, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var order = await _unitOfWork.SubcontractOrders.GetByIdAsync(query.OrderId, cancellationToken);
        if (order == null || order.TenantId != tenantId)
            return new List<SubcontractMaterialDto>();

        var materials = await _unitOfWork.SubcontractOrders.GetMaterialsByOrderAsync(query.OrderId, cancellationToken);

        return materials.Select(m => new SubcontractMaterialDto(
            m.Id,
            m.SubcontractOrderId,
            m.MaterialId,
            m.MaterialCode,
            m.MaterialName,
            m.RequiredQuantity,
            m.ShippedQuantity,
            m.ReturnedQuantity,
            m.ConsumedQuantity,
            m.Unit)).ToList();
    }
}
