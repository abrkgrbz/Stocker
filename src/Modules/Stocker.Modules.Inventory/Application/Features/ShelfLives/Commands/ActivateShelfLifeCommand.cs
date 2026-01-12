using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.ShelfLives.Commands;

/// <summary>
/// Command to activate a shelf life configuration
/// </summary>
public class ActivateShelfLifeCommand : IRequest<Result<bool>>
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
}

/// <summary>
/// Validator for ActivateShelfLifeCommand
/// </summary>
public class ActivateShelfLifeCommandValidator : AbstractValidator<ActivateShelfLifeCommand>
{
    public ActivateShelfLifeCommandValidator()
    {
        RuleFor(x => x.TenantId).NotEmpty().WithMessage("Kiracı kimliği gereklidir");
        RuleFor(x => x.Id).GreaterThan(0).WithMessage("Raf ömrü ID'si geçerli olmalıdır");
    }
}

/// <summary>
/// Handler for ActivateShelfLifeCommand
/// </summary>
public class ActivateShelfLifeCommandHandler : IRequestHandler<ActivateShelfLifeCommand, Result<bool>>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public ActivateShelfLifeCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(ActivateShelfLifeCommand request, CancellationToken cancellationToken)
    {
        var entity = await _unitOfWork.ShelfLives.GetByIdAsync(request.Id, cancellationToken);
        if (entity == null)
        {
            return Result<bool>.Failure(new Error("ShelfLife.NotFound", $"Raf ömrü yapılandırması bulunamadı (ID: {request.Id})", ErrorType.NotFound));
        }

        if (entity.IsActive)
        {
            return Result<bool>.Failure(new Error("ShelfLife.AlreadyActive", "Raf ömrü yapılandırması zaten aktif durumda", ErrorType.Validation));
        }

        entity.Activate();
        await _unitOfWork.ShelfLives.UpdateAsync(entity, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
