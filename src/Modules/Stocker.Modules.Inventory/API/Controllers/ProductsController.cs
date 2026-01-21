using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Application.Features.Products.Commands;
using Stocker.Modules.Inventory.Application.Features.Products.Queries;
using Stocker.Modules.Inventory.Application.Features.ProductImages.Commands;
using Stocker.Modules.Inventory.Application.Features.ProductImages.Queries;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.SharedKernel.Authorization;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.API.Controllers;

[ApiController]
[Authorize]
[Route("api/inventory/products")]
[RequireModule("Inventory")]
[ApiExplorerSettings(GroupName = "inventory")]
public class ProductsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ITenantService _tenantService;

    public ProductsController(IMediator mediator, ITenantService tenantService)
    {
        _mediator = mediator;
        _tenantService = tenantService;
    }

    /// <summary>
    /// Get all products
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<ProductDto>), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<List<ProductDto>>> GetProducts(
        [FromQuery] bool includeInactive = false,
        [FromQuery] int? categoryId = null,
        [FromQuery] int? brandId = null)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var query = new GetProductsQuery
        {
            TenantId = tenantId.Value,
            IncludeInactive = includeInactive,
            CategoryId = categoryId,
            BrandId = brandId
        };

        var result = await _mediator.Send(query);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }


    /// <summary>
    /// Get products with pagination and advanced filtering
    /// </summary>
    [HttpGet("paged")]
    [ProducesResponseType(typeof(PagedResult<ProductDto>), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<PagedResult<ProductDto>>> GetProductsPaged(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        [FromQuery] int? categoryId = null,
        [FromQuery] int? brandId = null,
        [FromQuery] string? productTypes = null,
        [FromQuery] string? stockStatus = null,
        [FromQuery] string? trackingType = null,
        [FromQuery] decimal? minPrice = null,
        [FromQuery] decimal? maxPrice = null,
        [FromQuery] bool includeInactive = false,
        [FromQuery] string? sortBy = "name",
        [FromQuery] bool sortDescending = false)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        // Parse product types from comma-separated string
        List<Domain.Enums.ProductType>? productTypeList = null;
        if (!string.IsNullOrEmpty(productTypes))
        {
            productTypeList = productTypes.Split(',')
                .Select(t => Enum.TryParse<Domain.Enums.ProductType>(t.Trim(), true, out var pt) ? pt : (Domain.Enums.ProductType?)null)
                .Where(t => t.HasValue)
                .Select(t => t!.Value)
                .ToList();
        }

        // Parse stock status
        StockStatus? stockStatusEnum = null;
        if (!string.IsNullOrEmpty(stockStatus) && Enum.TryParse<StockStatus>(stockStatus, true, out var ss))
        {
            stockStatusEnum = ss;
        }

        // Parse tracking type
        TrackingType? trackingTypeEnum = null;
        if (!string.IsNullOrEmpty(trackingType) && Enum.TryParse<TrackingType>(trackingType, true, out var tt))
        {
            trackingTypeEnum = tt;
        }

        var query = new GetProductsPagedQuery
        {
            TenantId = tenantId.Value,
            PageNumber = pageNumber,
            PageSize = pageSize,
            Filters = new ProductFilterParams
            {
                SearchTerm = search,
                CategoryId = categoryId,
                BrandId = brandId,
                ProductTypes = productTypeList,
                StockStatus = stockStatusEnum,
                TrackingType = trackingTypeEnum,
                MinPrice = minPrice,
                MaxPrice = maxPrice,
                IncludeInactive = includeInactive,
                SortBy = sortBy,
                SortDescending = sortDescending
            }
        };

        var result = await _mediator.Send(query);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    /// <summary>
    /// Get product by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ProductDto), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<ProductDto>> GetProduct(int id)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var query = new GetProductByIdQuery
        {
            TenantId = tenantId.Value,
            ProductId = id
        };

        var result = await _mediator.Send(query);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(result.Error);
            return BadRequest(result.Error);
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Get products with low stock
    /// </summary>
    [HttpGet("low-stock")]
    [ProducesResponseType(typeof(List<LowStockProductDto>), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<List<LowStockProductDto>>> GetLowStockProducts(
        [FromQuery] int? warehouseId = null)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var query = new GetLowStockProductsQuery
        {
            TenantId = tenantId.Value,
            WarehouseId = warehouseId
        };

        var result = await _mediator.Send(query);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    /// <summary>
    /// Create a new product
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ProductDto), 201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<ProductDto>> CreateProduct(CreateProductDto dto)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var command = new CreateProductCommand
        {
            TenantId = tenantId.Value,
            ProductData = dto
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return CreatedAtAction(nameof(GetProduct), new { id = result.Value.Id }, result.Value);
    }

    /// <summary>
    /// Update a product
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ProductDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<ProductDto>> UpdateProduct(int id, UpdateProductDto dto)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var command = new UpdateProductCommand
        {
            TenantId = tenantId.Value,
            ProductId = id,
            ProductData = dto
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(result.Error);
            return BadRequest(result.Error);
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Delete a product
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> DeleteProduct(int id)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var command = new DeleteProductCommand
        {
            TenantId = tenantId.Value,
            ProductId = id
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(result.Error);
            return BadRequest(result.Error);
        }

        return NoContent();
    }

    /// <summary>
    /// Activate a product
    /// </summary>
    [HttpPost("{id}/activate")]
    [ProducesResponseType(200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> ActivateProduct(int id)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var command = new ActivateProductCommand
        {
            TenantId = tenantId.Value,
            ProductId = id
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(result.Error);
            return BadRequest(result.Error);
        }

        return Ok();
    }

    /// <summary>
    /// Deactivate a product
    /// </summary>
    [HttpPost("{id}/deactivate")]
    [ProducesResponseType(200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> DeactivateProduct(int id)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var command = new DeactivateProductCommand
        {
            TenantId = tenantId.Value,
            ProductId = id
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(result.Error);
            return BadRequest(result.Error);
        }

        return Ok();
    }

    // ============================
    // PRODUCT IMAGES
    // ============================

    /// <summary>
    /// Get all images for a product
    /// </summary>
    [HttpGet("{id}/images")]
    [ProducesResponseType(typeof(List<ProductImageDto>), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<List<ProductImageDto>>> GetProductImages(
        int id,
        [FromQuery] bool includeInactive = false)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var query = new GetProductImagesQuery
        {
            TenantId = tenantId.Value,
            ProductId = id,
            IncludeInactive = includeInactive
        };

        var result = await _mediator.Send(query);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(result.Error);
            return BadRequest(result.Error);
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Upload a new image for a product
    /// </summary>
    [HttpPost("{id}/images")]
    [ProducesResponseType(typeof(ProductImageDto), 201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    [RequestSizeLimit(10 * 1024 * 1024)] // 10MB limit
    public async Task<ActionResult<ProductImageDto>> UploadProductImage(
        int id,
        IFormFile file,
        [FromForm] string? altText = null,
        [FromForm] string? title = null,
        [FromForm] ImageType imageType = ImageType.Gallery,
        [FromForm] bool setAsPrimary = false)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        if (file == null || file.Length == 0)
            return BadRequest(new Error("Image.Required", "Image file is required", ErrorType.Validation));

        using var memoryStream = new MemoryStream();
        await file.CopyToAsync(memoryStream);

        var command = new UploadProductImageCommand
        {
            TenantId = tenantId.Value,
            ProductId = id,
            ImageData = memoryStream.ToArray(),
            FileName = file.FileName,
            ContentType = file.ContentType,
            AltText = altText,
            Title = title,
            ImageType = imageType,
            SetAsPrimary = setAsPrimary
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(result.Error);
            return BadRequest(result.Error);
        }

        return CreatedAtAction(nameof(GetProductImages), new { id }, result.Value);
    }

    /// <summary>
    /// Delete a product image
    /// </summary>
    [HttpDelete("{id}/images/{imageId}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> DeleteProductImage(int id, int imageId)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var command = new DeleteProductImageCommand
        {
            TenantId = tenantId.Value,
            ProductId = id,
            ImageId = imageId
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(result.Error);
            return BadRequest(result.Error);
        }

        return NoContent();
    }

    /// <summary>
    /// Set an image as the primary image for a product
    /// </summary>
    [HttpPost("{id}/images/{imageId}/set-primary")]
    [ProducesResponseType(200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> SetPrimaryImage(int id, int imageId)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var command = new SetPrimaryImageCommand
        {
            TenantId = tenantId.Value,
            ProductId = id,
            ImageId = imageId
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(result.Error);
            return BadRequest(result.Error);
        }

        return Ok();
    }

    /// <summary>
    /// Reorder product images
    /// </summary>
    [HttpPost("{id}/images/reorder")]
    [ProducesResponseType(200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> ReorderProductImages(int id, [FromBody] List<int> imageIds)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var command = new ReorderProductImagesCommand
        {
            TenantId = tenantId.Value,
            ProductId = id,
            ImageIds = imageIds
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(result.Error);
            return BadRequest(result.Error);
        }

        return Ok();
    }

    /// <summary>
    /// Bulk delete products
    /// </summary>
    [HttpPost("bulk-delete")]
    [ProducesResponseType(typeof(BulkDeleteResult), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<BulkDeleteResult>> BulkDeleteProducts([FromBody] BulkDeleteRequest request)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var command = new BulkDeleteProductsCommand
        {
            TenantId = tenantId.Value,
            ProductIds = request.Ids
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    /// <summary>
    /// Bulk activate products
    /// </summary>
    [HttpPost("bulk-activate")]
    [ProducesResponseType(typeof(BulkStatusResult), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<BulkStatusResult>> BulkActivateProducts([FromBody] BulkStatusRequest request)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var command = new BulkActivateProductsCommand
        {
            TenantId = tenantId.Value,
            ProductIds = request.Ids
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    /// <summary>
    /// Bulk deactivate products
    /// </summary>
    [HttpPost("bulk-deactivate")]
    [ProducesResponseType(typeof(BulkStatusResult), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<BulkStatusResult>> BulkDeactivateProducts([FromBody] BulkStatusRequest request)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var command = new BulkDeactivateProductsCommand
        {
            TenantId = tenantId.Value,
            ProductIds = request.Ids
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    private static Error CreateTenantError()
    {
        return new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation);
    }
}

public class BulkDeleteRequest
{
    public List<int> Ids { get; set; } = new();
}

public class BulkStatusRequest
{
    public List<int> Ids { get; set; } = new();
}
