using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Application.Features.Campaigns.Commands;
using Stocker.Modules.CRM.Application.Features.Campaigns.Queries;
using Stocker.Modules.CRM.Domain.Enums;
using MediatR;

namespace Stocker.Modules.CRM.API.Controllers;

[ApiController]
[Route("api/crm/[controller]")]
[Authorize]
public class CampaignsController : ControllerBase
{
    private readonly IMediator _mediator;

    public CampaignsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CampaignDto>>> GetCampaigns(
        [FromQuery] string? search,
        [FromQuery] CampaignStatus? status,
        [FromQuery] CampaignType? type,
        [FromQuery] DateTime? fromDate,
        [FromQuery] DateTime? toDate,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var query = new GetCampaignsQuery
        {
            Search = search,
            Status = status,
            Type = type,
            FromDate = fromDate,
            ToDate = toDate,
            Page = page,
            PageSize = pageSize
        };

        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<CampaignDto>> GetCampaign(Guid id)
    {
        var query = new GetCampaignByIdQuery { Id = id };
        var result = await _mediator.Send(query);
        
        if (result == null)
            return NotFound();

        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<CampaignDto>> CreateCampaign(CreateCampaignCommand command)
    {
        var result = await _mediator.Send(command);
        if (result.IsFailure)
            return BadRequest(result.Error);
        
        return CreatedAtAction(nameof(GetCampaign), new { id = result.Value.Id }, result.Value);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<CampaignDto>> UpdateCampaign(Guid id, UpdateCampaignCommand command)
    {
        if (id != command.Id)
            return BadRequest("Id mismatch");

        var result = await _mediator.Send(command);
        if (result.IsFailure)
            return BadRequest(result.Error);
        
        return Ok(result.Value);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCampaign(Guid id)
    {
        var command = new DeleteCampaignCommand { Id = id };
        await _mediator.Send(command);
        return NoContent();
    }

    [HttpPost("{id}/start")]
    public async Task<ActionResult<CampaignDto>> StartCampaign(Guid id)
    {
        var command = new StartCampaignCommand { Id = id };
        var result = await _mediator.Send(command);
        if (result.IsFailure)
            return BadRequest(result.Error);
        
        return Ok(result.Value);
    }

    [HttpPost("{id}/pause")]
    public async Task<ActionResult<CampaignDto>> PauseCampaign(Guid id)
    {
        var command = new PauseCampaignCommand { Id = id };
        var result = await _mediator.Send(command);
        if (result.IsFailure)
            return BadRequest(result.Error);
        
        return Ok(result.Value);
    }

    [HttpPost("{id}/complete")]
    public async Task<ActionResult<CampaignDto>> CompleteCampaign(Guid id)
    {
        var command = new CompleteCampaignCommand { Id = id };
        var result = await _mediator.Send(command);
        if (result.IsFailure)
            return BadRequest(result.Error);
        
        return Ok(result.Value);
    }

    [HttpGet("{id}/members")]
    public async Task<ActionResult<IEnumerable<CampaignMemberDto>>> GetCampaignMembers(Guid id)
    {
        var query = new GetCampaignMembersQuery { CampaignId = id };
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpPost("{id}/members")]
    public async Task<ActionResult<CampaignMemberDto>> AddMember(Guid id, AddCampaignMemberCommand command)
    {
        if (id != command.CampaignId)
            return BadRequest("Id mismatch");

        var result = await _mediator.Send(command);
        if (result.IsFailure)
            return BadRequest(result.Error);
        
        return Ok(result.Value);
    }

    [HttpDelete("{id}/members/{memberId}")]
    public async Task<IActionResult> RemoveMember(Guid id, Guid memberId)
    {
        var command = new RemoveCampaignMemberCommand 
        { 
            CampaignId = id,
            MemberId = memberId
        };
        
        await _mediator.Send(command);
        return NoContent();
    }

    [HttpPost("{id}/members/{memberId}/convert")]
    public async Task<ActionResult<CampaignMemberDto>> ConvertMember(Guid id, Guid memberId)
    {
        var command = new ConvertCampaignMemberCommand 
        { 
            CampaignId = id,
            MemberId = memberId
        };
        
        var result = await _mediator.Send(command);
        if (result.IsFailure)
            return BadRequest(result.Error);
        
        return Ok(result.Value);
    }

    [HttpGet("{id}/roi")]
    public async Task<ActionResult<CampaignRoiDto>> GetCampaignRoi(Guid id)
    {
        var query = new GetCampaignRoiQuery { CampaignId = id };
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id}/statistics")]
    public async Task<ActionResult<CampaignStatisticsDto>> GetCampaignStatistics(Guid id)
    {
        var query = new GetCampaignStatisticsQuery { CampaignId = id };
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpPost("bulk-import")]
    public async Task<ActionResult<BulkImportResultDto>> BulkImportMembers(BulkImportCampaignMembersCommand command)
    {
        var result = await _mediator.Send(command);
        if (result.IsFailure)
            return BadRequest(result.Error);
        
        return Ok(result.Value);
    }
}