using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Inventory.Application.Contracts;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.ProductImages.Commands;

/// <summary>
/// Command to delete a product image
/// </summary>
public class DeleteProductImageCommand : IRequest<Result>
{
    public Guid TenantId { get; set; }
    public int ProductId { get; set; }
    public int ImageId { get; set; }
}

/// <summary>
/// Validator for DeleteProductImageCommand
/// </summary>
public class DeleteProductImageCommandValidator : AbstractValidator<DeleteProductImageCommand>
{
    public DeleteProductImageCommandValidator()
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
/// Handler for DeleteProductImageCommand
/// </summary>
public class DeleteProductImageCommandHandler : IRequestHandler<DeleteProductImageCommand, Result>
{
    private readonly IInventoryUnitOfWork _unitOfWork;
    private readonly IProductImageStorageService _storageService;

    public DeleteProductImageCommandHandler(
        IInventoryUnitOfWork unitOfWork,
        IProductImageStorageService storageService)
    {
        _unitOfWork = unitOfWork;
        _storageService = storageService;
    }

    public async Task<Result> Handle(DeleteProductImageCommand request, CancellationToken cancellationToken)
    {
        // Get product with images
        var product = await _unitOfWork.Products.GetByIdAsync(request.ProductId, cancellationToken);
        if (product == null)
        {
            return Result.Failure(
                Error.NotFound("Product", $"Product with ID {request.ProductId} not found"));
        }

        // Find the image
        var image = product.Images?.FirstOrDefault(i => i.Id == request.ImageId);
        if (image == null)
        {
            return Result.Failure(
                Error.NotFound("ProductImage", $"Image with ID {request.ImageId} not found"));
        }

        // Extract storage path from URL (if stored)
        // For now, we'll soft-delete the image record
        image.Deactivate();

        // If this was the primary image, set another as primary
        if (image.IsPrimary)
        {
            image.UnsetPrimary();
            var nextImage = product.Images?.FirstOrDefault(i => i.IsActive && i.Id != request.ImageId);
            nextImage?.SetAsPrimary();
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
