using Microsoft.EntityFrameworkCore;
using Stocker.Domain.Master.Entities;
using Stocker.Domain.Entities.Settings;

namespace Stocker.Application.Common.Interfaces;

/// <summary>
/// Master database context interface for clean architecture
/// </summary>
public interface IMasterDbContext
{
    // Master entities
    DbSet<Tenant> Tenants { get; }
    DbSet<MasterUser> MasterUsers { get; }
    DbSet<Package> Packages { get; }
    DbSet<Subscription> Subscriptions { get; }
    DbSet<Invoice> Invoices { get; }
    DbSet<Payment> Payments { get; }
    DbSet<SystemSettings> SystemSettings { get; }
    DbSet<TenantApiKey> TenantApiKeys { get; }
    DbSet<TenantWebhook> TenantWebhooks { get; }
    DbSet<TenantIntegration> TenantIntegrations { get; }
    DbSet<TenantActivityLog> TenantActivityLogs { get; }
    DbSet<TenantSettings> TenantSettings { get; }
    DbSet<TenantSecuritySettings> TenantSecuritySettings { get; }
    DbSet<TenantHealthCheck> TenantHealthChecks { get; }
    DbSet<TenantBackup> TenantBackups { get; }
    DbSet<TenantDomain> TenantDomains { get; }
    DbSet<TenantFeature> TenantFeatures { get; }
    DbSet<TenantRegistration> TenantRegistrations { get; }
    DbSet<TenantSetupWizard> TenantSetupWizards { get; }
    DbSet<TenantSetupChecklist> TenantSetupChecklists { get; }
    DbSet<PackageModule> PackageModules { get; }
    DbSet<TenantInitialData> TenantInitialData { get; }
    
    // Common methods
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    int SaveChanges();
}