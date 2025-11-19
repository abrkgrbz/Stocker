using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.SharedKernel.Results;
using Stocker.Application.Common.Interfaces;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Domain.Master.ValueObjects;
using Stocker.Domain.Master.Enums;

namespace Stocker.Application.Features.Packages.Commands.UpdatePackage;

public class UpdatePackageCommandHandler : IRequestHandler<UpdatePackageCommand, Result<bool>>
{
    private readonly IMasterDbContext _context;
    private readonly ILogger<UpdatePackageCommandHandler> _logger;

    public UpdatePackageCommandHandler(
        IMasterDbContext context,
        ILogger<UpdatePackageCommandHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result<bool>> Handle(UpdatePackageCommand request, CancellationToken cancellationToken)
    {
        try
        {
            // Log the incoming request to see what data we're receiving
            _logger.LogInformation("Received UpdatePackageCommand: {@Command}", new 
            {
                request.Id,
                request.Name,
                request.Description,
                request.BasePrice,
                request.BillingCycle,
                request.MaxUsers,
                request.MaxStorage,
                request.IsActive
            });
            
            var package = await _context.Packages
                .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);

            if (package == null)
            {
                return Result<bool>.Failure(Error.NotFound("Package.NotFound", $"Package with ID {request.Id} not found"));
            }

            // Check if name is being changed and if new name already exists
            if (package.Name != request.Name)
            {
                var nameExists = await _context.Packages
                    .AnyAsync(p => p.Name == request.Name && p.Id != request.Id, cancellationToken);

                if (nameExists)
                {
                    return Result<bool>.Failure(Error.Conflict("Package.NameConflict", $"Package with name '{request.Name}' already exists"));
                }
            }

            // Create value objects
            var basePrice = Money.Create(request.BasePrice, "TRY");
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
                _ => package.Type // Keep existing type if not specified or invalid
            };

            // Log before update
            _logger.LogInformation("Updating package entity with Name: {Name}, Description: {Description}, Type: {Type}",
                decodedName, decodedDescription, packageType);

            // Use domain method to update
            package.Update(
                name: decodedName,
                description: decodedDescription,
                basePrice: basePrice,
                limits: limits,
                trialDays: package.TrialDays, // Keep existing trial days
                displayOrder: package.DisplayOrder, // Keep existing display order
                isPublic: package.IsPublic // Keep existing public status
            );

            // Update package type if it changed
            if (package.Type != packageType)
            {
                package.ChangeType(packageType);
            }

            // Log after update
            _logger.LogInformation("Package entity updated. New Name: {Name}, New Description: {Description}, New Type: {Type}",
                package.Name, package.Description, package.Type);

            // Update activation status if changed
            if (request.IsActive && !package.IsActive)
            {
                package.Activate();
            }
            else if (!request.IsActive && package.IsActive)
            {
                package.Deactivate();
            }

            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Package {PackageId} updated successfully", request.Id);

            return Result<bool>.Success(true);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating package {PackageId}", request.Id);
            return Result<bool>.Failure(Error.Failure("Package.UpdateFailed", "Failed to update package"));
        }
    }
}