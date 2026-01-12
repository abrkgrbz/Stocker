using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.Units.Commands;

/// <summary>
/// Command to delete a unit
/// </summary>
public class DeleteUnitCommand : IRequest<Result<bool>>
{
    public Guid TenantId { get; set; }
    public int UnitId { get; set; }
}

/// <summary>
/// Validator for DeleteUnitCommand
/// </summary>
public class DeleteUnitCommandValidator : AbstractValidator<DeleteUnitCommand>
{
    public DeleteUnitCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Kiracı kimliği gereklidir");

        RuleFor(x => x.UnitId)
            .GreaterThan(0).WithMessage("Birim kimliği 0'dan büyük olmalıdır");
    }
}

/// <summary>
/// Handler for DeleteUnitCommand
/// </summary>
public class DeleteUnitCommandHandler : IRequestHandler<DeleteUnitCommand, Result<bool>>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public DeleteUnitCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(DeleteUnitCommand request, CancellationToken cancellationToken)
    {
        var unit = await _unitOfWork.Units.GetByIdAsync(request.UnitId, cancellationToken);

        if (unit == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("Unit", $"Birim bulunamadı (ID: {request.UnitId})"));
        }

        // Verify tenant ownership
        if (unit.TenantId != request.TenantId)
        {
            return Result<bool>.Failure(
                Error.NotFound("Unit", $"Birim bulunamadı (ID: {request.UnitId})"));
        }

        // Check if unit has products
        if (unit.Products != null && unit.Products.Count > 0)
        {
            return Result<bool>.Failure(
                Error.Validation("Unit.HasProducts", "Bu birime ait ürünler bulunmaktadır. Önce ürünlerin birimini değiştirin."));
        }

        // Check if unit is a base unit with derived units
        var derivedUnits = await _unitOfWork.Units.GetDerivedUnitsAsync(request.UnitId, cancellationToken);
        if (derivedUnits.Count > 0)
        {
            return Result<bool>.Failure(
                Error.Validation("Unit.HasDerivedUnits", "Bu birimden türetilmiş birimler bulunmaktadır. Önce türetilmiş birimleri silin."));
        }

        // Soft delete
        unit.Delete("system");
        await _unitOfWork.Units.UpdateAsync(unit, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
