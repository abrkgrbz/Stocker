using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Tenant.Entities;
using System.Text.Json;

namespace Stocker.Persistence.Configurations.Tenant;

public class TenantInitialDataConfiguration : BaseEntityTypeConfiguration<TenantInitialData>
{
    public override void Configure(EntityTypeBuilder<TenantInitialData> builder)
    {
        base.Configure(builder);
        
        // Table name
        builder.ToTable("TenantInitialData", "tenant");
        
        // Status
        builder.Property(d => d.DataSetType)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20);
            
        builder.Property(d => d.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20);
            
        // Company Information
        builder.Property(d => d.CompanyName)
            .IsRequired()
            .HasMaxLength(200);
            
        builder.Property(d => d.CompanyCode)
            .HasMaxLength(50);
            
        builder.Property(d => d.TaxNumber)
            .HasMaxLength(50);
            
        builder.Property(d => d.TaxOffice)
            .HasMaxLength(100);
            
        builder.Property(d => d.TradeRegistryNumber)
            .HasMaxLength(50);
            
        builder.Property(d => d.MersisNumber)
            .HasMaxLength(50);
            
        // Contact Information
        builder.Property(d => d.ContactEmail)
            .IsRequired()
            .HasMaxLength(100);
            
        builder.Property(d => d.ContactPhone)
            .IsRequired()
            .HasMaxLength(50);
            
        builder.Property(d => d.ContactFax)
            .HasMaxLength(50);
            
        builder.Property(d => d.Website)
            .HasMaxLength(200);
            
        // Address
        builder.Property(d => d.AddressLine1)
            .HasMaxLength(200);
            
        builder.Property(d => d.AddressLine2)
            .HasMaxLength(200);
            
        builder.Property(d => d.City)
            .HasMaxLength(100);
            
        builder.Property(d => d.State)
            .HasMaxLength(100);
            
        builder.Property(d => d.Country)
            .HasMaxLength(100);
            
        builder.Property(d => d.PostalCode)
            .HasMaxLength(20);
            
        // Business Information
        builder.Property(d => d.IndustryType)
            .HasMaxLength(100);
            
        builder.Property(d => d.BusinessType)
            .HasMaxLength(100);
            
        builder.Property(d => d.EmployeeCount);
        
        builder.Property(d => d.AnnualRevenue)
            .HasPrecision(18, 2);
            
        builder.Property(d => d.Currency)
            .HasMaxLength(10);
            
        builder.Property(d => d.FiscalYearStart);
        
        // Default Users
        builder.Property(d => d.AdminUserEmail)
            .IsRequired()
            .HasMaxLength(100);
            
        builder.Property(d => d.AdminUserName)
            .IsRequired()
            .HasMaxLength(100);
            
        builder.Property(d => d.AdminFirstName)
            .HasMaxLength(100);
            
        builder.Property(d => d.AdminLastName)
            .HasMaxLength(100);
            
        builder.Property(d => d.AdminPhone)
            .HasMaxLength(50);
            
        builder.Property(d => d.AdminUserCreated)
            .IsRequired()
            .HasDefaultValue(false);
            
        // Default Settings
        builder.Property(d => d.DefaultLanguage)
            .HasMaxLength(10);
            
        builder.Property(d => d.DefaultTimeZone)
            .HasMaxLength(100);
            
        builder.Property(d => d.DefaultDateFormat)
            .HasMaxLength(50);
            
        builder.Property(d => d.DefaultNumberFormat)
            .HasMaxLength(50);
            
        builder.Property(d => d.Use24HourTime)
            .IsRequired()
            .HasDefaultValue(false);
            
