using MediatR;
using Stocker.Modules.Manufacturing.Application.DTOs;
using Stocker.Modules.Manufacturing.Domain.Entities;
using Stocker.Modules.Manufacturing.Interfaces;

namespace Stocker.Modules.Manufacturing.Application.Features.BillOfMaterials.Queries;

public record GetBillOfMaterialQuery(int Id) : IRequest<BillOfMaterialDto>;

public class GetBillOfMaterialQueryHandler : IRequestHandler<GetBillOfMaterialQuery, BillOfMaterialDto>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetBillOfMaterialQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<BillOfMaterialDto> Handle(GetBillOfMaterialQuery query, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var bom = await _unitOfWork.BillOfMaterials.GetByIdWithLinesAsync(query.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"ID '{query.Id}' olan ürün reçetesi bulunamadı.");

        // Verify tenant access
        if (bom.TenantId != tenantId)
            throw new UnauthorizedAccessException("Bu kaynağa erişim yetkiniz bulunmamaktadır.");

        return MapToDto(bom);
    }

    private static BillOfMaterialDto MapToDto(BillOfMaterial entity) => new(
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
        entity.StandardYield,
        entity.ScrapRate,
        entity.EffectiveStartDate,
        entity.EffectiveEndDate,
        entity.EstimatedMaterialCost,
        entity.EstimatedLaborCost,
        entity.EstimatedOverheadCost,
        entity.TotalEstimatedCost,
        entity.DefaultRoutingId,
        entity.DefaultRouting?.Code,
        entity.IsDefault,
        entity.IsActive,
        entity.CreatedDate,
        entity.ApprovedBy,
        entity.ApprovalDate,
        entity.Lines.Select(MapLineToDto).ToList(),
        entity.CoProducts.Select(MapCoProductToDto).ToList());

    private static BomLineDto MapLineToDto(BomLine line) => new(
        line.Id,
        line.Sequence,
        line.ComponentProductId,
        null, // ComponentCode
        null, // ComponentName
        line.Type.ToString(),
        line.Quantity,
        line.Unit,
        line.ScrapRate,
        line.UnitCost,
        line.TotalCost,
        line.IsPhantom,
        line.OperationSequence,
        line.ConsumptionMethod.ToString(),
        line.ConsumptionTiming.ToString(),
        line.IsActive);

    private static BomCoProductDto MapCoProductToDto(BomCoProduct coProduct) => new(
        coProduct.Id,
        coProduct.ProductId,
        null, // ProductCode
        null, // ProductName
        coProduct.Type.ToString(),
        coProduct.Quantity,
        coProduct.Unit,
        coProduct.YieldPercent,
        coProduct.CostAllocationPercent,
        coProduct.CostAllocationMethod.ToString(),
        coProduct.UnitValue,
        coProduct.TotalValue,
        coProduct.IsActive);
}
