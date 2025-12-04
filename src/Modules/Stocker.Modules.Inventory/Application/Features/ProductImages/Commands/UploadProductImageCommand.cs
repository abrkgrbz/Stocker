using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Http;
using Stocker.Modules.Inventory.Application.Contracts;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.ProductImages.Commands;

/// <summary>
/// Command to upload a product image
/// </summary>
public class UploadProductImageCommand : IRequest<Result<ProductImageDto>>
{
    public Guid TenantId { get; set; }
    public int ProductId { get; set; }
    public byte[] ImageData { get; set; } = null!;
    public string FileName { get; set; } = null!;
    public string ContentType { get; set; } = null!;
    public string? AltText { get; set; }
    public string? Title { get; set; }
    public ImageType ImageType { get; set; } = ImageType.Gallery;
    public bool SetAsPrimary { get; set; }
}

/// <summary>
/// Validator for UploadProductImageCommand
/// </summary>
public class UploadProductImageCommandValidator : AbstractValidator<UploadProductImageCommand>
{
    private static readonly string[] AllowedContentTypes = new[]
    {
        "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", "image/bmp"
    };

    private const long MaxFileSizeBytes = 10 * 1024 * 1024; // 10MB

    public UploadProductImageCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.ProductId)
            .NotEmpty().WithMessage("Product ID is required");

        RuleFor(x => x.ImageData)
            .NotEmpty().WithMessage("Image data is required")
            .Must(x => x.Length <= MaxFileSizeBytes)
            .WithMessage($"Image size must not exceed {MaxFileSizeBytes / (1024 * 1024)}MB");

        RuleFor(x => x.FileName)
            .NotEmpty().WithMessage("File name is required")
            .MaximumLength(255).WithMessage("File name must not exceed 255 characters");

        RuleFor(x => x.ContentType)
            .NotEmpty().WithMessage("Content type is required")
            .Must(x => AllowedContentTypes.Contains(x.ToLowerInvariant()))
            .WithMessage($"Content type must be one of: {string.Join(", ", AllowedContentTypes)}");

        RuleFor(x => x.AltText)
            .MaximumLength(500).WithMessage("Alt text must not exceed 500 characters");

        RuleFor(x => x.Title)
            .MaximumLength(200).WithMessage("Title must not exceed 200 characters");
    }
}

/// <summary>
/// Handler for UploadProductImageCommand
/// </summary>
public class UploadProductImageCommandHandler : IRequestHandler<UploadProductImageCommand, Result<ProductImageDto>>
{
    private readonly IProductRepository _productRepository;
    private readonly IProductImageStorageService _storageService;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ITenantService _tenantService;

    public UploadProductImageCommandHandler(
        IProductRepository productRepository,
        IProductImageStorageService storageService,
        IUnitOfWork unitOfWork,
        ITenantService tenantService)
    {
        _productRepository = productRepository;
        _storageService = storageService;
        _unitOfWork = unitOfWork;
        _tenantService = tenantService;
    }

    public async Task<Result<ProductImageDto>> Handle(UploadProductImageCommand request, CancellationToken cancellationToken)
    {
        // Verify product exists
        var product = await _productRepository.GetByIdAsync(request.ProductId, cancellationToken);
        if (product == null)
        {
            return Result<ProductImageDto>.Failure(
                Error.NotFound("Product", $"Product with ID {request.ProductId} not found"));
        }

        // Upload image to MinIO
        var uploadResult = await _storageService.UploadImageAsync(
            request.ImageData,
            request.FileName,
            request.ContentType,
            request.TenantId,
            request.ProductId,
            cancellationToken);

        if (!uploadResult.IsSuccess)
        {
            return Result<ProductImageDto>.Failure(uploadResult.Error);
        }

        var storage = uploadResult.Value;

        // Create ProductImage entity with actual Guid TenantId from tenant service
        var tenantId = _tenantService.GetCurrentTenantId()
            ?? throw new InvalidOperationException("Tenant ID is not available");
        var productImage = new ProductImage(request.ProductId, storage.Url, tenantId, request.ImageType);
        productImage.SetMetadata(request.AltText, request.Title);
        productImage.SetFileInfo(
            storage.FileSize,
            storage.Width,
            storage.Height,
            request.ContentType,
            request.FileName);

        // Set display order based on existing images
        var existingImages = product.Images?.Where(i => i.IsActive).ToList() ?? new List<ProductImage>();
        productImage.SetDisplayOrder(existingImages.Count);

        // Handle primary image logic
        if (request.SetAsPrimary || !existingImages.Any())
        {
            // Unset existing primary images
            foreach (var img in existingImages.Where(i => i.IsPrimary))
            {
                img.UnsetPrimary();
            }
            productImage.SetAsPrimary();
        }

        // Add to product's images collection
        product.Images.Add(productImage);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Map to DTO
        var dto = new ProductImageDto
        {
            Id = productImage.Id,
            ImageUrl = productImage.Url,
            AltText = productImage.AltText,
            IsPrimary = productImage.IsPrimary,
            DisplayOrder = productImage.DisplayOrder
        };

        return Result<ProductImageDto>.Success(dto);
    }
}
