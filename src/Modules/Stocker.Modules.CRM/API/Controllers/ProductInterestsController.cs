using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.CRM.Application.Features.ProductInterests.Commands;
using Stocker.Modules.CRM.Application.Features.ProductInterests.Queries;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.SharedKernel.Authorization;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.API.Controllers;

[ApiController]
[Authorize]
[Route("api/crm/product-interests")]
[RequireModule("CRM")]
[ApiExplorerSettings(GroupName = "crm")]
public class ProductInterestsController : ControllerBase
{
    private readonly IMediator _mediator;

    public ProductInterestsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    private Guid GetTenantId()
    {
        var tenantIdClaim = User.FindFirst("TenantId")?.Value;
        return Guid.Parse(tenantIdClaim ?? throw new UnauthorizedAccessException("Tenant ID not found"));
    }

    [HttpGet]
    public async Task<IActionResult> GetProductInterests(
        [FromQuery] Guid? customerId = null,
        [FromQuery] Guid? leadId = null,
        [FromQuery] InterestStatus? status = null,
        [FromQuery] InterestLevel? level = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        var tenantId = GetTenantId();
        var query = new GetProductInterestsQuery
        {
            TenantId = tenantId,
            CustomerId = customerId,
            LeadId = leadId,
            Status = status,
            InterestLevel = level,
            Page = page,
            PageSize = pageSize
        };

        var result = await _mediator.Send(query, cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetProductInterest(Guid id, CancellationToken cancellationToken = default)
    {
        var tenantId = GetTenantId();
        var query = new GetProductInterestByIdQuery { TenantId = tenantId, Id = id };
        var result = await _mediator.Send(query, cancellationToken);

        return result != null
            ? Ok(result)
            : NotFound();
    }

    [HttpPost]
    public async Task<IActionResult> CreateProductInterest(
        [FromBody] CreateProductInterestRequest request,
        CancellationToken cancellationToken = default)
    {
        var tenantId = GetTenantId();
        var command = new CreateProductInterestCommand(
            tenantId,
            request.ProductId,
            request.ProductName,
            request.InterestLevel,
            request.Source ?? InterestSource.Direct,
            request.CustomerId,
            null,
            request.LeadId,
            null,
            null,
            request.Quantity,
            request.Unit,
            request.Budget);

        var result = await _mediator.Send(command, cancellationToken);

        return result.IsSuccess
            ? CreatedAtAction(nameof(GetProductInterest), new { id = result.Value }, result.Value)
            : BadRequest(result.Error);
    }

    // TODO: Add commands for the following specialized operations:
    // - UpdateInterestLevel, SetQuotedPrice
    // - MarkAsQualified, MarkAsPurchased, MarkAsLost

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProductInterest(Guid id, CancellationToken cancellationToken = default)
    {
        var tenantId = GetTenantId();
        var command = new DeleteProductInterestCommand(id, tenantId);
        var result = await _mediator.Send(command, cancellationToken);

        return result.IsSuccess
            ? NoContent()
            : NotFound(result.Error);
    }
}

public record CreateProductInterestRequest(
    int ProductId,
    string ProductName,
    InterestLevel InterestLevel = InterestLevel.Medium,
    Guid? CustomerId = null,
    Guid? LeadId = null,
    decimal? Quantity = null,
    string? Unit = null,
    decimal? Budget = null,
    InterestSource? Source = null);

public record UpdateInterestLevelRequest(InterestLevel Level);

public record SetQuotedPriceRequest(decimal Price);

public record MarkAsLostRequest(string? Reason = null);
