using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.SharedKernel.Results;
using Stocker.Application.DTOs.Package;
using Stocker.Application.Common.Interfaces;
using Stocker.Domain.Master.Entities;
using Microsoft.EntityFrameworkCore;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Domain.Master.Enums;
using Stocker.Domain.Master.ValueObjects;

namespace Stocker.Application.Features.Packages.Commands.CreatePackage;

public class CreatePackageCommandHandler : IRequestHandler<CreatePackageCommand, Result<PackageDto>>
{
    private readonly IMasterDbContext _context;
    private readonly ILogger<CreatePackageCommandHandler> _logger;

    public CreatePackageCommandHandler(
        IMasterDbContext context,
        ILogger<CreatePackageCommandHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result<PackageDto>> Handle(CreatePackageCommand request, CancellationToken cancellationToken)
    {
        try
        {
            // Check if package name already exists
            var existingPackage = await _context.Packages
                .AnyAsync(p => p.Name == request.Name, cancellationToken);

            if (existingPackage)
            {
                return Result<PackageDto>.Failure(Error.Conflict("Package.AlreadyExists", $"Package with name '{request.Name}' already exists"));
            }

            // Create Money value object
            var basePrice = Money.Create(request.BasePrice, "TRY");
            
            // Create PackageLimit value object
            var limits = PackageLimit.Create(
                maxUsers: request.MaxUsers,
                maxStorage: request.MaxStorage,
                maxProjects: 10, // Default value
                maxApiCalls: 10000 // Default value
            );

            // Decode HTML entities that might come from proxy/WAF
            var decodedName = System.Net.WebUtility.HtmlDecode(request.Name);
            var decodedDescription = System.Net.WebUtility.HtmlDecode(request.Description);

            // Map Type string to PackageType enum
            var packageType = request.Type?.ToLower() switch
            {
                "professional" or "profesyonel" => PackageType.Profesyonel,
                "business" or "isletme" => PackageType.Isletme,
                "enterprise" or "kurumsal" => PackageType.Kurumsal,
                "custom" or "ozel" => PackageType.Ozel,
                _ => PackageType.Baslangic // Default to Baslangic (Starter)
            };

            // Use factory method to create Package
            var package = Package.Create(
                name: decodedName,
                type: packageType,
                basePrice: basePrice,
                limits: limits,
                description: decodedDescription,
                trialDays: 14, // Default trial days
                displayOrder: 0,
                isPublic: true
            );

            // Add features using domain methods
            if (request.Features != null)
            {
                foreach (var feature in request.Features)
                {
                    if (feature.IsEnabled)
                    {
                        package.AddFeature(
                            featureCode: feature.FeatureCode,
                            featureName: feature.FeatureName
                        );
                    }
                }
            }

            // Add modules using domain methods
            if (request.Modules != null)
            {
                foreach (var module in request.Modules)
                {
                    package.AddModule(
                        moduleCode: module.ModuleCode,
                        moduleName: module.ModuleName,
                        isIncluded: module.IsIncluded
                    );
                }
            }

            _context.Packages.Add(package);
            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Package {PackageName} created with ID {PackageId}", 
                package.Name, package.Id);

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
                BillingCycle = "Monthly", // Default
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
                    IsEnabled = true // PackageFeature is included, so it's enabled
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
            _logger.LogError(ex, "Error creating package");
            return Result<PackageDto>.Failure(Error.Failure("Package.CreateFailed", "Failed to create package"));
        }
    }
}