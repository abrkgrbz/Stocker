using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Stocker.Modules.CRM.Infrastructure.Persistence;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.CRM.Infrastructure.Services;

/// <summary>
/// Service for managing CRM module database per tenant
/// </summary>
public interface ITenantCRMDatabaseService
{
    Task<bool> EnsureCRMTablesExistAsync(Guid tenantId);
    Task<bool> EnableCRMForTenantAsync(Guid tenantId, string connectionString);
    Task<bool> DisableCRMForTenantAsync(Guid tenantId);
    string GetTenantConnectionString(Guid tenantId);
}

public class TenantCRMDatabaseService : ITenantCRMDatabaseService
{
    private readonly IConfiguration _configuration;
    private readonly IServiceProvider _serviceProvider;

    public TenantCRMDatabaseService(
        IConfiguration configuration,
        IServiceProvider serviceProvider)
    {
        _configuration = configuration;
        _serviceProvider = serviceProvider;
    }

    /// <summary>
    /// Tenant'ın veritabanında CRM tablolarını oluştur
    /// </summary>
    public async Task<bool> EnsureCRMTablesExistAsync(Guid tenantId)
    {
        try
        {
            var connectionString = GetTenantConnectionString(tenantId);

            var optionsBuilder = new DbContextOptionsBuilder<CRMDbContext>();
            optionsBuilder.UseNpgsql(connectionString);

            // Tenant service'i al
            var tenantService = _serviceProvider.GetRequiredService<ITenantService>();
            
            using (var context = new CRMDbContext(optionsBuilder.Options, tenantService))
            {
                // CRM tablolarını oluştur (migration'ları uygula)
                await context.Database.MigrateAsync();
                return true;
            }
        }
        catch (Exception ex)
        {
            // Log error
            Console.WriteLine($"Error creating CRM tables for tenant {tenantId}: {ex.Message}");
            return false;
        }
    }

    /// <summary>
    /// Tenant için CRM modülünü etkinleştir
    /// </summary>
    public async Task<bool> EnableCRMForTenantAsync(Guid tenantId, string connectionString)
    {
        try
        {
            var optionsBuilder = new DbContextOptionsBuilder<CRMDbContext>();
            optionsBuilder.UseNpgsql(connectionString);

            var tenantService = _serviceProvider.GetRequiredService<ITenantService>();

            using (var context = new CRMDbContext(optionsBuilder.Options, tenantService))
            {
                // Migration'ları uygula
                await context.Database.MigrateAsync();
                
                // İlk veriyi ekle (opsiyonel)
                await SeedInitialDataAsync(context, tenantId);
                
                return true;
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error enabling CRM for tenant {tenantId}: {ex.Message}");
            return false;
        }
    }

    /// <summary>
    /// Tenant için CRM modülünü devre dışı bırak
    /// </summary>
    public async Task<bool> DisableCRMForTenantAsync(Guid tenantId)
    {
        // CRM tablolarını silmek yerine, sadece erişimi kapat
        // Veri güvenliği için tablolar kalabilir
        return await Task.FromResult(true);
    }

    /// <summary>
    /// Tenant'ın connection string'ini al
    /// </summary>
    public string GetTenantConnectionString(Guid tenantId)
    {
        // Her tenant'ın kendi veritabanı var
        // Format: Stocker_Tenant_{TenantId}
        var baseConnectionString = _configuration.GetConnectionString("TenantConnection")
            ?? "Host=localhost;Port=5432;Database={0};Username=postgres;Password=YourStrongPassword123!;Include Error Detail=true";
        
        var tenantDbName = $"Stocker_Tenant_{tenantId:N}";
        return baseConnectionString.Replace("StockerTenantDb", tenantDbName);
    }

    private async Task SeedInitialDataAsync(CRMDbContext context, Guid tenantId)
    {
        // İlk CRM verilerini ekle (opsiyonel)
        // Örnek: Varsayılan lead kaynakları, müşteri tipleri vb.
        await Task.CompletedTask;
    }
}