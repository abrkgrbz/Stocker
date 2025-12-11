using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
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
        RuleFor(x => x.TenantId).NotEmpty();
        RuleFor(x => x.Id).GreaterThan(0);
    }
}

/// <summary>
/// Handler for DeleteShelfLifeCommand
/// </summary>
public class DeleteShelfLifeCommandHandler : IRequestHandler<DeleteShelfLifeCommand, Result<bool>>
{
    private readonly IShelfLifeRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteShelfLifeCommandHandler(IShelfLifeRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(DeleteShelfLifeCommand request, CancellationToken cancellationToken)
    {
        var entity = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (entity == null)
        {
            return Result<bool>.Failure(new Error("ShelfLife.NotFound", $"Shelf life configuration with ID {request.Id} not found", ErrorType.NotFound));
        }

        entity.Delete("system");
        await _repository.UpdateAsync(entity, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
