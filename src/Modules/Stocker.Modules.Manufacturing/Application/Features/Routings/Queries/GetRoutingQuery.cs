using MediatR;
using Stocker.Modules.Manufacturing.Application.DTOs;
using Stocker.Modules.Manufacturing.Domain.Entities;
using Stocker.Modules.Manufacturing.Interfaces;

namespace Stocker.Modules.Manufacturing.Application.Features.Routings.Queries;

public record GetRoutingQuery(int Id) : IRequest<RoutingDto>;

public class GetRoutingQueryHandler : IRequestHandler<GetRoutingQuery, RoutingDto>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetRoutingQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<RoutingDto> Handle(GetRoutingQuery query, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var routing = await _unitOfWork.Routings.GetByIdWithOperationsAsync(query.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"ID '{query.Id}' olan rota bulunamadı.");
        
        // Verify tenant access
        if (routing.TenantId != tenantId)
            throw new UnauthorizedAccessException("Bu kaynağa erişim yetkiniz bulunmamaktadır.");

        return MapToDto(routing);
    }

    private static RoutingDto MapToDto(Routing entity) => new(
        entity.Id,
        entity.Code,
        entity.Name,
        entity.ProductId,
        null, // ProductCode
        null, // ProductName
        entity.Version,
        entity.RevisionNumber,
        entity.Type.ToString(),
        entity.Status.ToString(),
        entity.BaseQuantity,
        entity.BaseUnit,
        entity.EffectiveStartDate,
        entity.EffectiveEndDate,
        entity.TotalSetupTime,
        entity.TotalRunTime,
        entity.TotalQueueTime,
        entity.TotalMoveTime,
        entity.TotalLeadTime,
        entity.EstimatedLaborCost,
        entity.EstimatedMachineCost,
        entity.EstimatedOverheadCost,
        entity.TotalEstimatedCost,
        entity.IsDefault,
        entity.IsActive,
        entity.CreatedDate,
        entity.ApprovedBy,
        entity.ApprovalDate,
        entity.Operations.Select(MapOperationToDto).ToList());

    private static OperationDto MapOperationToDto(Operation op) => new(
        op.Id,
        op.Sequence,
        op.Code,
        op.Name,
        op.Type.ToString(),
        op.WorkCenterId,
        op.WorkCenter?.Code,
        op.WorkCenter?.Name,
        op.MachineId,
        op.Machine?.Code,
        op.SetupTime,
        op.RunTime,
        op.QueueTime,
        op.MoveTime,
        op.SetupTime + op.RunTime + op.QueueTime + op.MoveTime,
        op.SetupCost,
        op.RunCost,
        op.MachineCost,
        op.OverheadCost,
        op.TotalCost,
        op.MinimumWorkers,
        op.MaximumWorkers,
        op.IsSubcontracted,
        op.SubcontractorId,
        op.IsMilestone,
        op.RequiresQualityCheck,
        op.IsActive);
}
