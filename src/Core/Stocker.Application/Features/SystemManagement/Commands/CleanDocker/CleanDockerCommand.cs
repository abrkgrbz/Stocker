using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.SystemManagement.Commands.CleanDocker;

public enum DockerCleanType
{
    BuildCache,
    Images,
    Containers,
    Volumes,
    All
}

public record DockerCleanupResult
{
    public bool Success { get; init; }
    public string Message { get; init; } = string.Empty;
    public string? SpaceClaimed { get; init; }
    public DockerCleanupDetails? Details { get; init; }
}

public record DockerCleanupDetails
{
    public int ImagesRemoved { get; init; }
    public int ContainersRemoved { get; init; }
    public int VolumesRemoved { get; init; }
    public string BuildCacheRemoved { get; init; } = string.Empty;
}

public class CleanDockerCommand : IRequest<Result<DockerCleanupResult>>
{
    public DockerCleanType Type { get; init; }
}
