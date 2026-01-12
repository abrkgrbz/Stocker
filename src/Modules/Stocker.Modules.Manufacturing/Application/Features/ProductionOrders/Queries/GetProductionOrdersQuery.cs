using MediatR;
using Stocker.Modules.Manufacturing.Application.DTOs;
using Stocker.Modules.Manufacturing.Domain.Entities;
using Stocker.Modules.Manufacturing.Interfaces;

namespace Stocker.Modules.Manufacturing.Application.Features.ProductionOrders.Queries;

public record GetProductionOrdersQuery(
    string? Status = null,
    int? ProductId = null,
    DateTime? StartDate = null,
    DateTime? EndDate = null,
    bool? ActiveOnly = null,
    bool? OverdueOnly = null) : IRequest<IReadOnlyList<ProductionOrderListDto>>;

public class GetProductionOrdersQueryHandler : IRequestHandler<GetProductionOrdersQuery, IReadOnlyList<ProductionOrderListDto>>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetProductionOrdersQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<ProductionOrderListDto>> Handle(GetProductionOrdersQuery query, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        IReadOnlyList<ProductionOrder> orders;

        if (query.ActiveOnly == true)
        {
            orders = await _unitOfWork.ProductionOrders.GetActiveAsync(tenantId, cancellationToken);
        }
        else if (query.OverdueOnly == true)
        {
            orders = await _unitOfWork.ProductionOrders.GetOverdueAsync(tenantId, cancellationToken);
        }
        else if (!string.IsNullOrEmpty(query.Status))
        {
            orders = await _unitOfWork.ProductionOrders.GetByStatusAsync(tenantId, query.Status, cancellationToken);
        }
        else if (query.ProductId.HasValue)
        {
            orders = await _unitOfWork.ProductionOrders.GetByProductAsync(tenantId, query.ProductId.Value, cancellationToken);
        }
        else if (query.StartDate.HasValue && query.EndDate.HasValue)
        {
            orders = await _unitOfWork.ProductionOrders.GetByDateRangeAsync(tenantId, query.StartDate.Value, query.EndDate.Value, cancellationToken);
        }
        else
        {
            orders = await _unitOfWork.ProductionOrders.GetAllAsync(tenantId, cancellationToken);
        }

        return orders.Select(MapToListDto).ToList();
    }

    private static ProductionOrderListDto MapToListDto(ProductionOrder entity) => new(
        entity.Id,
        entity.OrderNumber,
        entity.Type.ToString(),
        entity.Status.ToString(),
        entity.Priority.ToString(),
        entity.ProductId,
        null, // ProductCode
        null, // ProductName
        entity.PlannedQuantity,
        entity.CompletedQuantity,
        entity.CompletionPercent,
        entity.PlannedStartDate,
        entity.PlannedEndDate,
        entity.ActualStartDate,
        entity.DueDate);
}
