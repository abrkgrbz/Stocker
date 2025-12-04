using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.ProductAttributes.Commands;

/// <summary>
/// Command to delete a product attribute
/// </summary>
public class DeleteProductAttributeCommand : IRequest<Result>
{
    public int TenantId { get; set; }
    public int AttributeId { get; set; }
}

/// <summary>
/// Validator for DeleteProductAttributeCommand
/// </summary>
public class DeleteProductAttributeCommandValidator : AbstractValidator<DeleteProductAttributeCommand>
{
    public DeleteProductAttributeCommandValidator()
    {
        RuleFor(x => x.TenantId).GreaterThan(0);
        RuleFor(x => x.AttributeId).GreaterThan(0);
    }
}

/// <summary>
/// Handler for DeleteProductAttributeCommand
/// </summary>
public class DeleteProductAttributeCommandHandler : IRequestHandler<DeleteProductAttributeCommand, Result>
{
    private readonly IProductAttributeRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteProductAttributeCommandHandler(IProductAttributeRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(DeleteProductAttributeCommand request, CancellationToken cancellationToken)
    {
        var attribute = await _repository.GetWithOptionsAsync(request.AttributeId, cancellationToken);

        if (attribute == null)
        {
            return Result.Failure(
                new Error("ProductAttribute.NotFound", $"Product attribute with ID {request.AttributeId} not found", ErrorType.NotFound));
        }

        // Check if attribute has values assigned to products
        var values = await _repository.GetProductAttributeValuesAsync(request.AttributeId, cancellationToken);
        if (values.Any(v => v.ProductAttributeId == request.AttributeId))
        {
            return Result.Failure(
                new Error("ProductAttribute.InUse", "Cannot delete attribute that is assigned to products", ErrorType.Validation));
        }

        _repository.Remove(attribute);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
