using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Application.Features.JobApplications.Commands;
using Stocker.Modules.HR.Application.Features.JobApplications.Queries;
using Stocker.SharedKernel.Authorization;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.HR.API.Controllers;

[ApiController]
[Authorize]
[Route("api/hr/job-applications")]
[RequireModule("HR")]
[ApiExplorerSettings(GroupName = "hr")]
public class JobApplicationsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ITenantService _tenantService;

    public JobApplicationsController(IMediator mediator, ITenantService tenantService)
    {
        _mediator = mediator;
        _tenantService = tenantService;
    }

    [HttpGet]
    public async Task<ActionResult<List<JobApplicationDto>>> GetAll()
    {
        var result = await _mediator.Send(new GetJobApplicationsQuery());
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<JobApplicationDto>> GetJobApplication(int id)
    {
        var result = await _mediator.Send(new GetJobApplicationByIdQuery { Id = id });
        if (result.IsFailure) return NotFound(result.Error);
        return Ok(result.Value);
    }

    [HttpPost]
    public async Task<ActionResult<int>> Create(CreateJobApplicationCommand command)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue)
            return BadRequest("Tenant context is required");

        var result = await _mediator.Send(command with { TenantId = tenantId.Value });
        if (result.IsFailure) return BadRequest(result.Error);
        return CreatedAtAction(nameof(GetJobApplication), new { id = result.Value }, result.Value);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> Update(int id, UpdateJobApplicationCommand command)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue)
            return BadRequest("Tenant context is required");

        var result = await _mediator.Send(command with { TenantId = tenantId.Value, JobApplicationId = id });
        if (result.IsFailure) return BadRequest(result.Error);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue)
            return BadRequest("Tenant context is required");

        var result = await _mediator.Send(new DeleteJobApplicationCommand(tenantId.Value, id));
        if (result.IsFailure) return BadRequest(result.Error);
        return NoContent();
    }
}
