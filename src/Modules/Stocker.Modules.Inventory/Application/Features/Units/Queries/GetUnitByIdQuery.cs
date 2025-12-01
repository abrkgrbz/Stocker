using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.Units.Queries;

/// <summary>
/// Query to get a unit by ID
/// </summary>
public class GetUnitByIdQuery : IRequest<Result<UnitDto>>
{
    public int TenantId { get; set; }
    public int UnitId { get; set; }
}

/// <summary>
/// Handler for GetUnitByIdQuery
/// </summary>
public class GetUnitByIdQueryHandler : IRequestHandler<GetUnitByIdQuery, Result<UnitDto>>
{
    private readonly IUnitRepository _unitRepository;

    public GetUnitByIdQueryHandler(IUnitRepository unitRepository)
    {
        _unitRepository = unitRepository;
    }

    public async Task<Result<UnitDto>> Handle(GetUnitByIdQuery request, CancellationToken cancellationToken)
    {
        var unit = await _unitRepository.GetByIdAsync(request.UnitId, cancellationToken);

        if (unit == null)
        {
            return Result<UnitDto>.Failure(new Error("Unit.NotFound", $"Unit with ID {request.UnitId} not found", ErrorType.NotFound));
        }

        var derivedUnits = await _unitRepository.GetDerivedUnitsAsync(unit.Id, cancellationToken);

        var dto = new UnitDto
        {
            Id = unit.Id,
            Code = unit.Code,
            Name = unit.Name,
            Symbol = unit.Symbol,
            BaseUnitId = unit.BaseUnitId,
            BaseUnitName = unit.BaseUnit?.Name,
            ConversionFactor = unit.ConversionFactor,
            IsActive = unit.IsActive,
            CreatedAt = unit.CreatedDate,
            UpdatedAt = unit.UpdatedDate,
            DerivedUnits = derivedUnits.Select(d => new UnitDto
            {
                Id = d.Id,
                Code = d.Code,
                Name = d.Name,
                Symbol = d.Symbol,
                ConversionFactor = d.ConversionFactor,
                IsActive = d.IsActive
            }).ToList()
        };

        return Result<UnitDto>.Success(dto);
    }
}
