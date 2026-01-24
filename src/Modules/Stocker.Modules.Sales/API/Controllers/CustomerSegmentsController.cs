using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Application.Features.CustomerSegments.Commands;
using Stocker.Modules.Sales.Application.Features.CustomerSegments.Queries;

namespace Stocker.Modules.Sales.API.Controllers;

[ApiController]
[Route("api/sales/[controller]")]
[Authorize]
public class CustomerSegmentsController : ControllerBase
{
    private readonly IMediator _mediator;

    public CustomerSegmentsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetSegments(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? priority = null,
        [FromQuery] bool? isActive = null)
    {
        var result = await _mediator.Send(new GetCustomerSegmentsPagedQuery(page, pageSize, priority, isActive));
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetSegment(Guid id)
    {
        var result = await _mediator.Send(new GetCustomerSegmentByIdQuery(id));
        return result.IsSuccess ? Ok(result.Value) : NotFound(result.Error);
    }

    [HttpGet("by-code/{code}")]
    public async Task<IActionResult> GetSegmentByCode(string code)
    {
        var result = await _mediator.Send(new GetCustomerSegmentByCodeQuery(code));
        return result.IsSuccess ? Ok(result.Value) : NotFound(result.Error);
    }

    [HttpGet("active")]
    public async Task<IActionResult> GetActiveSegments()
    {
        var result = await _mediator.Send(new GetActiveCustomerSegmentsQuery());
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
    }

    [HttpGet("default")]
    public async Task<IActionResult> GetDefaultSegment()
    {
        var result = await _mediator.Send(new GetDefaultCustomerSegmentQuery());
        return result.IsSuccess ? Ok(result.Value) : NotFound(result.Error);
    }

    [HttpGet("by-priority/{priority}")]
    public async Task<IActionResult> GetSegmentsByPriority(string priority)
    {
        var result = await _mediator.Send(new GetCustomerSegmentsByPriorityQuery(priority));
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
    }

    [HttpPost]
    public async Task<IActionResult> CreateSegment([FromBody] CreateCustomerSegmentDto dto)
    {
        var result = await _mediator.Send(new CreateCustomerSegmentCommand(dto));
        return result.IsSuccess ? CreatedAtAction(nameof(GetSegment), new { id = result.Value.Id }, result.Value) : BadRequest(result.Error);
    }

    [HttpPut("{id:guid}/pricing")]
    public async Task<IActionResult> SetPricing(Guid id, [FromBody] SetSegmentPricingDto dto)
    {
        var result = await _mediator.Send(new SetSegmentPricingCommand(id, dto));
        return result.IsSuccess ? NoContent() : BadRequest(result.Error);
    }

    [HttpPut("{id:guid}/credit-terms")]
    public async Task<IActionResult> SetCreditTerms(Guid id, [FromBody] SetSegmentCreditTermsDto dto)
    {
        var result = await _mediator.Send(new SetSegmentCreditTermsCommand(id, dto));
        return result.IsSuccess ? NoContent() : BadRequest(result.Error);
    }

    [HttpPut("{id:guid}/service-level")]
    public async Task<IActionResult> SetServiceLevel(Guid id, [FromBody] SetSegmentServiceLevelDto dto)
    {
        var result = await _mediator.Send(new SetSegmentServiceLevelCommand(id, dto));
        return result.IsSuccess ? NoContent() : BadRequest(result.Error);
    }

    [HttpPut("{id:guid}/eligibility")]
    public async Task<IActionResult> SetEligibility(Guid id, [FromBody] SetSegmentEligibilityDto dto)
    {
        var result = await _mediator.Send(new SetSegmentEligibilityCommand(id, dto));
        return result.IsSuccess ? NoContent() : BadRequest(result.Error);
    }

    [HttpPut("{id:guid}/benefits")]
    public async Task<IActionResult> SetBenefits(Guid id, [FromBody] SetSegmentBenefitsDto dto)
    {
        var result = await _mediator.Send(new SetSegmentBenefitsCommand(id, dto));
        return result.IsSuccess ? NoContent() : BadRequest(result.Error);
    }

    [HttpPut("{id:guid}/visual")]
    public async Task<IActionResult> SetVisual(Guid id, [FromBody] SetSegmentVisualDto dto)
    {
        var result = await _mediator.Send(new SetSegmentVisualCommand(id, dto));
        return result.IsSuccess ? NoContent() : BadRequest(result.Error);
    }

    [HttpPut("{id:guid}/details")]
    public async Task<IActionResult> UpdateDetails(Guid id, [FromBody] UpdateSegmentDetailsDto dto)
    {
        var result = await _mediator.Send(new UpdateSegmentDetailsCommand(id, dto));
        return result.IsSuccess ? NoContent() : BadRequest(result.Error);
    }

    [HttpPost("{id:guid}/customers")]
    public async Task<IActionResult> AssignCustomer(Guid id, [FromBody] AssignCustomerToSegmentDto dto)
    {
        var result = await _mediator.Send(new AssignCustomerCommand(id, dto));
        return result.IsSuccess ? NoContent() : BadRequest(result.Error);
    }

    [HttpDelete("{id:guid}/customers/{customerId:guid}")]
    public async Task<IActionResult> RemoveCustomer(Guid id, Guid customerId)
    {
        var result = await _mediator.Send(new RemoveCustomerFromSegmentCommand(id, customerId));
        return result.IsSuccess ? NoContent() : BadRequest(result.Error);
    }

    [HttpPost("{id:guid}/set-default")]
    public async Task<IActionResult> SetDefault(Guid id)
    {
        var result = await _mediator.Send(new SetDefaultSegmentCommand(id));
        return result.IsSuccess ? NoContent() : BadRequest(result.Error);
    }

    [HttpPost("{id:guid}/activate")]
    public async Task<IActionResult> Activate(Guid id)
    {
        var result = await _mediator.Send(new ActivateSegmentCommand(id));
        return result.IsSuccess ? NoContent() : BadRequest(result.Error);
    }

    [HttpPost("{id:guid}/deactivate")]
    public async Task<IActionResult> Deactivate(Guid id)
    {
        var result = await _mediator.Send(new DeactivateSegmentCommand(id));
        return result.IsSuccess ? NoContent() : BadRequest(result.Error);
    }
}
