using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Inventory.Domain.Entities;

namespace Stocker.Modules.Inventory.Infrastructure.Persistence.Configurations;

public class ProductImageConfiguration : IEntityTypeConfiguration<ProductImage>
{
    public void Configure(EntityTypeBuilder<ProductImage> builder)
    {
        builder.ToTable("ProductImages", "inventory");

        builder.HasKey(i => i.Id);

        builder.Property(i => i.TenantId)
            .IsRequired();

        builder.Property(i => i.Url)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(i => i.ThumbnailUrl)
            .HasMaxLength(500);

        builder.Property(i => i.AltText)
            .HasMaxLength(200);

        builder.Property(i => i.Title)
            .HasMaxLength(200);

        builder.HasOne(i => i.Product)
            .WithMany(p => p.Images)
            .HasForeignKey(i => i.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(i => i.TenantId);
        builder.HasIndex(i => new { i.ProductId, i.DisplayOrder });
    }
}
