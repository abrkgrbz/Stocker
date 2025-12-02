using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Inventory.Domain.Entities;

namespace Stocker.Modules.Inventory.Infrastructure.Persistence.Configurations;

public class ProductAttributeConfiguration : IEntityTypeConfiguration<ProductAttribute>
{
    public void Configure(EntityTypeBuilder<ProductAttribute> builder)
    {
        builder.ToTable("ProductAttributes", "inventory");

        builder.HasKey(a => a.Id);

        builder.Property(a => a.TenantId)
            .IsRequired();

        builder.Property(a => a.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(a => a.Code)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(a => a.Description)
            .HasMaxLength(500);

        builder.Property(a => a.AttributeType)
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(a => a.ValidationPattern)
            .HasMaxLength(500);

        builder.Property(a => a.DefaultValue)
            .HasMaxLength(500);

        builder.HasMany(a => a.Options)
            .WithOne(o => o.ProductAttribute)
            .HasForeignKey(o => o.ProductAttributeId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(a => a.Values)
            .WithOne(v => v.ProductAttribute)
            .HasForeignKey(v => v.ProductAttributeId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(a => a.TenantId);
        builder.HasIndex(a => new { a.TenantId, a.Code }).IsUnique();
        builder.HasIndex(a => new { a.TenantId, a.IsActive });
    }
}

public class ProductAttributeOptionConfiguration : IEntityTypeConfiguration<ProductAttributeOption>
{
    public void Configure(EntityTypeBuilder<ProductAttributeOption> builder)
    {
        builder.ToTable("ProductAttributeOptions", "inventory");

        builder.HasKey(o => o.Id);

        builder.Property(o => o.TenantId)
            .IsRequired();

        builder.Property(o => o.Value)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(o => o.Label)
            .HasMaxLength(200);

        builder.Property(o => o.ColorCode)
            .HasMaxLength(20);

        builder.Property(o => o.ImageUrl)
            .HasMaxLength(500);

        builder.HasIndex(o => o.TenantId);
        builder.HasIndex(o => new { o.ProductAttributeId, o.DisplayOrder });
    }
}

public class ProductAttributeValueConfiguration : IEntityTypeConfiguration<ProductAttributeValue>
{
    public void Configure(EntityTypeBuilder<ProductAttributeValue> builder)
    {
        builder.ToTable("ProductAttributeValues", "inventory");

        builder.HasKey(v => v.Id);

        builder.Property(v => v.TenantId)
            .IsRequired();

        builder.Property(v => v.Value)
            .HasMaxLength(500);

        builder.HasOne(v => v.Product)
            .WithMany(p => p.AttributeValues)
            .HasForeignKey(v => v.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(v => v.ProductAttribute)
            .WithMany(a => a.Values)
            .HasForeignKey(v => v.ProductAttributeId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(v => v.Option)
            .WithMany()
            .HasForeignKey(v => v.OptionId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(v => v.TenantId);
        builder.HasIndex(v => new { v.ProductId, v.ProductAttributeId }).IsUnique();
    }
}
