using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.Units.Commands;

/// <summary>
/// Command to update an existing unit
/// </summary>
public class UpdateUnitCommand : IRequest<Result<UnitDto>>
{
    public int TenantId { get; set; }
    public int UnitId { get; set; }
    public UpdateUnitDto UnitData { get; set; } = null!;
}

/// <summary>
/// Validator for UpdateUnitCommand
/// </summary>
public class UpdateUnitCommandValidator : AbstractValidator<UpdateUnitCommand>
{
    public UpdateUnitCommandValidator()
    {
        RuleFor(x => x.TenantId).GreaterThan(0);
        RuleFor(x => x.UnitId).GreaterThan(0);
        RuleFor(x => x.UnitData).NotNull();
        RuleFor(x => x.UnitData.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.UnitData.Symbol).MaximumLength(10);
        RuleFor(x => x.UnitData.ConversionFactor).GreaterThan(0);
    }
}

/// <summary>
/// Handler for UpdateUnitCommand
/// </summary>
public class UpdateUnitCommandHandler : IRequestHandler<UpdateUnitCommand, Result<UnitDto>>
{
    private readonly IUnitRepository _unitRepository;

    public UpdateUnitCommandHandler(IUnitRepository unitRepository)
    {
        _unitRepository = unitRepository;
    }

    public async Task<Result<UnitDto>> Handle(UpdateUnitCommand request, CancellationToken cancellationToken)
    {
        var unit = await _unitRepository.GetByIdAsync(request.UnitId, cancellationToken);

        if (unit == null)
        {
            return Result<UnitDto>.Failure(new Error("Unit.NotFound", $"Unit with ID {request.UnitId} not found", ErrorType.NotFound));
        }

        var data = request.UnitData;
        unit.UpdateUnit(data.Name, data.Symbol, null);

        if (!unit.IsBaseUnit && data.ConversionFactor != unit.ConversionFactor)
        {
            unit.SetConversionFactor(data.ConversionFactor);
        }

        await _unitRepository.UpdateAsync(unit, cancellationToken);

        var dto = new UnitDto
        {
            Id = unit.Id,
            Code = unit.Code,
            Name = unit.Name,
            Symbol = unit.Symbol,
            BaseUnitId = unit.BaseUnitId,
            ConversionFactor = unit.ConversionFactor,
            IsActive = unit.IsActive,
            CreatedAt = unit.CreatedDate,
            UpdatedAt = unit.UpdatedDate
        };

        return Result<UnitDto>.Success(dto);
    }
}
