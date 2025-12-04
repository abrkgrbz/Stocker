using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.ProductImages.Queries;

/// <summary>
/// Query to get all images for a product
/// </summary>
public class GetProductImagesQuery : IRequest<Result<List<ProductImageDto>>>
{
    public int TenantId { get; set; }
    public int ProductId { get; set; }
    public bool IncludeInactive { get; set; }
}

/// <summary>
/// Handler for GetProductImagesQuery
/// </summary>
public class GetProductImagesQueryHandler : IRequestHandler<GetProductImagesQuery, Result<List<ProductImageDto>>>
{
    private readonly IProductRepository _productRepository;

    public GetProductImagesQueryHandler(IProductRepository productRepository)
    {
        _productRepository = productRepository;
    }

    public async Task<Result<List<ProductImageDto>>> Handle(GetProductImagesQuery request, CancellationToken cancellationToken)
    {
        var product = await _productRepository.GetByIdAsync(request.ProductId, cancellationToken);
        if (product == null)
        {
            return Result<List<ProductImageDto>>.Failure(
                Error.NotFound("Product", $"Product with ID {request.ProductId} not found"));
        }

        var images = product.Images?
            .Where(i => request.IncludeInactive || i.IsActive)
            .OrderBy(i => i.DisplayOrder)
            .Select(i => new ProductImageDto
            {
                Id = i.Id,
                ImageUrl = i.Url,
                AltText = i.AltText,
                IsPrimary = i.IsPrimary,
                DisplayOrder = i.DisplayOrder
            })
            .ToList() ?? new List<ProductImageDto>();

        return Result<List<ProductImageDto>>.Success(images);
    }
}
