using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Application.Features.JobPostings.Commands;
using Stocker.Modules.HR.Application.Features.JobPostings.Queries;
using Stocker.SharedKernel.Authorization;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.HR.API.Controllers;

[ApiController]
[Authorize]
[Route("api/hr/job-postings")]
[RequireModule("HR")]
[ApiExplorerSettings(GroupName = "hr")]
public class JobPostingsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ITenantService _tenantService;

    public JobPostingsController(IMediator mediator, ITenantService tenantService)
    {
        _mediator = mediator;
        _tenantService = tenantService;
    }

    [HttpGet]
    public async Task<ActionResult<List<JobPostingDto>>> GetAll()
    {
        var result = await _mediator.Send(new GetJobPostingsQuery());
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<JobPostingDto>> GetJobPosting(int id)
    {
        var result = await _mediator.Send(new GetJobPostingByIdQuery { Id = id });
        if (result.IsFailure) return NotFound(result.Error);
        return Ok(result.Value);
    }

    [HttpPost]
    public async Task<ActionResult<int>> Create(CreateJobPostingCommand command)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return Unauthorized();

        var result = await _mediator.Send(command with { TenantId = tenantId.Value });
        if (result.IsFailure) return BadRequest(result.Error);
        return CreatedAtAction(nameof(GetJobPosting), new { id = result.Value }, result.Value);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> Update(int id, UpdateJobPostingCommand command)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return Unauthorized();

        var result = await _mediator.Send(command with { TenantId = tenantId.Value, JobPostingId = id });
        if (result.IsFailure) return BadRequest(result.Error);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return Unauthorized();

        var result = await _mediator.Send(new DeleteJobPostingCommand(tenantId.Value, id));
        if (result.IsFailure) return BadRequest(result.Error);
        return NoContent();
    }
}
