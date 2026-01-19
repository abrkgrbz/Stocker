using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.ShelfLives.Commands;

/// <summary>
/// Command to delete a shelf life configuration
/// </summary>
public class DeleteShelfLifeCommand : IRequest<Result<bool>>
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
}

/// <summary>
/// Validator for DeleteShelfLifeCommand
/// </summary>
public class DeleteShelfLifeCommandValidator : AbstractValidator<DeleteShelfLifeCommand>
{
    public DeleteShelfLifeCommandValidator()
    {
        RuleFor(x => x.TenantId).NotEmpty().WithMessage("Kiracı kimliği gereklidir");
        RuleFor(x => x.Id).GreaterThan(0).WithMessage("Geçerli bir raf ömrü ID'si gereklidir");
    }
}

/// <summary>
/// Handler for DeleteShelfLifeCommand
/// </summary>
public class DeleteShelfLifeCommandHandler : IRequestHandler<DeleteShelfLifeCommand, Result<bool>>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public DeleteShelfLifeCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(DeleteShelfLifeCommand request, CancellationToken cancellationToken)
    {
        var entity = await _unitOfWork.ShelfLives.GetByIdAsync(request.Id, cancellationToken);
        if (entity == null)
        {
            return Result<bool>.Failure(new Error("ShelfLife.NotFound", $"Raf ömrü yapılandırması bulunamadı (ID: {request.Id})", ErrorType.NotFound));
        }

        entity.Delete("system");
        await _unitOfWork.ShelfLives.UpdateAsync(entity, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
