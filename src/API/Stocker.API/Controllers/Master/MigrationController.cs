using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Stocker.API.Controllers.Base;
using Stocker.Persistence.Contexts;
using Stocker.SharedKernel.Interfaces;
using Swashbuckle.AspNetCore.Annotations;
using Stocker.Application.Common.Exceptions;
using Stocker.SharedKernel.Exceptions;

namespace Stocker.API.Controllers.Master;

[Authorize(Policy = "RequireMasterAccess")]
[ApiController]
[Route("api/master/migrations")]
[SwaggerTag("Master - Database Migration Management")]
public class MigrationController : ApiController
{
    private readonly MasterDbContext _masterDbContext;
    private readonly IServiceProvider _serviceProvider;
    private readonly ITenantService _tenantService;
    private readonly IConfiguration _configuration;
    private readonly ILogger<MigrationController> _logger;

    public MigrationController(
        MasterDbContext masterDbContext,
        IServiceProvider serviceProvider,
        ITenantService tenantService,
        IConfiguration configuration,
        ILogger<MigrationController> logger)
    {
        _masterDbContext = masterDbContext;
        _serviceProvider = serviceProvider;
        _tenantService = tenantService;
        _configuration = configuration;
        _logger = logger;
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
                .AsNoTracking()
                .Where(t => t.IsActive)
                .Select(t => new
                {
                    t.Id,
                    t.Name,
                    t.Code,
                    ConnectionString = t.ConnectionString.Value
                })
                .ToListAsync();

            var results = new List<object>();

            foreach (var tenant in tenants)
            {
                try
                {
                    var optionsBuilder = new DbContextOptionsBuilder<TenantDbContext>();
                    optionsBuilder.UseSqlServer(tenant.ConnectionString);

                    using var tenantContext = new TenantDbContext(optionsBuilder.Options, _tenantService);
                    
                    var pendingMigrations = await tenantContext.Database
                        .GetPendingMigrationsAsync();

                    var appliedMigrations = await tenantContext.Database
                        .GetAppliedMigrationsAsync();

                    var pendingList = pendingMigrations.ToList();
                    var appliedList = appliedMigrations.ToList();

                    // Check CRM module migrations if tenant has CRM access
                    List<string> crmPendingMigrations = new();
                    List<string> crmAppliedMigrations = new();
                    
                    try
                    {
                        var tenantModuleService = _serviceProvider.GetService<Stocker.Application.Common.Interfaces.ITenantModuleService>();
                        
                        if (tenantModuleService != null)
                        {
                            var hasCrmAccess = await tenantModuleService.HasModuleAccessAsync(tenant.Id, "CRM", CancellationToken.None);
                            
                            if (hasCrmAccess)
                            {
                                var crmOptionsBuilder = new DbContextOptionsBuilder<Stocker.Modules.CRM.Infrastructure.Persistence.CRMDbContext>();
                                crmOptionsBuilder.UseSqlServer(tenant.ConnectionString);
                                crmOptionsBuilder.ConfigureWarnings(warnings =>
                                    warnings.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));
                                
                                var mockTenantService = new Stocker.Persistence.Migrations.MockTenantService(tenant.Id, tenant.ConnectionString);
                                
                                using var crmDbContext = new Stocker.Modules.CRM.Infrastructure.Persistence.CRMDbContext(
                                    crmOptionsBuilder.Options, 
                                    mockTenantService);
                                
                                var crmPending = await crmDbContext.Database.GetPendingMigrationsAsync();
                                var crmApplied = await crmDbContext.Database.GetAppliedMigrationsAsync();
                                
                                crmPendingMigrations = crmPending.ToList();
                                crmAppliedMigrations = crmApplied.ToList();
                            }
                        }
                    }
                    catch (Exception crmEx)
                    {
                        _logger.LogWarning(crmEx, "Failed to check CRM migrations for tenant {TenantId}", tenant.Id);
                    }

                    var allPendingMigrations = new List<object>();
                    if (pendingList.Any())
                    {
                        allPendingMigrations.Add(new { Module = "Core", Migrations = pendingList });
                    }
                    if (crmPendingMigrations.Any())
                    {
                        allPendingMigrations.Add(new { Module = "CRM", Migrations = crmPendingMigrations });
                    }

                    var allAppliedMigrations = new List<object>();
                    if (appliedList.Any())
                    {
                        allAppliedMigrations.Add(new { Module = "Core", Migrations = appliedList });
                    }
                    if (crmAppliedMigrations.Any())
                    {
                        allAppliedMigrations.Add(new { Module = "CRM", Migrations = crmAppliedMigrations });
                    }

                    results.Add(new
                    {
                        TenantId = tenant.Id,
                        TenantName = tenant.Name,
                        TenantCode = tenant.Code,
                        PendingMigrations = allPendingMigrations,
                        AppliedMigrations = allAppliedMigrations,
                        HasPendingMigrations = pendingList.Any() || crmPendingMigrations.Any()
                    });
                }
                catch (DatabaseException ex)
                {
                    Logger.LogError(ex, "Database error checking migrations for tenant {TenantId}", tenant.Id);
                    results.Add(new
                    {
                        TenantId = tenant.Id,
                        TenantName = tenant.Name,
                        TenantCode = tenant.Code,
                        Error = $"Database error: {ex.Message}",
                        HasPendingMigrations = false
                    });
                }
                catch (ConfigurationException ex)
                {
                    Logger.LogError(ex, "Configuration error checking migrations for tenant {TenantId}", tenant.Id);
                    results.Add(new
                    {
                        TenantId = tenant.Id,
                        TenantName = tenant.Name,
                        TenantCode = tenant.Code,
                        Error = $"Configuration error: {ex.Message}",
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
        catch (DatabaseException ex)
        {
            Logger.LogError(ex, "Database error getting pending migrations");
            return StatusCode(503, new { message = "Veritabanı bağlantı hatası", error = ex.Message });
        }
        catch (InfrastructureException ex)
        {
            Logger.LogError(ex, "Infrastructure error getting pending migrations");
            return StatusCode(503, new { message = "Altyapı hatası", error = ex.Message });
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
            
            // Suppress pending model changes warning for tenant migrations
            optionsBuilder.ConfigureWarnings(warnings =>
                warnings.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));

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
        catch (DatabaseException ex)
        {
            Logger.LogError(ex, "Database error applying migration to tenant {TenantId}", tenantId);
            return StatusCode(503, new 
            { 
                message = "Veritabanı migration hatası", 
                error = ex.Message,
                details = ex.InnerException?.Message
            });
        }
        catch (BusinessException ex)
        {
            Logger.LogError(ex, "Business error applying migration to tenant {TenantId}", tenantId);
            return BadRequest(new 
            { 
                message = "Migration işlemi başarısız", 
                error = ex.Message
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
                catch (DatabaseException ex)
                {
                    failureCount++;
                    Logger.LogError(ex, "Database error applying migrations to tenant {TenantId}", tenant.Id);
                    
                    results.Add(new
                    {
                        TenantId = tenant.Id,
                        TenantName = tenant.Name,
                        Success = false,
                        Message = $"Database error: {ex.Message}",
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
        catch (DatabaseException ex)
        {
            Logger.LogError(ex, "Database error applying migrations to all tenants");
            return StatusCode(503, new { message = "Veritabanı bağlantı hatası", error = ex.Message });
        }
        catch (InfrastructureException ex)
        {
            Logger.LogError(ex, "Infrastructure error applying migrations to all tenants");
            return StatusCode(503, new { message = "Altyapı hatası", error = ex.Message });
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
            
            // Suppress pending model changes warning for tenant migrations
            optionsBuilder.ConfigureWarnings(warnings =>
                warnings.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));

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
        catch (DatabaseException ex)
        {
            Logger.LogError(ex, "Database error getting migration history for tenant {TenantId}", tenantId);
            return StatusCode(503, new { message = "Veritabanı bağlantı hatası", error = ex.Message });
        }
        catch (Application.Common.Exceptions.NotFoundException ex)
        {
            Logger.LogError(ex, "Tenant not found {TenantId}", tenantId);
            return NotFound(new { message = "Tenant bulunamadı", error = ex.Message });
        }
    }
}