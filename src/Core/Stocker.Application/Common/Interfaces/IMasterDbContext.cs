using Microsoft.EntityFrameworkCore;
using Stocker.Domain.Master.Entities;
using Stocker.Domain.Entities.Settings;

namespace Stocker.Application.Common.Interfaces;

/// <summary>
/// Master database context interface for clean architecture
/// </summary>
public interface IMasterDbContext
{
    // Core Master entities (Stay in Master DB)
    DbSet<Tenant> Tenants { get; }
    DbSet<MasterUser> MasterUsers { get; }
    DbSet<Package> Packages { get; }
    DbSet<PackageModule> PackageModules { get; }
    DbSet<Subscription> Subscriptions { get; }
    DbSet<Invoice> Invoices { get; }
    DbSet<Payment> Payments { get; }
    DbSet<SystemSettings> SystemSettings { get; }
    DbSet<TenantHealthCheck> TenantHealthChecks { get; }
    DbSet<TenantBackup> TenantBackups { get; }
    DbSet<TenantDomain> TenantDomains { get; }
    DbSet<TenantRegistration> TenantRegistrations { get; }
    DbSet<SecurityAuditLog> SecurityAuditLogs { get; }

    // All entities requiring tenant isolation have been moved to Tenant DB
    
    // REMOVED - Moved to Tenant DB (All phases completed):
    // Phase 1-2: TenantApiKey, TenantActivityLog, TenantSecuritySettings, TenantNotification
    //           TenantSetupWizard, TenantSetupChecklist, TenantInitialData, TenantSettings
    //           TenantDocument, TenantIntegration, UserTenant
    // Phase 3:  TenantWebhook, TenantFeature, TenantCompliance, TenantCustomization
    //           TenantOnboarding, OnboardingStep, OnboardingTask, PasswordHistory
    
    // Common methods
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    int SaveChanges();
}