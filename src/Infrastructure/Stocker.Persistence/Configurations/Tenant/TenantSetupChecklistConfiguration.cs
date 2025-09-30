using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Tenant.Entities;
using System.Text.Json;

namespace Stocker.Persistence.Configurations.Tenant;

public class TenantSetupChecklistConfiguration : IEntityTypeConfiguration<TenantSetupChecklist>
{
    public void Configure(EntityTypeBuilder<TenantSetupChecklist> builder)
    {
        // Table name
        builder.ToTable("TenantSetupChecklists");
        
        // Primary key
        builder.HasKey(c => c.Id);
        
        // Status
        builder.Property(c => c.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20);
            
        // Basic Setup
        builder.Property(c => c.CompanyInfoCompleted)
            .IsRequired()
            .HasDefaultValue(false);
            
        builder.Property(c => c.CompanyInfoCompletedAt);
        
        builder.Property(c => c.CompanyInfoCompletedBy)
            .HasMaxLength(100);
            
        builder.Property(c => c.LogoUploaded)
            .IsRequired()
            .HasDefaultValue(false);
            
        builder.Property(c => c.LogoUploadedAt);
        
        builder.Property(c => c.LogoUploadedBy)
            .HasMaxLength(100);
            
        builder.Property(c => c.AdminUserCreated)
            .IsRequired()
            .HasDefaultValue(false);
            
        builder.Property(c => c.AdminUserCreatedAt);
        
        builder.Property(c => c.AdminUserCreatedBy)
            .HasMaxLength(100);
            
        // Organization Setup
        builder.Property(c => c.DepartmentsCreated)
            .IsRequired()
            .HasDefaultValue(false);
            
        builder.Property(c => c.DepartmentCount)
            .IsRequired()
            .HasDefaultValue(0);
            
        builder.Property(c => c.BranchesCreated)
            .IsRequired()
            .HasDefaultValue(false);
            
        builder.Property(c => c.BranchCount)
            .IsRequired()
            .HasDefaultValue(0);
            
        builder.Property(c => c.RolesConfigured)
            .IsRequired()
            .HasDefaultValue(false);
            
        builder.Property(c => c.RoleCount)
            .IsRequired()
            .HasDefaultValue(0);
            
        builder.Property(c => c.UsersInvited)
            .IsRequired()
            .HasDefaultValue(false);
            
        builder.Property(c => c.UserCount)
            .IsRequired()
            .HasDefaultValue(0);
            
        // Module Setup - JSON arrays
        builder.Property(c => c.ModulesSelected)
            .IsRequired()
            .HasDefaultValue(false);
            
        builder.Property(c => c.SelectedModulesList)
            .HasConversion(
                v => JsonSerializer.Serialize(v, (JsonSerializerOptions)null),
                v => JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions)null))
            .HasColumnType("nvarchar(max)");
            
        builder.Property(c => c.ModulesConfigured)
            .IsRequired()
            .HasDefaultValue(false);
            
        // Financial Setup
        builder.Property(c => c.ChartOfAccountsSetup)
            .IsRequired()
            .HasDefaultValue(false);
            
        builder.Property(c => c.AccountCount)
            .IsRequired()
            .HasDefaultValue(0);
            
        builder.Property(c => c.TaxSettingsConfigured)
            .IsRequired()
            .HasDefaultValue(false);
            
        builder.Property(c => c.CurrencyConfigured)
            .IsRequired()
            .HasDefaultValue(false);
            
        builder.Property(c => c.PrimaryCurrency)
            .HasMaxLength(10);
            
        builder.Property(c => c.FiscalYearConfigured)
            .IsRequired()
            .HasDefaultValue(false);
            
        // Product/Service Setup
        builder.Property(c => c.ProductCategoriesCreated)
            .IsRequired()
            .HasDefaultValue(false);
            
        builder.Property(c => c.ProductCategoryCount)
            .IsRequired()
            .HasDefaultValue(0);
            
        builder.Property(c => c.ProductsImported)
            .IsRequired()
            .HasDefaultValue(false);
            
        builder.Property(c => c.ProductCount)
            .IsRequired()
            .HasDefaultValue(0);
            
        builder.Property(c => c.PricingRulesConfigured)
            .IsRequired()
            .HasDefaultValue(false);
            
        // Customer/Vendor Setup
        builder.Property(c => c.CustomersImported)
            .IsRequired()
            .HasDefaultValue(false);
            
        builder.Property(c => c.CustomerCount)
            .IsRequired()
            .HasDefaultValue(0);
            
        builder.Property(c => c.VendorsImported)
            .IsRequired()
            .HasDefaultValue(false);
            
        builder.Property(c => c.VendorCount)
            .IsRequired()
            .HasDefaultValue(0);
            
        // Security & Compliance
        builder.Property(c => c.SecuritySettingsConfigured)
            .IsRequired()
            .HasDefaultValue(false);
            
        builder.Property(c => c.PasswordPolicySet)
            .IsRequired()
            .HasDefaultValue(false);
            
        builder.Property(c => c.TwoFactorEnabled)
            .IsRequired()
            .HasDefaultValue(false);
            
        builder.Property(c => c.BackupConfigured)
            .IsRequired()
            .HasDefaultValue(false);
            
        builder.Property(c => c.ComplianceConfigured)
            .IsRequired()
            .HasDefaultValue(false);
            
        // Integration Setup
        builder.Property(c => c.EmailIntegrationConfigured)
            .IsRequired()
            .HasDefaultValue(false);
            
        builder.Property(c => c.PaymentGatewayConfigured)
            .IsRequired()
            .HasDefaultValue(false);
            
        builder.Property(c => c.SmsIntegrationConfigured)
            .IsRequired()
            .HasDefaultValue(false);
            
        builder.Property(c => c.ThirdPartyIntegrationsConfigured)
            .IsRequired()
            .HasDefaultValue(false);
            
        builder.Property(c => c.IntegratedServices)
            .HasConversion(
                v => v == null ? null : JsonSerializer.Serialize(v, (JsonSerializerOptions)null),
                v => v == null ? null : JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions)null))
            .HasColumnType("nvarchar(max)");
            
        // Customization
        builder.Property(c => c.ThemeCustomized)
            .IsRequired()
            .HasDefaultValue(false);
            
        builder.Property(c => c.EmailTemplatesConfigured)
            .IsRequired()
            .HasDefaultValue(false);
            
        builder.Property(c => c.ReportTemplatesConfigured)
            .IsRequired()
            .HasDefaultValue(false);
            
        builder.Property(c => c.DashboardConfigured)
            .IsRequired()
            .HasDefaultValue(false);
            
        // Workflow & Automation
        builder.Property(c => c.ApprovalWorkflowsConfigured)
            .IsRequired()
            .HasDefaultValue(false);
            
        builder.Property(c => c.WorkflowCount)
            .IsRequired()
            .HasDefaultValue(0);
            
        builder.Property(c => c.NotificationRulesConfigured)
            .IsRequired()
            .HasDefaultValue(false);
            
        builder.Property(c => c.NotificationRuleCount)
            .IsRequired()
            .HasDefaultValue(0);
            
        builder.Property(c => c.AutomationRulesConfigured)
            .IsRequired()
            .HasDefaultValue(false);
            
        builder.Property(c => c.AutomationRuleCount)
            .IsRequired()
            .HasDefaultValue(0);
            
        // Training & Documentation
        builder.Property(c => c.TrainingCompleted)
            .IsRequired()
            .HasDefaultValue(false);
            
        builder.Property(c => c.TrainedUserCount)
            .IsRequired()
            .HasDefaultValue(0);
            
        builder.Property(c => c.DocumentationReviewed)
            .IsRequired()
            .HasDefaultValue(false);
            
        builder.Property(c => c.SupportContactsAdded)
            .IsRequired()
            .HasDefaultValue(false);
            
        // Go-Live Readiness
        builder.Property(c => c.DataMigrationCompleted)
            .IsRequired()
            .HasDefaultValue(false);
            
        builder.Property(c => c.SystemTestingCompleted)
            .IsRequired()
            .HasDefaultValue(false);
            
        builder.Property(c => c.UserAcceptanceCompleted)
            .IsRequired()
            .HasDefaultValue(false);
            
        builder.Property(c => c.GoLiveApproved)
            .IsRequired()
            .HasDefaultValue(false);
            
        builder.Property(c => c.GoLiveApprovedBy)
            .HasMaxLength(100);
            
        // Progress Tracking
        builder.Property(c => c.TotalItems)
            .IsRequired()
            .HasDefaultValue(0);
            
        builder.Property(c => c.CompletedItems)
            .IsRequired()
            .HasDefaultValue(0);
            
        builder.Property(c => c.RequiredItems)
            .IsRequired()
            .HasDefaultValue(0);
            
        builder.Property(c => c.RequiredCompletedItems)
            .IsRequired()
            .HasDefaultValue(0);
            
        builder.Property(c => c.OverallProgress)
            .HasPrecision(5, 2)
            .HasDefaultValue(0);
            
        builder.Property(c => c.RequiredProgress)
            .HasPrecision(5, 2)
            .HasDefaultValue(0);
            
        // Notes & Comments - JSON arrays
        builder.Property(c => c.Notes)
            .HasMaxLength(4000);
            
        builder.Property(c => c.PendingTasks)
            .HasConversion(
                v => v == null ? null : JsonSerializer.Serialize(v, (JsonSerializerOptions)null),
                v => v == null ? null : JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions)null))
            .HasColumnType("nvarchar(max)");
            
        builder.Property(c => c.BlockingIssues)
            .HasConversion(
                v => v == null ? null : JsonSerializer.Serialize(v, (JsonSerializerOptions)null),
                v => v == null ? null : JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions)null))
            .HasColumnType("nvarchar(max)");
            
        // Audit
        builder.Property(c => c.CreatedAt)
            .IsRequired();
            
        builder.Property(c => c.CreatedBy)
            .IsRequired()
            .HasMaxLength(100);
            
        builder.Property(c => c.UpdatedAt);
        
        builder.Property(c => c.UpdatedBy)
            .HasMaxLength(100);
            
        builder.Property(c => c.CompletedAt);
        
        // Indexes
        builder.HasIndex(c => c.Status)
            .HasDatabaseName("IX_TenantSetupChecklists_Status");
            
        builder.HasIndex(c => c.CreatedAt)
            .HasDatabaseName("IX_TenantSetupChecklists_CreatedAt");
            
        builder.HasIndex(c => c.OverallProgress)
            .HasDatabaseName("IX_TenantSetupChecklists_OverallProgress");
            
        builder.HasIndex(c => c.RequiredProgress)
            .HasDatabaseName("IX_TenantSetupChecklists_RequiredProgress");
    }
}