using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.Extensions;
using Stocker.SharedKernel.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Packages.Commands.DeletePackage;

public class DeletePackageCommandHandler : IRequestHandler<DeletePackageCommand, Result<bool>>
{
    private readonly IMasterUnitOfWork _unitOfWork;
    private readonly ILogger<DeletePackageCommandHandler> _logger;

    public DeletePackageCommandHandler(
        IMasterUnitOfWork unitOfWork,
        ILogger<DeletePackageCommandHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result<bool>> Handle(DeletePackageCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var package = await _unitOfWork.Packages()
                .GetByIdAsync(request.PackageId, cancellationToken);

            if (package == null)
            {
                return Result<bool>.Failure(
                    Error.NotFound("Package.NotFound", "Paket bulunamadı"));
            }

            // Check if package has active subscriptions
            var hasActiveSubscriptions = await _unitOfWork.Subscriptions()
                .AsQueryable()
                .AnyAsync(s => s.PackageId == request.PackageId && 
                    (s.Status == Domain.Master.Enums.SubscriptionStatus.Active ||
                     s.Status == Domain.Master.Enums.SubscriptionStatus.Trial), 
                    cancellationToken);

            if (hasActiveSubscriptions)
            {
                return Result<bool>.Failure(
                    Error.Conflict("Package.HasActiveSubscriptions", 
                        "Aktif abonelikleri olan paket silinemez"));
            }

            // Soft delete - just deactivate
            package.Deactivate();
            
            await _unitOfWork.Packages().UpdateAsync(package, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            _logger.LogWarning("Package {PackageId} ({PackageName}) has been deleted", 
                package.Id, package.Name);

            return Result<bool>.Success(true);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting package {PackageId}", request.PackageId);
            return Result<bool>.Failure(
                Error.Failure("Package.DeleteFailed", "Paket silme işlemi başarısız oldu"));
        }
    }
}