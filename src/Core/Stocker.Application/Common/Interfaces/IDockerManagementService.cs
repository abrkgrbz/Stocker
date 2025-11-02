using Stocker.Application.Features.SystemManagement.Commands.CleanDocker;
using Stocker.Application.Features.SystemManagement.Queries.GetDockerStats;

namespace Stocker.Application.Common.Interfaces;

public interface IDockerManagementService
{
    Task<DockerStatsDto> GetDockerStatsAsync(CancellationToken cancellationToken = default);
    Task<DockerCleanupResult> CleanBuildCacheAsync(CancellationToken cancellationToken = default);
    Task<DockerCleanupResult> CleanImagesAsync(CancellationToken cancellationToken = default);
    Task<DockerCleanupResult> CleanContainersAsync(CancellationToken cancellationToken = default);
    Task<DockerCleanupResult> CleanVolumesAsync(CancellationToken cancellationToken = default);
    Task<DockerCleanupResult> CleanAllAsync(CancellationToken cancellationToken = default);
}
