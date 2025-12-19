using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.ProductAttributes.Commands;

/// <summary>
/// Command to delete a product attribute
/// </summary>
public class DeleteProductAttributeCommand : IRequest<Result>
{
    public Guid TenantId { get; set; }
    public int AttributeId { get; set; }
}

/// <summary>
/// Validator for DeleteProductAttributeCommand
/// </summary>
public class DeleteProductAttributeCommandValidator : AbstractValidator<DeleteProductAttributeCommand>
{
    public DeleteProductAttributeCommandValidator()
    {
        RuleFor(x => x.TenantId).NotEmpty();
        RuleFor(x => x.AttributeId).NotEmpty();
    }
}

/// <summary>
/// Handler for DeleteProductAttributeCommand
/// </summary>
public class DeleteProductAttributeCommandHandler : IRequestHandler<DeleteProductAttributeCommand, Result>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public DeleteProductAttributeCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(DeleteProductAttributeCommand request, CancellationToken cancellationToken)
    {
        var attribute = await _unitOfWork.ProductAttributes.GetWithOptionsAsync(request.AttributeId, cancellationToken);

        if (attribute == null)
        {
            return Result.Failure(
                new Error("ProductAttribute.NotFound", $"Product attribute with ID {request.AttributeId} not found", ErrorType.NotFound));
        }

        // Check if attribute has values assigned to products
        var values = await _unitOfWork.ProductAttributes.GetProductAttributeValuesAsync(request.AttributeId, cancellationToken);
        if (values.Any(v => v.ProductAttributeId == request.AttributeId))
        {
            return Result.Failure(
                new Error("ProductAttribute.InUse", "Cannot delete attribute that is assigned to products", ErrorType.Validation));
        }

        _unitOfWork.ProductAttributes.Remove(attribute);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
