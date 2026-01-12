using MediatR;
using Stocker.Modules.Manufacturing.Application.DTOs;
using Stocker.Modules.Manufacturing.Domain.Entities;
using Stocker.Modules.Manufacturing.Interfaces;

namespace Stocker.Modules.Manufacturing.Application.Features.BillOfMaterials.Queries;

public record GetBillOfMaterialsQuery(
    string? Status = null,
    int? ProductId = null,
    bool? ActiveOnly = null,
    bool? DefaultOnly = null) : IRequest<IReadOnlyList<BillOfMaterialListDto>>;

public class GetBillOfMaterialsQueryHandler : IRequestHandler<GetBillOfMaterialsQuery, IReadOnlyList<BillOfMaterialListDto>>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetBillOfMaterialsQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<BillOfMaterialListDto>> Handle(GetBillOfMaterialsQuery query, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        IReadOnlyList<BillOfMaterial> boms;

        if (query.ProductId.HasValue)
        {
            boms = await _unitOfWork.BillOfMaterials.GetVersionsAsync(tenantId, query.ProductId.Value, cancellationToken);
        }
        else
        {
            boms = await _unitOfWork.BillOfMaterials.GetAllAsync(tenantId, cancellationToken);
        }

        // Apply ActiveOnly filter in memory if needed
        if (query.ActiveOnly == true)
        {
            boms = boms.Where(b => b.IsActive).ToList();
        }

        // Apply additional filters
        var filtered = boms.AsEnumerable();

        if (!string.IsNullOrEmpty(query.Status))
        {
            filtered = filtered.Where(b => b.Status.ToString() == query.Status);
        }

        if (query.DefaultOnly == true)
        {
            filtered = filtered.Where(b => b.IsDefault);
        }

        return filtered.Select(MapToListDto).ToList();
    }

    private static BillOfMaterialListDto MapToListDto(BillOfMaterial entity) => new(
        entity.Id,
        entity.Code,
        entity.Name,
        entity.ProductId,
        null, // ProductCode - would need join
        null, // ProductName - would need join
        entity.Version,
        entity.Type.ToString(),
        entity.Status.ToString(),
        entity.TotalEstimatedCost,
        entity.EffectiveStartDate,
        entity.IsDefault,
        entity.IsActive);
}
