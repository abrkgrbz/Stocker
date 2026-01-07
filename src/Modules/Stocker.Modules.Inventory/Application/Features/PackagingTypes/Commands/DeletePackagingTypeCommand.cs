using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.PackagingTypes.Commands;

/// <summary>
/// Command to delete a packaging type
/// </summary>
public class DeletePackagingTypeCommand : IRequest<Result<bool>>
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
}

/// <summary>
/// Validator for DeletePackagingTypeCommand
/// </summary>
public class DeletePackagingTypeCommandValidator : AbstractValidator<DeletePackagingTypeCommand>
{
    public DeletePackagingTypeCommandValidator()
    {
        RuleFor(x => x.TenantId).NotEmpty();
        RuleFor(x => x.Id).GreaterThan(0);
    }
}

/// <summary>
/// Handler for DeletePackagingTypeCommand
/// </summary>
public class DeletePackagingTypeCommandHandler : IRequestHandler<DeletePackagingTypeCommand, Result<bool>>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public DeletePackagingTypeCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(DeletePackagingTypeCommand request, CancellationToken cancellationToken)
    {
        var entity = await _unitOfWork.PackagingTypes.GetByIdAsync(request.Id, cancellationToken);
        if (entity == null)
        {
            return Result<bool>.Failure(new Error("PackagingType.NotFound", $"Packaging type with ID {request.Id} not found", ErrorType.NotFound));
        }

        entity.Delete("system");
        await _unitOfWork.PackagingTypes.UpdateAsync(entity, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
