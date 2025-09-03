using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MediatR;
using Stocker.API.Controllers.Base;
using Stocker.Application.Features.StockMovements.Commands.CreateStockMovement;

namespace Stocker.API.Controllers.Tenant;

[Authorize]
[Route("api/tenant/[controller]")]
public class StockMovementsController : ApiController
{
    private readonly IMediator _mediator;

    public StockMovementsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<IActionResult> CreateMovement([FromBody] CreateStockMovementCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(CreateSuccessResponse(result));
    }

    [HttpPost("inbound")]
    public async Task<IActionResult> CreateInboundMovement([FromBody] CreateStockMovementCommand command)
    {
        command.Type = Domain.Tenant.Enums.MovementType.Inbound;
        var result = await _mediator.Send(command);
        return Ok(CreateSuccessResponse(result));
    }

    [HttpPost("outbound")]
    public async Task<IActionResult> CreateOutboundMovement([FromBody] CreateStockMovementCommand command)
    {
        command.Type = Domain.Tenant.Enums.MovementType.Outbound;
        var result = await _mediator.Send(command);
        return Ok(CreateSuccessResponse(result));
    }

    [HttpPost("transfer")]
    public async Task<IActionResult> CreateTransferMovement([FromBody] CreateStockMovementCommand command)
    {
        command.Type = Domain.Tenant.Enums.MovementType.Transfer;
        var result = await _mediator.Send(command);
        return Ok(CreateSuccessResponse(result));
    }

    [HttpPost("adjustment")]
    public async Task<IActionResult> CreateAdjustmentMovement([FromBody] CreateStockMovementCommand command)
    {
        command.Type = Domain.Tenant.Enums.MovementType.Adjustment;
        var result = await _mediator.Send(command);
        return Ok(CreateSuccessResponse(result));
    }

    // TODO: Add more endpoints for getting movements, approving, cancelling etc.
}