using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.API.Controllers.Base;

namespace Stocker.API.Controllers.Tenant;

/// <summary>
/// User modules and package information
/// </summary>
[Authorize]
[ApiVersion("1.0")]
[ApiController]
[Route("api/tenant/user-modules")]
public class UserModulesController : ApiController
{

    /// <summary>
    /// Get current user's active modules based on subscription
    /// </summary>
    /// <returns>List of active module codes</returns>
    [HttpGet("active")]
    [ProducesResponseType(typeof(UserModulesResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetActiveModules(CancellationToken cancellationToken)
    {
        try
        {
            // Get tenant's active subscription from master database
            var tenantId = GetTenantId() ?? Guid.Empty;
            
            // TODO: Create MediatR query to get subscription modules
            // For now, return hardcoded response based on common packages
            
            var response = new UserModulesResponse
            {
                TenantId = tenantId,
                Modules = new List<ModuleInfo>
                {
                    new() { Code = "crm", Name = "CRM", IsActive = true, Category = "core" },
                    new() { Code = "sales", Name = "Satış", IsActive = true, Category = "core" },
                    new() { Code = "inventory", Name = "Stok", IsActive = true, Category = "operations" },
                    new() { Code = "accounting", Name = "Muhasebe", IsActive = true, Category = "finance" }
                },
                PackageName = "Professional",
                PackageType = "Professional",
                SubscriptionStatus = "Active",
                SubscriptionExpiryDate = DateTime.UtcNow.AddMonths(1)
            };

            return Ok(response);
        }
        catch (Exception ex)
        {
            return Problem(
                title: "Module Retrieval Failed",
                detail: ex.Message,
                statusCode: StatusCodes.Status500InternalServerError
            );
        }
    }
}

public class UserModulesResponse
{
    public Guid TenantId { get; set; }
    public List<ModuleInfo> Modules { get; set; } = new();
    public string PackageName { get; set; } = string.Empty;
    public string PackageType { get; set; } = string.Empty;
    public string SubscriptionStatus { get; set; } = string.Empty;
    public DateTime? SubscriptionExpiryDate { get; set; }
}

public class ModuleInfo
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public string? Category { get; set; }
    public string? Description { get; set; }
    public string? Icon { get; set; }
    public string? Route { get; set; }
}
