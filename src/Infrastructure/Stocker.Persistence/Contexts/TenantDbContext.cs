using Microsoft.EntityFrameworkCore; 
using Stocker.Domain.Tenant.Entities;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.Application.Common.Interfaces;

namespace Stocker.Persistence.Contexts;

public class TenantDbContext : BaseDbContext, ITenantDbContext 
{
    private readonly ITenantService? _tenantService;
    private readonly Guid? _tenantId;
    
    // Constructor for DI with ITenantService
    public TenantDbContext(DbContextOptions<TenantDbContext> options, ITenantService tenantService) 
        : base(options)
    {
        _tenantService = tenantService ?? throw new ArgumentNullException(nameof(tenantService));
    }
    
    // Constructor for factory pattern with explicit tenantId
    public TenantDbContext(DbContextOptions<TenantDbContext> options, Guid tenantId) 
        : base(options)
    {
        _tenantId = tenantId;
    }

    // Tenant Id property for Unit of Work
    public Guid TenantId => _tenantId ?? _tenantService?.GetCurrentTenantId() ?? throw new InvalidOperationException("TenantId is not set");

    // Company & Organization
    public DbSet<Company> Companies => Set<Company>();
    public DbSet<Department> Departments => Set<Department>();
    public DbSet<Branch> Branches => Set<Branch>();

    // User & Authorization
    public DbSet<TenantUser> TenantUsers => Set<TenantUser>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<RolePermission> RolePermissions => Set<RolePermission>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();
    public DbSet<UserPermission> UserPermissions => Set<UserPermission>();
    
    // Settings & Configuration
    public DbSet<TenantSettings> TenantSettings => Set<TenantSettings>();
    public DbSet<TenantModules> TenantModules => Set<TenantModules>();
    // public DbSet<TenantModule> TenantModule => Set<TenantModule>(); // TODO: Add entity or remove
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    // public DbSet<UserSession> UserSessions => Set<UserSession>(); // TODO: Add entity or remove
    
    // Setup & Onboarding (Moved from Master to Tenant for better isolation)
    public DbSet<SetupWizard> SetupWizards => Set<SetupWizard>();
    public DbSet<SetupWizardStep> SetupWizardSteps => Set<SetupWizardStep>();
    
    // Security & Compliance (Moved from Master to Tenant for better isolation)
    public DbSet<TenantSecuritySettings> TenantSecuritySettings => Set<TenantSecuritySettings>();
    public DbSet<TenantApiKey> TenantApiKeys => Set<TenantApiKey>();
    
    // Activity & Notifications (Moved from Master to Tenant for better isolation)
    public DbSet<TenantActivityLog> TenantActivityLogs => Set<TenantActivityLog>();
    public DbSet<TenantNotification> TenantNotifications => Set<TenantNotification>();
    
    // Onboarding & Initial Setup (Moved from Master to Tenant for better isolation)
    public DbSet<TenantSetupChecklist> TenantSetupChecklists => Set<TenantSetupChecklist>();
    public DbSet<TenantInitialData> TenantInitialData => Set<TenantInitialData>();
    
    // User Management (Moved from Master to Tenant for better isolation)
    public DbSet<UserTenant> UserTenants => Set<UserTenant>();
    
    // Phase 3 Entities (New additions)
    public DbSet<TenantWebhook> TenantWebhooks => Set<TenantWebhook>();
    public DbSet<TenantCompliance> TenantCompliances => Set<TenantCompliance>();
    public DbSet<TenantCustomization> TenantCustomizations => Set<TenantCustomization>();
    public DbSet<TenantOnboarding> TenantOnboardings => Set<TenantOnboarding>();
    public DbSet<OnboardingStep> OnboardingSteps => Set<OnboardingStep>();
    public DbSet<OnboardingTask> OnboardingTasks => Set<OnboardingTask>();
    public DbSet<TenantFeature> TenantFeatures => Set<TenantFeature>();
    public DbSet<PasswordHistory> PasswordHistories => Set<PasswordHistory>();
    
    // Documents & Integrations (Moved from Master to Tenant for better isolation)
    public DbSet<TenantDocument> TenantDocuments => Set<TenantDocument>();
    public DbSet<TenantIntegration> TenantIntegrations => Set<TenantIntegration>();
    
    // Financial
    public DbSet<Domain.Tenant.Entities.Invoice> Invoices => Set<Domain.Tenant.Entities.Invoice>();
    public DbSet<Domain.Tenant.Entities.InvoiceItem> InvoiceItems => Set<Domain.Tenant.Entities.InvoiceItem>();
    public DbSet<Domain.Tenant.Entities.Payment> Payments => Set<Domain.Tenant.Entities.Payment>();
    
    // Customer & Product Management
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Product> Products => Set<Product>();

    // Inventory - Moved to Stocker.Modules.Inventory
    // public DbSet<Product> Products => Set<Product>();
    // public DbSet<Stock> Stocks => Set<Stock>();
    // public DbSet<StockMovement> StockMovements => Set<StockMovement>();
    // public DbSet<Warehouse> Warehouses => Set<Warehouse>();

    // CRM Module - TODO: Move to separate CRM DbContext to avoid circular reference
    // public DbSet<Customer> Customers => Set<Customer>();
    // public DbSet<Contact> Contacts => Set<Contact>();
    // public DbSet<Lead> Leads => Set<Lead>();
    // public DbSet<Opportunity> Opportunities => Set<Opportunity>();
    // public DbSet<Activity> Activities => Set<Activity>();
    // public DbSet<Note> Notes => Set<Note>();
    // public DbSet<OpportunityProduct> OpportunityProducts => Set<OpportunityProduct>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Set schema based on tenant
        var tenantId = _tenantId ?? _tenantService?.GetCurrentTenantId();
        if (tenantId.HasValue)
        {
            // Each tenant can have its own schema if needed
            // For now, we'll use the default schema
            modelBuilder.HasDefaultSchema("tenant");
        }
        
