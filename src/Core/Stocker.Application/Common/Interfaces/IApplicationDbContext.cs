using Microsoft.EntityFrameworkCore;
using Stocker.Domain.Master.Entities;
using Stocker.Domain.Entities.Settings;

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
    
    // Settings
    DbSet<SystemSettings> SystemSettings { get; }
    
    // Tenant Core Management (Remaining in Master)
    DbSet<TenantHealthCheck> TenantHealthChecks { get; }
    DbSet<TenantBackup> TenantBackups { get; }
    DbSet<TenantDomain> TenantDomains { get; }
    
    // REMOVED - Moved to Tenant DB (All phases completed):
    // Phase 1-2: TenantApiKey, TenantActivityLog, TenantSecuritySettings, TenantSettings
    //           TenantIntegration, TenantNotification, TenantSetupWizard, TenantSetupChecklist
    //           TenantInitialData, TenantDocument, UserTenant
    // Phase 3:  TenantWebhook, TenantFeature, TenantCompliance, TenantCustomization
    //           TenantOnboarding, OnboardingStep, OnboardingTask, PasswordHistory
    
    // Common method
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    int SaveChanges();
}