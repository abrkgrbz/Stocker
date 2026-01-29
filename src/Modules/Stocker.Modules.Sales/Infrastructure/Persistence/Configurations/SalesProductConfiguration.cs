using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Sales.Domain.Entities;

namespace Stocker.Modules.Sales.Infrastructure.Persistence.Configurations;

public class SalesProductConfiguration : IEntityTypeConfiguration<SalesProduct>
{
    public void Configure(EntityTypeBuilder<SalesProduct> builder)
    {
        builder.ToTable("SalesProducts", "sales");

        builder.HasKey(e => e.Id);

        // Tenant index
        builder.HasIndex(e => e.TenantId)
            .HasDatabaseName("IX_SalesProducts_TenantId");

        // Unique product code per tenant
        builder.HasIndex(e => new { e.TenantId, e.ProductCode })
            .IsUnique()
            .HasDatabaseName("IX_SalesProducts_TenantId_ProductCode");

        // Barcode index
        builder.HasIndex(e => new { e.TenantId, e.Barcode })
            .HasDatabaseName("IX_SalesProducts_TenantId_Barcode");

        // SKU index
        builder.HasIndex(e => new { e.TenantId, e.SKU })
            .HasDatabaseName("IX_SalesProducts_TenantId_SKU");

        // Active products index
        builder.HasIndex(e => new { e.TenantId, e.IsActive, e.IsAvailableForSale })
            .HasDatabaseName("IX_SalesProducts_TenantId_IsActive_IsAvailableForSale");

        // Category index
        builder.HasIndex(e => new { e.TenantId, e.Category })
            .HasDatabaseName("IX_SalesProducts_TenantId_Category");

        // Inventory link index
        builder.HasIndex(e => new { e.TenantId, e.InventoryProductId })
            .HasDatabaseName("IX_SalesProducts_TenantId_InventoryProductId");

        // Properties
        builder.Property(e => e.ProductCode)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(e => e.Name)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(e => e.Description)
            .HasMaxLength(2000);

        builder.Property(e => e.ProductType)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(e => e.Barcode)
            .HasMaxLength(50);

        builder.Property(e => e.SKU)
            .HasMaxLength(50);

        builder.Property(e => e.GtipCode)
            .HasMaxLength(20);

        // Unit
        builder.Property(e => e.Unit)
            .IsRequired()
            .HasMaxLength(10)
            .HasDefaultValue("C62");

        builder.Property(e => e.UnitDescription)
            .IsRequired()
            .HasMaxLength(50)
            .HasDefaultValue("Adet");

        // Pricing
        builder.Property(e => e.UnitPrice)
            .IsRequired()
            .HasPrecision(18, 4);

        builder.Property(e => e.Currency)
            .IsRequired()
            .HasMaxLength(3)
            .HasDefaultValue("TRY");

        builder.Property(e => e.CostPrice)
            .HasPrecision(18, 4);

        builder.Property(e => e.MinimumSalePrice)
            .HasPrecision(18, 4);

        builder.Property(e => e.ListPrice)
            .HasPrecision(18, 4);

        builder.Property(e => e.IsPriceIncludingVat)
            .IsRequired()
            .HasDefaultValue(false);

        // Tax
        builder.Property(e => e.VatRate)
            .IsRequired()
            .HasPrecision(5, 2)
            .HasDefaultValue(20);

        builder.Property(e => e.VatExemptionCode)
            .HasMaxLength(10);

        builder.Property(e => e.VatExemptionReason)
            .HasMaxLength(500);

        builder.Property(e => e.SpecialConsumptionTaxRate)
            .HasPrecision(5, 2);

        builder.Property(e => e.SpecialConsumptionTaxAmount)
            .HasPrecision(18, 4);

        // Stock
        builder.Property(e => e.TrackStock)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(e => e.StockQuantity)
            .IsRequired()
            .HasPrecision(18, 4)
            .HasDefaultValue(0);

        builder.Property(e => e.MinimumStock)
            .IsRequired()
            .HasPrecision(18, 4)
            .HasDefaultValue(0);

        builder.Property(e => e.Weight)
            .HasPrecision(18, 4);

        // Category
        builder.Property(e => e.Category)
            .HasMaxLength(100);

        builder.Property(e => e.SubCategory)
            .HasMaxLength(100);

        builder.Property(e => e.Brand)
            .HasMaxLength(100);

        builder.Property(e => e.Tags)
            .HasMaxLength(500);

        // Images
        builder.Property(e => e.ImageUrl)
            .HasMaxLength(500);

        builder.Property(e => e.ThumbnailUrl)
            .HasMaxLength(500);

        // Status
        builder.Property(e => e.IsActive)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(e => e.IsAvailableForSale)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(e => e.ShowOnWeb)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(e => e.Notes)
            .HasMaxLength(2000);

        builder.Property(e => e.DataSource)
            .IsRequired()
            .HasConversion<int>()
            .HasDefaultValue(Domain.Enums.ProductDataSource.Sales);

        // Audit
        builder.Property(e => e.CreatedAt)
            .IsRequired();

        builder.Property(e => e.CreatedBy)
            .HasMaxLength(100);

        builder.Property(e => e.UpdatedBy)
            .HasMaxLength(100);
    }
}
