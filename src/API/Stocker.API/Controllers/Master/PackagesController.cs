using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Application.Features.Packages.Commands.CreatePackage;
using Stocker.Application.Features.Packages.Commands.UpdatePackage;
using Stocker.Application.Features.Packages.Commands.DeletePackage;
using Stocker.Application.Features.Packages.Commands.AddPackageFeature;
using Stocker.Application.Features.Packages.Commands.RemovePackageFeature;
using Stocker.Application.Features.Packages.Commands.AddPackageModule;
using Stocker.Application.Features.Packages.Commands.RemovePackageModule;
using Stocker.Application.Features.Packages.Queries.GetPackageById;
using Stocker.Application.Features.Packages.Queries.GetPackagesList;
using Stocker.Application.DTOs.Package;
using Swashbuckle.AspNetCore.Annotations;

namespace Stocker.API.Controllers.Master;

/// <summary>
/// Manages subscription packages
/// </summary>
[SwaggerTag("Master Admin Panel - Package Management")]
public class PackagesController : MasterControllerBase
{
    public PackagesController(IMediator mediator, ILogger<PackagesController> logger) 
        : base(mediator, logger)
    {
    }

    /// <summary>
    /// Get all packages (admin only)
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<List<PackageDto>>), 200)]
    public async Task<IActionResult> GetAll([FromQuery] GetPackagesListQuery query)
    {
        _logger.LogInformation("Getting all packages");

        var result = await _mediator.Send(query);
        return HandleResult(result);
    }

    /// <summary>
    /// Get package by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<PackageDto>), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetById(Guid id)
    {
        _logger.LogInformation("Getting package details for ID: {PackageId}", id);
        
        var query = new GetPackageByIdQuery(id);
        var result = await _mediator.Send(query);
        return HandleResult(result);
    }

    /// <summary>
    /// Create a new package
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<PackageDto>), 201)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> Create([FromBody] CreatePackageCommand command)
    {
        _logger.LogInformation("Creating new package: {PackageName}", command.Name);
        
        command.CreatedBy = CurrentUserId;
        var result = await _mediator.Send(command);
        
        if (result.IsSuccess)
        {
            _logger.LogInformation("Package created successfully with ID: {PackageId}", result.Value.Id);
            return CreatedAtAction(nameof(GetById), new { id = result.Value.Id }, 
                new ApiResponse<PackageDto>
                {
                    Success = true,
                    Data = result.Value,
                    Message = "Package created successfully",
                    Timestamp = DateTime.UtcNow
                });
        }
        
        return HandleResult(result);
    }

    /// <summary>
    /// Update package information
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<bool>), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdatePackageCommand command)
    {
        _logger.LogInformation("Updating package ID: {PackageId}", id);
        _logger.LogInformation("Received UpdatePackageCommand in Controller: {@Command}", new 
        {
            command.Id,
            command.Name,
            command.Description,
            command.BasePrice,
            command.BillingCycle,
            command.MaxUsers,
            command.MaxStorage,
            command.IsActive
        });
        
        command.Id = id;
        command.ModifiedBy = CurrentUserId;
        
        var result = await _mediator.Send(command);
        
        if (result.IsSuccess)
        {
            _logger.LogInformation("Package {PackageId} updated successfully", id);
        }
        
        return HandleResult(result);
    }

    /// <summary>
    /// Delete a package
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(typeof(ApiResponse<bool>), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> Delete(Guid id)
    {
        _logger.LogWarning("Deleting package ID: {PackageId} by user: {UserEmail}", 
            id, CurrentUserEmail);
        
        var command = new DeletePackageCommand { PackageId = id };
        var result = await _mediator.Send(command);
        
        if (result.IsSuccess)
        {
            _logger.LogWarning("Package {PackageId} has been deleted by {UserEmail}", 
                id, CurrentUserEmail);
        }
        
        return HandleResult(result);
    }

    /// <summary>
    /// Add feature to package
    /// </summary>
    [HttpPost("{id}/features")]
    [ProducesResponseType(typeof(ApiResponse<bool>), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> AddFeature(Guid id, [FromBody] AddPackageFeatureCommand command)
    {
        _logger.LogInformation("Adding feature {FeatureCode} to package {PackageId}", command.FeatureCode, id);

        command.PackageId = id;
        var result = await _mediator.Send(command);

        if (result.IsSuccess)
        {
            _logger.LogInformation("Feature {FeatureCode} added to package {PackageId}", command.FeatureCode, id);
        }

        return HandleResult(result);
    }

    /// <summary>
    /// Remove feature from package
    /// </summary>
    [HttpDelete("{id}/features/{featureCode}")]
    [ProducesResponseType(typeof(ApiResponse<bool>), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> RemoveFeature(Guid id, string featureCode)
    {
        _logger.LogInformation("Removing feature {FeatureCode} from package {PackageId}", featureCode, id);

        var command = new RemovePackageFeatureCommand
        {
            PackageId = id,
            FeatureCode = featureCode
        };
        var result = await _mediator.Send(command);

        if (result.IsSuccess)
        {
            _logger.LogInformation("Feature {FeatureCode} removed from package {PackageId}", featureCode, id);
        }

        return HandleResult(result);
    }

    /// <summary>
    /// Add module to package
    /// </summary>
    [HttpPost("{id}/modules")]
    [ProducesResponseType(typeof(ApiResponse<bool>), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> AddModule(Guid id, [FromBody] AddPackageModuleCommand command)
    {
        _logger.LogInformation("Adding module {ModuleCode} to package {PackageId}", command.ModuleCode, id);

        command.PackageId = id;
        var result = await _mediator.Send(command);

        if (result.IsSuccess)
        {
            _logger.LogInformation("Module {ModuleCode} added to package {PackageId}", command.ModuleCode, id);
        }

        return HandleResult(result);
    }

    /// <summary>
    /// Remove module from package
    /// </summary>
    [HttpDelete("{id}/modules/{moduleCode}")]
    [ProducesResponseType(typeof(ApiResponse<bool>), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> RemoveModule(Guid id, string moduleCode)
    {
        _logger.LogInformation("Removing module {ModuleCode} from package {PackageId}", moduleCode, id);

        var command = new RemovePackageModuleCommand
        {
            PackageId = id,
            ModuleCode = moduleCode
        };
        var result = await _mediator.Send(command);

        if (result.IsSuccess)
        {
            _logger.LogInformation("Module {ModuleCode} removed from package {PackageId}", moduleCode, id);
        }

        return HandleResult(result);
    }
}