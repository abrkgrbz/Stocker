using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Application.Interfaces.Repositories;

namespace Stocker.API.Controllers.Master;

[ApiController]
[Route("api/master/users")]
[Authorize(Policy = "RequireMasterAccess")]
public class UsersController : ControllerBase
{
    private readonly IUserRepository _userRepository;

    public UsersController(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    [HttpGet]
    public async Task<IActionResult> GetUsers(
        [FromQuery] int page = 1, 
        [FromQuery] int pageSize = 10, 
        [FromQuery] string? searchTerm = null)
    {
        var users = await _userRepository.GetMasterUsersAsync(page, pageSize, searchTerm);
        return Ok(users);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetUser(string id)
    {
        var user = await _userRepository.GetMasterUserByIdAsync(id);
        
        if (user == null)
        {
            return NotFound(new { message = "User not found" });
        }
        
        return Ok(user);
    }

    [HttpPost("{id}/toggle-status")]
    public async Task<IActionResult> ToggleUserStatus(string id)
    {
        var result = await _userRepository.ToggleMasterUserStatusAsync(id);
        
        if (!result)
        {
            return NotFound(new { message = "User not found" });
        }
        
        return Ok(new { success = true, message = "User status updated successfully" });
    }

    [HttpPost("{userId}/assign-tenant/{tenantId}")]
    public async Task<IActionResult> AssignTenantToUser(string userId, Guid tenantId)
    {
        var result = await _userRepository.AssignTenantToUserAsync(userId, tenantId);
        
        if (!result)
        {
            return NotFound(new { message = "User or tenant not found" });
        }
        
        return Ok(new { success = true, message = "Tenant assigned to user successfully" });
    }
}