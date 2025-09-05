using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Persistence.Contexts;
using Stocker.Persistence.Factories;
using Stocker.Persistence.Seeds;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.API.Controllers.Master;

[ApiController]
[Route("api/master/[controller]")]
[Authorize(Roles = "SystemAdmin")]
public class SeedController : ControllerBase
{
    private readonly ILogger<SeedController> _logger;
    private readonly MasterDbContext _masterDbContext;
    private readonly ITenantDbContextFactory _tenantDbContextFactory;
    private readonly ITenantService _tenantService;
    private readonly IServiceProvider _serviceProvider;

    public SeedController(
        ILogger<SeedController> logger,
        MasterDbContext masterDbContext,
        ITenantDbContextFactory tenantDbContextFactory,
        ITenantService tenantService,
        IServiceProvider serviceProvider)
    {
        _logger = logger;
        _masterDbContext = masterDbContext;
        _tenantDbContextFactory = tenantDbContextFactory;
        _tenantService = tenantService;
        _serviceProvider = serviceProvider;
    }

    /// <summary>
    /// Seed default settings for a specific tenant
    /// </summary>
    [HttpPost("seed-tenant-settings/{tenantId}")]
    public async Task<IActionResult> SeedTenantSettings(Guid tenantId)
    {
        try
        {
            // Get tenant
            var tenant = await _masterDbContext.Tenants
                .FirstOrDefaultAsync(t => t.Id == tenantId);

            if (tenant == null)
            {
                return NotFound(new { message = "Tenant bulunamadı" });
            }

            // Create tenant context
            var optionsBuilder = new DbContextOptionsBuilder<TenantDbContext>();
            optionsBuilder.UseSqlServer(tenant.ConnectionString.Value);
            
            // Suppress pending model changes warning for seed operations
            optionsBuilder.ConfigureWarnings(warnings =>
                warnings.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));

            using var tenantContext = new TenantDbContext(optionsBuilder.Options, _tenantService);
            
            // Create logger for seed
            var seedLogger = _serviceProvider.GetRequiredService<ILogger<TenantSettingsSeed>>();
            var seed = new TenantSettingsSeed(tenantContext, seedLogger);
            
            await seed.SeedAsync(tenantId);

            _logger.LogInformation("Settings seeded successfully for tenant {TenantId}", tenantId);

            return Ok(new
            {
                success = true,
                message = "Ayarlar başarıyla oluşturuldu",
                tenantName = tenant.Name
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error seeding settings for tenant {TenantId}", tenantId);
            return StatusCode(500, new 
            { 
                message = "Ayarlar oluşturulurken hata oluştu", 
                error = ex.Message 
            });
        }
    }

    /// <summary>
    /// Seed default settings for all tenants
    /// </summary>
    [HttpPost("seed-all-tenant-settings")]
    public async Task<IActionResult> SeedAllTenantSettings()
    {
        try
        {
            var tenants = await _masterDbContext.Tenants
                .Where(t => t.IsActive)
                .ToListAsync();

            var results = new List<object>();

            foreach (var tenant in tenants)
            {
                try
                {
                    var optionsBuilder = new DbContextOptionsBuilder<TenantDbContext>();
                    optionsBuilder.UseSqlServer(tenant.ConnectionString.Value);
                    
                    // Suppress pending model changes warning
                    optionsBuilder.ConfigureWarnings(warnings =>
                        warnings.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));

                    using var tenantContext = new TenantDbContext(optionsBuilder.Options, _tenantService);
                    
                    var seedLogger = _serviceProvider.GetRequiredService<ILogger<TenantSettingsSeed>>();
                    var seed = new TenantSettingsSeed(tenantContext, seedLogger);
                    
                    await seed.SeedAsync(tenant.Id);

                    results.Add(new 
                    { 
                        tenantId = tenant.Id,
                        tenantName = tenant.Name,
                        success = true,
                        message = "Ayarlar oluşturuldu"
                    });
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error seeding settings for tenant {TenantId}", tenant.Id);
                    results.Add(new 
                    { 
                        tenantId = tenant.Id,
                        tenantName = tenant.Name,
                        success = false,
                        message = ex.Message
                    });
                }
            }

            return Ok(new
            {
                success = true,
                message = $"{tenants.Count} tenant için ayarlar işlendi",
                results
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error seeding settings for all tenants");
            return StatusCode(500, new 
            { 
                message = "Ayarlar oluşturulurken hata oluştu", 
                error = ex.Message 
            });
        }
    }
}