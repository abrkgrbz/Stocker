using MediatR;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.SystemManagement.Commands.CleanDocker;

public class CleanDockerCommandHandler : IRequestHandler<CleanDockerCommand, Result<DockerCleanupResult>>
{
    private readonly IDockerManagementService _dockerService;

    public CleanDockerCommandHandler(IDockerManagementService dockerService)
    {
        _dockerService = dockerService;
    }

    public async Task<Result<DockerCleanupResult>> Handle(CleanDockerCommand request, CancellationToken cancellationToken)
    {
        try
        {
            DockerCleanupResult result = request.Type switch
            {
                DockerCleanType.BuildCache => await _dockerService.CleanBuildCacheAsync(cancellationToken),
                DockerCleanType.Images => await _dockerService.CleanImagesAsync(cancellationToken),
                DockerCleanType.Containers => await _dockerService.CleanContainersAsync(cancellationToken),
                DockerCleanType.Volumes => await _dockerService.CleanVolumesAsync(cancellationToken),
                DockerCleanType.All => await _dockerService.CleanAllAsync(cancellationToken),
                _ => new DockerCleanupResult
                {
                    Success = false,
                    Message = "Geçersiz temizlik tipi"
                }
            };

            return Result<DockerCleanupResult>.Success(result);
        }
        catch (Exception ex)
        {
            return Result<DockerCleanupResult>.Failure(new Error("DockerCleanup.Failed", ex.Message));
        }
    }
}
