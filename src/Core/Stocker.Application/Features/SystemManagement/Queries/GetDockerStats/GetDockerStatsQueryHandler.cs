using MediatR;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.SystemManagement.Queries.GetDockerStats;

public class GetDockerStatsQueryHandler : IRequestHandler<GetDockerStatsQuery, Result<DockerStatsDto>>
{
    private readonly IDockerManagementService _dockerService;

    public GetDockerStatsQueryHandler(IDockerManagementService dockerService)
    {
        _dockerService = dockerService;
    }

    public async Task<Result<DockerStatsDto>> Handle(GetDockerStatsQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var stats = await _dockerService.GetDockerStatsAsync(cancellationToken);
            return Result<DockerStatsDto>.Success(stats);
        }
        catch (Exception ex)
        {
            return Result<DockerStatsDto>.Failure(new Error("DockerStats.Failed", ex.Message));
        }
    }
}
