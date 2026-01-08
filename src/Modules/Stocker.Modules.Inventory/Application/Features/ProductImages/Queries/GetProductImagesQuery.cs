using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Inventory.Application.Contracts;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.ProductImages.Queries;

/// <summary>
/// Query to get all images for a product
/// </summary>
public class GetProductImagesQuery : IRequest<Result<List<ProductImageDto>>>
{
    public Guid TenantId { get; set; }
    public int ProductId { get; set; }
    public bool IncludeInactive { get; set; }
}

/// <summary>
/// Handler for GetProductImagesQuery
/// Uses IInventoryUnitOfWork to ensure repository and SaveChanges use the same DbContext instance
/// Generates presigned URLs for private bucket access
/// </summary>
public class GetProductImagesQueryHandler : IRequestHandler<GetProductImagesQuery, Result<List<ProductImageDto>>>
{
    private readonly IInventoryUnitOfWork _unitOfWork;
    private readonly IProductImageStorageService _storageService;

    public GetProductImagesQueryHandler(IInventoryUnitOfWork unitOfWork, IProductImageStorageService storageService)
    {
        _unitOfWork = unitOfWork;
        _storageService = storageService;
    }

    public async Task<Result<List<ProductImageDto>>> Handle(GetProductImagesQuery request, CancellationToken cancellationToken)
    {
        // Use GetWithDetailsAsync to include images navigation property
        var product = await _unitOfWork.Products.GetWithDetailsAsync(request.ProductId, cancellationToken);
        if (product == null)
        {
            return Result<List<ProductImageDto>>.Failure(
                Error.NotFound("Product", $"Product with ID {request.ProductId} not found"));
        }

        // Query images using Product's navigation property (already loaded)
        var imagesQuery = product.Images?.AsQueryable() ?? Enumerable.Empty<ProductImage>().AsQueryable();

        if (!request.IncludeInactive)
        {
            imagesQuery = imagesQuery.Where(i => i.IsActive);
        }

        var imageEntities = imagesQuery
            .OrderBy(i => i.DisplayOrder)
            .ToList();

        // Generate presigned URLs for each image
        var images = new List<ProductImageDto>();
        foreach (var img in imageEntities)
        {
            var imageUrl = img.Url;

            // If StoragePath is available, generate presigned URL (24 hours expiry)
            if (!string.IsNullOrEmpty(img.StoragePath))
            {
                var urlResult = await _storageService.GetImageUrlAsync(img.StoragePath, TimeSpan.FromHours(24), cancellationToken);
                if (urlResult.IsSuccess)
                {
                    imageUrl = urlResult.Value;
                }
            }

            images.Add(new ProductImageDto
            {
                Id = img.Id,
                ImageUrl = imageUrl,
                AltText = img.AltText,
                IsPrimary = img.IsPrimary,
                DisplayOrder = img.DisplayOrder
            });
        }

        return Result<List<ProductImageDto>>.Success(images);
    }
}
