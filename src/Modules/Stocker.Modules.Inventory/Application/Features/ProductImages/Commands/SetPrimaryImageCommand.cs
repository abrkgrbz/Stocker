using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.ProductImages.Commands;

/// <summary>
/// Command to set a product image as primary
/// </summary>
public class SetPrimaryImageCommand : IRequest<Result>
{
    public Guid TenantId { get; set; }
    public int ProductId { get; set; }
    public int ImageId { get; set; }
}

/// <summary>
/// Validator for SetPrimaryImageCommand
/// </summary>
public class SetPrimaryImageCommandValidator : AbstractValidator<SetPrimaryImageCommand>
{
    public SetPrimaryImageCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.ProductId)
            .NotEmpty().WithMessage("Product ID is required");

        RuleFor(x => x.ImageId)
            .NotEmpty().WithMessage("Image ID is required");
    }
}

/// <summary>
/// Handler for SetPrimaryImageCommand
/// </summary>
public class SetPrimaryImageCommandHandler : IRequestHandler<SetPrimaryImageCommand, Result>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public SetPrimaryImageCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(SetPrimaryImageCommand request, CancellationToken cancellationToken)
    {
        // Get product with images
        var product = await _unitOfWork.Products.GetByIdAsync(request.ProductId, cancellationToken);
        if (product == null)
        {
            return Result.Failure(
                Error.NotFound("Product", $"Product with ID {request.ProductId} not found"));
        }

        // Find the image to set as primary
        var targetImage = product.Images?.FirstOrDefault(i => i.Id == request.ImageId && i.IsActive);
        if (targetImage == null)
        {
            return Result.Failure(
                Error.NotFound("ProductImage", $"Active image with ID {request.ImageId} not found"));
        }

        // Unset all other primary images
        foreach (var img in product.Images?.Where(i => i.IsPrimary && i.Id != request.ImageId) ?? Enumerable.Empty<Domain.Entities.ProductImage>())
        {
            img.UnsetPrimary();
        }

        // Set this image as primary
        targetImage.SetAsPrimary();

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
