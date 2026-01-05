using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Application.Features.Training.Commands;
using Stocker.Modules.HR.Application.Features.Training.Queries;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Domain.Enums;
using Stocker.SharedKernel.Authorization;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.API.Controllers;

[ApiController]
[Authorize]
[Route("api/hr/training")]
[RequireModule("HR")]
[ApiExplorerSettings(GroupName = "hr")]
public class TrainingController : ControllerBase
{
    private readonly IMediator _mediator;

    public TrainingController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Get trainings with filtering
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<TrainingDto>), 200)]
    [ProducesResponseType(400)]
    public async Task<ActionResult<List<TrainingDto>>> GetTrainings(
        [FromQuery] TrainingStatus? status = null,
        [FromQuery] bool? mandatoryOnly = null,
        [FromQuery] bool? onlineOnly = null,
        [FromQuery] bool? withCertification = null,
        [FromQuery] bool? upcomingOnly = null,
        [FromQuery] bool includeInactive = false)
    {
        var query = new GetTrainingsQuery
        {
            Status = status,
            MandatoryOnly = mandatoryOnly,
            OnlineOnly = onlineOnly,
            WithCertification = withCertification,
            UpcomingOnly = upcomingOnly,
            IncludeInactive = includeInactive
        };

        var result = await _mediator.Send(query);
        if (result.IsFailure) return BadRequest(result.Error);
        return Ok(result.Value);
    }

    /// <summary>
    /// Get training by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(TrainingDto), 200)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<TrainingDto>> GetTraining(int id, [FromQuery] bool includeParticipants = false)
    {
        var result = await _mediator.Send(new GetTrainingByIdQuery(id, includeParticipants));
        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound) return NotFound(result.Error);
            return BadRequest(result.Error);
        }
        return Ok(result.Value);
    }

    /// <summary>
    /// Get employee's trainings
    /// </summary>
    [HttpGet("employee/{employeeId}")]
    [ProducesResponseType(typeof(List<EmployeeTrainingDto>), 200)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<List<EmployeeTrainingDto>>> GetEmployeeTrainings(
        int employeeId,
        [FromQuery] EmployeeTrainingStatus? status = null,
        [FromQuery] bool? activeCertificatesOnly = null)
    {
        var query = new GetEmployeeTrainingsQuery
        {
            EmployeeId = employeeId,
            Status = status,
            ActiveCertificatesOnly = activeCertificatesOnly
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
    /// Create a new training
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(TrainingDto), 201)]
    [ProducesResponseType(400)]
    public async Task<ActionResult<TrainingDto>> CreateTraining(CreateTrainingDto dto)
    {
        var command = new CreateTrainingCommand { TrainingData = dto };
        var result = await _mediator.Send(command);

        if (result.IsFailure) return BadRequest(result.Error);
        return CreatedAtAction(nameof(GetTraining), new { id = result.Value.Id }, result.Value);
    }

    /// <summary>
    /// Update a training
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(TrainingDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<TrainingDto>> UpdateTraining(int id, UpdateTrainingDto dto)
    {
        var command = new UpdateTrainingCommand { TrainingId = id, TrainingData = dto };
        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound) return NotFound(result.Error);
            return BadRequest(result.Error);
        }
        return Ok(result.Value);
    }

    /// <summary>
    /// Delete a training
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> DeleteTraining(int id)
    {
        var command = new DeleteTrainingCommand { TrainingId = id };
        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound) return NotFound(result.Error);
            return BadRequest(result.Error);
        }
        return NoContent();
    }

    /// <summary>
    /// Enroll employee in training
    /// </summary>
    [HttpPost("{trainingId}/enroll")]
    [ProducesResponseType(typeof(EmployeeTrainingDto), 201)]
    [ProducesResponseType(400)]
    public async Task<ActionResult<EmployeeTrainingDto>> EnrollEmployee(int trainingId, EnrollEmployeeDto dto)
    {
        var command = new EnrollEmployeeCommand
        {
            TrainingId = trainingId,
            EmployeeId = dto.EmployeeId,
            Notes = dto.Notes
        };

        var result = await _mediator.Send(command);
        if (result.IsFailure) return BadRequest(result.Error);
        return Ok(result.Value);
    }

    /// <summary>
    /// Mark employee training as complete
    /// </summary>
    [HttpPost("{trainingId}/complete/{employeeId}")]
    [ProducesResponseType(typeof(EmployeeTrainingDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<EmployeeTrainingDto>> CompleteTraining(int trainingId, int employeeId, CompleteTrainingDto dto)
    {
        var command = new CompleteTrainingCommand
        {
            TrainingId = trainingId,
            EmployeeId = employeeId,
            Score = dto.Score,
            IsPassed = dto.IsPassed,
            CompletionNotes = dto.CompletionNotes
        };

        var result = await _mediator.Send(command);
        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound) return NotFound(result.Error);
            return BadRequest(result.Error);
        }
        return Ok(result.Value);
    }
}
