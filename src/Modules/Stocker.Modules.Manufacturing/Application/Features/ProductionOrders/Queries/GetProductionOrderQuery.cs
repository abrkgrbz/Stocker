using MediatR;
using Stocker.Modules.Manufacturing.Application.DTOs;
using Stocker.Modules.Manufacturing.Domain.Entities;
using Stocker.Modules.Manufacturing.Interfaces;

namespace Stocker.Modules.Manufacturing.Application.Features.ProductionOrders.Queries;

public record GetProductionOrderQuery(int Id) : IRequest<ProductionOrderDto>;

public class GetProductionOrderQueryHandler : IRequestHandler<GetProductionOrderQuery, ProductionOrderDto>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetProductionOrderQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ProductionOrderDto> Handle(GetProductionOrderQuery query, CancellationToken cancellationToken)
    {
        var order = await _unitOfWork.ProductionOrders.GetByIdWithDetailsAsync(query.Id, cancellationToken)
            ?? throw new KeyNotFoundException("Üretim emri bulunamadı.");

        return MapToDto(order);
    }

    private static ProductionOrderDto MapToDto(ProductionOrder entity) => new(
        entity.Id,
        entity.OrderNumber,
        entity.Type.ToString(),
        entity.Status.ToString(),
        entity.Priority.ToString(),
        entity.ProductId,
        null, // ProductCode
        null, // ProductName
        entity.BomId,
        null, // BomCode
        entity.RoutingId,
        null, // RoutingCode
        entity.PlannedQuantity,
        entity.CompletedQuantity,
        entity.ScrapQuantity,
        entity.ReworkQuantity,
        entity.CompletionPercent,
        entity.Unit,
        entity.OrderDate,
        entity.PlannedStartDate,
        entity.PlannedEndDate,
        entity.ActualStartDate,
        entity.ActualEndDate,
        entity.DueDate,
        entity.SourceWarehouseId,
        entity.TargetWarehouseId,
        entity.EstimatedMaterialCost,
        entity.EstimatedLaborCost,
        entity.EstimatedMachineCost,
        entity.EstimatedOverheadCost,
        entity.TotalEstimatedCost,
        entity.ActualMaterialCost,
        entity.ActualLaborCost,
        entity.ActualMachineCost,
        entity.ActualOverheadCost,
        entity.TotalActualCost,
        entity.SalesOrderId,
        entity.SalesOrderLineId,
        entity.ParentProductionOrderId,
        entity.ProjectId,
        entity.LotNumber,
        entity.PlannedBy,
        entity.ReleasedBy,
        entity.ReleasedDate,
        entity.ClosedBy,
        entity.ClosedDate,
        entity.Notes,
        entity.CreatedDate,
        entity.UpdatedDate,
        entity.Lines.Select(l => new ProductionOrderLineDto(
            l.Id,
            l.Sequence,
            l.ComponentProductId,
            null, // ProductCode
            null, // ProductName
            l.LineType.ToString(),
            l.RequiredQuantity,
            l.IssuedQuantity,
            l.ScrapQuantity,
            l.Unit,
            l.UnitCost ?? 0,
            l.TotalCost ?? 0,
            l.WarehouseId,
            null, // WarehouseName
            l.OperationId,
            l.IsBackflushed,
            l.Notes)).ToList(),
        entity.Operations.Select(o => new ProductionOperationListDto(
            o.Id,
            o.Sequence,
            o.OperationId,
            null, // OperationCode
            null, // OperationName
            o.Status.ToString(),
            o.WorkCenterId,
            null, // WorkCenterName
            o.MachineId,
            null, // MachineName
            o.PlannedQuantity,
            o.CompletedQuantity,
            o.PlannedStartDate,
            o.ActualStartDate)).ToList());
}
