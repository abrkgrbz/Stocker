using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.ProductAttributes.Commands;

/// <summary>
/// Command to delete a product attribute option
/// </summary>
public class DeleteProductAttributeOptionCommand : IRequest<Result>
{
    public Guid TenantId { get; set; }
    public int AttributeId { get; set; }
    public int OptionId { get; set; }
}

/// <summary>
/// Validator for DeleteProductAttributeOptionCommand
/// </summary>
public class DeleteProductAttributeOptionCommandValidator : AbstractValidator<DeleteProductAttributeOptionCommand>
{
    public DeleteProductAttributeOptionCommandValidator()
    {
        RuleFor(x => x.TenantId).NotEmpty();
        RuleFor(x => x.AttributeId).NotEmpty();
        RuleFor(x => x.OptionId).NotEmpty();
    }
}

/// <summary>
/// Handler for DeleteProductAttributeOptionCommand
/// </summary>
public class DeleteProductAttributeOptionCommandHandler : IRequestHandler<DeleteProductAttributeOptionCommand, Result>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public DeleteProductAttributeOptionCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(DeleteProductAttributeOptionCommand request, CancellationToken cancellationToken)
    {
        var option = await _unitOfWork.ProductAttributes.GetOptionByIdAsync(request.OptionId, cancellationToken);

        if (option == null || option.ProductAttributeId != request.AttributeId)
        {
            return Result.Failure(
                new Error("ProductAttributeOption.NotFound", $"Option with ID {request.OptionId} not found for attribute {request.AttributeId}", ErrorType.NotFound));
        }

        _unitOfWork.ProductAttributes.RemoveOption(option);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
