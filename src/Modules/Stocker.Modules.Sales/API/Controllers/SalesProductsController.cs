using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Application.Features.SalesProducts.Commands;
using Stocker.Modules.Sales.Application.Features.SalesProducts.Queries;
using Stocker.Modules.Sales.Domain.Enums;
using Stocker.SharedKernel.Authorization;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.API.Controllers;

/// <summary>
/// Controller for managing sales products
/// These are products specific to the Sales module, used when Inventory module is not active
/// </summary>
[Authorize]
[ApiController]
[Route("api/sales/products")]
[RequireModule("Sales")]
[ApiExplorerSettings(GroupName = "sales")]
public class SalesProductsController : ControllerBase
{
    private readonly IMediator _mediator;

    public SalesProductsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Gets all sales products with pagination and filtering
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<SalesProductListDto>), 200)]
    [ProducesResponseType(400)]
    public async Task<ActionResult<PagedResult<SalesProductListDto>>> GetProducts(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? searchTerm = null,
        [FromQuery] SalesProductType? productType = null,
        [FromQuery] string? category = null,
        [FromQuery] string? subCategory = null,
        [FromQuery] string? brand = null,
        [FromQuery] decimal? minPrice = null,
        [FromQuery] decimal? maxPrice = null,
        [FromQuery] bool? inStock = null,
        [FromQuery] bool includeInactive = false,
        [FromQuery] bool onlyAvailableForSale = false,
        [FromQuery] bool onlyShowOnWeb = false,
        [FromQuery] string? sortBy = "ProductCode",
        [FromQuery] bool sortDescending = false,
        CancellationToken cancellationToken = default)
    {
        var query = new GetSalesProductsPagedQuery
        {
            PageNumber = page,
            PageSize = pageSize,
            SearchTerm = searchTerm,
            ProductType = productType,
            Category = category,
            SubCategory = subCategory,
            Brand = brand,
            MinPrice = minPrice,
            MaxPrice = maxPrice,
            InStock = inStock,
            IncludeInactive = includeInactive,
            OnlyAvailableForSale = onlyAvailableForSale,
            OnlyShowOnWeb = onlyShowOnWeb,
            SortBy = sortBy,
            SortDescending = sortDescending
        };

        var result = await _mediator.Send(query, cancellationToken);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error.Description });

        return Ok(result.Value);
    }

    /// <summary>
    /// Gets a sales product by ID
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(SalesProductDto), 200)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<SalesProductDto>> GetProductById(Guid id, CancellationToken cancellationToken)
    {
        var query = new GetSalesProductByIdQuery { Id = id };
        var result = await _mediator.Send(query, cancellationToken);

        if (!result.IsSuccess)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(new { error = result.Error.Description });
            return BadRequest(new { error = result.Error.Description });
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Gets a sales product by product code
    /// </summary>
    [HttpGet("by-code/{productCode}")]
    [ProducesResponseType(typeof(SalesProductDto), 200)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<SalesProductDto>> GetProductByCode(string productCode, CancellationToken cancellationToken)
    {
        var query = new GetSalesProductByCodeQuery { ProductCode = productCode };
        var result = await _mediator.Send(query, cancellationToken);

        if (!result.IsSuccess)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(new { error = result.Error.Description });
            return BadRequest(new { error = result.Error.Description });
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Gets a sales product by barcode
    /// </summary>
    [HttpGet("by-barcode/{barcode}")]
    [ProducesResponseType(typeof(SalesProductDto), 200)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<SalesProductDto>> GetProductByBarcode(string barcode, CancellationToken cancellationToken)
    {
        var query = new GetSalesProductByBarcodeQuery { Barcode = barcode };
        var result = await _mediator.Send(query, cancellationToken);

        if (!result.IsSuccess)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(new { error = result.Error.Description });
            return BadRequest(new { error = result.Error.Description });
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Gets a sales product by SKU
    /// </summary>
    [HttpGet("by-sku/{sku}")]
    [ProducesResponseType(typeof(SalesProductDto), 200)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<SalesProductDto>> GetProductBySKU(string sku, CancellationToken cancellationToken)
    {
        var query = new GetSalesProductBySKUQuery { SKU = sku };
        var result = await _mediator.Send(query, cancellationToken);

        if (!result.IsSuccess)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(new { error = result.Error.Description });
            return BadRequest(new { error = result.Error.Description });
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Searches sales products for autocomplete/dropdown
    /// </summary>
    [HttpGet("search")]
    [ProducesResponseType(typeof(List<SalesProductListDto>), 200)]
    public async Task<ActionResult<List<SalesProductListDto>>> SearchProducts(
        [FromQuery] string term,
        [FromQuery] int maxResults = 10,
        [FromQuery] bool onlyActive = true,
        [FromQuery] bool onlyAvailableForSale = true,
        CancellationToken cancellationToken = default)
    {
        var query = new SearchSalesProductsQuery
        {
            SearchTerm = term,
            MaxResults = maxResults,
            OnlyActive = onlyActive,
            OnlyAvailableForSale = onlyAvailableForSale
        };

        var result = await _mediator.Send(query, cancellationToken);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error.Description });

        return Ok(result.Value);
    }

    /// <summary>
    /// Gets products by category
    /// </summary>
    [HttpGet("by-category/{category}")]
    [ProducesResponseType(typeof(List<SalesProductListDto>), 200)]
    public async Task<ActionResult<List<SalesProductListDto>>> GetProductsByCategory(
        string category,
        [FromQuery] string? subCategory = null,
        [FromQuery] bool onlyActive = true,
        CancellationToken cancellationToken = default)
    {
        var query = new GetProductsByCategoryQuery
        {
            Category = category,
            SubCategory = subCategory,
            OnlyActive = onlyActive
        };

        var result = await _mediator.Send(query, cancellationToken);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error.Description });

        return Ok(result.Value);
    }

    /// <summary>
    /// Gets products by brand
    /// </summary>
    [HttpGet("by-brand/{brand}")]
    [ProducesResponseType(typeof(List<SalesProductListDto>), 200)]
    public async Task<ActionResult<List<SalesProductListDto>>> GetProductsByBrand(
        string brand,
        [FromQuery] bool onlyActive = true,
        CancellationToken cancellationToken = default)
    {
        var query = new GetProductsByBrandQuery
        {
            Brand = brand,
            OnlyActive = onlyActive
        };

        var result = await _mediator.Send(query, cancellationToken);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error.Description });

        return Ok(result.Value);
    }

    /// <summary>
    /// Gets low stock products
    /// </summary>
    [HttpGet("low-stock")]
    [ProducesResponseType(typeof(List<SalesProductListDto>), 200)]
    public async Task<ActionResult<List<SalesProductListDto>>> GetLowStockProducts(
        [FromQuery] bool onlyActive = true,
        CancellationToken cancellationToken = default)
    {
        var query = new GetLowStockProductsQuery { OnlyActive = onlyActive };
        var result = await _mediator.Send(query, cancellationToken);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error.Description });

        return Ok(result.Value);
    }

    /// <summary>
    /// Gets products available for web display
    /// </summary>
    [HttpGet("web")]
    [ProducesResponseType(typeof(List<SalesProductListDto>), 200)]
    public async Task<ActionResult<List<SalesProductListDto>>> GetWebProducts(
        [FromQuery] string? category = null,
        [FromQuery] string? brand = null,
        [FromQuery] bool onlyInStock = false,
        CancellationToken cancellationToken = default)
    {
        var query = new GetWebProductsQuery
        {
            Category = category,
            Brand = brand,
            OnlyInStock = onlyInStock
        };

        var result = await _mediator.Send(query, cancellationToken);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error.Description });

        return Ok(result.Value);
    }

    /// <summary>
    /// Gets all product categories
    /// </summary>
    [HttpGet("categories")]
    [ProducesResponseType(typeof(List<string>), 200)]
    public async Task<ActionResult<List<string>>> GetCategories(CancellationToken cancellationToken)
    {
        var query = new GetProductCategoriesQuery();
        var result = await _mediator.Send(query, cancellationToken);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error.Description });

        return Ok(result.Value);
    }

    /// <summary>
    /// Gets all product brands
    /// </summary>
    [HttpGet("brands")]
    [ProducesResponseType(typeof(List<string>), 200)]
    public async Task<ActionResult<List<string>>> GetBrands(CancellationToken cancellationToken)
    {
        var query = new GetProductBrandsQuery();
        var result = await _mediator.Send(query, cancellationToken);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error.Description });

        return Ok(result.Value);
    }

    /// <summary>
    /// Checks if a barcode already exists
    /// </summary>
    [HttpGet("check-barcode/{barcode}")]
    [ProducesResponseType(typeof(bool), 200)]
    public async Task<ActionResult<bool>> CheckBarcodeExists(
        string barcode,
        [FromQuery] Guid? excludeProductId = null,
        CancellationToken cancellationToken = default)
    {
        var query = new CheckBarcodeExistsQuery
        {
            Barcode = barcode,
            ExcludeProductId = excludeProductId
        };

        var result = await _mediator.Send(query, cancellationToken);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error.Description });

        return Ok(result.Value);
    }

    /// <summary>
    /// Checks if a SKU already exists
    /// </summary>
    [HttpGet("check-sku/{sku}")]
    [ProducesResponseType(typeof(bool), 200)]
    public async Task<ActionResult<bool>> CheckSKUExists(
        string sku,
        [FromQuery] Guid? excludeProductId = null,
        CancellationToken cancellationToken = default)
    {
        var query = new CheckSKUExistsQuery
        {
            SKU = sku,
            ExcludeProductId = excludeProductId
        };

        var result = await _mediator.Send(query, cancellationToken);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error.Description });

        return Ok(result.Value);
    }

    /// <summary>
    /// Creates a new sales product
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(SalesProductDto), 201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(409)]
    public async Task<ActionResult<SalesProductDto>> CreateProduct(
        [FromBody] CreateSalesProductCommand command,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(command, cancellationToken);

        if (!result.IsSuccess)
        {
            if (result.Error.Type == ErrorType.Conflict)
                return Conflict(new { error = result.Error.Description });
            return BadRequest(new { error = result.Error.Description });
        }

        return CreatedAtAction(
            nameof(GetProductById),
            new { id = result.Value.Id },
            result.Value);
    }

    /// <summary>
    /// Updates an existing sales product
    /// </summary>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(SalesProductDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(409)]
    public async Task<ActionResult<SalesProductDto>> UpdateProduct(
        Guid id,
        [FromBody] UpdateSalesProductCommand command,
        CancellationToken cancellationToken)
    {
        if (id != command.Id)
            return BadRequest(new { error = "ID in URL does not match ID in request body" });

        var result = await _mediator.Send(command, cancellationToken);

        if (!result.IsSuccess)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(new { error = result.Error.Description });
            if (result.Error.Type == ErrorType.Conflict)
                return Conflict(new { error = result.Error.Description });
            return BadRequest(new { error = result.Error.Description });
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Deletes a sales product (soft delete)
    /// </summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> DeleteProduct(Guid id, CancellationToken cancellationToken)
    {
        var command = new DeleteSalesProductCommand { Id = id };
        var result = await _mediator.Send(command, cancellationToken);

        if (!result.IsSuccess)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(new { error = result.Error.Description });
            return BadRequest(new { error = result.Error.Description });
        }

        return NoContent();
    }

    /// <summary>
    /// Activates a sales product
    /// </summary>
    [HttpPost("{id:guid}/activate")]
    [ProducesResponseType(typeof(SalesProductDto), 200)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<SalesProductDto>> ActivateProduct(Guid id, CancellationToken cancellationToken)
    {
        var command = new ActivateSalesProductCommand { Id = id };
        var result = await _mediator.Send(command, cancellationToken);

        if (!result.IsSuccess)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(new { error = result.Error.Description });
            return BadRequest(new { error = result.Error.Description });
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Deactivates a sales product
    /// </summary>
    [HttpPost("{id:guid}/deactivate")]
    [ProducesResponseType(typeof(SalesProductDto), 200)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<SalesProductDto>> DeactivateProduct(Guid id, CancellationToken cancellationToken)
    {
        var command = new DeactivateSalesProductCommand { Id = id };
        var result = await _mediator.Send(command, cancellationToken);

        if (!result.IsSuccess)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(new { error = result.Error.Description });
            return BadRequest(new { error = result.Error.Description });
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Adjusts product stock
    /// </summary>
    [HttpPost("{id:guid}/stock")]
    [ProducesResponseType(typeof(SalesProductDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<SalesProductDto>> AdjustStock(
        Guid id,
        [FromBody] AdjustStockDto dto,
        CancellationToken cancellationToken)
    {
        var command = new AdjustProductStockCommand
        {
            Id = id,
            Quantity = dto.Quantity,
            Reason = dto.Reason
        };

        var result = await _mediator.Send(command, cancellationToken);

        if (!result.IsSuccess)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(new { error = result.Error.Description });
            return BadRequest(new { error = result.Error.Description });
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Updates product pricing
    /// </summary>
    [HttpPut("{id:guid}/pricing")]
    [ProducesResponseType(typeof(SalesProductDto), 200)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<SalesProductDto>> UpdatePricing(
        Guid id,
        [FromBody] UpdateProductPricingCommand command,
        CancellationToken cancellationToken)
    {
        if (id != command.Id)
            return BadRequest(new { error = "ID in URL does not match ID in request body" });

        var result = await _mediator.Send(command, cancellationToken);

        if (!result.IsSuccess)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(new { error = result.Error.Description });
            return BadRequest(new { error = result.Error.Description });
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Updates product tax info
    /// </summary>
    [HttpPut("{id:guid}/tax")]
    [ProducesResponseType(typeof(SalesProductDto), 200)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<SalesProductDto>> UpdateTaxInfo(
        Guid id,
        [FromBody] UpdateProductTaxInfoCommand command,
        CancellationToken cancellationToken)
    {
        if (id != command.Id)
            return BadRequest(new { error = "ID in URL does not match ID in request body" });

        var result = await _mediator.Send(command, cancellationToken);

        if (!result.IsSuccess)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(new { error = result.Error.Description });
            return BadRequest(new { error = result.Error.Description });
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Sets product web visibility
    /// </summary>
    [HttpPost("{id:guid}/web-visibility")]
    [ProducesResponseType(typeof(SalesProductDto), 200)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<SalesProductDto>> SetWebVisibility(
        Guid id,
        [FromQuery] bool showOnWeb,
        CancellationToken cancellationToken)
    {
        var command = new SetProductWebVisibilityCommand
        {
            Id = id,
            ShowOnWeb = showOnWeb
        };

        var result = await _mediator.Send(command, cancellationToken);

        if (!result.IsSuccess)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(new { error = result.Error.Description });
            return BadRequest(new { error = result.Error.Description });
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Sets product sale availability
    /// </summary>
    [HttpPost("{id:guid}/sale-availability")]
    [ProducesResponseType(typeof(SalesProductDto), 200)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<SalesProductDto>> SetSaleAvailability(
        Guid id,
        [FromQuery] bool isAvailableForSale,
        CancellationToken cancellationToken)
    {
        var command = new SetProductSaleAvailabilityCommand
        {
            Id = id,
            IsAvailableForSale = isAvailableForSale
        };

        var result = await _mediator.Send(command, cancellationToken);

        if (!result.IsSuccess)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(new { error = result.Error.Description });
            return BadRequest(new { error = result.Error.Description });
        }

        return Ok(result.Value);
    }
}
