using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Stocker.API.Controllers.Base;
using Stocker.Persistence.Contexts;
using Stocker.SharedKernel.Interfaces;
using Swashbuckle.AspNetCore.Annotations;

namespace Stocker.API.Controllers.Master;

[Authorize(Roles = "SystemAdmin")]
[ApiController]
[Route("api/master/migrations")]
[SwaggerTag("Master - Database Migration Management")]
public class MigrationController : ApiController
{
    private readonly MasterDbContext _masterDbContext;
    private readonly IServiceProvider _serviceProvider;
    private readonly ITenantService _tenantService;
    private readonly IConfiguration _configuration;

    public MigrationController(
        MasterDbContext masterDbContext,
        IServiceProvider serviceProvider,
        ITenantService tenantService,
        IConfiguration configuration)
    {
        _masterDbContext = masterDbContext;
        _serviceProvider = serviceProvider;
        _tenantService = tenantService;
        _configuration = configuration;
    }

    /// <summary>
    /// Get pending migrations for all tenants
    /// </summary>
    [HttpGet("pending")]
    public async Task<IActionResult> GetPendingMigrations()
    {
        try
        {
            var tenants = await _masterDbContext.Tenants
                .Where(t => t.IsActive)
                .Select(t => new
                {
                    t.Id,
                    t.Name,
                    t.Code,
                    t.ConnectionString
                })
                .ToListAsync();

            var results = new List<object>();

            foreach (var tenant in tenants)
            {
                try
                {
                    var optionsBuilder = new DbContextOptionsBuilder<TenantDbContext>();
                    optionsBuilder.UseSqlServer(tenant.ConnectionString.Value);

                    using var tenantContext = new TenantDbContext(optionsBuilder.Options, _tenantService);
                    
                    var pendingMigrations = await tenantContext.Database
                        .GetPendingMigrationsAsync();

                    var appliedMigrations = await tenantContext.Database
                        .GetAppliedMigrationsAsync();

                    results.Add(new
                    {
                        TenantId = tenant.Id,
                        TenantName = tenant.Name,
                        TenantCode = tenant.Code,
                        PendingMigrations = pendingMigrations.ToList(),
                        AppliedMigrations = appliedMigrations.ToList(),
                        HasPendingMigrations = pendingMigrations.Any()
                    });
                }
                catch (Exception ex)
                {
                    Logger.LogError(ex, "Error checking migrations for tenant {TenantId}", tenant.Id);
                    results.Add(new
                    {
                        TenantId = tenant.Id,
                        TenantName = tenant.Name,
                        TenantCode = tenant.Code,
                        Error = ex.Message,
                        HasPendingMigrations = false
                    });
                }
            }

            return Ok(new
            {
                Success = true,
                Data = results,
                TotalTenants = tenants.Count,
                TenantsWithPendingMigrations = results.Count(r => 
                    r.GetType().GetProperty("HasPendingMigrations")?.GetValue(r) as bool? == true)
            });
        }
        catch (Exception ex)
        {
            Logger.LogError(ex, "Error getting pending migrations");
            return StatusCode(500, new { message = "Migration durumu kontrol edilirken hata oluştu", error = ex.Message });
        }
    }

    /// <summary>
    /// Apply migrations to specific tenant
    /// </summary>
    [HttpPost("apply/{tenantId}")]
    public async Task<IActionResult> ApplyMigrationToTenant(Guid tenantId)
    {
        try
        {
            var tenant = await _masterDbContext.Tenants
                .FirstOrDefaultAsync(t => t.Id == tenantId && t.IsActive);

            if (tenant == null)
            {
                return NotFound(new { message = "Tenant bulunamadı" });
            }

            Logger.LogInformation("Applying migrations to tenant {TenantId} - {TenantName}", tenant.Id, tenant.Name);

            var optionsBuilder = new DbContextOptionsBuilder<TenantDbContext>();
            optionsBuilder.UseSqlServer(tenant.ConnectionString.Value);

            using var tenantContext = new TenantDbContext(optionsBuilder.Options, _tenantService);
            
            var pendingMigrations = await tenantContext.Database.GetPendingMigrationsAsync();
            var pendingList = pendingMigrations.ToList();

            if (!pendingList.Any())
            {
                return Ok(new { 
                    success = true, 
                    message = "Uygulanacak migration yok",
                    tenantName = tenant.Name
                });
            }

            await tenantContext.Database.MigrateAsync();

            Logger.LogInformation("Migrations applied successfully to tenant {TenantId}. Applied: {Migrations}", 
                tenant.Id, string.Join(", ", pendingList));

            return Ok(new
            {
                success = true,
                message = $"{pendingList.Count} migration başarıyla uygulandı",
                tenantName = tenant.Name,
                appliedMigrations = pendingList
            });
        }
        catch (Exception ex)
        {
            Logger.LogError(ex, "Error applying migration to tenant {TenantId}", tenantId);
            return StatusCode(500, new 
            { 
                message = "Migration uygulanırken hata oluştu", 
                error = ex.Message,
                details = ex.InnerException?.Message
            });
        }
    }

