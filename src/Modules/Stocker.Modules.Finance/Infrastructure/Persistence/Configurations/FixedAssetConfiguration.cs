using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Finance.Domain.Entities;

namespace Stocker.Modules.Finance.Infrastructure.Persistence.Configurations;

/// <summary>
/// Entity configuration for FixedAsset
/// </summary>
public class FixedAssetConfiguration : IEntityTypeConfiguration<FixedAsset>
{
    public void Configure(EntityTypeBuilder<FixedAsset> builder)
    {
        builder.ToTable("FixedAssets", "finance");

        builder.HasKey(fa => fa.Id);

        builder.Property(fa => fa.TenantId)
            .IsRequired();

        builder.Property(fa => fa.Code)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(fa => fa.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(fa => fa.Description)
            .HasMaxLength(500);

        builder.Property(fa => fa.Barcode)
            .HasMaxLength(50);

        builder.Property(fa => fa.SerialNumber)
            .HasMaxLength(100);

        builder.Property(fa => fa.ModelNumber)
            .HasMaxLength(100);

        builder.Property(fa => fa.Brand)
            .HasMaxLength(100);

        builder.Property(fa => fa.SubCategory)
            .HasMaxLength(100);

        builder.Property(fa => fa.AccountGroup)
            .IsRequired()
            .HasMaxLength(10);

        builder.Property(fa => fa.Currency)
            .IsRequired()
            .HasMaxLength(3)
            .HasDefaultValue("TRY");

        // Depreciation Information
        builder.Property(fa => fa.DepreciationRate)
            .HasPrecision(5, 2);

        // Location Information
        builder.Property(fa => fa.LocationName)
            .HasMaxLength(200);

        builder.Property(fa => fa.CustodianName)
            .HasMaxLength(200);

        // Supplier Information
        builder.Property(fa => fa.SupplierName)
            .HasMaxLength(200);

        builder.Property(fa => fa.InvoiceNumber)
            .HasMaxLength(50);

        // Accounting Integration
        builder.Property(fa => fa.AssetAccountCode)
            .HasMaxLength(50);

        builder.Property(fa => fa.AccumulatedDepreciationAccountCode)
            .HasMaxLength(50);

        // Disposal Information
        builder.Property(fa => fa.DisposalReason)
            .HasMaxLength(500);

        // Insurance Information
        builder.Property(fa => fa.InsurancePolicyNumber)
            .HasMaxLength(50);

        builder.Property(fa => fa.InsuranceCompany)
            .HasMaxLength(200);

        // Status Information
        builder.Property(fa => fa.Notes)
            .HasMaxLength(2000);

        builder.Property(fa => fa.Tags)
            .HasMaxLength(500);

        builder.Property(fa => fa.ImagePath)
            .HasMaxLength(500);

        // Money value objects - owned entities
        builder.OwnsOne(fa => fa.AcquisitionCost, money =>
        {
            money.Property(m => m.Amount).HasColumnName("AcquisitionCost").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("AcquisitionCostCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(fa => fa.CostValue, money =>
        {
            money.Property(m => m.Amount).HasColumnName("CostValue").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("CostValueCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(fa => fa.SalvageValue, money =>
        {
            money.Property(m => m.Amount).HasColumnName("SalvageValue").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("SalvageValueCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(fa => fa.DepreciableAmount, money =>
        {
            money.Property(m => m.Amount).HasColumnName("DepreciableAmount").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("DepreciableAmountCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(fa => fa.AccumulatedDepreciation, money =>
        {
            money.Property(m => m.Amount).HasColumnName("AccumulatedDepreciation").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("AccumulatedDepreciationCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(fa => fa.NetBookValue, money =>
        {
            money.Property(m => m.Amount).HasColumnName("NetBookValue").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("NetBookValueCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(fa => fa.RevaluationAmount, money =>
        {
            money.Property(m => m.Amount).HasColumnName("RevaluationAmount").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("RevaluationAmountCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(fa => fa.SaleAmount, money =>
        {
            money.Property(m => m.Amount).HasColumnName("SaleAmount").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("SaleAmountCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(fa => fa.DisposalGainLoss, money =>
        {
            money.Property(m => m.Amount).HasColumnName("DisposalGainLoss").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("DisposalGainLossCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(fa => fa.InsuranceValue, money =>
        {
            money.Property(m => m.Amount).HasColumnName("InsuranceValue").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("InsuranceValueCurrency").HasMaxLength(3);
        });

        // Relationships
        builder.HasOne(fa => fa.AssetAccount)
            .WithMany()
            .HasForeignKey(fa => fa.AssetAccountId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(fa => fa.AccumulatedDepreciationAccount)
            .WithMany()
            .HasForeignKey(fa => fa.AccumulatedDepreciationAccountId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(fa => fa.DepreciationExpenseAccount)
            .WithMany()
            .HasForeignKey(fa => fa.DepreciationExpenseAccountId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(fa => fa.Supplier)
            .WithMany()
            .HasForeignKey(fa => fa.SupplierId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(fa => fa.Invoice)
            .WithMany()
            .HasForeignKey(fa => fa.InvoiceId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(fa => fa.CostCenter)
            .WithMany()
            .HasForeignKey(fa => fa.CostCenterId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasMany(fa => fa.Depreciations)
            .WithOne(d => d.FixedAsset)
            .HasForeignKey(d => d.FixedAssetId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(fa => fa.Movements)
            .WithOne(m => m.FixedAsset)
            .HasForeignKey(m => m.FixedAssetId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(fa => fa.Maintenances)
            .WithOne(m => m.FixedAsset)
            .HasForeignKey(m => m.FixedAssetId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(fa => fa.TenantId);
        builder.HasIndex(fa => new { fa.TenantId, fa.Code }).IsUnique();
        builder.HasIndex(fa => new { fa.TenantId, fa.Name });
        builder.HasIndex(fa => new { fa.TenantId, fa.AssetType });
        builder.HasIndex(fa => new { fa.TenantId, fa.Category });
        builder.HasIndex(fa => new { fa.TenantId, fa.Status });
        builder.HasIndex(fa => new { fa.TenantId, fa.IsActive });
        builder.HasIndex(fa => new { fa.TenantId, fa.IsFullyDepreciated });
        builder.HasIndex(fa => new { fa.TenantId, fa.AcquisitionDate });
        builder.HasIndex(fa => fa.Barcode);
        builder.HasIndex(fa => fa.SerialNumber);
        builder.HasIndex(fa => fa.LocationId);
        builder.HasIndex(fa => fa.DepartmentId);
        builder.HasIndex(fa => fa.CustodianUserId);
    }
}

/// <summary>
/// Entity configuration for FixedAssetDepreciation
/// </summary>
public class FixedAssetDepreciationConfiguration : IEntityTypeConfiguration<FixedAssetDepreciation>
{
    public void Configure(EntityTypeBuilder<FixedAssetDepreciation> builder)
    {
        builder.ToTable("FixedAssetDepreciations", "finance");

        builder.HasKey(d => d.Id);

        builder.Property(d => d.TenantId)
            .IsRequired();

        builder.Property(d => d.Period)
            .IsRequired()
            .HasMaxLength(20);

        // Money value objects - owned entities
        builder.OwnsOne(d => d.DepreciationAmount, money =>
        {
            money.Property(m => m.Amount).HasColumnName("DepreciationAmount").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("DepreciationAmountCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(d => d.AccumulatedDepreciation, money =>
        {
            money.Property(m => m.Amount).HasColumnName("AccumulatedDepreciation").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("AccumulatedDepreciationCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(d => d.NetBookValue, money =>
        {
            money.Property(m => m.Amount).HasColumnName("NetBookValue").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("NetBookValueCurrency").HasMaxLength(3);
        });

        // Relationships
        builder.HasOne(d => d.FixedAsset)
            .WithMany(fa => fa.Depreciations)
            .HasForeignKey(d => d.FixedAssetId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(d => d.JournalEntry)
            .WithMany()
            .HasForeignKey(d => d.JournalEntryId)
            .OnDelete(DeleteBehavior.SetNull);

        // Indexes
        builder.HasIndex(d => d.TenantId);
        builder.HasIndex(d => d.FixedAssetId);
        builder.HasIndex(d => new { d.TenantId, d.FixedAssetId, d.Period }).IsUnique();
        builder.HasIndex(d => new { d.TenantId, d.PeriodStart, d.PeriodEnd });
        builder.HasIndex(d => new { d.TenantId, d.IsPosted });
    }
}

/// <summary>
/// Entity configuration for FixedAssetMovement
/// </summary>
public class FixedAssetMovementConfiguration : IEntityTypeConfiguration<FixedAssetMovement>
{
    public void Configure(EntityTypeBuilder<FixedAssetMovement> builder)
    {
        builder.ToTable("FixedAssetMovements", "finance");

        builder.HasKey(m => m.Id);

        builder.Property(m => m.TenantId)
            .IsRequired();

        builder.Property(m => m.Description)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(m => m.Notes)
            .HasMaxLength(2000);

        // Money value objects - owned entities
        builder.OwnsOne(m => m.Amount, money =>
        {
            money.Property(mo => mo.Amount).HasColumnName("Amount").HasPrecision(18, 4);
            money.Property(mo => mo.Currency).HasColumnName("AmountCurrency").HasMaxLength(3);
        });

        // Relationships
        builder.HasOne(m => m.FixedAsset)
            .WithMany(fa => fa.Movements)
            .HasForeignKey(m => m.FixedAssetId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(m => m.TenantId);
        builder.HasIndex(m => m.FixedAssetId);
        builder.HasIndex(m => new { m.TenantId, m.MovementType });
        builder.HasIndex(m => new { m.TenantId, m.MovementDate });
    }
}

/// <summary>
/// Entity configuration for FixedAssetMaintenance
/// </summary>
public class FixedAssetMaintenanceConfiguration : IEntityTypeConfiguration<FixedAssetMaintenance>
{
    public void Configure(EntityTypeBuilder<FixedAssetMaintenance> builder)
    {
        builder.ToTable("FixedAssetMaintenances", "finance");

        builder.HasKey(m => m.Id);

        builder.Property(m => m.TenantId)
            .IsRequired();

        builder.Property(m => m.Description)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(m => m.Notes)
            .HasMaxLength(2000);

        // Money value objects - owned entities
        builder.OwnsOne(m => m.Cost, money =>
        {
            money.Property(mo => mo.Amount).HasColumnName("Cost").HasPrecision(18, 4);
            money.Property(mo => mo.Currency).HasColumnName("CostCurrency").HasMaxLength(3);
        });

        // Relationships
        builder.HasOne(m => m.FixedAsset)
            .WithMany(fa => fa.Maintenances)
            .HasForeignKey(m => m.FixedAssetId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(m => m.TenantId);
        builder.HasIndex(m => m.FixedAssetId);
        builder.HasIndex(m => new { m.TenantId, m.MaintenanceType });
        builder.HasIndex(m => new { m.TenantId, m.MaintenanceDate });
        builder.HasIndex(m => new { m.TenantId, m.IsCompleted });
        builder.HasIndex(m => new { m.TenantId, m.NextMaintenanceDate });
    }
}
