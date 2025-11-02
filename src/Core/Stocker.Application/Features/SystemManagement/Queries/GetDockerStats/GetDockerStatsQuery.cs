using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.SystemManagement.Queries.GetDockerStats;

public record DockerStatsDto
{
    public ContainerStats Containers { get; init; } = new();
    public ImageStats Images { get; init; } = new();
    public VolumeStats Volumes { get; init; } = new();
    public int Networks { get; init; }
    public List<DockerCacheInfo> CacheInfo { get; init; } = new();
}

public record ContainerStats
{
    public int Running { get; init; }
    public int Stopped { get; init; }
    public int Total { get; init; }
}

public record ImageStats
{
    public int Total { get; init; }
    public string Size { get; init; } = string.Empty;
}

public record VolumeStats
{
    public int Total { get; init; }
    public string Size { get; init; } = string.Empty;
}

public record DockerCacheInfo
{
    public string Type { get; init; } = string.Empty;
    public string Total { get; init; } = string.Empty;
    public string Active { get; init; } = string.Empty;
    public string Size { get; init; } = string.Empty;
    public string Reclaimable { get; init; } = string.Empty;
}

public class GetDockerStatsQuery : IRequest<Result<DockerStatsDto>>
{
}