        // Initial Modules - JSON arrays
        builder.Property(d => d.EnabledModules)
            .HasConversion(
                v => JsonSerializer.Serialize(v, (JsonSerializerOptions)null),
                v => JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions)null))
            .HasColumnType("nvarchar(max)");
            
        builder.Property(d => d.RequestedFeatures)
            .HasConversion(
                v => JsonSerializer.Serialize(v, (JsonSerializerOptions)null),
                v => JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions)null))
            .HasColumnType("nvarchar(max)");
            
        // Initial Data Sets
        builder.Property(d => d.CreateSampleData)
            .IsRequired()
            .HasDefaultValue(false);
            
        builder.Property(d => d.ImportExistingData)
            .IsRequired()
            .HasDefaultValue(false);
            
        builder.Property(d => d.DataImportSource)
            .HasMaxLength(500);
            
        builder.Property(d => d.DataImportFormat)
            .HasMaxLength(50);
            
        // Initial Departments - JSON
        builder.Property(d => d.InitialDepartments)
            .HasConversion(
                v => JsonSerializer.Serialize(v, (JsonSerializerOptions)null),
                v => JsonSerializer.Deserialize<List<InitialDepartment>>(v, (JsonSerializerOptions)null))
            .HasColumnType("nvarchar(max)");
            
        // Initial Branches - JSON
        builder.Property(d => d.InitialBranches)
            .HasConversion(
                v => JsonSerializer.Serialize(v, (JsonSerializerOptions)null),
                v => JsonSerializer.Deserialize<List<InitialBranch>>(v, (JsonSerializerOptions)null))
            .HasColumnType("nvarchar(max)");
            
        // Initial Roles - JSON
        builder.Property(d => d.InitialRoles)
            .HasConversion(
                v => JsonSerializer.Serialize(v, (JsonSerializerOptions)null),
                v => JsonSerializer.Deserialize<List<InitialRole>>(v, (JsonSerializerOptions)null))
            .HasColumnType("nvarchar(max)");
            
        // Initial Chart of Accounts - JSON
        builder.Property(d => d.InitialAccounts)
            .HasConversion(
                v => JsonSerializer.Serialize(v, (JsonSerializerOptions)null),
                v => JsonSerializer.Deserialize<List<InitialAccount>>(v, (JsonSerializerOptions)null))
            .HasColumnType("nvarchar(max)");
            
        // Initial Tax Settings - JSON
        builder.Property(d => d.InitialTaxRates)
            .HasConversion(
                v => JsonSerializer.Serialize(v, (JsonSerializerOptions)null),
                v => JsonSerializer.Deserialize<List<InitialTaxRate>>(v, (JsonSerializerOptions)null))
            .HasColumnType("nvarchar(max)");
            
        // Initial Product Categories - JSON
        builder.Property(d => d.InitialProductCategories)
            .HasConversion(
                v => JsonSerializer.Serialize(v, (JsonSerializerOptions)null),
                v => JsonSerializer.Deserialize<List<InitialProductCategory>>(v, (JsonSerializerOptions)null))
            .HasColumnType("nvarchar(max)");
            
        // Initial Warehouses - JSON
        builder.Property(d => d.InitialWarehouses)
            .HasConversion(
                v => JsonSerializer.Serialize(v, (JsonSerializerOptions)null),
                v => JsonSerializer.Deserialize<List<InitialWarehouse>>(v, (JsonSerializerOptions)null))
            .HasColumnType("nvarchar(max)");
            
        // Processing Information
        builder.Property(d => d.CreatedAt)
            .IsRequired();
            
        builder.Property(d => d.CreatedBy)
            .IsRequired()
            .HasMaxLength(100);
            
        builder.Property(d => d.ProcessedAt);
        
        builder.Property(d => d.ProcessedBy)
            .HasMaxLength(100);
            
        builder.Property(d => d.ProcessAttempts)
            .IsRequired()
            .HasDefaultValue(0);
            
        builder.Property(d => d.ProcessingError)
            .HasMaxLength(2000);
            
        builder.Property(d => d.ProcessingLog)
            .HasColumnType("nvarchar(max)");
            
        // Validation
        builder.Property(d => d.IsValidated)
            .IsRequired()
            .HasDefaultValue(false);
            
        builder.Property(d => d.ValidatedAt);
        
        builder.Property(d => d.ValidationErrors)
            .HasConversion(
                v => JsonSerializer.Serialize(v, (JsonSerializerOptions)null),
                v => JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions)null))
            .HasColumnType("nvarchar(max)");
            
        builder.Property(d => d.ValidationWarnings)
            .HasConversion(
                v => JsonSerializer.Serialize(v, (JsonSerializerOptions)null),
                v => JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions)null))
            .HasColumnType("nvarchar(max)");
            
        // Indexes
        builder.HasIndex(d => d.Status)
            .HasDatabaseName("IX_TenantInitialData_Status");
            
        builder.HasIndex(d => d.CompanyName)
            .HasDatabaseName("IX_TenantInitialData_CompanyName");
            
        builder.HasIndex(d => d.AdminUserEmail)
            .HasDatabaseName("IX_TenantInitialData_AdminUserEmail");
            
        builder.HasIndex(d => d.CreatedAt)
            .HasDatabaseName("IX_TenantInitialData_CreatedAt");
            
        builder.HasIndex(d => d.ProcessedAt)
            .HasDatabaseName("IX_TenantInitialData_ProcessedAt");
    }
}