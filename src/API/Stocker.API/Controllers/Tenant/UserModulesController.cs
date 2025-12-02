using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Stocker.API.Controllers.Base;
using Stocker.Application.Common.Interfaces;
using Stocker.Domain.Master.Enums;

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
    private readonly IMasterDbContext _masterDbContext;
    private readonly ILogger<UserModulesController> _logger;

    public UserModulesController(
        IMasterDbContext masterDbContext,
        ILogger<UserModulesController> logger)
    {
        _masterDbContext = masterDbContext;
        _logger = logger;
    }

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
            var tenantId = GetTenantId() ?? Guid.Empty;

            if (tenantId == Guid.Empty)
            {
                _logger.LogWarning("No tenant ID found in request");
                return BadRequest("Tenant ID not found");
            }

            // Get active subscription with package and modules
            var subscription = await _masterDbContext.Subscriptions
                .AsNoTracking()
                .Include(s => s.Package)
                    .ThenInclude(p => p.Modules)
                .Where(s => s.TenantId == tenantId &&
                           (s.Status == SubscriptionStatus.Aktif ||
                            s.Status == SubscriptionStatus.Deneme))
                .OrderByDescending(s => s.StartDate)
                .FirstOrDefaultAsync(cancellationToken);

            if (subscription == null)
            {
                _logger.LogWarning("No active subscription found for tenant {TenantId}", tenantId);
                return Ok(new UserModulesResponse
                {
                    TenantId = tenantId,
                    Modules = new List<ModuleInfo>(),
                    PackageName = "None",
                    PackageType = "None",
                    SubscriptionStatus = "Inactive",
                    SubscriptionExpiryDate = null
                });
            }

            // Get included modules from package
            var modules = subscription.Package?.Modules?
                .Where(pm => pm.IsIncluded)
                .Select(pm => new ModuleInfo
                {
                    Code = pm.ModuleCode.ToLower(),
                    Name = pm.ModuleName,
                    IsActive = true,
                    Category = GetModuleCategory(pm.ModuleCode)
                })
                .ToList() ?? new List<ModuleInfo>();

            _logger.LogInformation(
                "Tenant {TenantId} has package '{PackageName}' with {ModuleCount} modules: {Modules}",
                tenantId,
                subscription.Package?.Name ?? "Unknown",
                modules.Count,
                string.Join(", ", modules.Select(m => m.Code)));

            var response = new UserModulesResponse
            {
                TenantId = tenantId,
                Modules = modules,
                PackageName = subscription.Package?.Name ?? "Unknown",
                PackageType = subscription.Package?.PackageType.ToString() ?? "Unknown",
                SubscriptionStatus = subscription.Status.ToString(),
                SubscriptionExpiryDate = subscription.EndDate
            };

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving modules for tenant");
            return Problem(
                title: "Module Retrieval Failed",
                detail: ex.Message,
                statusCode: StatusCodes.Status500InternalServerError
            );
        }
    }

    private static string GetModuleCategory(string moduleCode)
    {
        return moduleCode.ToUpper() switch
        {
            "CRM" => "core",
            "SALES" => "core",
            "INVENTORY" => "operations",
            "ACCOUNTING" => "finance",
            "HR" => "hr",
            "PROJECTS" => "operations",
            "PURCHASE" => "operations",
            "FINANCE" => "finance",
            _ => "other"
        };
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
