using Stocker.SharedKernel.Authorization;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Pagination;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Application.Features.Activities.Commands;
using Stocker.Modules.CRM.Application.Features.Activities.Queries;
using Stocker.Modules.CRM.Domain.Enums;
using MediatR;

namespace Stocker.Modules.CRM.API.Controllers;

[ApiController]
[Authorize]
[Route("api/crm/[controller]")]
[RequireModule("CRM")]
[ApiExplorerSettings(GroupName = "crm")]
public class ActivitiesController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ICurrentUserService _currentUserService;

    public ActivitiesController(IMediator mediator, ICurrentUserService currentUserService)
    {
        _mediator = mediator;
        _currentUserService = currentUserService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<ActivityDto>), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<PagedResult<ActivityDto>>> GetActivities(
        [FromQuery] ActivityType? type,
        [FromQuery] ActivityStatus? status,
        [FromQuery] Guid? leadId,
        [FromQuery] Guid? customerId,
        [FromQuery] Guid? opportunityId,
        [FromQuery] Guid? dealId,
        [FromQuery] Guid? assignedToId,
        [FromQuery] DateTime? fromDate,
        [FromQuery] DateTime? toDate,
        [FromQuery] bool? overdue,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var query = new GetActivitiesQuery
        {
            TenantId = _currentUserService.TenantId ?? Guid.Empty,
            Type = type,
            Status = status,
            LeadId = leadId,
            CustomerId = customerId,
            OpportunityId = opportunityId,
            DealId = dealId,
            AssignedToId = assignedToId,
            FromDate = fromDate,
            ToDate = toDate,
            Overdue = overdue,
            Page = page,
            PageSize = pageSize
        };

        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ActivityDto), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<ActivityDto>> GetActivity(Guid id)
    {
        var query = new GetActivityByIdQuery { Id = id };
        var result = await _mediator.Send(query);
        
        if (result == null)
            return NotFound();

        return Ok(result);
    }

    [HttpPost]
    [ProducesResponseType(typeof(ActivityDto), 201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<ActivityDto>> CreateActivity(CreateActivityCommand command)
    {
        var result = await _mediator.Send(command);
        if (result.IsFailure)
            return BadRequest(result.Error);
        
        return CreatedAtAction(nameof(GetActivity), new { id = result.Value.Id }, result.Value);
    }

    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ActivityDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<ActivityDto>> UpdateActivity(Guid id, UpdateActivityCommand command)
    {
        if (id != command.Id)
            return BadRequest("Id mismatch");

        var result = await _mediator.Send(command);
        if (result.IsFailure)
            return BadRequest(result.Error);
        
        return Ok(result.Value);
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> DeleteActivity(Guid id)
    {
        var command = new DeleteActivityCommand { Id = id };
        await _mediator.Send(command);
        return NoContent();
    }

    [HttpPost("{id}/complete")]
    [ProducesResponseType(typeof(ActivityDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<ActivityDto>> CompleteActivity(Guid id, CompleteActivityCommand command)
    {
        if (id != command.Id)
            return BadRequest("Id mismatch");

        var result = await _mediator.Send(command);
        if (result.IsFailure)
            return BadRequest(result.Error);
        
        return Ok(result.Value);
    }

    [HttpPost("{id}/cancel")]
    [ProducesResponseType(typeof(ActivityDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<ActivityDto>> CancelActivity(Guid id, CancelActivityCommand command)
    {
        if (id != command.Id)
            return BadRequest("Id mismatch");

        var result = await _mediator.Send(command);
        if (result.IsFailure)
            return BadRequest(result.Error);
        
        return Ok(result.Value);
    }

    [HttpPost("{id}/reschedule")]
    [ProducesResponseType(typeof(ActivityDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<ActivityDto>> RescheduleActivity(Guid id, RescheduleActivityCommand command)
    {
        if (id != command.Id)
            return BadRequest("Id mismatch");

        var result = await _mediator.Send(command);
        if (result.IsFailure)
            return BadRequest(result.Error);
        
        return Ok(result.Value);
    }

    [HttpGet("upcoming")]
    [ProducesResponseType(typeof(IEnumerable<ActivityDto>), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<IEnumerable<ActivityDto>>> GetUpcomingActivities(
        [FromQuery] int days = 7,
        [FromQuery] Guid? assignedToId = null)
    {
        var query = new GetUpcomingActivitiesQuery 
        { 
            Days = days,
            AssignedToId = assignedToId
        };
        
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("overdue")]
    [ProducesResponseType(typeof(IEnumerable<ActivityDto>), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<IEnumerable<ActivityDto>>> GetOverdueActivities(
        [FromQuery] Guid? assignedToId = null)
    {
        var query = new GetOverdueActivitiesQuery 
        { 
            AssignedToId = assignedToId
        };
        
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("calendar")]
    [ProducesResponseType(typeof(IEnumerable<ActivityDto>), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<IEnumerable<ActivityDto>>> GetCalendarActivities(
        [FromQuery] DateTime startDate,
        [FromQuery] DateTime endDate,
        [FromQuery] Guid? assignedToId = null)
    {
        var query = new GetCalendarActivitiesQuery
        {
            StartDate = startDate,
            EndDate = endDate,
            AssignedToId = assignedToId
        };

        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("statistics")]
    [ProducesResponseType(typeof(ActivityStatisticsDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<ActivityStatisticsDto>> GetActivityStatistics(
        [FromQuery] DateTime? fromDate,
        [FromQuery] DateTime? toDate,
        [FromQuery] Guid? assignedToId = null)
    {
        var query = new GetActivityStatisticsQuery
        {
            FromDate = fromDate,
            ToDate = toDate,
            AssignedToId = assignedToId
        };

        var result = await _mediator.Send(query);
        return Ok(result);
    }
}