using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.Units.Commands;

/// <summary>
/// Command to update an existing unit
/// </summary>
public class UpdateUnitCommand : IRequest<Result<UnitDto>>
{
    public Guid TenantId { get; set; }
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
        RuleFor(x => x.TenantId).NotEmpty().WithMessage("Kiracı kimliği gereklidir");
        RuleFor(x => x.UnitId).NotEmpty().WithMessage("Birim kimliği gereklidir");
        RuleFor(x => x.UnitData).NotNull().WithMessage("Birim bilgileri gereklidir");
        RuleFor(x => x.UnitData.Name).NotEmpty().WithMessage("Birim adı gereklidir").MaximumLength(100).WithMessage("Birim adı en fazla 100 karakter olabilir");
        RuleFor(x => x.UnitData.Symbol).MaximumLength(10).WithMessage("Sembol en fazla 10 karakter olabilir");
        RuleFor(x => x.UnitData.ConversionFactor).NotEmpty().WithMessage("Dönüşüm faktörü gereklidir");
    }
}

/// <summary>
/// Handler for UpdateUnitCommand
/// </summary>
public class UpdateUnitCommandHandler : IRequestHandler<UpdateUnitCommand, Result<UnitDto>>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public UpdateUnitCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<UnitDto>> Handle(UpdateUnitCommand request, CancellationToken cancellationToken)
    {
        var unit = await _unitOfWork.Units.GetByIdAsync(request.UnitId, cancellationToken);

        if (unit == null)
        {
            return Result<UnitDto>.Failure(new Error("Unit.NotFound", $"Birim bulunamadı (ID: {request.UnitId})", ErrorType.NotFound));
        }

        var data = request.UnitData;
        unit.UpdateUnit(data.Name, data.Symbol, null);

        if (!unit.IsBaseUnit && data.ConversionFactor != unit.ConversionFactor)
        {
            unit.SetConversionFactor(data.ConversionFactor);
        }

        await _unitOfWork.Units.UpdateAsync(unit, cancellationToken);
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
            CreatedAt = unit.CreatedDate,
            UpdatedAt = unit.UpdatedDate
        };

        return Result<UnitDto>.Success(dto);
    }
}
