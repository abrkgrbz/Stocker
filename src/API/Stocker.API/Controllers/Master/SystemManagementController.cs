using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.API.Controllers.Base;
using Stocker.Application.Features.SystemManagement.Commands.CleanDocker;
using Swashbuckle.AspNetCore.Annotations;
using Stocker.Application.Features.SystemManagement.Commands.ResolveError;
using Swashbuckle.AspNetCore.Annotations;
using Stocker.Application.Features.SystemManagement.Commands.DeleteError;
using Swashbuckle.AspNetCore.Annotations;
using Stocker.Application.Features.SystemManagement.Commands.ClearResolvedErrors;
using Swashbuckle.AspNetCore.Annotations;
using Stocker.Application.Features.SystemManagement.Queries.GetDockerStats;
using Swashbuckle.AspNetCore.Annotations;
using Stocker.Application.Features.SystemManagement.Queries.GetSystemErrors;
using Swashbuckle.AspNetCore.Annotations;
using Stocker.Application.Features.SystemManagement.Queries.GetErrorStatistics;
using Swashbuckle.AspNetCore.Annotations;

namespace Stocker.API.Controllers.Master;

[Authorize]
[Route("api/master/system-management")]
public class SystemManagementController : ApiController
{
    /// <summary>
    /// Get Docker system statistics
    /// </summary>
    [HttpGet("docker/stats")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetDockerStats(CancellationToken cancellationToken)
    {
        var query = new GetDockerStatsQuery();
        var result = await Mediator.Send(query, cancellationToken);

        if (!result.IsSuccess)
            return HandleFailure(result);

        return OkResponse(result.Value);
    }

    /// <summary>
    /// Clean Docker build cache
    /// </summary>
    [HttpPost("docker/clean-build-cache")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> CleanDockerBuildCache(CancellationToken cancellationToken)
    {
        var command = new CleanDockerCommand { Type = DockerCleanType.BuildCache };
        var result = await Mediator.Send(command, cancellationToken);

        if (!result.IsSuccess)
            return HandleFailure(result);

        return OkResponse(result.Value);
    }

    /// <summary>
    /// Clean unused Docker images
    /// </summary>
    [HttpPost("docker/clean-images")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> CleanDockerImages(CancellationToken cancellationToken)
    {
        var command = new CleanDockerCommand { Type = DockerCleanType.Images };
        var result = await Mediator.Send(command, cancellationToken);

        if (!result.IsSuccess)
            return HandleFailure(result);

        return OkResponse(result.Value);
    }

    /// <summary>
    /// Clean stopped Docker containers
    /// </summary>
    [HttpPost("docker/clean-containers")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> CleanDockerContainers(CancellationToken cancellationToken)
    {
        var command = new CleanDockerCommand { Type = DockerCleanType.Containers };
        var result = await Mediator.Send(command, cancellationToken);

        if (!result.IsSuccess)
            return HandleFailure(result);

        return OkResponse(result.Value);
    }

    /// <summary>
    /// Clean unused Docker volumes
    /// </summary>
    [HttpPost("docker/clean-volumes")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> CleanDockerVolumes(CancellationToken cancellationToken)
    {
        var command = new CleanDockerCommand { Type = DockerCleanType.Volumes };
        var result = await Mediator.Send(command, cancellationToken);

        if (!result.IsSuccess)
            return HandleFailure(result);

        return OkResponse(result.Value);
    }

    /// <summary>
    /// Clean all Docker resources
    /// </summary>
    [HttpPost("docker/clean-all")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> CleanAllDocker(CancellationToken cancellationToken)
    {
        var command = new CleanDockerCommand { Type = DockerCleanType.All };
        var result = await Mediator.Send(command, cancellationToken);

        if (!result.IsSuccess)
            return HandleFailure(result);

        return OkResponse(result.Value);
    }

    /// <summary>
    /// Get system errors with filtering and pagination
    /// </summary>
    [HttpGet("errors")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSystemErrors(
        [FromQuery] string? level,
        [FromQuery] string? source,
        [FromQuery] bool? resolved,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        CancellationToken cancellationToken = default)
    {
        var query = new GetSystemErrorsQuery
        {
            Level = level,
            Source = source,
            Resolved = resolved,
            Page = page,
            PageSize = pageSize
        };
        var result = await Mediator.Send(query, cancellationToken);

        if (!result.IsSuccess)
            return HandleFailure(result);

        return OkResponse(result.Value);
    }

    /// <summary>
    /// Get error statistics
    /// </summary>
    [HttpGet("errors/statistics")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetErrorStatistics(CancellationToken cancellationToken)
    {
        var query = new GetErrorStatisticsQuery();
        var result = await Mediator.Send(query, cancellationToken);

        if (!result.IsSuccess)
            return HandleFailure(result);

        return OkResponse(result.Value);
    }

    /// <summary>
    /// Mark error as resolved
    /// </summary>
    [HttpPost("errors/{errorId}/resolve")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> ResolveError(string errorId, CancellationToken cancellationToken)
    {
        var command = new ResolveErrorCommand { ErrorId = errorId };
        var result = await Mediator.Send(command, cancellationToken);

        if (!result.IsSuccess)
            return HandleFailure(result);

        return OkResponse(result.Value);
    }

    /// <summary>
    /// Delete error
    /// </summary>
    [HttpDelete("errors/{errorId}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> DeleteError(string errorId, CancellationToken cancellationToken)
    {
        var command = new DeleteErrorCommand { ErrorId = errorId };
        var result = await Mediator.Send(command, cancellationToken);

        if (!result.IsSuccess)
            return HandleFailure(result);

        return OkResponse(result.Value);
    }

    /// <summary>
    /// Clear all resolved errors
    /// </summary>
    [HttpDelete("errors/resolved")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> ClearResolvedErrors(CancellationToken cancellationToken)
    {
        var command = new ClearResolvedErrorsCommand();
        var result = await Mediator.Send(command, cancellationToken);

        if (!result.IsSuccess)
            return HandleFailure(result);

        return OkResponse(result.Value);
    }
}
