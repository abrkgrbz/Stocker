using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.BarcodeDefinitions.Commands;

/// <summary>
/// Command to delete a barcode definition
/// </summary>
public class DeleteBarcodeDefinitionCommand : IRequest<Result<bool>>
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
}

/// <summary>
/// Validator for DeleteBarcodeDefinitionCommand
/// </summary>
public class DeleteBarcodeDefinitionCommandValidator : AbstractValidator<DeleteBarcodeDefinitionCommand>
{
    public DeleteBarcodeDefinitionCommandValidator()
    {
        RuleFor(x => x.TenantId).NotEmpty();
        RuleFor(x => x.Id).GreaterThan(0);
    }
}

/// <summary>
/// Handler for DeleteBarcodeDefinitionCommand
/// </summary>
public class DeleteBarcodeDefinitionCommandHandler : IRequestHandler<DeleteBarcodeDefinitionCommand, Result<bool>>
{
    private readonly IBarcodeDefinitionRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteBarcodeDefinitionCommandHandler(IBarcodeDefinitionRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(DeleteBarcodeDefinitionCommand request, CancellationToken cancellationToken)
    {
        var entity = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (entity == null)
        {
            return Result<bool>.Failure(new Error("BarcodeDefinition.NotFound", $"Barcode definition with ID {request.Id} not found", ErrorType.NotFound));
        }

        // Check if this is the primary barcode - cannot delete primary without setting another as primary
        if (entity.IsPrimary)
        {
            return Result<bool>.Failure(new Error("BarcodeDefinition.CannotDeletePrimary", "Cannot delete primary barcode. Set another barcode as primary first.", ErrorType.Validation));
        }

        entity.Delete("system");
        await _repository.UpdateAsync(entity, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
