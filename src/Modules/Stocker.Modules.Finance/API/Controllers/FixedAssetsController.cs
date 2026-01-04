using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.Finance.Application.DTOs;
using Stocker.Modules.Finance.Application.Features.FixedAssets.Commands;
using Stocker.Modules.Finance.Application.Features.FixedAssets.Queries;
using Stocker.Modules.Finance.Domain.Entities;
using Stocker.SharedKernel.Authorization;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Finance.API.Controllers;

/// <summary>
/// Sabit Kıymet (Fixed Asset) API Controller
/// </summary>
[ApiController]
[Authorize]
[Route("api/finance/fixed-assets")]
[RequireModule("Finance")]
[ApiExplorerSettings(GroupName = "finance")]
public class FixedAssetsController : ControllerBase
{
    private readonly IMediator _mediator;

    public FixedAssetsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Get paginated fixed assets
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<FixedAssetSummaryDto>), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<PagedResult<FixedAssetSummaryDto>>> GetFixedAssets(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? searchTerm = null,
        [FromQuery] int? assetType = null,
        [FromQuery] int? category = null,
        [FromQuery] int? status = null,
        [FromQuery] bool? isActive = null,
        [FromQuery] bool? isFullyDepreciated = null,
        [FromQuery] int? locationId = null,
        [FromQuery] int? departmentId = null,
        [FromQuery] int? branchId = null,
        [FromQuery] int? custodianUserId = null,
        [FromQuery] DateTime? acquisitionDateFrom = null,
        [FromQuery] DateTime? acquisitionDateTo = null,
        [FromQuery] DateTime? inServiceDateFrom = null,
        [FromQuery] DateTime? inServiceDateTo = null,
        [FromQuery] decimal? minNetBookValue = null,
        [FromQuery] decimal? maxNetBookValue = null,
        [FromQuery] int? supplierId = null,
        [FromQuery] string? sortBy = null,
        [FromQuery] bool sortDescending = false)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var query = new GetFixedAssetsQuery
        {
            TenantId = tenantId.Value,
            Filter = new FixedAssetFilterDto
            {
                PageNumber = pageNumber,
                PageSize = pageSize,
                SearchTerm = searchTerm,
                AssetType = assetType.HasValue ? (FixedAssetType)assetType.Value : null,
                Category = category.HasValue ? (FixedAssetCategory)category.Value : null,
                Status = status.HasValue ? (FixedAssetStatus)status.Value : null,
                IsActive = isActive,
                IsFullyDepreciated = isFullyDepreciated,
                LocationId = locationId,
                DepartmentId = departmentId,
                BranchId = branchId,
                CustodianUserId = custodianUserId,
                AcquisitionDateFrom = acquisitionDateFrom,
                AcquisitionDateTo = acquisitionDateTo,
                InServiceDateFrom = inServiceDateFrom,
                InServiceDateTo = inServiceDateTo,
                MinNetBookValue = minNetBookValue,
                MaxNetBookValue = maxNetBookValue,
                SupplierId = supplierId,
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
    /// Get fixed asset by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(FixedAssetDto), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<FixedAssetDto>> GetFixedAsset(int id)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var query = new GetFixedAssetByIdQuery
        {
            TenantId = tenantId.Value,
            Id = id
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
    /// Get fixed assets by category
    /// </summary>
    [HttpGet("by-category/{category}")]
    [ProducesResponseType(typeof(List<FixedAssetSummaryDto>), 200)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<List<FixedAssetSummaryDto>>> GetFixedAssetsByCategory(
        int category,
        [FromQuery] bool? isActive = null,
        [FromQuery] bool includeDisposed = false)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var query = new GetFixedAssetsByCategoryQuery
        {
            TenantId = tenantId.Value,
            Category = (FixedAssetCategory)category,
            IsActive = isActive,
            IncludeDisposed = includeDisposed
        };

        var result = await _mediator.Send(query);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    /// <summary>
    /// Get assets for depreciation calculation
    /// </summary>
    [HttpGet("for-depreciation")]
    [ProducesResponseType(typeof(List<FixedAssetSummaryDto>), 200)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<List<FixedAssetSummaryDto>>> GetAssetsForDepreciation(
        [FromQuery] DateTime asOfDate,
        [FromQuery] int? category = null)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var query = new GetAssetsForDepreciationQuery
        {
            TenantId = tenantId.Value,
            AsOfDate = asOfDate,
            Category = category.HasValue ? (FixedAssetCategory)category.Value : null
        };

        var result = await _mediator.Send(query);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    /// <summary>
    /// Get fixed assets summary by category
    /// </summary>
    [HttpGet("summary-by-category")]
    [ProducesResponseType(typeof(List<FixedAssetCategorySummaryDto>), 200)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<List<FixedAssetCategorySummaryDto>>> GetSummaryByCategory(
        [FromQuery] bool includeDisposed = false)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var query = new GetFixedAssetsSummaryByCategoryQuery
        {
            TenantId = tenantId.Value,
            IncludeDisposed = includeDisposed
        };

        var result = await _mediator.Send(query);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    /// <summary>
    /// Get depreciation schedule for a fixed asset
    /// </summary>
    [HttpGet("{id}/depreciation-schedule")]
    [ProducesResponseType(typeof(DepreciationScheduleDto), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<DepreciationScheduleDto>> GetDepreciationSchedule(int id)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var query = new GetDepreciationScheduleQuery
        {
            TenantId = tenantId.Value,
            FixedAssetId = id
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
    /// Get depreciations by asset
    /// </summary>
    [HttpGet("{id}/depreciations")]
    [ProducesResponseType(typeof(List<DepreciationDto>), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<List<DepreciationDto>>> GetDepreciationsByAsset(int id)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var query = new GetDepreciationsByAssetQuery
        {
            TenantId = tenantId.Value,
            FixedAssetId = id
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
    /// Create a new fixed asset
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(FixedAssetDto), 201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<FixedAssetDto>> CreateFixedAsset([FromBody] CreateFixedAssetDto dto)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var command = new CreateFixedAssetCommand
        {
            TenantId = tenantId.Value,
            Data = dto
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return CreatedAtAction(nameof(GetFixedAsset), new { id = result.Value.Id }, result.Value);
    }

    /// <summary>
    /// Update a fixed asset
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(FixedAssetDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<FixedAssetDto>> UpdateFixedAsset(int id, [FromBody] UpdateFixedAssetDto dto)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var command = new UpdateFixedAssetCommand
        {
            TenantId = tenantId.Value,
            Id = id,
            Data = dto
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
    /// Calculate depreciation for a fixed asset
    /// </summary>
    [HttpPost("{id}/calculate-depreciation")]
    [ProducesResponseType(typeof(DepreciationDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<DepreciationDto>> CalculateDepreciation(int id, [FromBody] CalculateDepreciationDto dto)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var command = new CalculateDepreciationCommand
        {
            TenantId = tenantId.Value,
            FixedAssetId = id,
            Data = dto
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
    /// Dispose a fixed asset (sell, scrap, transfer)
    /// </summary>
    [HttpPost("{id}/dispose")]
    [ProducesResponseType(typeof(FixedAssetDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<FixedAssetDto>> DisposeFixedAsset(int id, [FromBody] DisposeFixedAssetDto dto)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var command = new DisposeFixedAssetCommand
        {
            TenantId = tenantId.Value,
            Id = id,
            Data = dto
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
    /// Add to cost of a fixed asset
    /// </summary>
    [HttpPost("{id}/add-to-cost")]
    [ProducesResponseType(typeof(FixedAssetDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<FixedAssetDto>> AddToCost(int id, [FromBody] AddToCostDto dto)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var command = new AddToCostCommand
        {
            TenantId = tenantId.Value,
            Id = id,
            Data = dto
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
    /// Revalue a fixed asset
    /// </summary>
    [HttpPost("{id}/revalue")]
    [ProducesResponseType(typeof(FixedAssetDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<FixedAssetDto>> RevalueFixedAsset(int id, [FromBody] RevaluationDto dto)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var command = new RevalueFixedAssetCommand
        {
            TenantId = tenantId.Value,
            Id = id,
            Data = dto
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
    /// Change fixed asset status
    /// </summary>
    [HttpPost("{id}/change-status")]
    [ProducesResponseType(typeof(FixedAssetDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<FixedAssetDto>> ChangeStatus(int id, [FromQuery] int newStatus)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var command = new ChangeFixedAssetStatusCommand
        {
            TenantId = tenantId.Value,
            Id = id,
            NewStatus = (FixedAssetStatus)newStatus
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
    /// Delete a fixed asset
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> DeleteFixedAsset(int id)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var command = new DeleteFixedAssetCommand
        {
            TenantId = tenantId.Value,
            Id = id
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
}
