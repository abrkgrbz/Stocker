using Microsoft.EntityFrameworkCore;
using Stocker.Domain.Tenant.Entities;
using Stocker.Domain.Master.Entities;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Stocker.Application.Common.Interfaces;

/// <summary>
/// Tenant database context interface for clean architecture
/// </summary>
public interface ITenantDbContext : IDisposable, IAsyncDisposable
{
    // Tenant Id property for multi-tenant support
    Guid TenantId { get; }
    
    // Tenant entities
    DbSet<Domain.Tenant.Entities.TenantSettings> TenantSettings { get; }
    DbSet<TenantModules> TenantModules { get; }
    DbSet<AuditLog> AuditLogs { get; }
    DbSet<Role> Roles { get; }
    // DbSet<Permission> Permissions { get; } // TODO: Add Permission entity
    DbSet<RolePermission> RolePermissions { get; }
    DbSet<UserRole> UserRoles { get; }
    DbSet<UserPermission> UserPermissions { get; }
    
    // Setup & Onboarding
    DbSet<SetupWizard> SetupWizards { get; }
    DbSet<SetupWizardStep> SetupWizardSteps { get; }
    
    // Security & Compliance
    DbSet<Domain.Tenant.Entities.TenantSecuritySettings> TenantSecuritySettings { get; }
    DbSet<Domain.Tenant.Entities.TenantApiKey> TenantApiKeys { get; }
    
    // Activity & Notifications
    DbSet<Domain.Tenant.Entities.TenantActivityLog> TenantActivityLogs { get; }
    DbSet<Domain.Tenant.Entities.TenantNotification> TenantNotifications { get; }
    
    // Onboarding & Initial Setup
    DbSet<Domain.Tenant.Entities.TenantSetupChecklist> TenantSetupChecklists { get; }
    DbSet<Domain.Tenant.Entities.TenantInitialData> TenantInitialData { get; }
    
    // User Management
    DbSet<Domain.Tenant.Entities.UserTenant> UserTenants { get; }
    DbSet<Domain.Tenant.Entities.TenantUser> TenantUsers { get; }
    
    // Documents & Integrations
    DbSet<Domain.Tenant.Entities.TenantDocument> TenantDocuments { get; }
    DbSet<Domain.Tenant.Entities.TenantIntegration> TenantIntegrations { get; }
    
    // Phase 3 Entities - Newly Added
    DbSet<Domain.Tenant.Entities.TenantWebhook> TenantWebhooks { get; }
    DbSet<Domain.Tenant.Entities.TenantCompliance> TenantCompliances { get; }
    DbSet<Domain.Tenant.Entities.TenantCustomization> TenantCustomizations { get; }
    DbSet<Domain.Tenant.Entities.TenantOnboarding> TenantOnboardings { get; }
    DbSet<Domain.Tenant.Entities.OnboardingStep> OnboardingSteps { get; }
    DbSet<Domain.Tenant.Entities.OnboardingTask> OnboardingTasks { get; }
    DbSet<Domain.Tenant.Entities.TenantFeature> TenantFeatures { get; }
    DbSet<Domain.Tenant.Entities.PasswordHistory> PasswordHistories { get; }
    
    // Customer & Product Management
    DbSet<Customer> Customers { get; }
    DbSet<Product> Products { get; }
    
    // Financial
    DbSet<Domain.Tenant.Entities.Invoice> Invoices { get; }
    DbSet<Domain.Tenant.Entities.InvoiceItem> InvoiceItems { get; }
    DbSet<Domain.Tenant.Entities.Payment> Payments { get; }
    
    // Common methods
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    int SaveChanges();
}