using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Packages.Commands.RemovePackageModule;

public class RemovePackageModuleCommandHandler : IRequestHandler<RemovePackageModuleCommand, Result<bool>>
{
    private readonly IMasterDbContext _context;
    private readonly ILogger<RemovePackageModuleCommandHandler> _logger;

    public RemovePackageModuleCommandHandler(
        IMasterDbContext context,
        ILogger<RemovePackageModuleCommandHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result<bool>> Handle(RemovePackageModuleCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var package = await _context.Packages.FindAsync(new object[] { request.PackageId }, cancellationToken);

            if (package == null)
            {
                return Result<bool>.Failure(Error.NotFound("Package.NotFound", $"Package with ID {request.PackageId} not found"));
            }

            package.RemoveModule(request.ModuleCode);

            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Module {ModuleCode} removed from package {PackageId}", request.ModuleCode, request.PackageId);

            return Result<bool>.Success(true);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Failed to remove module from package {PackageId}", request.PackageId);
            return Result<bool>.Failure(Error.Failure("Package.ModuleNotFound", ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error removing module from package {PackageId}", request.PackageId);
            return Result<bool>.Failure(Error.Failure("Package.RemoveModuleError", "An error occurred while removing module from package"));
        }
    }
}
