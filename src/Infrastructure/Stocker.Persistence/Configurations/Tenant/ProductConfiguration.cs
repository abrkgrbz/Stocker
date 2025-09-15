using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Tenant.Entities;

namespace Stocker.Persistence.Configurations.Tenant;

public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.ToTable("Products", "tenant");
        
        builder.HasKey(x => x.Id);
        
        builder.Property(x => x.Id)
            .ValueGeneratedNever();
            
        builder.Property(x => x.TenantId)
            .IsRequired();
            
        builder.Property(x => x.Name)
            .IsRequired()
            .HasMaxLength(200);
            
        builder.Property(x => x.Description)
            .HasMaxLength(1000);
            
        builder.Property(x => x.Code)
            .IsRequired()
            .HasMaxLength(100);
            
        builder.Property(x => x.Barcode)
            .HasMaxLength(100);
            
        builder.Property(x => x.StockQuantity)
            .HasPrecision(18, 2);
            
        builder.Property(x => x.MinimumStockLevel)
            .HasPrecision(18, 2);
            
        builder.Property(x => x.ReorderLevel)
            .HasPrecision(18, 2);
            
        builder.Property(x => x.Unit)
            .HasMaxLength(50);
            
        builder.Property(x => x.VatRate)
            .HasPrecision(5, 2);
            
        builder.Property(x => x.IsActive)
            .IsRequired();
            
        // Configure Price as owned type
        builder.OwnsOne(x => x.Price, price =>
        {
            price.Property(p => p.Amount)
                .HasColumnName("Price")
                .HasPrecision(18, 2)
                .IsRequired();
                
            price.Property(p => p.Currency)
                .HasColumnName("Currency")
                .HasMaxLength(3)
                .IsRequired();
        });
        
        // Configure CostPrice as owned type
        builder.OwnsOne(x => x.CostPrice, costPrice =>
        {
            costPrice.Property(p => p.Amount)
                .HasColumnName("CostPrice")
                .HasPrecision(18, 2);
                
            costPrice.Property(p => p.Currency)
                .HasColumnName("CostCurrency")
                .HasMaxLength(3);
        });
        
        builder.HasIndex(x => x.TenantId);
        builder.HasIndex(x => new { x.TenantId, x.Code }).IsUnique();
        builder.HasIndex(x => new { x.TenantId, x.Name });
    }
}