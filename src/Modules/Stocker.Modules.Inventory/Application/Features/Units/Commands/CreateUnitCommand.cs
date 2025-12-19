using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using InventoryUnit = Stocker.Modules.Inventory.Domain.Entities.Unit;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.Units.Commands;

/// <summary>
/// Command to create a new unit
/// </summary>
public class CreateUnitCommand : IRequest<Result<UnitDto>>
{
    public Guid TenantId { get; set; }
    public CreateUnitDto UnitData { get; set; } = null!;
}

/// <summary>
/// Validator for CreateUnitCommand
/// </summary>
public class CreateUnitCommandValidator : AbstractValidator<CreateUnitCommand>
{
    public CreateUnitCommandValidator()
    {
        RuleFor(x => x.TenantId).NotEmpty();
        RuleFor(x => x.UnitData).NotNull();
        RuleFor(x => x.UnitData.Code).NotEmpty().MaximumLength(20);
        RuleFor(x => x.UnitData.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.UnitData.Symbol).MaximumLength(10);
        RuleFor(x => x.UnitData.ConversionFactor).NotEmpty();
    }
}

/// <summary>
/// Handler for CreateUnitCommand
/// Uses IInventoryUnitOfWork to ensure repository and SaveChanges use the same DbContext instance
/// </summary>
public class CreateUnitCommandHandler : IRequestHandler<CreateUnitCommand, Result<UnitDto>>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public CreateUnitCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<UnitDto>> Handle(CreateUnitCommand request, CancellationToken cancellationToken)
    {
        var data = request.UnitData;

        // Check if unit with same code exists
        var existingUnit = await _unitOfWork.Units.GetByCodeAsync(data.Code, cancellationToken);
        if (existingUnit != null)
        {
            return Result<UnitDto>.Failure(new Error("Unit.DuplicateCode", $"Unit with code '{data.Code}' already exists", ErrorType.Conflict));
        }

        InventoryUnit unit;

        if (data.BaseUnitId.HasValue)
        {
            // Validate base unit exists
            var baseUnit = await _unitOfWork.Units.GetByIdAsync(data.BaseUnitId.Value, cancellationToken);
            if (baseUnit == null)
            {
                return Result<UnitDto>.Failure(new Error("Unit.BaseUnitNotFound", $"Base unit with ID {data.BaseUnitId} not found", ErrorType.NotFound));
            }

            unit = InventoryUnit.CreateDerivedUnit(data.Code, data.Name, data.BaseUnitId.Value, data.ConversionFactor, data.Symbol);
        }
        else
        {
            unit = new InventoryUnit(data.Code, data.Name, data.Symbol);
        }

        // Set tenant ID for multi-tenancy
        unit.SetTenantId(request.TenantId);

        await _unitOfWork.Units.AddAsync(unit, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = new UnitDto
        {
            Id = unit.Id,
            Code = unit.Code,
            Name = unit.Name,
            Symbol = unit.Symbol,
            BaseUnitId = unit.BaseUnitId,
            ConversionFactor = unit.ConversionFactor,
            IsActive = unit.IsActive,
            CreatedAt = unit.CreatedDate
        };

        return Result<UnitDto>.Success(dto);
    }
}
