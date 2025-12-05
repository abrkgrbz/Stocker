using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Infrastructure.Persistence;
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
/// </summary>
public class GetProductImagesQueryHandler : IRequestHandler<GetProductImagesQuery, Result<List<ProductImageDto>>>
{
    private readonly InventoryDbContext _dbContext;

    public GetProductImagesQueryHandler(InventoryDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<Result<List<ProductImageDto>>> Handle(GetProductImagesQuery request, CancellationToken cancellationToken)
    {
        // Verify product exists
        var productExists = await _dbContext.Set<Product>()
            .AnyAsync(p => p.Id == request.ProductId, cancellationToken);
        if (!productExists)
        {
            return Result<List<ProductImageDto>>.Failure(
                Error.NotFound("Product", $"Product with ID {request.ProductId} not found"));
        }

        // Query images directly from ProductImage table
        var query = _dbContext.Set<ProductImage>()
            .Where(i => i.ProductId == request.ProductId);

        if (!request.IncludeInactive)
        {
            query = query.Where(i => i.IsActive);
        }

        var images = await query
            .OrderBy(i => i.DisplayOrder)
            .Select(i => new ProductImageDto
            {
                Id = i.Id,
                ImageUrl = i.Url,
                AltText = i.AltText,
                IsPrimary = i.IsPrimary,
                DisplayOrder = i.DisplayOrder
            })
            .ToListAsync(cancellationToken);

        return Result<List<ProductImageDto>>.Success(images);
    }
}
