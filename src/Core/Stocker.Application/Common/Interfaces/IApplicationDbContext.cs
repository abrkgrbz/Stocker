using Microsoft.EntityFrameworkCore;
using Stocker.Domain.Master.Entities;

namespace Stocker.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    // Master Entities
    DbSet<Tenant> Tenants { get; }
    DbSet<MasterUser> MasterUsers { get; }
    DbSet<Package> Packages { get; }
    DbSet<Subscription> Subscriptions { get; }
    DbSet<Domain.Master.Entities.Invoice> Invoices { get; }
    DbSet<Domain.Master.Entities.Payment> Payments { get; }
    
    // Tenant Related Entities
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
    
    // Common method
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    int SaveChanges();
}