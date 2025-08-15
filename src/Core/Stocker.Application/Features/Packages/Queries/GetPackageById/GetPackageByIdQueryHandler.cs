using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.SharedKernel.Results;
using Stocker.Application.DTOs.Package;
using Stocker.Persistence.Contexts;

namespace Stocker.Application.Features.Packages.Queries.GetPackageById;

public class GetPackageByIdQueryHandler : IRequestHandler<GetPackageByIdQuery, Result<PackageDto>>
{
    private readonly MasterDbContext _context;
    private readonly ILogger<GetPackageByIdQueryHandler> _logger;

    public GetPackageByIdQueryHandler(
        MasterDbContext context,
        ILogger<GetPackageByIdQueryHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result<PackageDto>> Handle(GetPackageByIdQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var package = await _context.Packages
                .Include(p => p.Features)
                .Include(p => p.Modules)
                .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);

            if (package == null)
            {
                _logger.LogWarning("Package with ID {PackageId} not found", request.Id);
                return Result<PackageDto>.Failure(Error.NotFound("Package.NotFound", $"Package with ID {request.Id} not found"));
            }

            var dto = new PackageDto
            {
                Id = package.Id,
                Name = package.Name,
                Description = package.Description,
                BasePrice = new MoneyDto 
                { 
                    Amount = package.BasePrice.Amount,
                    Currency = package.BasePrice.Currency
                },
                Currency = package.BasePrice.Currency,
                Type = package.Type.ToString(),
                BillingCycle = "Monthly",
                MaxUsers = package.Limits.MaxUsers,
                MaxStorage = package.Limits.MaxStorage,
                TrialDays = package.TrialDays,
                IsActive = package.IsActive,
                IsPublic = package.IsPublic,
                DisplayOrder = package.DisplayOrder,
                CreatedAt = package.CreatedAt,
                Features = package.Features.Select(f => new PackageFeatureDto
                {
                    FeatureCode = f.FeatureCode,
                    FeatureName = f.FeatureName,
                    IsEnabled = true
                }).ToList(),
                Modules = package.Modules.Select(m => new PackageModuleDto
                {
                    ModuleCode = m.ModuleCode,
                    ModuleName = m.ModuleName,
                    IsIncluded = m.IsIncluded
                }).ToList()
            };

            return Result<PackageDto>.Success(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving package {PackageId}", request.Id);
            return Result<PackageDto>.Failure(Error.Failure("Package.RetrieveFailed", "Failed to retrieve package"));
        }
    }
}