using MediatR;
using Microsoft.EntityFrameworkCore;
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
/// </summary>
public class GetProductImagesQueryHandler : IRequestHandler<GetProductImagesQuery, Result<List<ProductImageDto>>>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public GetProductImagesQueryHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<List<ProductImageDto>>> Handle(GetProductImagesQuery request, CancellationToken cancellationToken)
    {
        // Verify product exists and get with images navigation property
        var product = await _unitOfWork.Products.GetByIdAsync(request.ProductId, cancellationToken);
        if (product == null)
        {
            return Result<List<ProductImageDto>>.Failure(
                Error.NotFound("Product", $"Product with ID {request.ProductId} not found"));
        }

        // Query images using Product's navigation property
        var imagesQuery = product.Images?.AsQueryable() ?? Enumerable.Empty<ProductImage>().AsQueryable();

        if (!request.IncludeInactive)
        {
            imagesQuery = imagesQuery.Where(i => i.IsActive);
        }

        var images = imagesQuery
            .OrderBy(i => i.DisplayOrder)
            .Select(i => new ProductImageDto
            {
                Id = i.Id,
                ImageUrl = i.Url,
                AltText = i.AltText,
                IsPrimary = i.IsPrimary,
                DisplayOrder = i.DisplayOrder
            })
            .ToList();

        return Result<List<ProductImageDto>>.Success(images);
    }
}
