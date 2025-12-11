using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
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
    private readonly IPackagingTypeRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public DeletePackagingTypeCommandHandler(IPackagingTypeRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(DeletePackagingTypeCommand request, CancellationToken cancellationToken)
    {
        var entity = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (entity == null)
        {
            return Result<bool>.Failure(new Error("PackagingType.NotFound", $"Packaging type with ID {request.Id} not found", ErrorType.NotFound));
        }

        entity.Delete("system");
        await _repository.UpdateAsync(entity, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
