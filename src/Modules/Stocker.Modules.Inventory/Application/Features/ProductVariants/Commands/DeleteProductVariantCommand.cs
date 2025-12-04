using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.ProductVariants.Commands;

/// <summary>
/// Command to delete a product variant
/// </summary>
public class DeleteProductVariantCommand : IRequest<Result>
{
    public int TenantId { get; set; }
    public int VariantId { get; set; }
}

/// <summary>
/// Validator for DeleteProductVariantCommand
/// </summary>
public class DeleteProductVariantCommandValidator : AbstractValidator<DeleteProductVariantCommand>
{
    public DeleteProductVariantCommandValidator()
    {
        RuleFor(x => x.TenantId).GreaterThan(0);
        RuleFor(x => x.VariantId).GreaterThan(0);
    }
}

/// <summary>
/// Handler for DeleteProductVariantCommand
/// </summary>
public class DeleteProductVariantCommandHandler : IRequestHandler<DeleteProductVariantCommand, Result>
{
    private readonly IProductVariantRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteProductVariantCommandHandler(IProductVariantRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(DeleteProductVariantCommand request, CancellationToken cancellationToken)
    {
        var variant = await _repository.GetWithOptionsAsync(request.VariantId, cancellationToken);

        if (variant == null)
        {
            return Result.Failure(
                new Error("ProductVariant.NotFound", $"Product variant with ID {request.VariantId} not found", ErrorType.NotFound));
        }

        // Check if variant has stock
        if (variant.Stocks?.Any(s => s.Quantity > 0) == true)
        {
            return Result.Failure(
                new Error("ProductVariant.HasStock", "Cannot delete variant with existing stock", ErrorType.Validation));
        }

        _repository.Remove(variant);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
