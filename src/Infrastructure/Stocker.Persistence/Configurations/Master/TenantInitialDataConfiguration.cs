using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Master.Entities;

namespace Stocker.Persistence.Configurations.Master;

public class TenantInitialDataConfiguration : IEntityTypeConfiguration<TenantInitialData>
{
    public void Configure(EntityTypeBuilder<TenantInitialData> builder)
    {
        builder.ToTable("TenantInitialData", "Master");
        
        builder.HasKey(x => x.Id);
        
        // Data Set Information
        builder.Property(x => x.DataSetType)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);
            
        builder.Property(x => x.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);
            
        // Company Information
        builder.Property(x => x.CompanyName)
            .IsRequired()
            .HasMaxLength(200);
            
        builder.Property(x => x.CompanyCode)
            .HasMaxLength(50);
            
        builder.Property(x => x.TaxNumber)
            .HasMaxLength(50);
            
        builder.Property(x => x.TaxOffice)
            .HasMaxLength(100);
            
        builder.Property(x => x.TradeRegistryNumber)
            .HasMaxLength(50);
            
        builder.Property(x => x.MersisNumber)
            .HasMaxLength(20);
            
        // Contact Information
        builder.Property(x => x.ContactEmail)
            .IsRequired()
            .HasMaxLength(256);
            
        builder.Property(x => x.ContactPhone)
            .IsRequired()
            .HasMaxLength(50);
            
        builder.Property(x => x.ContactFax)
            .HasMaxLength(50);
            
        builder.Property(x => x.Website)
            .HasMaxLength(500);
            
        // Address
        builder.Property(x => x.AddressLine1)
            .HasMaxLength(200);
            
        builder.Property(x => x.AddressLine2)
            .HasMaxLength(200);
            
        builder.Property(x => x.City)
            .HasMaxLength(100);
            
        builder.Property(x => x.State)
            .HasMaxLength(100);
            
        builder.Property(x => x.Country)
            .HasMaxLength(100);
            
        builder.Property(x => x.PostalCode)
            .HasMaxLength(20);
            
        // Business Information
        builder.Property(x => x.IndustryType)
            .HasMaxLength(100);
            
        builder.Property(x => x.BusinessType)
            .HasMaxLength(100);
            
        builder.Property(x => x.AnnualRevenue)
            .HasPrecision(18, 2);
            
        builder.Property(x => x.Currency)
            .HasMaxLength(3);
            
        // Default Users
        builder.Property(x => x.AdminUserEmail)
            .IsRequired()
            .HasMaxLength(256);
            
        builder.Property(x => x.AdminUserName)
            .IsRequired()
            .HasMaxLength(100);
            
        builder.Property(x => x.AdminFirstName)
            .HasMaxLength(100);
            
        builder.Property(x => x.AdminLastName)
            .HasMaxLength(100);
            
        builder.Property(x => x.AdminPhone)
            .HasMaxLength(50);
            
        builder.Property(x => x.AdminUserCreated)
            .IsRequired();
            
        // Default Settings
        builder.Property(x => x.DefaultLanguage)
            .IsRequired()
            .HasMaxLength(10);
            
        builder.Property(x => x.DefaultTimeZone)
            .IsRequired()
            .HasMaxLength(100);
            
        builder.Property(x => x.DefaultDateFormat)
            .IsRequired()
            .HasMaxLength(50);
            
        builder.Property(x => x.DefaultTimeFormat)
            .IsRequired()
            .HasMaxLength(50);
            
        builder.Property(x => x.DefaultCurrency)
            .IsRequired()
            .HasMaxLength(3);
            
        builder.Property(x => x.DefaultTheme)
            .HasMaxLength(50);
            
        // Module Selections
        builder.Property(x => x.SelectedModules)
            .IsRequired()
            .HasMaxLength(4000);
            
        builder.Property(x => x.ModuleConfigurations)
            .IsRequired()
            .HasMaxLength(4000);
            
        // Initial Data Sets
        builder.Property(x => x.CreateSampleData)
            .IsRequired();
            
        builder.Property(x => x.ImportExistingData)
            .IsRequired();
            
        builder.Property(x => x.ImportedDataSources)
            .HasMaxLength(4000);
            
        // Departments & Branches
        builder.Property(x => x.DefaultDepartments)
            .HasMaxLength(4000);
            
        builder.Property(x => x.DefaultBranches)
            .HasMaxLength(4000);
            
        builder.Property(x => x.DepartmentsCreated)
            .IsRequired();
            
        builder.Property(x => x.BranchesCreated)
            .IsRequired();
            
        // Chart of Accounts
        builder.Property(x => x.UseDefaultChartOfAccounts)
            .IsRequired();
            
        builder.Property(x => x.ChartOfAccountsTemplate)
            .HasMaxLength(100);
            
        builder.Property(x => x.ChartOfAccountsCreated)
            .IsRequired();
            
        // Product Categories
        builder.Property(x => x.DefaultProductCategories)
            .HasMaxLength(4000);
            
        builder.Property(x => x.ProductCategoriesCreated)
            .IsRequired();
            
        // Templates
        builder.Property(x => x.CustomerTemplate)
            .HasMaxLength(4000);
            
        builder.Property(x => x.VendorTemplate)
            .HasMaxLength(4000);
            
        builder.Property(x => x.TemplatesCreated)
            .IsRequired();
            
        // Workflow Configurations
        builder.Property(x => x.ApprovalWorkflows)
            .HasMaxLength(4000);
            
        builder.Property(x => x.NotificationRules)
            .HasMaxLength(4000);
            
        builder.Property(x => x.WorkflowsConfigured)
            .IsRequired();
            
        // Integration Preferences
        builder.Property(x => x.PreferredIntegrations)
            .HasMaxLength(4000);
            
        builder.Property(x => x.IntegrationsConfigured)
            .IsRequired();
            
        // Setup Progress
        builder.Property(x => x.SetupStepsCompleted)
            .IsRequired();
            
        builder.Property(x => x.TotalSetupSteps)
            .IsRequired();
            
        builder.Property(x => x.SetupProgressPercentage)
            .IsRequired()
            .HasPrecision(5, 2);
            
        // Validation
        builder.Property(x => x.IsValidated)
            .IsRequired();
            
        builder.Property(x => x.ValidationErrors)
            .HasMaxLength(4000);
            
        // Processing
        builder.Property(x => x.IsProcessed)
            .IsRequired();
            
        builder.Property(x => x.ProcessingErrors)
            .HasMaxLength(4000);
            
        builder.Property(x => x.ProcessingAttempts)
            .IsRequired();
            
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
            .WithMany()
            .HasForeignKey(x => x.TenantId)
            .OnDelete(DeleteBehavior.Restrict);
            
        // Indexes
        builder.HasIndex(x => x.TenantId);
        builder.HasIndex(x => x.Status);
        builder.HasIndex(x => x.DataSetType);
        builder.HasIndex(x => x.IsValidated);
        builder.HasIndex(x => x.IsProcessed);
        builder.HasIndex(x => x.CompanyName);
        builder.HasIndex(x => x.ContactEmail);
        builder.HasIndex(x => x.AdminUserEmail);
        builder.HasIndex(x => new { x.TenantId, x.Status });
    }
}