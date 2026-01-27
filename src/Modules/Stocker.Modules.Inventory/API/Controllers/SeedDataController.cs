using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.Inventory.Application.Features.SeedData.Commands;
using Stocker.SharedKernel.Authorization;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.API.Controllers;

[ApiController]
[Authorize]
[Route("api/inventory/seed-data")]
[RequireModule("Inventory")]
[ApiExplorerSettings(GroupName = "inventory")]
public class SeedDataController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ITenantService _tenantService;

    public SeedDataController(IMediator mediator, ITenantService tenantService)
    {
        _mediator = mediator;
        _tenantService = tenantService;
    }

    /// <summary>
    /// Seed standard inventory data (units, packaging types, categories, warehouse)
    /// </summary>
    /// <remarks>
    /// This endpoint loads standard inventory data for the current tenant including:
    /// - 26 measurement units (ADET, KG, LT, etc.)
    /// - 29 packaging types (boxes, cartons, pallets, etc.)
    /// - 8 default categories (HAMMADDE, MAMUL, etc.)
    /// - 1 default warehouse (MERKEZ)
    ///
    /// The operation is idempotent - if data already exists, it will not be duplicated.
    /// </remarks>
    [HttpPost("load-standard")]
    [ProducesResponseType(typeof(SeedInventoryDataResult), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<SeedInventoryDataResult>> LoadStandardData()
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue)
        {
            return BadRequest(new Error("Tenant.Required", "Kiracı kimliği gereklidir", ErrorType.Validation));
        }

        var command = new SeedInventoryDataCommand
        {
            TenantId = tenantId.Value,
            ForceReseed = false
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }
}
