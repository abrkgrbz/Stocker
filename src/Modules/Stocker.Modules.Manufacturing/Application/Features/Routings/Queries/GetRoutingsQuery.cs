using MediatR;
using Stocker.Modules.Manufacturing.Application.DTOs;
using Stocker.Modules.Manufacturing.Domain.Entities;
using Stocker.Modules.Manufacturing.Interfaces;

namespace Stocker.Modules.Manufacturing.Application.Features.Routings.Queries;

public record GetRoutingsQuery(
    string? Status = null,
    int? ProductId = null,
    bool? ActiveOnly = null,
    bool? DefaultOnly = null) : IRequest<IReadOnlyList<RoutingListDto>>;

public class GetRoutingsQueryHandler : IRequestHandler<GetRoutingsQuery, IReadOnlyList<RoutingListDto>>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetRoutingsQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<RoutingListDto>> Handle(GetRoutingsQuery query, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        IReadOnlyList<Routing> routings;

        if (query.ProductId.HasValue)
        {
            routings = await _unitOfWork.Routings.GetVersionsAsync(tenantId, query.ProductId.Value, cancellationToken);
        }
        else
        {
            routings = await _unitOfWork.Routings.GetAllAsync(tenantId, cancellationToken);
        }
        
        // Apply ActiveOnly filter in memory if needed
        if (query.ActiveOnly == true)
        {
            routings = routings.Where(r => r.IsActive).ToList();
        }

        // Apply additional filters
        var filtered = routings.AsEnumerable();

        if (!string.IsNullOrEmpty(query.Status))
        {
            filtered = filtered.Where(r => r.Status.ToString() == query.Status);
        }

        if (query.DefaultOnly == true)
        {
            filtered = filtered.Where(r => r.IsDefault);
        }

        return filtered.Select(MapToListDto).ToList();
    }

    private static RoutingListDto MapToListDto(Routing entity) => new(
        entity.Id,
        entity.Code,
        entity.Name,
        entity.ProductId,
        null, // ProductCode
        null, // ProductName
        entity.Version,
        entity.Type.ToString(),
        entity.Status.ToString(),
        entity.Operations.Count,
        entity.TotalLeadTime,
        entity.IsDefault,
        entity.IsActive);
}
