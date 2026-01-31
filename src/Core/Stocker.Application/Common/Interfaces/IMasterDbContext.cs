using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Stocker.Domain.Master.Entities;
using Stocker.Domain.Master.Entities.CMS;
using Stocker.Domain.Entities.Settings;

namespace Stocker.Application.Common.Interfaces;

/// <summary>
/// Master database context interface for clean architecture
/// </summary>
public interface IMasterDbContext
{
    /// <summary>
    /// Provides access to change tracking for entities
    /// </summary>
    ChangeTracker ChangeTracker { get; }
    // Core Master entities (Stay in Master DB)
    DbSet<Tenant> Tenants { get; }

    // Email Templates (System-wide templates with Liquid support)
    DbSet<Domain.Master.Entities.EmailTemplate> EmailTemplates { get; }
    DbSet<MasterUser> MasterUsers { get; }
    DbSet<Package> Packages { get; }
    DbSet<PackageModule> PackageModules { get; }
    DbSet<ModuleDefinition> ModuleDefinitions { get; }
    DbSet<ModuleFeature> ModuleFeatures { get; }
    DbSet<ModuleDependency> ModuleDependencies { get; }
    DbSet<Subscription> Subscriptions { get; }
    DbSet<SubscriptionModule> SubscriptionModules { get; }
    DbSet<Invoice> Invoices { get; }
    DbSet<Payment> Payments { get; }
    DbSet<SystemSettings> SystemSettings { get; }
    DbSet<TenantHealthCheck> TenantHealthChecks { get; }
    DbSet<TenantBackup> TenantBackups { get; }
    DbSet<TenantDomain> TenantDomains { get; }
    DbSet<TenantRegistration> TenantRegistrations { get; }
    DbSet<TenantSettings> TenantSettings { get; }
    DbSet<TenantUserEmail> TenantUserEmails { get; }
    DbSet<SecurityAuditLog> SecurityAuditLogs { get; }
    DbSet<BackupSchedule> BackupSchedules { get; }
    DbSet<LemonSqueezySubscription> LemonSqueezySubscriptions { get; }

    /// <summary>
    /// Password history for preventing password reuse (linked to MasterUser)
    /// </summary>
    DbSet<PasswordHistory> PasswordHistories { get; }

    /// <summary>
    /// Active user sessions for session management and logout all functionality
    /// </summary>
    DbSet<UserSession> UserSessions { get; }

    // System Monitoring & Reporting entities
    DbSet<SystemAlert> SystemAlerts { get; }
    DbSet<ReportSchedule> ReportSchedules { get; }
    DbSet<ReportExecution> ReportExecutions { get; }

    // Pricing & Setup entities
    DbSet<AddOn> AddOns { get; }
    DbSet<AddOnFeature> AddOnFeatures { get; }
    DbSet<StoragePlan> StoragePlans { get; }
    DbSet<Industry> Industries { get; }
    DbSet<IndustryRecommendedModule> IndustryRecommendedModules { get; }
    DbSet<UserTier> UserTiers { get; }
    DbSet<ModulePricing> ModulePricing { get; }
    DbSet<ModuleBundle> ModuleBundles { get; }
    DbSet<ModuleBundleItem> ModuleBundleItems { get; }
    DbSet<SubscriptionAddOn> SubscriptionAddOns { get; }
    DbSet<IyzicoSubscription> IyzicoSubscriptions { get; }

    // Shopping Cart & Checkout entities
    DbSet<SubscriptionCart> SubscriptionCarts { get; }
    DbSet<SubscriptionCartItem> SubscriptionCartItems { get; }
    DbSet<SubscriptionOrder> SubscriptionOrders { get; }
    DbSet<SubscriptionOrderItem> SubscriptionOrderItems { get; }

    // Subscription & Tenant Management
    DbSet<SubscriptionUsage> SubscriptionUsages { get; }
    DbSet<TenantLimits> TenantLimits { get; }

    // CMS entities
    DbSet<CmsPage> CmsPages { get; }
    DbSet<BlogPost> BlogPosts { get; }
    DbSet<BlogCategory> BlogCategories { get; }
    DbSet<DocItem> DocItems { get; }
    DbSet<CmsMedia> CmsMedia { get; }

    // All entities requiring tenant isolation have been moved to Tenant DB
    // Data Migration entities moved to Tenant DB for proper tenant isolation
    
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