using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.ProductImages.Commands;

/// <summary>
/// Command to reorder product images
/// </summary>
public class ReorderProductImagesCommand : IRequest<Result>
{
    public Guid TenantId { get; set; }
    public int ProductId { get; set; }
    public List<int> ImageIds { get; set; } = new();
}

/// <summary>
/// Validator for ReorderProductImagesCommand
/// </summary>
public class ReorderProductImagesCommandValidator : AbstractValidator<ReorderProductImagesCommand>
{
    public ReorderProductImagesCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.ProductId)
            .NotEmpty().WithMessage("Product ID is required");

        RuleFor(x => x.ImageIds)
            .NotEmpty().WithMessage("Image IDs are required");
    }
}

/// <summary>
/// Handler for ReorderProductImagesCommand
/// </summary>
public class ReorderProductImagesCommandHandler : IRequestHandler<ReorderProductImagesCommand, Result>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public ReorderProductImagesCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(ReorderProductImagesCommand request, CancellationToken cancellationToken)
    {
        // Get product with images
        var product = await _unitOfWork.Products.GetByIdAsync(request.ProductId, cancellationToken);
        if (product == null)
        {
            return Result.Failure(
                Error.NotFound("Product", $"Product with ID {request.ProductId} not found"));
        }

        // Update display order for each image
        for (int i = 0; i < request.ImageIds.Count; i++)
        {
            var imageId = request.ImageIds[i];
            var image = product.Images?.FirstOrDefault(img => img.Id == imageId);

            if (image != null)
            {
                image.SetDisplayOrder(i);
            }
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
