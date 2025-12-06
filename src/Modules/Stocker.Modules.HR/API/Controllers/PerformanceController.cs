using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Application.Features.Performance.Commands;
using Stocker.Modules.HR.Application.Features.Performance.Queries;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Domain.Enums;
using Stocker.SharedKernel.Authorization;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.API.Controllers;

[ApiController]
[Authorize]
[Route("api/hr/performance")]
[RequireModule("HR")]
[ApiExplorerSettings(GroupName = "hr")]
public class PerformanceController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ITenantService _tenantService;

    public PerformanceController(IMediator mediator, ITenantService tenantService)
    {
        _mediator = mediator;
        _tenantService = tenantService;
    }

    #region Performance Reviews

    /// <summary>
    /// Get performance reviews with filtering
    /// </summary>
    [HttpGet("reviews")]
    [ProducesResponseType(typeof(List<PerformanceReviewDto>), 200)]
    [ProducesResponseType(400)]
    public async Task<ActionResult<List<PerformanceReviewDto>>> GetReviews(
        [FromQuery] int? employeeId = null,
        [FromQuery] int? reviewerId = null,
        [FromQuery] int? year = null,
        [FromQuery] int? quarter = null,
        [FromQuery] PerformanceReviewStatus? status = null,
        [FromQuery] bool includeCriteria = false)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var query = new GetPerformanceReviewsQuery
        {
            TenantId = tenantId.Value,
            EmployeeId = employeeId,
            ReviewerId = reviewerId,
            Year = year,
            Quarter = quarter,
            Status = status,
            IncludeCriteria = includeCriteria
        };

        var result = await _mediator.Send(query);
        if (result.IsFailure) return BadRequest(result.Error);
        return Ok(result.Value);
    }

    /// <summary>
    /// Get performance review by ID
    /// </summary>
    [HttpGet("reviews/{id}")]
    [ProducesResponseType(typeof(PerformanceReviewDto), 200)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<PerformanceReviewDto>> GetReview(int id, [FromQuery] bool includeGoals = false)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var query = new GetPerformanceReviewByIdQuery
        {
            TenantId = tenantId.Value,
            ReviewId = id,
            IncludeGoals = includeGoals
        };

        var result = await _mediator.Send(query);
        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound) return NotFound(result.Error);
            return BadRequest(result.Error);
        }
        return Ok(result.Value);
    }

    /// <summary>
    /// Create a performance review
    /// </summary>
    [HttpPost("reviews")]
    [ProducesResponseType(typeof(PerformanceReviewDto), 201)]
    [ProducesResponseType(400)]
    public async Task<ActionResult<PerformanceReviewDto>> CreateReview(CreatePerformanceReviewDto dto)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var command = new CreatePerformanceReviewCommand { TenantId = tenantId.Value, ReviewData = dto };
        var result = await _mediator.Send(command);

        if (result.IsFailure) return BadRequest(result.Error);
        return CreatedAtAction(nameof(GetReview), new { id = result.Value.Id }, result.Value);
    }

    /// <summary>
    /// Update a performance review
    /// </summary>
    [HttpPut("reviews/{id}")]
    [ProducesResponseType(typeof(PerformanceReviewDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<PerformanceReviewDto>> UpdateReview(int id, UpdatePerformanceReviewDto dto)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var command = new UpdatePerformanceReviewCommand { TenantId = tenantId.Value, ReviewId = id, ReviewData = dto };
        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound) return NotFound(result.Error);
            return BadRequest(result.Error);
        }
        return Ok(result.Value);
    }

    /// <summary>
    /// Complete/submit a performance review
    /// </summary>
    [HttpPost("reviews/{id}/complete")]
    [ProducesResponseType(typeof(PerformanceReviewDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<PerformanceReviewDto>> CompleteReview(int id, CompleteReviewDto dto)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var command = new CompletePerformanceReviewCommand
        {
            TenantId = tenantId.Value,
            ReviewId = id,
            OverallRating = dto.OverallRating,
            FinalComments = dto.FinalComments
        };

        var result = await _mediator.Send(command);
        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound) return NotFound(result.Error);
            return BadRequest(result.Error);
        }
        return Ok(result.Value);
    }

    #endregion

    #region Performance Goals

    /// <summary>
    /// Get performance goals with filtering
    /// </summary>
    [HttpGet("goals")]
    [ProducesResponseType(typeof(List<PerformanceGoalDto>), 200)]
    [ProducesResponseType(400)]
    public async Task<ActionResult<List<PerformanceGoalDto>>> GetGoals(
        [FromQuery] int? employeeId = null,
        [FromQuery] int? reviewId = null,
        [FromQuery] GoalStatus? status = null,
        [FromQuery] string? category = null,
        [FromQuery] bool? activeOnly = null,
        [FromQuery] bool? overdueOnly = null)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var query = new GetPerformanceGoalsQuery
        {
            TenantId = tenantId.Value,
            EmployeeId = employeeId,
            ReviewId = reviewId,
            Status = status,
            Category = category,
            ActiveOnly = activeOnly,
            OverdueOnly = overdueOnly
        };

        var result = await _mediator.Send(query);
        if (result.IsFailure) return BadRequest(result.Error);
        return Ok(result.Value);
    }

    /// <summary>
    /// Get performance goal by ID
    /// </summary>
    [HttpGet("goals/{id}")]
    [ProducesResponseType(typeof(PerformanceGoalDto), 200)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<PerformanceGoalDto>> GetGoal(int id)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var query = new GetPerformanceGoalByIdQuery { TenantId = tenantId.Value, GoalId = id };
        var result = await _mediator.Send(query);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound) return NotFound(result.Error);
            return BadRequest(result.Error);
        }
        return Ok(result.Value);
    }

    /// <summary>
    /// Create a performance goal
    /// </summary>
    [HttpPost("goals")]
    [ProducesResponseType(typeof(PerformanceGoalDto), 201)]
    [ProducesResponseType(400)]
    public async Task<ActionResult<PerformanceGoalDto>> CreateGoal(CreatePerformanceGoalDto dto)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var command = new CreatePerformanceGoalCommand { TenantId = tenantId.Value, GoalData = dto };
        var result = await _mediator.Send(command);

        if (result.IsFailure) return BadRequest(result.Error);
        return CreatedAtAction(nameof(GetGoal), new { id = result.Value.Id }, result.Value);
    }

    /// <summary>
    /// Update a performance goal
    /// </summary>
    [HttpPut("goals/{id}")]
    [ProducesResponseType(typeof(PerformanceGoalDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<PerformanceGoalDto>> UpdateGoal(int id, UpdatePerformanceGoalDto dto)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var command = new UpdatePerformanceGoalCommand { TenantId = tenantId.Value, GoalId = id, GoalData = dto };
        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound) return NotFound(result.Error);
            return BadRequest(result.Error);
        }
        return Ok(result.Value);
    }

    /// <summary>
    /// Update goal progress
    /// </summary>
    [HttpPut("goals/{id}/progress")]
    [ProducesResponseType(typeof(PerformanceGoalDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<PerformanceGoalDto>> UpdateGoalProgress(int id, UpdateGoalProgressDto dto)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var command = new UpdateGoalProgressCommand
        {
            TenantId = tenantId.Value,
            GoalId = id,
            Progress = dto.Progress,
            Notes = dto.Notes
        };

        var result = await _mediator.Send(command);
        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound) return NotFound(result.Error);
            return BadRequest(result.Error);
        }
        return Ok(result.Value);
    }

    #endregion

    private static Error CreateTenantError()
    {
        return new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation);
    }
}