    /// <summary>
    /// Apply migrations to all tenants
    /// </summary>
    [HttpPost("apply-all")]
    public async Task<IActionResult> ApplyMigrationsToAllTenants()
    {
        try
        {
            var tenants = await _masterDbContext.Tenants
                .Where(t => t.IsActive)
                .ToListAsync();

            var results = new List<object>();
            var successCount = 0;
            var failureCount = 0;

            foreach (var tenant in tenants)
            {
                try
                {
                    Logger.LogInformation("Applying migrations to tenant {TenantId} - {TenantName}", tenant.Id, tenant.Name);

                    var optionsBuilder = new DbContextOptionsBuilder<TenantDbContext>();
                    optionsBuilder.UseSqlServer(tenant.ConnectionString.Value);

                    using var tenantContext = new TenantDbContext(optionsBuilder.Options, _tenantService);
                    
                    var pendingMigrations = await tenantContext.Database.GetPendingMigrationsAsync();
                    var pendingList = pendingMigrations.ToList();

                    if (pendingList.Any())
                    {
                        await tenantContext.Database.MigrateAsync();
                        successCount++;

                        results.Add(new
                        {
                            TenantId = tenant.Id,
                            TenantName = tenant.Name,
                            Success = true,
                            Message = $"{pendingList.Count} migration uygulandı",
                            AppliedMigrations = pendingList
                        });
                    }
                    else
                    {
                        results.Add(new
                        {
                            TenantId = tenant.Id,
                            TenantName = tenant.Name,
                            Success = true,
                            Message = "Migration yok",
                            AppliedMigrations = new List<string>()
                        });
                    }
                }
                catch (Exception ex)
                {
                    failureCount++;
                    Logger.LogError(ex, "Error applying migrations to tenant {TenantId}", tenant.Id);
                    
                    results.Add(new
                    {
                        TenantId = tenant.Id,
                        TenantName = tenant.Name,
                        Success = false,
                        Message = ex.Message,
                        Error = ex.InnerException?.Message
                    });
                }
            }

            return Ok(new
            {
                success = true,
                message = $"İşlem tamamlandı. Başarılı: {successCount}, Başarısız: {failureCount}",
                totalTenants = tenants.Count,
                successCount,
                failureCount,
                results
            });
        }
        catch (Exception ex)
        {
            Logger.LogError(ex, "Error applying migrations to all tenants");
            return StatusCode(500, new { message = "Migration işlemi sırasında hata oluştu", error = ex.Message });
        }
    }

    /// <summary>
    /// Get migration history for specific tenant
    /// </summary>
    [HttpGet("history/{tenantId}")]
    public async Task<IActionResult> GetMigrationHistory(Guid tenantId)
    {
        try
        {
            var tenant = await _masterDbContext.Tenants
                .FirstOrDefaultAsync(t => t.Id == tenantId && t.IsActive);

            if (tenant == null)
            {
                return NotFound(new { message = "Tenant bulunamadı" });
            }

            var optionsBuilder = new DbContextOptionsBuilder<TenantDbContext>();
            optionsBuilder.UseSqlServer(tenant.ConnectionString.Value);

            using var tenantContext = new TenantDbContext(optionsBuilder.Options, _tenantService);
            
            var appliedMigrations = await tenantContext.Database
                .GetAppliedMigrationsAsync();

            return Ok(new
            {
                success = true,
                tenantName = tenant.Name,
                tenantCode = tenant.Code,
                appliedMigrations = appliedMigrations.ToList(),
                totalMigrations = appliedMigrations.Count()
            });
        }
        catch (Exception ex)
        {
            Logger.LogError(ex, "Error getting migration history for tenant {TenantId}", tenantId);
            return StatusCode(500, new { message = "Migration geçmişi alınırken hata oluştu", error = ex.Message });
        }
    }
}