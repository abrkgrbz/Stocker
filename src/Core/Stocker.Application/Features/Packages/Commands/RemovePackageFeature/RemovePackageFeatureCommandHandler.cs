using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Packages.Commands.RemovePackageFeature;

public class RemovePackageFeatureCommandHandler : IRequestHandler<RemovePackageFeatureCommand, Result<bool>>
{
    private readonly IMasterDbContext _context;
    private readonly ILogger<RemovePackageFeatureCommandHandler> _logger;

    public RemovePackageFeatureCommandHandler(
        IMasterDbContext context,
        ILogger<RemovePackageFeatureCommandHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result<bool>> Handle(RemovePackageFeatureCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var package = await _context.Packages.FindAsync(new object[] { request.PackageId }, cancellationToken);

            if (package == null)
            {
                return Result<bool>.Failure(Error.NotFound("Package.NotFound", $"Package with ID {request.PackageId} not found"));
            }

            package.RemoveFeature(request.FeatureCode);

            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Feature {FeatureCode} removed from package {PackageId}", request.FeatureCode, request.PackageId);

            return Result<bool>.Success(true);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Failed to remove feature from package {PackageId}", request.PackageId);
            return Result<bool>.Failure(Error.Failure("Package.FeatureNotFound", ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error removing feature from package {PackageId}", request.PackageId);
            return Result<bool>.Failure(Error.Failure("Package.RemoveFeatureError", "An error occurred while removing feature from package"));
        }
    }
}
