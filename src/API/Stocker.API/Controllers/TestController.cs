using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Stocker.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TestController : ControllerBase
{
    [HttpGet("claims")]
    [Authorize]
    public IActionResult GetClaims()
    {
        var claims = User.Claims.Select(c => new { c.Type, c.Value }).ToList();
        return Ok(new
        {
            IsAuthenticated = User.Identity?.IsAuthenticated,
            AuthenticationType = User.Identity?.AuthenticationType,
            Name = User.Identity?.Name,
            Claims = claims,
            Roles = User.Claims.Where(c => c.Type == ClaimTypes.Role).Select(c => c.Value).ToList(),
            IsInSystemAdminRole = User.IsInRole("SystemAdmin")
        });
    }

    [HttpGet("admin-test")]
    [Authorize(Policy = "SystemAdminPolicy")]
    public IActionResult AdminTest()
    {
        return Ok(new { message = "You have SystemAdmin access!" });
    }
}