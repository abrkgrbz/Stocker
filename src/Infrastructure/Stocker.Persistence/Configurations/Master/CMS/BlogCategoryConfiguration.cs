using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Master.Entities.CMS;

namespace Stocker.Persistence.Configurations.Master.CMS;

public class BlogCategoryConfiguration : BaseEntityTypeConfiguration<BlogCategory>
{
    public override void Configure(EntityTypeBuilder<BlogCategory> builder)
    {
        base.Configure(builder);

        builder.ToTable("BlogCategories", "cms");

        // Properties
        builder.Property(c => c.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(c => c.Slug)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(c => c.Description)
            .HasMaxLength(500);

        builder.Property(c => c.Color)
            .HasMaxLength(20);

        builder.Property(c => c.Icon)
            .HasMaxLength(50);

        builder.Property(c => c.DisplayOrder)
            .IsRequired()
            .HasDefaultValue(0);

        builder.Property(c => c.IsActive)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(c => c.CreatedAt)
            .IsRequired();

        builder.Property(c => c.UpdatedAt);

        // Indexes
        builder.HasIndex(c => c.Slug)
            .IsUnique()
            .HasDatabaseName("IX_BlogCategories_Slug");

        builder.HasIndex(c => c.IsActive)
            .HasDatabaseName("IX_BlogCategories_IsActive");

        builder.HasIndex(c => c.DisplayOrder)
            .HasDatabaseName("IX_BlogCategories_DisplayOrder");
    }
}
