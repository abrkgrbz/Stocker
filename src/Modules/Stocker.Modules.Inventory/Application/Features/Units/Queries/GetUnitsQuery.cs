using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.Units.Queries;

/// <summary>
/// Query to get all units
/// </summary>
public class GetUnitsQuery : IRequest<Result<List<UnitDto>>>
{
    public int TenantId { get; set; }
    public bool IncludeInactive { get; set; }
    public bool BaseUnitsOnly { get; set; }
}

/// <summary>
/// Handler for GetUnitsQuery
/// </summary>
public class GetUnitsQueryHandler : IRequestHandler<GetUnitsQuery, Result<List<UnitDto>>>
{
    private readonly IUnitRepository _unitRepository;

    public GetUnitsQueryHandler(IUnitRepository unitRepository)
    {
        _unitRepository = unitRepository;
    }

    public async Task<Result<List<UnitDto>>> Handle(GetUnitsQuery request, CancellationToken cancellationToken)
    {
        IReadOnlyList<Domain.Entities.Unit> units;

        if (request.BaseUnitsOnly)
        {
            units = await _unitRepository.GetBaseUnitsAsync(cancellationToken);
        }
        else if (request.IncludeInactive)
        {
            units = await _unitRepository.GetAllAsync(cancellationToken);
        }
        else
        {
            units = await _unitRepository.GetActiveUnitsAsync(cancellationToken);
        }

        var dtos = units.Select(u => new UnitDto
        {
            Id = u.Id,
            Code = u.Code,
            Name = u.Name,
            Symbol = u.Symbol,
            BaseUnitId = u.BaseUnitId,
            BaseUnitName = u.BaseUnit?.Name,
            ConversionFactor = u.ConversionFactor,
            IsActive = u.IsActive,
            CreatedAt = u.CreatedDate,
            UpdatedAt = u.UpdatedDate
        }).ToList();

        return Result<List<UnitDto>>.Success(dtos);
    }
}
