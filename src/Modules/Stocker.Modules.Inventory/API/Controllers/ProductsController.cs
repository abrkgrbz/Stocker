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

    public ProductsController(IMediator mediator)
    {
        _mediator = mediator;
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
        var tenantId = GetTenantId();
        if (tenantId == 0) return BadRequest(CreateTenantError());

        var query = new GetProductsQuery
        {
            TenantId = tenantId,
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
    /// Get product by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ProductDto), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<ProductDto>> GetProduct(int id)
    {
        var tenantId = GetTenantId();
        if (tenantId == 0) return BadRequest(CreateTenantError());

        var query = new GetProductByIdQuery
        {
            TenantId = tenantId,
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
        var tenantId = GetTenantId();
        if (tenantId == 0) return BadRequest(CreateTenantError());

        var query = new GetLowStockProductsQuery
        {
            TenantId = tenantId,
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
        var tenantId = GetTenantId();
        if (tenantId == 0) return BadRequest(CreateTenantError());

        var command = new CreateProductCommand
        {
            TenantId = tenantId,
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
        var tenantId = GetTenantId();
        if (tenantId == 0) return BadRequest(CreateTenantError());

        var command = new UpdateProductCommand
        {
            TenantId = tenantId,
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
        var tenantId = GetTenantId();
        if (tenantId == 0) return BadRequest(CreateTenantError());

        var command = new DeleteProductCommand
        {
            TenantId = tenantId,
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
        var tenantId = GetTenantId();
        if (tenantId == 0) return BadRequest(CreateTenantError());

        var command = new ActivateProductCommand
        {
            TenantId = tenantId,
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
        var tenantId = GetTenantId();
        if (tenantId == 0) return BadRequest(CreateTenantError());

        var command = new DeactivateProductCommand
        {
            TenantId = tenantId,
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
        var tenantId = GetTenantId();
        if (tenantId == 0) return BadRequest(CreateTenantError());

        var query = new GetProductImagesQuery
        {
            TenantId = tenantId,
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
        var tenantId = GetTenantId();
        if (tenantId == 0) return BadRequest(CreateTenantError());

        if (file == null || file.Length == 0)
            return BadRequest(new Error("Image.Required", "Image file is required", ErrorType.Validation));

        using var memoryStream = new MemoryStream();
        await file.CopyToAsync(memoryStream);

        var command = new UploadProductImageCommand
        {
            TenantId = tenantId,
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
        var tenantId = GetTenantId();
        if (tenantId == 0) return BadRequest(CreateTenantError());

        var command = new DeleteProductImageCommand
        {
            TenantId = tenantId,
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
        var tenantId = GetTenantId();
        if (tenantId == 0) return BadRequest(CreateTenantError());

        var command = new SetPrimaryImageCommand
        {
            TenantId = tenantId,
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
        var tenantId = GetTenantId();
        if (tenantId == 0) return BadRequest(CreateTenantError());

        var command = new ReorderProductImagesCommand
        {
            TenantId = tenantId,
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

    private int GetTenantId()
    {
        if (HttpContext.Items["TenantId"] is int tenantId)
            return tenantId;
        if (HttpContext.Items["TenantId"] is Guid guidTenantId)
            return guidTenantId.GetHashCode(); // Fallback for Guid-based tenant
        return 0;
    }

    private static Error CreateTenantError()
    {
        return new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation);
    }
}
