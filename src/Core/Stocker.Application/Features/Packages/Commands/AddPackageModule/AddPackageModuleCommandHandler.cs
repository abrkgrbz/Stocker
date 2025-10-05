using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Packages.Commands.AddPackageModule;

public class AddPackageModuleCommandHandler : IRequestHandler<AddPackageModuleCommand, Result<bool>>
{
    private readonly IMasterDbContext _context;
    private readonly ILogger<AddPackageModuleCommandHandler> _logger;

    public AddPackageModuleCommandHandler(
        IMasterDbContext context,
        ILogger<AddPackageModuleCommandHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result<bool>> Handle(AddPackageModuleCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var package = await _context.Packages.FindAsync(new object[] { request.PackageId }, cancellationToken);

            if (package == null)
            {
                return Result<bool>.Failure(Error.NotFound("Package.NotFound", $"Package with ID {request.PackageId} not found"));
            }

            package.AddModule(
                request.ModuleCode,
                request.ModuleName,
                request.IsIncluded,
                request.MaxEntities);

            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Module {ModuleCode} added to package {PackageId}", request.ModuleCode, request.PackageId);

            return Result<bool>.Success(true);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Failed to add module to package {PackageId}", request.PackageId);
            return Result<bool>.Failure(Error.Failure("Package.ModuleExists", ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding module to package {PackageId}", request.PackageId);
            return Result<bool>.Failure(Error.Failure("Package.AddModuleError", "An error occurred while adding module to package"));
        }
    }
}
