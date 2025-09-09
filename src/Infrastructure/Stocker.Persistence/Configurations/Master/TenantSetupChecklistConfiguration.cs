using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Master.Entities;

namespace Stocker.Persistence.Configurations.Master;

public class TenantSetupChecklistConfiguration : IEntityTypeConfiguration<TenantSetupChecklist>
{
    public void Configure(EntityTypeBuilder<TenantSetupChecklist> builder)
    {
        builder.ToTable("TenantSetupChecklists", "Master");
        
        builder.HasKey(x => x.Id);
        
        // Status
        builder.Property(x => x.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);
            
        // Basic Setup
        builder.Property(x => x.CompanyInfoCompleted)
            .IsRequired();
        builder.Property(x => x.CompanyInfoCompletedBy)
            .HasMaxLength(100);
            
        builder.Property(x => x.LogoUploaded)
            .IsRequired();
        builder.Property(x => x.LogoUploadedBy)
            .HasMaxLength(100);
            
        builder.Property(x => x.AdminUserCreated)
            .IsRequired();
        builder.Property(x => x.AdminUserCreatedBy)
            .HasMaxLength(100);
            
        // Organization Setup
        builder.Property(x => x.DepartmentsCreated)
            .IsRequired();
        builder.Property(x => x.DepartmentCount)
            .IsRequired();
            
        builder.Property(x => x.BranchesCreated)
            .IsRequired();
        builder.Property(x => x.BranchCount)
            .IsRequired();
            
        builder.Property(x => x.RolesConfigured)
            .IsRequired();
        builder.Property(x => x.RoleCount)
            .IsRequired();
            
        builder.Property(x => x.UsersInvited)
            .IsRequired();
        builder.Property(x => x.UserCount)
            .IsRequired();
            
        // Module Setup
        builder.Property(x => x.ModulesSelected)
            .IsRequired();
        builder.Property(x => x.SelectedModulesList)
            .IsRequired()
            .HasMaxLength(4000);
            
        builder.Property(x => x.ModulesConfigured)
            .IsRequired();
            
        // Financial Setup
        builder.Property(x => x.ChartOfAccountsSetup)
            .IsRequired();
        builder.Property(x => x.AccountCount)
            .IsRequired();
            
        builder.Property(x => x.TaxSettingsConfigured)
            .IsRequired();
            
        builder.Property(x => x.CurrencyConfigured)
            .IsRequired();
        builder.Property(x => x.PrimaryCurrency)
            .HasMaxLength(3);
            
        builder.Property(x => x.FiscalYearConfigured)
            .IsRequired();
            
        // Product/Service Setup
        builder.Property(x => x.ProductCategoriesCreated)
            .IsRequired();
        builder.Property(x => x.ProductCategoryCount)
            .IsRequired();
            
        builder.Property(x => x.ProductsImported)
            .IsRequired();
        builder.Property(x => x.ProductCount)
            .IsRequired();
            
        builder.Property(x => x.PricingRulesConfigured)
            .IsRequired();
            
        // Customer/Vendor Setup
        builder.Property(x => x.CustomersImported)
            .IsRequired();
        builder.Property(x => x.CustomerCount)
            .IsRequired();
            
        builder.Property(x => x.VendorsImported)
            .IsRequired();
        builder.Property(x => x.VendorCount)
            .IsRequired();
            
        // Security & Compliance
        builder.Property(x => x.SecuritySettingsConfigured)
            .IsRequired();
            
        builder.Property(x => x.PasswordPolicySet)
            .IsRequired();
            
        builder.Property(x => x.TwoFactorEnabled)
            .IsRequired();
            
        builder.Property(x => x.BackupConfigured)
            .IsRequired();
            
        builder.Property(x => x.ComplianceConfigured)
            .IsRequired();
            
        // Integration Setup
        builder.Property(x => x.EmailIntegrationConfigured)
            .IsRequired();
            
        builder.Property(x => x.PaymentGatewayConfigured)
            .IsRequired();
            
        builder.Property(x => x.SmsIntegrationConfigured)
            .IsRequired();
            
        builder.Property(x => x.ThirdPartyIntegrationsConfigured)
            .IsRequired();
        builder.Property(x => x.IntegratedServices)
            .HasMaxLength(4000);
            
        // Customization
        builder.Property(x => x.ThemeCustomized)
            .IsRequired();
            
        builder.Property(x => x.EmailTemplatesConfigured)
            .IsRequired();
            
        builder.Property(x => x.ReportTemplatesConfigured)
            .IsRequired();
            
        builder.Property(x => x.DashboardConfigured)
            .IsRequired();
            
        // Workflow & Automation
        builder.Property(x => x.ApprovalWorkflowsConfigured)
            .IsRequired();
        builder.Property(x => x.WorkflowCount)
            .IsRequired();
            
        builder.Property(x => x.NotificationRulesConfigured)
            .IsRequired();
        builder.Property(x => x.NotificationRuleCount)
            .IsRequired();
            
        builder.Property(x => x.AutomationRulesConfigured)
            .IsRequired();
        builder.Property(x => x.AutomationRuleCount)
            .IsRequired();
            
        // Training & Documentation
        builder.Property(x => x.TrainingCompleted)
            .IsRequired();
        builder.Property(x => x.TrainedUserCount)
            .IsRequired();
            
        builder.Property(x => x.DocumentationReviewed)
            .IsRequired();
            
        builder.Property(x => x.SupportContactsAdded)
            .IsRequired();
            
        // Go-Live Readiness
        builder.Property(x => x.DataMigrationCompleted)
            .IsRequired();
            
        builder.Property(x => x.SystemTestingCompleted)
            .IsRequired();
            
        builder.Property(x => x.UserAcceptanceCompleted)
            .IsRequired();
            
        builder.Property(x => x.GoLiveApproved)
            .IsRequired();
        builder.Property(x => x.GoLiveApprovedBy)
            .HasMaxLength(100);
            
        // Progress Tracking
        builder.Property(x => x.TotalItems)
            .IsRequired();
            
        builder.Property(x => x.CompletedItems)
            .IsRequired();
            
        builder.Property(x => x.RequiredItems)
            .IsRequired();
            
        builder.Property(x => x.RequiredCompletedItems)
            .IsRequired();
            
        builder.Property(x => x.OverallProgress)
            .IsRequired()
            .HasPrecision(5, 2);
            
        builder.Property(x => x.RequiredProgress)
            .IsRequired()
            .HasPrecision(5, 2);
            
        // Notes & Comments
        builder.Property(x => x.Notes)
            .HasMaxLength(4000);
            
        builder.Property(x => x.PendingTasks)
            .HasMaxLength(4000);
            
        builder.Property(x => x.BlockingIssues)
            .HasMaxLength(4000);
            
        // Audit
        builder.Property(x => x.CreatedAt)
            .IsRequired();
            
        builder.Property(x => x.CreatedBy)
            .IsRequired()
            .HasMaxLength(100);
            
        builder.Property(x => x.UpdatedBy)
            .HasMaxLength(100);
            
        // Navigation
        builder.HasOne(x => x.Tenant)
            .WithOne()
            .HasForeignKey<TenantSetupChecklist>(x => x.TenantId)
            .OnDelete(DeleteBehavior.Restrict);
            
        // Indexes
        builder.HasIndex(x => x.TenantId)
            .IsUnique();
        builder.HasIndex(x => x.Status);
        builder.HasIndex(x => x.OverallProgress);
        builder.HasIndex(x => x.RequiredProgress);
        builder.HasIndex(x => x.GoLiveApproved);
    }
}