        // Apply configurations from root namespace only (not Tenant subfolder to avoid duplicates)
        var rootConfigNamespace = "Stocker.Persistence.Configurations";
        
        var configurations = GetType().Assembly.GetTypes()
            .Where(t => t.Namespace == rootConfigNamespace && 
                       !t.IsAbstract && 
                       !t.IsGenericTypeDefinition &&
                       t.GetInterfaces().Any(i => i.IsGenericType && 
                                                  i.GetGenericTypeDefinition() == typeof(Microsoft.EntityFrameworkCore.IEntityTypeConfiguration<>)))
            .ToList();
            
        // Also apply configurations from Tenant namespace, but filter out Phase 3 entities
        var tenantConfigNamespace = "Stocker.Persistence.Configurations.Tenant";
        var phase3Entities = new[] { "TenantWebhook", "TenantCompliance", "TenantCustomization", 
                                     "TenantOnboarding", "TenantFeature", "PasswordHistory" };
        
        var tenantConfigurations = GetType().Assembly.GetTypes()
            .Where(t => t.Namespace == tenantConfigNamespace && 
                       !t.IsAbstract && 
                       !t.IsGenericTypeDefinition &&
                       !phase3Entities.Any(e => t.Name.Contains(e)) &&
                       t.GetInterfaces().Any(i => i.IsGenericType && 
                                                  i.GetGenericTypeDefinition() == typeof(Microsoft.EntityFrameworkCore.IEntityTypeConfiguration<>)))
            .ToList();
            
        configurations.AddRange(tenantConfigurations);

        // CRM configurations are now handled in the separate CRMDbContext

        foreach (var configurationType in configurations)
        {
            dynamic? configurationInstance = Activator.CreateInstance(configurationType);
            if (configurationInstance != null)
            {
                modelBuilder.ApplyConfiguration(configurationInstance);
            }
        }

        // Apply global query filter for multi-tenancy
        var currentTenantId = _tenantId ?? _tenantService?.GetCurrentTenantId();
        if (currentTenantId.HasValue)
        {
            modelBuilder.Entity<Company>().HasQueryFilter(e => e.TenantId == currentTenantId);
            modelBuilder.Entity<Department>().HasQueryFilter(e => e.TenantId == currentTenantId);
            modelBuilder.Entity<Branch>().HasQueryFilter(e => e.TenantId == currentTenantId);
            modelBuilder.Entity<TenantUser>().HasQueryFilter(e => e.TenantId == currentTenantId);
            // Role artık TenantId içermiyor - database-per-tenant yapısı kullanıldığı için gerek yok
            modelBuilder.Entity<TenantSettings>().HasQueryFilter(e => e.TenantId == currentTenantId);
            modelBuilder.Entity<TenantModules>().HasQueryFilter(e => e.TenantId == currentTenantId);
            modelBuilder.Entity<Customer>().HasQueryFilter(e => e.TenantId == currentTenantId);
            modelBuilder.Entity<Product>().HasQueryFilter(e => e.TenantId == currentTenantId);
            modelBuilder.Entity<Domain.Tenant.Entities.Invoice>().HasQueryFilter(e => e.TenantId == currentTenantId);
            modelBuilder.Entity<Domain.Tenant.Entities.InvoiceItem>().HasQueryFilter(e => e.TenantId == currentTenantId);
            modelBuilder.Entity<Domain.Tenant.Entities.Payment>().HasQueryFilter(e => e.TenantId == currentTenantId);
            
            // Phase 3 Entities - No query filters needed (database-per-tenant approach)
            // Each tenant has its own database, so no need for TenantId filtering
        }
        // Inventory entities moved to Stocker.Modules.Inventory
        // modelBuilder.Entity<Product>().HasQueryFilter(e => e.TenantId == _tenantService.GetCurrentTenantId());
        // modelBuilder.Entity<Stock>().HasQueryFilter(e => e.TenantId == _tenantService.GetCurrentTenantId());
        // modelBuilder.Entity<StockMovement>().HasQueryFilter(e => e.TenantId == _tenantService.GetCurrentTenantId());
        // modelBuilder.Entity<Warehouse>().HasQueryFilter(e => e.TenantId == _tenantService.GetCurrentTenantId());
    }

    protected override void ConfigureConventions(ModelConfigurationBuilder configurationBuilder)
    {
        base.ConfigureConventions(configurationBuilder);
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var tenantId = _tenantId ?? _tenantService?.GetCurrentTenantId();
        if (!tenantId.HasValue)
        {
            throw new InvalidOperationException("TenantId is required for all operations in tenant context.");
        }

        // Automatically set TenantId for new entities
        foreach (var entry in ChangeTracker.Entries<ITenantEntity>())
        {
            if (entry.State == EntityState.Added && entry.Entity.TenantId == Guid.Empty)
            {
                // Use reflection to set TenantId since it's a private setter
                var tenantIdProperty = entry.Entity.GetType().GetProperty(nameof(ITenantEntity.TenantId));
                if (tenantIdProperty != null && tenantIdProperty.CanWrite)
                {
                    var setTenantIdMethod = entry.Entity.GetType().GetMethod("SetTenantId", 
                        System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);
                    setTenantIdMethod?.Invoke(entry.Entity, new object[] { tenantId.Value });
                }
            }
        }

        return await base.SaveChangesAsync(cancellationToken);
    }
}