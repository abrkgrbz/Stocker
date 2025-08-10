using MediatR;
using Microsoft.AspNetCore.Mvc;
using Stocker.Application.Features.Packages.Commands.CreatePackage;
using Stocker.Application.Features.Packages.Commands.UpdatePackage;
using Stocker.Application.Features.Packages.Queries.GetPackageById;
using Stocker.Application.Features.Packages.Queries.GetPackagesList;
using Stocker.Application.DTOs.Package;

namespace Stocker.API.Controllers.Master;

/// <summary>
/// Manages subscription packages
/// </summary>
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
        
        // TODO: Implement DeletePackageCommand
        // Check for active subscriptions before deleting
        return Ok(new ApiResponse<bool>
        {
            Success = true,
            Data = true,
            Message = "Delete functionality not implemented yet",
            Timestamp = DateTime.UtcNow
        });
    }
}