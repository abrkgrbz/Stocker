using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Packages.Commands.AddPackageFeature;

public class AddPackageFeatureCommandHandler : IRequestHandler<AddPackageFeatureCommand, Result<bool>>
{
    private readonly IMasterDbContext _context;
    private readonly ILogger<AddPackageFeatureCommandHandler> _logger;

    public AddPackageFeatureCommandHandler(
        IMasterDbContext context,
        ILogger<AddPackageFeatureCommandHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result<bool>> Handle(AddPackageFeatureCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var package = await _context.Packages.FindAsync(new object[] { request.PackageId }, cancellationToken);

            if (package == null)
            {
                return Result<bool>.Failure(Error.NotFound("Package.NotFound", $"Package with ID {request.PackageId} not found"));
            }

            package.AddFeature(
                request.FeatureCode,
                request.FeatureName,
                request.Description,
                request.IsHighlighted);

            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Feature {FeatureCode} added to package {PackageId}", request.FeatureCode, request.PackageId);

            return Result<bool>.Success(true);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Failed to add feature to package {PackageId}", request.PackageId);
            return Result<bool>.Failure(Error.Failure("Package.FeatureExists", ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding feature to package {PackageId}", request.PackageId);
            return Result<bool>.Failure(Error.Failure("Package.AddFeatureError", "An error occurred while adding feature to package"));
        }
    }
}
