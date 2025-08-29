using MediatR;
using Microsoft.AspNetCore.Mvc;
using Stocker.Application.Features.MasterUsers.Commands.CreateMasterUser;
using Stocker.Application.Features.MasterUsers.Commands.UpdateMasterUser;
using Stocker.Application.Features.MasterUsers.Commands.DeleteMasterUser;
using Stocker.Application.Features.MasterUsers.Commands.ToggleMasterUserStatus;
using Stocker.Application.Features.MasterUsers.Commands.AssignToTenant;
using Stocker.Application.Features.MasterUsers.Commands.RemoveFromTenant;
using Stocker.Application.Features.MasterUsers.Commands.ResetPassword;
using Stocker.Application.Features.MasterUsers.Queries.GetAllMasterUsers;
using Stocker.Application.Features.MasterUsers.Queries.GetMasterUserById;
using Stocker.Application.DTOs.MasterUser;
using Swashbuckle.AspNetCore.Annotations;

namespace Stocker.API.Controllers.Master;

[SwaggerTag("Master User Management - Manage system administrators and support staff")]
public class MasterUsersController : MasterControllerBase
{
    public MasterUsersController(IMediator mediator, ILogger<MasterUsersController> logger) 
        : base(mediator, logger)
    {
    }

    /// <summary>
    /// Get all master users with filtering
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<List<MasterUserDto>>), 200)]
    public async Task<IActionResult> GetAll([FromQuery] GetAllMasterUsersQuery query)
    {
        _logger.LogInformation("Getting all master users with query: {@Query}", query);
        
        var result = await _mediator.Send(query);
        return HandleResult(result);
    }

    /// <summary>
    /// Get master user by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<MasterUserDto>), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetById(Guid id)
    {
        _logger.LogInformation("Getting master user details for ID: {UserId}", id);
        
        var query = new GetMasterUserByIdQuery { UserId = id };
        var result = await _mediator.Send(query);
        return HandleResult(result);
    }

    /// <summary>
    /// Create a new master user
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<MasterUserDto>), 201)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> Create([FromBody] CreateMasterUserCommand command)
    {
        _logger.LogInformation("Creating new master user: {Username}", command.Username);
        
        var result = await _mediator.Send(command);
        
        if (result.IsSuccess)
        {
            _logger.LogInformation("Master user created successfully with ID: {UserId}", result.Value.Id);
            return CreatedAtAction(nameof(GetById), new { id = result.Value.Id }, 
                new ApiResponse<MasterUserDto>
                {
                    Success = true,
                    Data = result.Value,
                    Message = "Kullanıcı başarıyla oluşturuldu",
                    Timestamp = DateTime.UtcNow
                });
        }
        
        return HandleResult(result);
    }

    /// <summary>
    /// Update master user information
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<bool>), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateMasterUserCommand command)
    {
        _logger.LogInformation("Updating master user ID: {UserId}", id);
        
        command.UserId = id;
        command.ModifiedBy = CurrentUserId;
        
        var result = await _mediator.Send(command);
        
        if (result.IsSuccess)
        {
            _logger.LogInformation("Master user {UserId} updated successfully", id);
        }
        
        return HandleResult(result);
    }

    /// <summary>
    /// Delete a master user
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(typeof(ApiResponse<bool>), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> Delete(Guid id)
    {
        _logger.LogWarning("Deleting master user ID: {UserId} by user: {UserEmail}", 
            id, CurrentUserEmail);
        
        var command = new DeleteMasterUserCommand { UserId = id };
        var result = await _mediator.Send(command);
        
        if (result.IsSuccess)
        {
            _logger.LogWarning("Master user {UserId} has been deleted by {UserEmail}", 
                id, CurrentUserEmail);
        }
        
        return HandleResult(result);
    }

    /// <summary>
    /// Toggle master user active status
    /// </summary>
    [HttpPost("{id}/toggle-status")]
    [ProducesResponseType(typeof(ApiResponse<bool>), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> ToggleStatus(Guid id)
    {
        _logger.LogWarning("Toggling status for master user ID: {UserId} by user: {UserEmail}", 
            id, CurrentUserEmail);
        
        var command = new ToggleMasterUserStatusCommand 
        { 
            UserId = id,
            ModifiedBy = CurrentUserId
        };
        
        var result = await _mediator.Send(command);
        
        if (result.IsSuccess)
        {
            var status = result.Value ? "activated" : "deactivated";
            _logger.LogWarning("Master user {UserId} has been {Status} by {UserEmail}", 
                id, status, CurrentUserEmail);
        }
        
        return HandleResult(result);
    }

    /// <summary>
    /// Assign user to a tenant
    /// </summary>
    [HttpPost("{id}/assign-tenant")]
    [ProducesResponseType(typeof(ApiResponse<bool>), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> AssignToTenant(Guid id, [FromBody] AssignToTenantCommand command)
    {
        _logger.LogInformation("Assigning user {UserId} to tenant {TenantId} with role {UserType}", 
            id, command.TenantId, command.UserType);
        
        command.UserId = id;
        command.AssignedBy = CurrentUserId;
        
        var result = await _mediator.Send(command);
        
        if (result.IsSuccess)
        {
            _logger.LogInformation("User {UserId} assigned to tenant {TenantId} successfully", 
                id, command.TenantId);
        }
        
        return HandleResult(result);
    }

    /// <summary>
    /// Remove user from a tenant
    /// </summary>
    [HttpDelete("{id}/remove-tenant/{tenantId}")]
    [ProducesResponseType(typeof(ApiResponse<bool>), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> RemoveFromTenant(Guid id, Guid tenantId)
    {
        _logger.LogWarning("Removing user {UserId} from tenant {TenantId} by {UserEmail}", 
            id, tenantId, CurrentUserEmail);
        
        var command = new RemoveFromTenantCommand 
        { 
            UserId = id, 
            TenantId = tenantId,
            RemovedBy = CurrentUserId
        };
        
        var result = await _mediator.Send(command);
        
        if (result.IsSuccess)
        {
            _logger.LogInformation("User {UserId} removed from tenant {TenantId} successfully", 
                id, tenantId);
        }
        
        return HandleResult(result);
    }

    /// <summary>
    /// Reset user password
    /// </summary>
    [HttpPost("{id}/reset-password")]
    [ProducesResponseType(typeof(ApiResponse<string>), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> ResetPassword(Guid id, [FromBody] ResetPasswordCommand command)
    {
        _logger.LogWarning("Resetting password for user {UserId} by {UserEmail}", 
            id, CurrentUserEmail);
        
        command.UserId = id;
        command.ResetBy = CurrentUserId;
        
        var result = await _mediator.Send(command);
        
        if (result.IsSuccess)
        {
            _logger.LogWarning("Password reset for user {UserId} by {UserEmail}. Temporary password: {TempPassword}", 
                id, CurrentUserEmail, result.Value);
        }
        
        return HandleResult(result);
    }
}