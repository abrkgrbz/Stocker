using MediatR;
using Microsoft.AspNetCore.Mvc;
using Stocker.Application.Features.Packages.Commands.CreatePackage;
using Stocker.Application.Features.Packages.Commands.UpdatePackage;
using Stocker.Application.Features.Packages.Commands.DeletePackage;
using Stocker.Application.Features.Packages.Queries.GetPackageById;
using Stocker.Application.Features.Packages.Queries.GetPackagesList;
using Stocker.Application.DTOs.Package;
using Swashbuckle.AspNetCore.Annotations;

namespace Stocker.API.Controllers.Master;

/// <summary>
/// Manages subscription packages
/// </summary>
[SwaggerTag("Package Management - Manage subscription packages and pricing")]
public class PackagesController : MasterControllerBase
{
    public PackagesController(IMediator mediator, ILogger<PackagesController> logger) 
        : base(mediator, logger)
    {
    }

    /// <summary>
    /// Get all packages
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
}